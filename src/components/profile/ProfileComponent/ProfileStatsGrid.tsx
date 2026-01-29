'use client';

import { formatMoneyCompact } from './profileUtils';

type ProfileStatsGridProps = {
	rating: number;
	balance: number | null;
};

export function ProfileStatsGrid({ rating, balance }: ProfileStatsGridProps) {
	return (
		<div className="px-4 mb-6">
			<div className="grid grid-cols-2 gap-3">
				<div className="bg-[#1c1c1e] rounded-[20px] p-4 flex flex-col items-center justify-center gap-1">
					<span className="text-2xl font-bold text-[#ccf333]">{rating}</span>
					<span className="text-[10px] text-gray-500 uppercase tracking-widest">Рейтинг</span>
				</div>

				<div className="bg-[#1c1c1e] rounded-[20px] p-4 flex flex-col items-center justify-center gap-1">
					<span className="text-2xl font-bold text-white">{formatMoneyCompact(balance)}</span>
					<span className="text-[10px] text-gray-500 uppercase tracking-widest">Баланс</span>
				</div>
			</div>
		</div>
	);
}
