// src/components/ui/AppTopBarSlot.tsx
'use client';

import { ReactNode } from 'react';
import { TopProgressBar } from './TopProgressBar';

export function AppTopBarSlot({
	active,
	children,
}: {
	active: boolean;
	children: ReactNode;
}) {
	return (
		<>
			{/* ✅ ВСЕГДА резервируем место (safe-area + 3px) */}
			<div
				style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 3px)' }}
			>
				{children}
			</div>

			{/* ✅ бар в фиксированном слое, но место уже зарезервировано */}
			<div
				className="fixed left-0 right-0 z-50 pointer-events-none"
				style={{ top: 'env(safe-area-inset-top, 0px)', height: 3 }}
			>
				<TopProgressBar
					className={`h-[3px] transition-opacity duration-150 ${active ? 'opacity-100' : 'opacity-0'
						}`}
				/>
			</div>
		</>
	);
}
