'use client';

import type { Named } from '@/components/auth/meQuery';

type ProfileSpecialtiesCardProps = {
	specialties: Named[];
};

export function ProfileSpecialtiesCard({ specialties }: ProfileSpecialtiesCardProps) {
	return (
		<div className="bg-[#1c1c1e] rounded-[24px] p-5">
			<h3 className="text-gray-500 text-xs uppercase tracking-widest font-semibold mb-4">Специализация</h3>
			<div className="flex flex-wrap gap-2">
				{specialties.length > 0 ? (
					specialties.map((s) => (
						<span key={s.id} className="px-3 py-1.5 rounded-full bg-[#ccf333]/10 text-[#ccf333] text-sm border border-[#ccf333]/20">
							{s.name}
						</span>
					))
				) : (
					<span className="text-gray-600 text-sm">Не указано</span>
				)}
			</div>
		</div>
	);
}
