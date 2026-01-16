// src/components/navigation/BottomBar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// Minimalist List Icon
function IconOrders({ active }: { active: boolean }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={active ? 2.5 : 2}
			className={clsx('h-6 w-6 transition-colors', active ? 'text-[#ccf333]' : 'text-gray-500')}
		>
			<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
		</svg>
	);
}

// Minimalist User Icon
function IconProfile({ active }: { active: boolean }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={active ? 2.5 : 2}
			className={clsx('h-6 w-6 transition-colors', active ? 'text-[#ccf333]' : 'text-gray-500')}
		>
			<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
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
			className="group flex flex-1 flex-col items-center justify-center gap-1 py-1 transition active:scale-95"
			aria-current={active ? 'page' : undefined}
		>
			{/* Icon Container with subtle glow on active */}
			<div className={clsx(
				"p-1.5 rounded-full transition-all duration-300",
				active ? "bg-[#ccf333]/10" : "bg-transparent group-hover:bg-white/5"
			)}>
				{icon}
			</div>

			<span className={clsx(
				'text-[10px] font-medium tracking-wide transition-colors',
				active ? 'text-[#ccf333]' : 'text-gray-500 group-hover:text-gray-300'
			)}>
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
		<div className="fixed inset-x-0 bottom-6 z-50 pointer-events-none">
			<div className="px-6 flex justify-center">
				<div
					className={clsx(
						'pointer-events-auto w-full max-w-[280px]', // Compact width
						'rounded-full border border-white/10', // Subtle border
						'bg-[#1c1c1e]/90 backdrop-blur-xl', // Dark glass effect
						'shadow-[0_8px_32px_rgba(0,0,0,0.5)]', // Deep shadow
					)}
				>
					<div className="flex items-center justify-between px-6 py-3">
						<TabLink
							href="/orders"
							active={isOrders}
							label=""
							icon={<IconOrders active={isOrders} />}
						/>

						{/* Divider */}
						<div className="h-8 w-[1px] bg-white/10 mx-2" />

						<TabLink
							href="/profile"
							active={isProfile}
							label=""
							icon={<IconProfile active={isProfile} />}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
