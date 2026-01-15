// src/components/orders/OrdersPageClient.tsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ApiError } from '@/lib/apiClient';
import { getAvailableOrders, type OrderDto } from '@/lib/ordersApi';

function formatMoney(n?: number | null) {
	if (n == null) return '—';
	return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n);
}

function formatWhen(iso?: string | null) {
	if (!iso) return 'По времени: не указано';
	const d = new Date(iso);
	return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function OrderCard({ o }: { o: OrderDto }) {
	const district = o.district?.name ?? 'Район не указан';
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
						<span className="badge badge-ghost">PENDING</span>
					</div>
				</div>
			</div>
		</Link>
	);
}

export default function OrdersPageClient() {
	const [items, setItems] = useState<OrderDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [search, setSearch] = useState('');
	const [urgentOnly, setUrgentOnly] = useState(false);

	const query = useMemo(() => ({ search: search.trim() || undefined, urgentOnly, limit: 50 }), [search, urgentOnly]);

	useEffect(() => {
		let cancelled = false;

		(async () => {
			try {
				setLoading(true);
				setError(null);
				const list = await getAvailableOrders(query);
				if (!cancelled) setItems(Array.isArray(list) ? list : []);
			} catch (e) {
				if (cancelled) return;
				setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Ошибка загрузки заказов');
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [query]);

	return (
		<div className="p-4 space-y-4">
			<div className="flex items-center justify-between gap-3">
				<h1 className="text-xl font-bold">Заказы</h1>
				<button className="btn btn-sm" onClick={() => window.location.reload()}>
					Обновить
				</button>
			</div>

			<div className="card bg-base-100 border border-base-200">
				<div className="card-body p-4 gap-3">
					<input
						className="input input-bordered w-full"
						placeholder="Поиск (заголовок, адрес, описание)…"
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
						<span className="label-text">Срочные (в ближайшие 2 часа)</span>
					</label>
				</div>
			</div>

			{error && (
				<div className="alert alert-error">
					<span>{error}</span>
				</div>
			)}

			{loading ? (
				<div className="flex items-center gap-3 opacity-80">
					<span className="loading loading-spinner loading-md" />
					<span>Загружаем заказы…</span>
				</div>
			) : items.length === 0 ? (
				<div className="card bg-base-100 border border-base-200">
					<div className="card-body">
						<h2 className="font-semibold">Нет доступных заказов</h2>
						<p className="text-sm opacity-70">Попробуй снять фильтры или зайти позже.</p>
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
