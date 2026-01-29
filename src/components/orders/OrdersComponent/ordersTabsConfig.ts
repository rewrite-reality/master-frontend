export type OrdersTab = 'active' | 'available' | 'history';

export const TAB_LABELS: Record<OrdersTab, string> = {
	active: 'Активные',
	available: 'Доступные',
	history: 'История',
};

export const ORDERS_TABS: OrdersTab[] = ['active', 'available', 'history'];
