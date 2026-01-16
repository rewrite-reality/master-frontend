// src/lib/ordersApi.ts
import { api } from '@/lib/apiClient';

// ВАЖНО: привели статусы к backend (Prisma enum OrderStatus)
// + оставили string, чтобы не падать, если прилетит новый статус
export type OrderStatus =
	| 'PENDING'
	| 'ASSIGNED'
	| 'ARRIVED'
	| 'IN_PROGRESS'
	| 'COMPLETED'
	| 'CANCELLED'
	| 'DISPUTE'
	| 'CANCELED'
	| string;

export type OrderDto = {
	id: string;
	title: string;
	description?: string | null;

	status: OrderStatus;

	dispatchMode?: string | null;

	price?: number | null;

	scheduledAt?: string | null; // ISO
	createdAt?: string;
	updatedAt?: string;

	street?: string | null;
	house?: string | null;
	apartment?: string | null;

	district?: { id: string; name: string; city?: string | null } | null;
	specialty?: { id: string; name: string } | null;

	// sensitive fields, backend already nulls them if not assigned to current master
	clientName?: string | null;
	clientPhone?: string | null;

	masterId?: string | null;
};

export type GetOrdersQuery = {
	// Новый параметр для табов (если бэк уже поддерживает scope)
	// Если бэк НЕ поддерживает — просто не передавай его, ничего не сломается.
	scope?: 'available' | 'active' | 'history';

	status?: string; // default PENDING on backend
	districtId?: string;
	specialtyId?: string;
	urgentOnly?: boolean;
	minPrice?: number;
	maxPrice?: number;
	search?: string;
	limit?: number;
	offset?: number;
};

export type AcceptOrderResponseDto = {
	success: boolean;
	orderId: string;
	message?: string;
};

// Ответ от advance (под твой бэк: { id, status, amoLeadId })
export type AdvanceOrderResponseDto = {
	id: string;
	status: OrderStatus;
	amoLeadId?: string | null;
};

// adjust these paths if your controller differs
const ROUTES = {
	available: '/orders',
	one: (id: string) => `/orders/${id}`,
	accept: (id: string) => `/orders/${id}/accept`,
	advance: (id: string) => `/orders/${id}/advance`,
};

function qs(query: GetOrdersQuery) {
	const p = new URLSearchParams();

	if (query.scope) p.set('scope', query.scope);

	if (query.status) p.set('status', query.status);
	if (query.districtId) p.set('districtId', query.districtId);
	if (query.specialtyId) p.set('specialtyId', query.specialtyId);
	if (query.urgentOnly) p.set('urgentOnly', 'true');
	if (query.minPrice != null) p.set('minPrice', String(query.minPrice));
	if (query.maxPrice != null) p.set('maxPrice', String(query.maxPrice));
	if (query.search) p.set('search', query.search);
	if (query.limit != null) p.set('limit', String(query.limit));
	if (query.offset != null) p.set('offset', String(query.offset));

	const s = p.toString();
	return s ? `?${s}` : '';
}

export async function getAvailableOrders(query: GetOrdersQuery = {}) {
	// Не меняем семантику: это по-прежнему "available" через /orders
	// Просто позволяем (опционально) передавать scope, если бэк уже поддерживает.
	return api<OrderDto[]>(`${ROUTES.available}${qs(query)}`, { method: 'GET' });
}

export async function getOrderById(id: string) {
	return api<OrderDto>(ROUTES.one(id), { method: 'GET' });
}

export async function acceptOrder(id: string) {
	return api<AcceptOrderResponseDto>(ROUTES.accept(id), { method: 'POST' });
}

export async function advanceOrderStatus(id: string) {
	return api<AdvanceOrderResponseDto>(ROUTES.advance(id), { method: 'POST' });
}
