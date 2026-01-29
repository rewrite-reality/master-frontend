import type { Item } from './types';

type ProfileDistrictsSectionProps = {
	loading: boolean;
	districts: Item[];
	selectedIds: string[];
	onToggle: (id: string) => void;
};

export function ProfileDistrictsSection({
	loading,
	districts,
	selectedIds,
	onToggle,
}: ProfileDistrictsSectionProps) {
	return (
		<div className="space-y-4">
			<div className="flex justify-between items-end">
				<h2 className="text-xs uppercase tracking-widest text-gray-500 font-semibold pl-1">Районы работы</h2>
				<span className="text-xs text-gray-600">{selectedIds.length} выбрано</span>
			</div>

			{loading ? (
				<div className="flex gap-2 justify-center py-4">
					<span className="loading loading-dots loading-md text-[#ccf333]"></span>
				</div>
			) : (
				<div className="flex flex-wrap gap-2">
					{districts.map((district) => {
						const id = String(district.id);
						const isSelected = selectedIds.includes(id);
						return (
							<button
								key={district.id}
								onClick={() => onToggle(id)}
								className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${isSelected
									? 'bg-[#ccf333] text-black border-[#ccf333]'
									: 'bg-[#1c1c1e] text-gray-400 border-white/5 hover:border-white/20'
									}`}
							>
								{district.name}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
