import type { OrderDto } from '@/lib/ordersApi';

export type UiOrderStatus = OrderDto['status'];

export const STATUS_LABELS: Record<string, string> = {
	PENDING: 'В поиске мастера',
	ASSIGNED: 'Мастер найден',
	ARRIVED: 'Мастер на месте',
	IN_PROGRESS: 'В работе',
	COMPLETED: 'Выполнено',
	CANCELLED: 'Отменено',
	DISPUTE: 'Спор',
};
