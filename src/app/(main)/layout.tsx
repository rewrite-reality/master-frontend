// src/app/(main)/layout.tsx
import type { ReactNode } from 'react';
import BottomBar from '@/components/navigation/BottomBar';
import { AuthGate } from '@/components/auth/AuthGate';

export default function MainLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-dvh bg-base-200">
			<div className="pb-28">
				<AuthGate>{children}</AuthGate>
			</div>
			<BottomBar />
		</div>
	);
}
