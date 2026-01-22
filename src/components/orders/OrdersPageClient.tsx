'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
// 1. Импортируем хуки для работы с URL
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/lib/apiClient';
import { getAvailableOrders, type OrderDto } from '@/lib/ordersApi';
import { EmptyStateSkeleton, OrdersListSkeleton } from './OrderSkeleton';

// ... (Helpers: formatMoney, formatTime, formatDate, getStatusProgress остаются без изменений)
function formatMoney(n?: number | null) {
	if (n == null) return '—';
	return new Intl.NumberFormat('ru-RU', {
		style: 'currency',
		currency: 'RUB',
		maximumFractionDigits: 0,
	}).format(n);
}

function formatTime(iso?: string | null) {
	if (!iso) return '--:--';
	const d = new Date(iso);
	return d.toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso?: string | null) {
	if (!iso) return 'Нет даты';
	const d = new Date(iso);
	return d.toLocaleString('ru-RU', { day: 'numeric', month: 'short' });
}

const getStatusProgress = (status: string = '') => {
	const s = status.toUpperCase();
	if (s.includes('PENDING')) return 15;
	if (s.includes('ASSIGNED') || s.includes('ARRIVED') || s.includes('IN_PROGRESS')) return 50;
	if (s.includes('COMPLETED')) return 100;
	return 25;
};

type OrdersTab = 'active' | 'available' | 'history';

const TAB_LABELS: Record<OrdersTab, string> = {
	active: 'Активные',
	available: 'Доступные',
	history: 'История',
};

// ... (OrderCard остается без изменений, но обратите внимание на Link)
function OrderCard({ o }: { o: OrderDto }) {
	const district = o.district?.name ?? 'Город';
	const street = o.street ?? 'Адрес скрыт';
	const progressValue = getStatusProgress(o.status);

	return (
		// Link остается простым, браузер сам запомнит историю URL с параметром ?tab=...
		<Link href={`/orders/${o.id}`} className="block group">
			<div className="card bg-[#1c1c1e] text-white shadow-lg border border-white/5 transition-transform active:scale-[0.99] rounded-[24px]">
				{/* ... Внутренности карточки без изменений ... */}
				<div className="card-body p-5 gap-5">
					<div className="flex items-center justify-between">
						<h2 className="card-title text-xl font-medium tracking-wide truncate pr-2">{o.title}</h2>
						<span className="badge border-none bg-[#ccf333] text-black font-bold h-8 px-4 rounded-full text-xs uppercase tracking-wider whitespace-nowrap">
							{formatMoney(o.price)}
						</span>
					</div>

					<div className="flex items-center justify-between text-sm">
						<div className="flex flex-col gap-1">
							<span className="text-gray-300 font-medium">{district}</span>
							<span className="text-gray-500 text-xs">{formatDate(o.scheduledAt)}</span>
						</div>
						<div className="flex text-[#ccf333] tracking-[-2px] opacity-80 text-lg mx-2">{'>>>'}</div>
						<div className="flex flex-col gap-1 text-right">
							<span className="text-gray-300 font-medium truncate max-w-[120px]">{o.specialty?.name ?? 'Мастер'}</span>
							<span className="text-gray-500 text-xs">{formatTime(o.scheduledAt)}</span>
						</div>
					</div>

					<div className="text-xs text-gray-500 line-clamp-1">{o.description || street}</div>

					<div className="flex flex-col gap-2 mt-1">
						<div className="h-[2px] w-full bg-[#3a3a3c] rounded-full relative overflow-hidden">
							<div
								className="absolute top-0 left-0 h-full bg-[#ccf333] transition-all duration-500"
								style={{ width: `${progressValue}%` }}
							/>
						</div>
						<div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
							<span className={progressValue >= 15 ? 'text-[#ccf333]' : 'text-gray-600'}>Поиск</span>
							<span className={progressValue >= 50 ? 'text-[#ccf333]' : 'text-gray-600'}>В работе</span>
							<span className={progressValue >= 100 ? 'text-[#ccf333]' : 'text-gray-600'}>Готово</span>
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
}

export default function OrdersPageClient() {
	const router = useRouter();
	const searchParams = useSearchParams();

	// 2. Читаем таб из URL. Если нет - 'available' по умолчанию
	const currentTab = (searchParams.get('tab') as OrdersTab) || 'available';

	// Локальный стейт для поиска оставляем локальным
	const [search, setSearch] = useState('');
	const [urgentOnly, setUrgentOnly] = useState(false);
	const [isPageVisible, setIsPageVisible] = useState(true);

	// 3. Функция смены таба: меняем URL, а не просто стейт
	const handleTabChange = (newTab: OrdersTab) => {
		// replace: true чтобы не засорять историю браузера переключениями табов
		// scroll: false чтобы страница не прыгала вверх
		router.replace(`/orders?tab=${newTab}`, { scroll: false });
	};

	useEffect(() => {
		const onVis = () => setIsPageVisible(!document.hidden);
		onVis();
		document.addEventListener('visibilitychange', onVis);
		return () => document.removeEventListener('visibilitychange', onVis);
	}, []);

	const query = useMemo(() => {
		return {
			scope: currentTab, // Используем currentTab из URL
			search: search.trim() || undefined,
			urgentOnly: currentTab === 'available' ? urgentOnly : undefined,
			limit: 50,
		};
	}, [currentTab, search, urgentOnly]);

	const refetchInterval = useCallback(() => {
		if (!isPageVisible) return false;
		if (currentTab === 'active') return 2500;
		if (currentTab === 'available') return 5000;
		return false;
	}, [currentTab, isPageVisible]);

	const { data, isLoading, isFetching, error, refetch } = useQuery({
		queryKey: ['orders', currentTab, query], // Ключ зависит от URL
		queryFn: () => getAvailableOrders(query),
		staleTime: currentTab === 'active' ? 2_000 : currentTab === 'available' ? 5_000 : 30_000,
		gcTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchInterval,
		refetchIntervalInBackground: false,
		placeholderData: (previousData) => previousData,
	});

	const items = data ?? [];
	const errorMessage = error
		? error instanceof ApiError
			? error.message
			: error instanceof Error
				? error.message
				: 'Не удалось загрузить заявки'
		: null;

	const headerTitle = useMemo(() => {
		return currentTab === 'available' ? 'Доступные заявки' : currentTab === 'active' ? 'Активные заявки' : 'История заявок';
	}, [currentTab]);

	return (
		<div className="min-h-screen text-white font-sans pb-10">
			<div className="p-4 max-w-md mx-auto space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between pt-2">
					<h1 className="text-xl font-medium tracking-tight">{headerTitle}</h1>
					<button onClick={() => refetch()} className="btn btn-circle btn-sm btn-ghost text-gray-400 hover:text-white">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
							<path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
						</svg>
					</button>
				</div>

				{/* Tabs */}
				<div className="flex gap-2 overflow-x-auto no-scrollbar">
					{(['active', 'available', 'history'] as OrdersTab[]).map((t) => {
						const active = currentTab === t;
						return (
							<button
								key={t}
								onClick={() => handleTabChange(t)} // Используем новую функцию
								className={`btn btn-sm rounded-full border-none px-6 font-normal ${active ? 'bg-[#ccf333] text-black hover:bg-[#bbe02f]' : 'bg-[#1c1c1e] text-gray-400 hover:bg-[#2c2c2e]'
									}`}
							>
								{TAB_LABELS[t]}
							</button>
						);
					})}
				</div>

				{/* Filters Area */}
				<div className="flex flex-col gap-4">
					<div className="relative">
						<input
							type="text"
							placeholder="Поиск по ID или адресу..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="input input-bordered w-full bg-[#1c1c1e] border-none rounded-full pl-11 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#ccf333]"
						/>
						<svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</div>
				</div>

				{/* Error State */}
				{errorMessage && (
					<div role="alert" className="alert alert-error bg-red-900/50 border-none text-red-200">
						<span>{errorMessage}</span>
					</div>
				)}

				{/* List Content */}
				<div className="space-y-4">
					{isLoading && items.length === 0 ? (
						<OrdersListSkeleton count={6} />
					) : items.length === 0 ? (
						<div className="card bg-[#1c1c1e] text-center py-10 rounded-[24px]">
							<div className="card-body">
								<h2 className="text-gray-300 font-semibold mb-2">Пусто</h2>
								<p className="text-gray-600 text-sm">
									{currentTab === 'active'
										? 'У вас нет активных заявок.'
										: currentTab === 'available'
											? 'Доступных заявок с такими параметрами не найдено.'
											: 'История пока пуста.'}
								</p>
							</div>
						</div>
					) : (
						items.map((o) => <OrderCard key={o.id} o={o} />)
					)}
				</div>
			</div>
		</div>
	);
}
