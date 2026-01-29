'use client';

import { type OrderDto } from '@/lib/ordersApi';
import { OrdersListSkeleton } from '../OrderSkeleton';
import OrderCard from './OrderCard';
import OrdersEmptyState from './OrdersEmptyState';
import { type OrdersTab } from './ordersTabsConfig';

type OrdersListSectionProps = {
	items: OrderDto[];
	isLoading: boolean;
	currentTab: OrdersTab;
};

export default function OrdersListSection({ items, isLoading, currentTab }: OrdersListSectionProps) {
	if (isLoading && items.length === 0) {
		return <OrdersListSkeleton count={6} />;
	}

	if (items.length === 0) {
		return <OrdersEmptyState currentTab={currentTab} />;
	}

	return (
		<>
			{items.map((o) => (
				<OrderCard key={o.id} o={o} />
			))}
		</>
	);
}
