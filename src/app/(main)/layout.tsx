// src/app/(main)/layout.tsx
import type { ReactNode } from 'react';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AuthGate } from '@/components/auth/AuthGate';
import BottomBarSlot from '@/components/navigation/BottomBarSlot';

export default function MainLayout({ children }: { children: ReactNode }) {
	return (
		<QueryProvider>
			<AuthGate>
				<BottomBarSlot>{children}</BottomBarSlot>
			</AuthGate>
		</QueryProvider>
	);
}
