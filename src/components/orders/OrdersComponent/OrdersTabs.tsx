'use client';

import { ORDERS_TABS, TAB_LABELS, type OrdersTab } from './ordersTabsConfig';

type OrdersTabsProps = {
	currentTab: OrdersTab;
	onTabChange: (tab: OrdersTab) => void;
};

export default function OrdersTabs({ currentTab, onTabChange }: OrdersTabsProps) {
	return (
		<div className="flex gap-2 overflow-x-auto no-scrollbar">
			{ORDERS_TABS.map((tab) => {
				const active = currentTab === tab;
				return (
					<button
						key={tab}
						onClick={() => onTabChange(tab)}
						className={`btn btn-sm rounded-full border-none px-6 font-normal ${active ? 'bg-[#ccf333] text-black hover:bg-[#bbe02f]' : 'bg-[#1c1c1e] text-gray-400 hover:bg-[#2c2c2e]'
							}`}
					>
						{TAB_LABELS[tab]}
					</button>
				);
			})}
		</div>
	);
}
