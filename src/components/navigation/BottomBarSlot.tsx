'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import BottomBar from '@/components/navigation/BottomBar';

export default function BottomBarSlot({ children }: { children: ReactNode }) {
	const pathname = usePathname();

	// скрываем на /orders/[id]
	const hideBottomBar = /^\/orders\/[^/]+$/.test(pathname);

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
