// src/components/navigation/BottomBar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

function IconOrders({ active }: { active: boolean }) {
	return (
		<svg
			viewBox="0 0 24 24"
			className={clsx('h-6 w-6', active ? 'text-primary' : 'text-base-content/70')}
			aria-hidden="true"
		>
			<path
				fill="currentColor"
				d="M7 2h10a2 2 0 0 1 2 2v17a1 1 0 0 1-1.447.894L12 19.118l-5.553 2.776A1 1 0 0 1 5 21V4a2 2 0 0 1 2-2zm0 2v15.382l4.553-2.276a1 1 0 0 1 .894 0L17 19.382V4H7zm2 3h6v2H9V7zm0 4h6v2H9v-2z"
			/>
		</svg>
	);
}

function IconProfile({ active }: { active: boolean }) {
	return (
		<svg
			viewBox="0 0 24 24"
			className={clsx('h-6 w-6', active ? 'text-primary' : 'text-base-content/70')}
			aria-hidden="true"
		>
			<path
				fill="currentColor"
				d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4.418 0-8 2.015-8 4.5V21h16v-2.5c0-2.485-3.582-4.5-8-4.5z"
			/>
		</svg>
	);
}

function TabLink({
	href,
	active,
	label,
	icon,
}: {
	href: string;
	active: boolean;
	label: string;
	icon: React.ReactNode;
}) {
	return (
		<Link
			href={href}
			className={clsx(
				'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition',
				active ? 'bg-primary/10' : 'hover:bg-base-300/40'
			)}
			aria-current={active ? 'page' : undefined}
		>
			{icon}
			<span className={clsx('text-[11px] font-medium', active ? 'text-primary' : 'text-base-content/70')}>
				{label}
			</span>
		</Link>
	);
}

export default function BottomBar() {
	const pathname = usePathname();

	const isOrders = pathname === '/orders' || pathname.startsWith('/orders/');
	const isProfile = pathname === '/profile' || pathname.startsWith('/profile/');

	return (
		<div className="fixed inset-x-0 bottom-0 z-50">
			<div className="px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
				<div
					className={clsx(
						'mx-auto w-full max-w-md',
						'rounded-full border border-base-300/60',
						'bg-base-100/80 backdrop-blur-xl',
						'shadow-lg'
					)}
				>
					<div className="flex items-center justify-around px-2 py-2">
						<TabLink href="/orders" active={isOrders} label="Заказы" icon={<IconOrders active={isOrders} />} />
						<TabLink href="/profile" active={isProfile} label="Профиль" icon={<IconProfile active={isProfile} />} />
					</div>
				</div>
			</div>
		</div>
	);
}
