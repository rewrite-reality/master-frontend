// src/components/auth/AuthGate.tsx
'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
// import { TopProgressBar } from '../ui/TopProgressBar';


const AuthGateClient = dynamic(
	() => import('./AuthGateClient').then((m) => m.AuthGateClient),
	{
		ssr: false,
		// loading: () => <TopProgressBar className="absolute left-0 right-0 top-0 z-50" />,
	},
);

export function AuthGate({ children }: { children: ReactNode }) {
	return <AuthGateClient>{children}</AuthGateClient>;
}
