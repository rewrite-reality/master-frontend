'use client';

type ProfileSettingsCardProps = {
	onOpenSetup: () => void;
};

export function ProfileSettingsCard({ onOpenSetup }: ProfileSettingsCardProps) {
	return (
		<div
			className="bg-[#1c1c1e] rounded-[24px] p-5 cursor-pointer active:opacity-80 transition-opacity"
			onClick={onOpenSetup}
		>
			<h3 className="text-gray-500 text-xs uppercase tracking-widest font-semibold mb-4">Настройки</h3>

			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
							<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h3M12 3v3m6.364 2.136-2.121 2.121m1.414 7.071-2.121-2.121M21 12h-3M6 10.5v3M3 12h3m2.136-6.364 2.121 2.121m-2.121 9.9 2.121-2.121M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z" />
						</svg>
					</div>

					<div className="flex flex-col">
						<span className="text-white font-medium">Профиль мастера</span>
						<span className="text-gray-500 text-sm mt-0.5">Изменить районы, специализацию и данные</span>
					</div>
				</div>

				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-600">
					<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
				</svg>
			</div>
		</div>
	);
}
