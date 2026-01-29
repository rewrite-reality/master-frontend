import { useCallback } from 'react';

interface OrderMapPreviewProps {
	mapUrl: string;
	lat?: number | null;
	lon?: number | null;
}

export function OrderMapPreview({ mapUrl, lat, lon }: OrderMapPreviewProps) {
	const handleOpenMap = useCallback(() => {
		if (!lat || !lon) return;
		const url = `https://yandex.ru/maps/?pt=${lon},${lat}&z=16&l=map`;

		// Prefer Telegram WebApp openLink when available; fallback to browser open.
		// @ts-ignore
		if (typeof window !== 'undefined' && window.Telegram?.WebApp?.openLink) {
			// @ts-ignore
			window.Telegram.WebApp.openLink(url);
			return;
		}

		window.open(url, '_blank', 'noopener,noreferrer');
	}, [lat, lon]);

	return (
		<div className="relative h-48 w-full">
			<img
				src={mapUrl}
				alt="Map location"
				className="w-full h-full object-cover"
			/>
			<div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#1c1c1e] to-transparent" />

			{(lat && lon) && (
				<button
					className="absolute bottom-4 right-4 w-10 h-10 bg-[#ccf333] rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer z-10"
					onClick={(e) => {
						e.stopPropagation();
						handleOpenMap();
					}}
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="black" className="w-5 h-5">
						<path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
						<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
					</svg>
				</button>
			)}
		</div>
	);
}
