'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import BottomBar from '@/components/navigation/BottomBar';

export default function BottomBarSlot({ children }: { children: ReactNode }) {
	const pathname = usePathname();

	// скрываем на /orders/[id] и /profile/setup
	const hideBottomBar = /^\/orders\/[^/]+$/.test(pathname) || pathname === '/profile/setup';

	// если скрыли bottom bar — уменьшаем padding снизу (или вообще убираем)
	return (
		<div>
			<div className={hideBottomBar ? 'pb-0' : 'pb-28'}>
				{children}
			</div>

			{!hideBottomBar && <BottomBar />}
		</div>
	);
}
