'use client';

import dynamic from 'next/dynamic';

const SplashClient = dynamic(() => import('./SplashClient').then((m) => m.SplashClient), {
	ssr: false,
	loading: () => (
		<main className="min-h-dvh flex items-center justify-center p-6">
			<span className="loading loading-spinner loading-md" />
		</main>
	),
});

export default function SplashWrapper() {
	return <SplashClient />;
}
