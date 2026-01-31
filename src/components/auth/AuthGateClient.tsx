'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useRawInitData } from '@tma.js/sdk-react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/apiClient';
import { bootstrapMe, subscribeNeedsSetup } from './meQuery';
// import { TopProgressBar } from '../ui/TopProgressBar';

function normalizeInitData(raw: string): string {
	let s = raw.trim();
	if (s.startsWith('#')) s = s.slice(1);
	if (s.startsWith('tgWebAppData=')) s = s.slice('tgWebAppData='.length);
	return s;
}

export function AuthGateClient({ children }: { children: ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const queryClient = useQueryClient();
	const raw = useRawInitData();

	const initData = useMemo(() => (raw ? normalizeInitData(raw) : null), [raw]);

	const [ready, setReady] = useState(false);
	const [fatalError, setFatalError] = useState<string | null>(null);
	const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);

	useEffect(() => {
		router.prefetch('/profile');
		router.prefetch('/profile/setup');
		router.prefetch('/orders');
	}, [router]);

	useEffect(() => subscribeNeedsSetup((value) => setNeedsSetup(value)), []);

	useEffect(() => {
		if (!initData) return;

		let cancelled = false;

		(async () => {
			try {
				setFatalError(null);
				const { needsSetup } = await bootstrapMe(initData, queryClient);
				if (cancelled) return;

				setNeedsSetup(needsSetup);
				setReady(true);
			} catch (e) {
				if (cancelled) return;
				if (e instanceof ApiError && e.status === 401) {
					setFatalError('Telegram init data is invalid for this Mini App.');
					return;
				}
				setFatalError(e instanceof Error ? e.message : 'Auth failed. Please reload.');
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [initData, queryClient]);

	useEffect(() => {
		if (!ready) return;
		if (needsSetup == null) return;

		if (needsSetup && pathname !== '/profile/setup') {
			router.replace('/profile/setup');
			return;
		}

		if (!needsSetup && pathname === '/profile/setup') {
			router.replace('/profile');
		}
	}, [ready, pathname, router]);

	if (fatalError) {
		return (
			<div className="min-h-[50vh] p-4 flex items-center justify-center">
				<div className="card bg-base-100 shadow border border-base-200 w-full max-w-md">
					<div className="card-body gap-3">
						<h2 className="card-title">Authorization error</h2>
						<p className="opacity-70 text-sm">{fatalError}</p>
						<button className="btn btn-primary w-full" onClick={() => window.location.reload()}>
							Reload
						</button>
					</div>
				</div>
			</div>
		);
	}

	// if (!ready) {
	// 	return <TopProgressBar className="fixed left-0 right-0 top-0 z-50" />;
	// }

	// Check if we need to redirect
	const shouldRedirect = ready && needsSetup != null && (
		(needsSetup && pathname !== '/profile/setup') ||
		(!needsSetup && pathname === '/profile/setup')
	);

	if (!ready || shouldRedirect) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[#161616]">
				{/* <span className="loading loading-spinner loading-lg text-primary"></span> */}
			</div>
		);
	}

	return <>{children}</>;
}