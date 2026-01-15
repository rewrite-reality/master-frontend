// src/components/orders/OrderDetailsPageClient.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError } from '@/lib/apiClient';
import { acceptOrder, getOrderById, type OrderDto } from '@/lib/ordersApi';

function formatMoney(n?: number | null) {
	if (n == null) return '—';
	return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n);
}

function formatWhen(iso?: string | null) {
	if (!iso) return 'Не указано';
	const d = new Date(iso);
	return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function OrderDetailsPageClient() {
	const router = useRouter();
	const params = useParams<{ id: string }>();
	const id = params?.id;

	const [order, setOrder] = useState<OrderDto | null>(null);
	const [loading, setLoading] = useState(true);
	const [accepting, setAccepting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [toast, setToast] = useState<string | null>(null);

	const showToast = useCallback((msg: string) => {
		setToast(msg);
		window.setTimeout(() => setToast(null), 2000);
	}, []);

	useEffect(() => {
		if (!id) return;
		let cancelled = false;

		(async () => {
			try {
				setLoading(true);
				setError(null);
				const data = await getOrderById(id);
				if (!cancelled) setOrder(data);
			} catch (e) {
				if (cancelled) return;
				setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Ошибка загрузки заказа');
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [id]);

	const canSeeContacts = useMemo(() => {
		return !!order?.clientPhone; // backend already nulls it if not assigned to this master
	}, [order]);

	const onAccept = useCallback(async () => {
		if (!id || accepting) return;
		try {
			setAccepting(true);
			setError(null);
			await acceptOrder(id);
			showToast('Заказ принят');
			const updated = await getOrderById(id);
			setOrder(updated);
		} catch (e) {
			if (e instanceof ApiError) {
				// common: 409 if someone accepted earlier
				if (e.status === 409) {
					showToast('Упс. Заказ уже приняли.');
					router.replace('/orders');
					return;
				}
				setError(e.message || `Ошибка ${e.status}`);
				return;
			}
			setError(e instanceof Error ? e.message : 'Ошибка принятия заказа');
		} finally {
			setAccepting(false);
		}
	}, [id, accepting, showToast, router]);

	if (loading) {
		return (
			<div className="p-4">
				<div className="flex items-center gap-3 opacity-80">
					<span className="loading loading-spinner loading-md" />
					<span>Загрузка…</span>
				</div>
			</div>
		);
	}

	if (error && !order) {
		return (
			<div className="p-4 space-y-3">
				<div className="alert alert-error">
					<span>{error}</span>
				</div>
				<button className="btn w-full" onClick={() => router.replace('/orders')}>
					Назад к заказам
				</button>
			</div>
		);
	}

	if (!order) return null;

	const district = order.district?.name ?? '—';
	const city = order.district?.city ?? '';
	const specialty = order.specialty?.name ?? '—';

	const address = [order.street, order.house, order.apartment ? `кв ${order.apartment}` : null]
		.filter(Boolean)
		.join(', ');

	return (
		<div className="p-4 space-y-4">
			<button className="btn btn-ghost btn-sm w-fit" onClick={() => router.back()}>
				← Назад
			</button>

			{error && (
				<div className="alert alert-error">
					<span>{error}</span>
				</div>
			)}

			<div className="card bg-base-100 border border-base-200">
				<div className="card-body p-4 gap-3">
					<div className="flex items-start justify-between gap-3">
						<h1 className="text-lg font-bold leading-snug">{order.title}</h1>
						<span className="badge badge-primary badge-outline">{formatMoney(order.price)}</span>
					</div>

					<div className="flex flex-wrap gap-2">
						<span className="badge badge-ghost">
							{city ? `${city}, ` : ''}{district}
						</span>
						<span className="badge badge-ghost">{specialty}</span>
						<span className="badge badge-ghost">{order.status}</span>
					</div>

					<div className="text-sm opacity-80 whitespace-pre-wrap">
						{order.description || 'Без описания'}
					</div>

					<div className="divider my-1" />

					<div className="space-y-1 text-sm">
						<div className="flex justify-between gap-3">
							<span className="opacity-70">Адрес</span>
							<span className="text-right">{address || '—'}</span>
						</div>
						<div className="flex justify-between gap-3">
							<span className="opacity-70">Когда</span>
							<span className="text-right">{formatWhen(order.scheduledAt)}</span>
						</div>
					</div>
				</div>
			</div>

			<div className="card bg-base-100 border border-base-200">
				<div className="card-body p-4 gap-3">
					<h2 className="font-semibold">Контакты клиента</h2>
					{canSeeContacts ? (
						<div className="space-y-1 text-sm">
							<div className="flex justify-between gap-3">
								<span className="opacity-70">Имя</span>
								<span className="text-right">{order.clientName || '—'}</span>
							</div>
							<div className="flex justify-between gap-3">
								<span className="opacity-70">Телефон</span>
								<span className="text-right">{order.clientPhone || '—'}</span>
							</div>
						</div>
					) : (
						<p className="text-sm opacity-70">Контакты будут доступны после принятия заказа.</p>
					)}
				</div>
			</div>

			{!canSeeContacts && (
				<button className="btn btn-primary w-full" onClick={onAccept} disabled={accepting}>
					{accepting ? 'Принимаем…' : 'Принять заказ'}
				</button>
			)}

			{toast && (
				<div className="toast toast-top toast-center z-[60]">
					<div className="alert alert-info shadow-lg">
						<span>{toast}</span>
					</div>
				</div>
			)}
		</div>
	);
}
