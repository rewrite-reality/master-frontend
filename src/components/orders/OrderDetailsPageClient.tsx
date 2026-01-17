// src/components/orders/OrderDetailsPageClient.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoAnimate } from '@formkit/auto-animate/react';

import { ApiError } from '@/lib/apiClient';
import { acceptOrder, advanceOrderStatus, getOrderById, type OrderDto } from '@/lib/ordersApi';
import { OrderDetailsSkeleton } from '@/components/orders/OrderDetailsSkeleton';

// --- Helpers ---

function formatMoney(n?: number | null) {
	if (n == null) return '—';
	return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n);
}

function formatWhen(iso?: string | null) {
	if (!iso) return 'Не указано';
	const d = new Date(iso);
	return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

type UiOrderStatus = OrderDto['status'];

const STATUS_LABELS: Record<string, string> = {
	PENDING: 'В поиске мастера',
	ASSIGNED: 'Мастер найден',
	ARRIVED: 'Мастер на месте',
	IN_PROGRESS: 'В работе',
	COMPLETED: 'Выполнено',
	CANCELLED: 'Отменено',
	DISPUTE: 'Спор',
};

const STEPS_FLOW: UiOrderStatus[] = ['ASSIGNED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'];

const STEP_LABELS: Record<string, string> = {
	ASSIGNED: 'Принят',
	ARRIVED: 'На месте',
	IN_PROGRESS: 'Работает',
	COMPLETED: 'Завершён',
};

function getNextStatus(status: UiOrderStatus): UiOrderStatus | null {
	switch (status) {
		case 'ASSIGNED': return 'ARRIVED';
		case 'ARRIVED': return 'IN_PROGRESS';
		case 'IN_PROGRESS': return 'COMPLETED';
		default: return null;
	}
}

function isFlowStatus(status: UiOrderStatus): status is 'ASSIGNED' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' {
	return ['ASSIGNED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(status || '');
}

// --- Components ---

export default function OrderDetailsPageClient() {
	const router = useRouter();
	const params = useParams<{ id: string }>();
	const id = params?.id;
	const queryClient = useQueryClient();

	// Хук для плавных переходов внутри списка (auto-layout)
	const [animationParent] = useAutoAnimate();

	const [toast, setToast] = useState<string | null>(null);

	const showToast = useCallback((msg: string) => {
		setToast(msg);
		window.setTimeout(() => setToast(null), 2000);
	}, []);

	// --- Queries ---

	const {
		data: order,
		isLoading,
		isError,
		error: queryError
	} = useQuery({
		queryKey: ['orders', id],
		queryFn: () => getOrderById(id!),
		enabled: !!id,
		retry: 1,
		// Instant Navigation: ищем заказ в кэше списков
		placeholderData: (previousData) => {
			if (previousData) return previousData;
			// Ищем во всех запросах, начинающихся с 'orders'
			const allOrdersQueries = queryClient.getQueriesData<OrderDto[]>({ queryKey: ['orders'] });
			for (const [, listData] of allOrdersQueries) {
				const found = listData?.find((d) => d.id === id);
				if (found) return found;
			}
			return undefined;
		},
	});

	const errorMsg = useMemo(() => {
		if (!queryError) return null;
		if (queryError instanceof ApiError) return queryError.message;
		return queryError instanceof Error ? queryError.message : 'Ошибка загрузки заказа';
	}, [queryError]);

	// --- Mutations ---

	// 1. Принятие заказа
	const acceptMutation = useMutation({
		mutationFn: () => acceptOrder(id!),
		onSuccess: () => {
			showToast('Заказ принят!');
			queryClient.invalidateQueries({ queryKey: ['orders', id] });
		},
		onError: (e: unknown) => {
			if (e instanceof ApiError && e.status === 409) {
				showToast('Упс. Заказ уже занят.');
				router.replace('/orders');
				return;
			}
			const msg = e instanceof ApiError ? (e.message || `Ошибка ${e.status}`) : 'Ошибка принятия заказа';
			showToast(msg);
		}
	});

	// 2. Смена статуса (Optimistic Update)
	const advanceMutation = useMutation({
		mutationFn: () => advanceOrderStatus(id!),
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: ['orders', id] });
			const previousOrder = queryClient.getQueryData<OrderDto>(['orders', id]);

			if (previousOrder) {
				const optimisticNext = getNextStatus(previousOrder.status);
				if (optimisticNext) {
					queryClient.setQueryData<OrderDto>(['orders', id], {
						...previousOrder,
						status: optimisticNext,
					});
					showToast(`Статус: ${STATUS_LABELS[optimisticNext] ?? optimisticNext}`);
				}
			}
			return { previousOrder };
		},
		onError: (e: unknown, _, context) => {
			if (context?.previousOrder) {
				queryClient.setQueryData(['orders', id], context.previousOrder);
			}
			if (e instanceof ApiError) {
				if (e.status === 409) {
					showToast('Статус уже изменился. Данные обновлены.');
					return;
				}
				if (e.status === 403) {
					showToast('Нет доступа.');
					return;
				}
				showToast(e.message || `Ошибка ${e.status}`);
				return;
			}
			showToast('Не удалось изменить статус');
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['orders', id] });
		},
	});

	// --- Logic helpers ---

	const canSeeContacts = useMemo(() => !!order?.clientPhone, [order]);

	const statusRu = useMemo(() => {
		if (!order?.status) return '—';
		return STATUS_LABELS[order.status] ?? order.status;
	}, [order?.status]);

	const stepIndex = useMemo(() => {
		if (!order?.status) return -1;
		return STEPS_FLOW.indexOf(order.status);
	}, [order?.status]);

	const canAdvance = useMemo(() => {
		if (!order) return false;
		if (!canSeeContacts) return false;
		if (!isFlowStatus(order.status)) return false;
		return getNextStatus(order.status) !== null;
	}, [order, canSeeContacts]);

	const nextStatus = useMemo(() => {
		if (!order) return null;
		return getNextStatus(order.status);
	}, [order]);

	const nextStatusRu = useMemo(() => {
		if (!nextStatus) return null;
		return STATUS_LABELS[nextStatus] ?? nextStatus;
	}, [nextStatus]);

	const progressHint = useMemo(() => {
		if (!order) return '';
		if (order.status === 'PENDING') return 'Сначала примите заказ — затем сможете двигать статусы.';
		if (order.status === 'COMPLETED') return 'Заказ завершён.';
		if (order.status === 'CANCELLED') return 'Заказ отменён.';
		if (order.status === 'DISPUTE') return 'Заказ в споре.';
		return 'Нажмите кнопку ниже, чтобы перейти к следующему шагу.';
	}, [order]);

	// --- Handlers ---

	const onAccept = () => {
		if (!id || acceptMutation.isPending) return;
		acceptMutation.mutate();
	};

	const onAdvance = () => {
		if (!id || advanceMutation.isPending || !order) return;
		advanceMutation.mutate();
	};

	// --- Renders Vars ---

	const district = order?.district?.name ?? 'Район не указан';
	const city = order?.district?.city ?? '';
	const specialty = order?.specialty?.name ?? 'Специальность';
	const address = order ? [order.street, order.house, order.apartment ? `кв ${order.apartment}` : null].filter(Boolean).join(', ') : '';

	const showProgressBlock = order ? (order.status === 'PENDING' || isFlowStatus(order.status) || order.status === 'CANCELLED' || order.status === 'DISPUTE') : false;
	const progressIsActive = order ? (canSeeContacts && (isFlowStatus(order.status) || order.status === 'COMPLETED')) : false;
	const progressBorder = progressIsActive ? 'bg-[#1c1c1e] border-[#ccf333]/30' : 'bg-transparent border-gray-800';

	return (
		<div className="min-h-screen text-white font-sans pb-24 relative">
			{/* Header (Static) */}
			<div className="px-4 pt-4 pb-2 flex items-center gap-4">
				<button
					className="w-10 h-10 rounded-full bg-[#1c1c1e] flex items-center justify-center text-white hover:bg-[#2c2c2e] transition-colors"
					onClick={() => router.back()}
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M19 12H5M12 19l-7-7 7-7" />
					</svg>
				</button>
				<h1 className="text-lg font-medium">Детали заказа</h1>
			</div>

			<AnimatePresence mode="wait">
				{isLoading ? (
					<motion.div
						key="skeleton"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
					>
						<OrderDetailsSkeleton />
					</motion.div>
				) : isError && !order ? (
					<motion.div
						key="error"
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="min-h-[60vh] flex flex-col justify-center items-center text-center space-y-6 p-6"
					>
						<div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center text-red-500">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
							</svg>
						</div>
						<div className="space-y-2">
							<h2 className="text-white text-lg font-medium">Ошибка</h2>
							<p className="text-gray-400 text-sm max-w-[200px] mx-auto">{errorMsg}</p>
						</div>
						<button
							className="btn btn-outline border-white/20 text-white rounded-full px-8 hover:bg-white hover:text-black hover:border-white transition-colors"
							onClick={() => router.replace('/orders')}
						>
							Вернуться к списку
						</button>
					</motion.div>
				) : order ? (
					<motion.div
						key="content"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3, ease: "easeOut" }}
						ref={animationParent} // AutoAnimate для внутренних блоков
						className="p-4 space-y-4 max-w-md mx-auto"
					>
						{/* Error Alert inside content */}
						{isError && (
							<div className="alert alert-error bg-red-900/50 border-none text-red-200 text-sm py-3 rounded-2xl">
								<span>{errorMsg}</span>
							</div>
						)}

						{/* Main Info Card */}
						<div className="card bg-[#1c1c1e] rounded-[24px] overflow-hidden">
							<div className="card-body p-5 gap-5">
								{/* Title & Price */}
								<div className="flex items-start justify-between gap-4">
									<h2 className="text-xl font-medium leading-snug">{order.title}</h2>
									<span className="badge bg-[#ccf333] text-black font-bold h-8 px-3 rounded-full border-none whitespace-nowrap">
										{formatMoney(order.price)}
									</span>
								</div>

								{/* Tags Row */}
								<div className="flex flex-wrap gap-2">
									<span className="px-3 py-1.5 rounded-full bg-white/5 text-gray-300 text-xs font-medium border border-white/5">
										{city ? `${city}, ` : ''}{district}
									</span>
									<span className="px-3 py-1.5 rounded-full bg-white/5 text-gray-300 text-xs font-medium border border-white/5">
										{specialty}
									</span>
									<span className="px-3 py-1.5 rounded-full bg-white/5 text-[#ccf333] text-xs font-medium border border-white/5">
										{statusRu}
									</span>
								</div>

								{/* Description */}
								<div className="p-4 rounded-2xl bg-black/40 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
									{order.description || 'Описание отсутствует'}
								</div>

								{/* Meta Info Table */}
								<div className="space-y-3 pt-2">
									<div className="flex items-start gap-3">
										<div className="mt-1 w-8 h-8 rounded-full bg-[#2c2c2e] flex items-center justify-center shrink-0 text-[#ccf333]">
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
												<path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
												<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
											</svg>
										</div>
										<div className="flex flex-col">
											<span className="text-gray-500 text-xs">Адрес</span>
											<span className="text-white text-sm">{address || 'Скрыт до принятия'}</span>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<div className="mt-1 w-8 h-8 rounded-full bg-[#2c2c2e] flex items-center justify-center shrink-0 text-[#ccf333]">
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
												<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										</div>
										<div className="flex flex-col">
											<span className="text-gray-500 text-xs">Время</span>
											<span className="text-white text-sm">{formatWhen(order.scheduledAt)}</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Progress Card */}
						{showProgressBlock && (
							<div className={`card rounded-[24px] border border-dashed transition-colors ${progressBorder}`}>
								<div className="card-body p-5 gap-4">
									<div className="flex items-center justify-between">
										<h2 className="font-medium text-gray-300 flex items-center gap-2">
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
												<path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
												<path strokeLinecap="round" strokeLinejoin="round" d="M7 14l3-3 4 4 6-8" />
											</svg>
											Прогресс
										</h2>
										<span className="text-gray-500 text-xs">
											{isFlowStatus(order.status) ? `${stepIndex + 1}/4` : order.status === 'PENDING' ? '0/4' : '—'}
										</span>
									</div>

									<div className="rounded-2xl bg-black/30 border border-white/5 p-4">
										<ul className="steps w-full">
											{STEPS_FLOW.map((s, idx) => {
												const active = isFlowStatus(order.status) ? idx <= stepIndex : false;
												return (
													<li key={s} className={['step', active ? 'step-primary' : ''].join(' ')}>
														{STEP_LABELS[s] ?? s}
													</li>
												);
											})}
										</ul>
										<div className="mt-3 text-xs text-gray-500">{progressHint}</div>
									</div>
								</div>
							</div>
						)}

						{/* Contacts Card */}
						<div
							className={`card rounded-[24px] border border-dashed transition-colors ${canSeeContacts ? 'bg-[#1c1c1e] border-[#ccf333]/30' : 'bg-transparent border-gray-800'}`}
						>
							<div className="card-body p-5 gap-4">
								<h2 className="font-medium text-gray-300 flex items-center gap-2">
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
										<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
									</svg>
									Клиент
								</h2>

								{canSeeContacts ? (
									<div className="space-y-4">
										<div className="flex justify-between items-center pb-2 border-b border-white/5">
											<span className="text-gray-500 text-sm">Имя</span>
											<span className="text-white font-medium">{order.clientName || '—'}</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-gray-500 text-sm">Телефон</span>
											<a href={`tel:${order.clientPhone}`} className="text-[#ccf333] font-medium hover:underline">
												{order.clientPhone || '—'}
											</a>
										</div>
									</div>
								) : (
									<div className="text-center py-2 space-y-2">
										<p className="text-gray-600 text-sm">Примите заказ, чтобы увидеть контакты клиента и точный адрес.</p>
									</div>
								)}
							</div>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>

			{/* Floating Action Button Area (Static outside animation) */}
			<div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-40 max-w-md mx-auto">
				{order && (
					!canSeeContacts ? (
						<button
							className="btn w-full h-14 rounded-full bg-[#ccf333] hover:bg-[#bbe02f] text-black text-lg font-bold border-none shadow-[0_0_20px_rgba(204,243,51,0.3)] disabled:bg-gray-800 disabled:text-gray-500"
							onClick={onAccept}
							disabled={acceptMutation.isPending}
						>
							{acceptMutation.isPending ? <span className="loading loading-spinner" /> : 'Принять заказ'}
						</button>
					) : (
						<button
							className="btn w-full h-14 rounded-full bg-[#ccf333] hover:bg-[#bbe02f] text-black text-lg font-bold border-none shadow-[0_0_20px_rgba(204,243,51,0.3)] disabled:bg-gray-800 disabled:text-gray-500"
							onClick={onAdvance}
							disabled={!canAdvance || advanceMutation.isPending}
						>
							{advanceMutation.isPending ? (
								<span className="loading loading-spinner" />
							) : (
								<span className="flex items-center justify-center gap-2">
									<span>Следующий шаг</span>
									{nextStatusRu ? <span className="text-black/70 text-sm font-semibold">→ {nextStatusRu}</span> : null}
								</span>
							)}
						</button>
					)
				)}
			</div>

			{/* Toast Notification */}
			{toast && (
				<div className="toast toast-top toast-center z-[60] w-full max-w-sm px-4 mt-4">
					<div className="alert bg-[#323232] text-white border border-[#ccf333]/50 shadow-2xl rounded-2xl flex justify-center">
						<span className="font-medium">{toast}</span>
					</div>
				</div>
			)}
		</div>
	);
}
