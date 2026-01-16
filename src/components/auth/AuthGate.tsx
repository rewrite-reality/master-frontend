// src/components/auth/AuthGate.tsx
'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

const AuthGateClient = dynamic(
	() => import('./AuthGateClient').then((m) => m.AuthGateClient),
	{
		ssr: false,
		loading: () => (
			<div className="relative min-h-[40vh]">
				<div className="absolute left-0 right-0 top-0 h-[2px] bg-base-300 overflow-hidden">
					<div className="h-full w-1/3 bg-primary animate-[progress_1.1s_ease-in-out_infinite]" />
				</div>
				<style jsx global>{`
					@keyframes progress {
						0% { transform: translateX(-100%); }
						50% { transform: translateX(80%); }
						100% { transform: translateX(220%); }
					}
				`}</style>
			</div>
		),
	},
);

export function AuthGate({ children }: { children: ReactNode }) {
	return <AuthGateClient>{children}</AuthGateClient>;
}
