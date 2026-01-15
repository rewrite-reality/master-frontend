// src/app/(main)/layout.tsx
import type { ReactNode } from 'react';
import BottomBar from '@/components/navigation/BottomBar';

export default function MainLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-dvh bg-base-200">
			{/* page content */}
			<div className="pb-28">{children}</div>

			{/* iOS-like bottom bar */}
			<BottomBar />
		</div>
	);
}
