'use client';

import { type OrdersTab } from './ordersTabsConfig';

type OrdersEmptyStateProps = {
	currentTab: OrdersTab;
};

const EMPTY_TEXT: Record<OrdersTab, string> = {
	active: 'У вас нет активных заявок.',
	available: 'Доступных заявок с такими параметрами не найдено.',
	history: 'История пока пуста.',
};

export default function OrdersEmptyState({ currentTab }: OrdersEmptyStateProps) {
	return (
		<div className="card bg-[#1c1c1e] text-center py-10 rounded-[24px]">
			<div className="card-body">
				<h2 className="text-gray-300 font-semibold mb-2">Пусто</h2>
				<p className="text-gray-600 text-sm">{EMPTY_TEXT[currentTab]}</p>
			</div>
		</div>
	);
}
