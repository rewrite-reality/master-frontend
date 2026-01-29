'use client';

type OrdersFiltersProps = {
	search: string;
	onSearchChange: (value: string) => void;
	showUrgent?: boolean;
	urgentOnly?: boolean;
	onUrgentChange?: (value: boolean) => void;
};

export default function OrdersFilters({
	search,
	onSearchChange,
	showUrgent = false,
	urgentOnly = false,
	onUrgentChange,
}: OrdersFiltersProps) {
	return (
		<div className="flex flex-col gap-4">
			<div className="relative">
				<input
					type="text"
					placeholder="Поиск по ID или адресу..."
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					className="input input-bordered w-full bg-[#1c1c1e] border-none rounded-full pl-11 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#ccf333]"
				/>
				<svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</div>
			{showUrgent && onUrgentChange && (
				<label className="flex items-center gap-2 text-sm text-gray-300">
					<input
						type="checkbox"
						checked={urgentOnly}
						onChange={(e) => onUrgentChange(e.target.checked)}
						className="checkbox checkbox-sm checkbox-success"
					/>
					Срочные
				</label>
			)}
		</div>
	);
}
