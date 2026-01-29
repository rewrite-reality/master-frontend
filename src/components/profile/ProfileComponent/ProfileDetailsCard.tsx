'use client';

import type { Named } from '@/components/auth/meQuery';

type ProfileDetailsCardProps = {
	phonePretty: string;
	phoneE164: string;
	onCopyPhone: () => void;
	districts: Named[];
};

export function ProfileDetailsCard({
	phonePretty,
	phoneE164,
	onCopyPhone,
	districts,
}: ProfileDetailsCardProps) {
	return (
		<div className="bg-[#1c1c1e] rounded-[24px] p-5">
			<h3 className="text-gray-500 text-xs uppercase tracking-widest font-semibold mb-4">Детали</h3>

			<div className="space-y-4">
				<div
					className="flex items-center justify-between group cursor-pointer active:opacity-70 transition-opacity"
					onClick={onCopyPhone}
				>
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
								<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
							</svg>
						</div>
						<span className="text-white font-medium">{phonePretty || phoneE164}</span>
					</div>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors">
						<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
					</svg>
				</div>

				<div className="h-[1px] bg-white/5 w-full my-2" />

				<div className="flex items-start gap-3">
					<div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
							<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
							<circle cx="12" cy="10" r="3" />
						</svg>
					</div>
					<div className="flex flex-col">
						<span className="text-white text-sm font-medium">Районы работы</span>
						<span className="text-gray-500 text-sm mt-0.5">
							{districts.length ? districts.map((d) => d.name).join(', ') : 'Не указаны'}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
