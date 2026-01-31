// src/components/orders/OrderDetailsPageClient.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoAnimate } from '@formkit/auto-animate/react';

import { ApiError } from '@/lib/apiClient';
import { acceptOrder, advanceOrderStatus, getOrderById, submitOrderReview, type OrderDto } from '@/lib/ordersApi';
import { OrderDetailsSkeleton } from '@/components/orders/OrderDetailsSkeleton';
import { STATUS_LABELS, type UiOrderStatus } from '@/components/orders/OrderDetailsComponent/orderStatus';
import { OrderMainCard } from '@/components/orders/OrderDetailsComponent/OrderMainCard';
import { OrderProgressCard } from '@/components/orders/OrderDetailsComponent/OrderProgressCard';
import { OrderClientCard } from '@/components/orders/OrderDetailsComponent/OrderClientCard';
import { OrderActionButton } from '@/components/orders/OrderDetailsComponent/OrderActionButton';
import { OrderReviewModal } from '@/components/orders/OrderDetailsComponent/OrderReviewModal';
import { AppToast } from '@/components/orders/OrderDetailsComponent/AppToast';

// --- Helpers ---

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
	const [isReviewModalOpen, setReviewModalOpen] = useState(false);
	const [reviewResetKey, setReviewResetKey] = useState(0);

	// Ref for navigation fallback
	const navTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Cleanup navigation timer on unmount
	useEffect(() => {
		return () => {
			if (navTimeoutRef.current) {
				clearTimeout(navTimeoutRef.current);
			}
		};
	}, []);

	const showToast = useCallback((msg: string) => {
		setToast(msg);
		window.setTimeout(() => setToast(null), 3000);
	}, []);

	// --- Custom Back Handler ---
	const handleBack = useCallback(() => {
		// Пытаемся вернуться назад
		router.back();

		// Если история пуста (или мы открыли ссылку напрямую), router.back() может ничего не сделать
		// Ставим тайм-аут: если через 300мс мы всё ещё здесь — форсируем переход в список
		if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);

		navTimeoutRef.current = setTimeout(() => {
			// Проверка safety: если компонент размонтирован, этот колбэк не должен навредить,
			// но router.push всё равно сработает.
			router.push('/orders');
		}, 300);
	}, [router]);

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

			for (const [queryKey, listData] of allOrdersQueries) {
				// 1. Если данных нет или это не массив — пропускаем сразу
				if (!listData || !Array.isArray(listData)) {
					continue;
				}

				// Теперь безопасно ищем
				const found = listData.find((d) => d.id === id);
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
			showToast('Заказ успешно принят!');
			queryClient.invalidateQueries({ queryKey: ['orders', id] });
		},
		onError: async (e: unknown) => {
			// Инвалидируем в любом случае, чтобы получить актуальный статус
			queryClient.invalidateQueries({ queryKey: ['orders', id] });

			if (e instanceof ApiError && e.status === 409) {
				// Логика обработки 409
				try {
					// Пробуем получить актуальную версию заказа прямо сейчас
					const freshOrder = await queryClient.fetchQuery({
						queryKey: ['orders', id],
						queryFn: () => getOrderById(id!),
						staleTime: 0
					});

					// Если мы видим телефон клиента, значит заказ НАШ (мы уже его взяли ранее)
					if (freshOrder?.clientPhone) {
						showToast('Вы уже приняли этот заказ. Обновляем данные...');
						return; // Остаёмся на странице
					} else {
						// Если телефона нет, значит заказ взял кто-то другой
						showToast('Заказ уже забрал другой исполнитель');
						// Ждём чуть-чуть, чтобы юзер прочитал тост, и уводим
						setTimeout(() => {
							router.replace('/orders');
						}, 2000);
						return;
					}
				} catch (fetchErr) {
					// Если не удалось загрузить, просто редиректим
					showToast('Заказ недоступен');
					router.replace('/orders');
					return;
				}
			}

			// Стандартная обработка остальных ошибок
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
					showToast(`Статус изменен: ${STATUS_LABELS[optimisticNext] ?? optimisticNext}`);
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
					showToast('Статус уже был изменен другим устройством. Данные обновлены.');
					return;
				}
				if (e.status === 403) {
					showToast('У вас нет прав на это действие.');
					return;
				}
				showToast(e.message || `Ошибка ${e.status}`);
				return;
			}
			showToast('Не удалось изменить статус. Попробуйте снова.');
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['orders', id] });
		},
	});

	// 3. Отправка отзыва (завершение)
	const reviewMutation = useMutation({
		mutationFn: (files: File[]) => submitOrderReview(id!, files),
		onSuccess: () => {
			showToast('Отчет отправлен на проверку!');
			setReviewModalOpen(false);
			setReviewResetKey((prev) => prev + 1);
			queryClient.invalidateQueries({ queryKey: ['orders', id] });
		},
		onError: (e: unknown) => {
			const msg = e instanceof ApiError ? (e.message || `Ошибка ${e.status}`) : 'Ошибка отправки отчета';
			showToast(msg);
		}
	});

	// --- Logic helpers ---

	const canSeeContacts = useMemo(() => !!order?.clientPhone, [order]);

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

	// --- Handlers ---

	const onAccept = () => {
		if (!id || acceptMutation.isPending) return;
		acceptMutation.mutate();
	};

	const onAdvance = () => {
		if (!id || advanceMutation.isPending || !order) return;

		// CRITICAL: Если сейчас статус IN_PROGRESS, то следующий шаг - COMPLETED.
		// Вместо прямого вызова advance, открываем модалку с фото.
		if (order.status === 'IN_PROGRESS') {
			setReviewModalOpen(true);
			return;
		}

		advanceMutation.mutate();
	};

	const onReviewSubmit = (files: File[]) => {
		if (!id || reviewMutation.isPending) return;
		reviewMutation.mutate(files);
	};

	// --- Renders Vars ---

	const district = order?.district?.name ?? 'Район не указан';
	const city = order?.district?.city ?? '';
	const specialty = order?.specialty?.name ?? 'Специальность';
	const address = order ? [order.street, order.house, order.apartment ? `кв ${order.apartment}` : null].filter(Boolean).join(', ') : '';

	return (
		<div className="min-h-screen text-white font-sans pb-24 relative">
			{/* Header (Static) */}
			<div className="px-4 pt-4 pb-2 flex items-center gap-4">
				<button
					className="w-10 h-10 rounded-full bg-[#1c1c1e] flex items-center justify-center text-white hover:bg-[#2c2c2e] transition-colors"
					onClick={handleBack}
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

						<OrderMainCard
							title={order.title}
							price={order.price}
							mapUrl={order.mapUrl}
							lat={order.lat}
							lon={order.lon}
							description={order.description}
							district={district}
							city={city}
							specialty={specialty}
							address={address}
							scheduledAt={order.scheduledAt}
							status={order.status}
						/>

						<OrderProgressCard status={order.status} />

						<OrderClientCard
							clientName={order.clientName}
							clientPhone={order.clientPhone}
							canSeeContacts={canSeeContacts}
						/>
					</motion.div>
				) : null}
			</AnimatePresence>

			{order && (
				<OrderActionButton
					canSeeContacts={canSeeContacts}
					canAdvance={canAdvance}
					nextStatusRu={nextStatusRu}
					onAccept={onAccept}
					onAdvance={onAdvance}
					isAcceptPending={acceptMutation.isPending}
					isAdvancePending={advanceMutation.isPending}
				/>
			)}

			<AppToast message={toast} />

			<OrderReviewModal
				open={isReviewModalOpen}
				onClose={() => setReviewModalOpen(false)}
				onSubmit={onReviewSubmit}
				isSubmitting={reviewMutation.isPending}
				resetKey={reviewResetKey}
			/>
		</div>
	);
}
