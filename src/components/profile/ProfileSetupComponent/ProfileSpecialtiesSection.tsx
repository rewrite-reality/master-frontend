import type { Item } from './types';

type ProfileSpecialtiesSectionProps = {
	loading: boolean;
	specialties: Item[];
	selectedIds: string[];
	onToggle: (id: string) => void;
};

export function ProfileSpecialtiesSection({
	loading,
	specialties,
	selectedIds,
	onToggle,
}: ProfileSpecialtiesSectionProps) {
	return (
		<div className="space-y-4">
			<div className="flex justify-between items-end">
				<h2 className="text-xs uppercase tracking-widest text-gray-500 font-semibold pl-1">Специальности</h2>
				<span className="text-xs text-gray-600">{selectedIds.length} выбрано</span>
			</div>

			{loading ? (
				<div className="flex gap-2 justify-center py-4">
					<span className="loading loading-dots loading-md text-[#ccf333]"></span>
				</div>
			) : (
				<div className="flex flex-wrap gap-2">
					{specialties.map((specialty) => {
						const id = String(specialty.id);
						const isSelected = selectedIds.includes(id);
						return (
							<button
								key={specialty.id}
								onClick={() => onToggle(id)}
								className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${isSelected
									? 'bg-[#ccf333] text-black border-[#ccf333]'
									: 'bg-[#1c1c1e] text-gray-400 border-white/5 hover:border-white/20'
									}`}
							>
								{specialty.name}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
