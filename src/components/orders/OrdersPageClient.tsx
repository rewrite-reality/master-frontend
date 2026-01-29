'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/lib/apiClient';
import { getAvailableOrders } from '@/lib/ordersApi';
import OrdersErrorAlert from './OrdersComponent/OrdersErrorAlert';
import OrdersFilters from './OrdersComponent/OrdersFilters';
import OrdersHeader from './OrdersComponent/OrdersHeader';
import OrdersListSection from './OrdersComponent/OrdersListSection';
import OrdersTabs from './OrdersComponent/OrdersTabs';
import { type OrdersTab } from './OrdersComponent/ordersTabsConfig';

export default function OrdersPageClient() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const currentTab = (searchParams.get('tab') as OrdersTab) || 'available';

	const [search, setSearch] = useState('');
	const [urgentOnly, setUrgentOnly] = useState(false);
	const [isPageVisible, setIsPageVisible] = useState(true);

	const handleTabChange = (newTab: OrdersTab) => {
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
			scope: currentTab,
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

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['orders', currentTab, query],
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
				<OrdersHeader title={headerTitle} onRefetch={() => refetch()} />
				<OrdersTabs currentTab={currentTab} onTabChange={handleTabChange} />
				<OrdersFilters search={search} onSearchChange={setSearch} urgentOnly={urgentOnly} onUrgentChange={setUrgentOnly} />
				<OrdersErrorAlert message={errorMessage} />
				<div className="space-y-4">
					<OrdersListSection items={items} isLoading={isLoading} currentTab={currentTab} />
				</div>
			</div>
		</div>
	);
}
