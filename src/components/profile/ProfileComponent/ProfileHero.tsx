'use client';

type ProfileHeroProps = {
	fullName: string;
	tgPhotoUrl: string | null;
	initials: string;
	avatarBorderColor: string;
	rating: number;
	reviewsText: string;
	statusLabel: string;
	statusClassName: string;
};

export function ProfileHero({
	fullName,
	tgPhotoUrl,
	initials,
	avatarBorderColor,
	rating,
	reviewsText,
	statusLabel,
	statusClassName,
}: ProfileHeroProps) {
	return (
		<div className="flex flex-col items-center pt-6 pb-8">
			<div className={`relative p-1 rounded-full border-2 ${avatarBorderColor} transition-colors duration-500`}>
				<div className="w-24 h-24 rounded-full bg-[#1c1c1e] flex items-center justify-center overflow-hidden">
					{tgPhotoUrl ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={tgPhotoUrl} alt="avatar" className="w-full h-full object-cover" />
					) : (
						<span className="text-3xl font-bold text-gray-400 select-none">{initials}</span>
					)}
				</div>

				<div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-black ${statusClassName}`}>
					{statusLabel}
				</div>
			</div>

			<h1 className="mt-5 text-2xl font-semibold tracking-tight">{fullName}</h1>

			<div className="flex items-center gap-1.5 mt-2 text-sm text-gray-400">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#ccf333]">
					<path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
				</svg>
				<span className="text-white font-medium">{rating}</span>
				<span>•</span>
				<span>{reviewsText}</span>
			</div>
		</div>
	);
}
