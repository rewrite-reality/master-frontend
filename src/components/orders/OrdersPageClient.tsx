'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/lib/apiClient';
import { getAvailableOrders, type OrderDto } from '@/lib/ordersApi';
import { TopProgressBar } from '../ui/TopProgressBar';

function formatMoney(n?: number | null) {
	if (n == null) return '—';
	return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n);
}

function formatWhen(iso?: string | null) {
	if (!iso) return 'Без даты и времени';
	const d = new Date(iso);
	return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function OrderCard({ o }: { o: OrderDto }) {
	const district = o.district?.name ?? 'Без района';
	const specialty = o.specialty?.name ?? 'Без специальности';

	return (
		<Link href={`/orders/${o.id}`} className="block">
			<div className="card bg-base-100 shadow-sm border border-base-200 active:scale-[0.99] transition">
				<div className="card-body p-4 gap-3">
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0">
							<h2 className="font-semibold text-base leading-snug truncate">{o.title}</h2>
							<p className="text-xs opacity-70 mt-1">
								{district} • {specialty}
							</p>
						</div>
						<span className="badge badge-primary badge-outline">{formatMoney(o.price)}</span>
					</div>

					<div className="text-sm opacity-80 line-clamp-2">{o.description || o.street || 'Без описания'}</div>

					<div className="flex items-center justify-between">
						<span className="text-xs opacity-70">{formatWhen(o.scheduledAt)}</span>
						<span className="badge badge-ghost">{o.status}</span>
					</div>
				</div>
			</div>
		</Link>
	);
}

export default function OrdersPageClient() {
	const [search, setSearch] = useState('');
	const [urgentOnly, setUrgentOnly] = useState(false);

	const query = useMemo(() => ({ search: search.trim() || undefined, urgentOnly, limit: 50 }), [search, urgentOnly]);

	const { data, isLoading, isFetching, error, refetch } = useQuery({
		queryKey: ['orders', query],
		queryFn: () => getAvailableOrders(query),
		staleTime: 30 * 1000,
		gcTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
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

	return (
		<div className="p-4 space-y-4">
			{isFetching && <TopProgressBar className="fixed left-0 right-0 top-0 z-40" />}

			<div className="flex items-center justify-between gap-3">
				<h1 className="text-xl font-bold">Заявки</h1>
				<button className="btn btn-sm" onClick={() => refetch()}>
					Обновить
				</button>
			</div>

			<div className="card bg-base-100 border border-base-200">
				<div className="card-body p-4 gap-3">
					<input
						className="input input-bordered w-full"
						placeholder="Поиск (адрес, заказ, клиент)…"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>

					<label className="label cursor-pointer justify-start gap-3 p-0">
						<input
							type="checkbox"
							className="toggle toggle-primary"
							checked={urgentOnly}
							onChange={(e) => setUrgentOnly(e.target.checked)}
						/>
						<span className="label-text">Только срочные (до 2 часов)</span>
					</label>
				</div>
			</div>

			{errorMessage && (
				<div className="alert alert-error">
					<span>{errorMessage}</span>
				</div>
			)}

			{isLoading && items.length === 0 ? (
				<div className="flex items-center gap-3 opacity-80">
					<span className="loading loading-spinner loading-md" />
					<span>Загружаем заявки…</span>
				</div>
			) : items.length === 0 ? (
				<div className="card bg-base-100 border border-base-200">
					<div className="card-body">
						<h2 className="font-semibold">Нет подходящих заявок</h2>
						<p className="text-sm opacity-70">Попробуйте изменить фильтры или загляните позже.</p>
					</div>
				</div>
			) : (
				<div className="space-y-3">
					{items.map((o) => (
						<OrderCard key={o.id} o={o} />
					))}
				</div>
			)}
		</div>
	);
}
