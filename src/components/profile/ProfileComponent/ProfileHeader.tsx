'use client';

type ProfileHeaderProps = {
	onBack: () => void;
};

export function ProfileHeader({ onBack }: ProfileHeaderProps) {
	return (
		<div className="px-4 pt-4 pb-2 flex items-center justify-between">
			<button
				className="w-10 h-10 rounded-full bg-[#1c1c1e] flex items-center justify-center text-white hover:bg-[#2c2c2e] transition-colors"
				onClick={onBack}
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<path d="M19 12H5M12 19l-7-7 7-7" />
				</svg>
			</button>
			<div className="text-sm font-medium text-gray-500">Профиль</div>
			<div className="w-10" />
		</div>
	);
}
