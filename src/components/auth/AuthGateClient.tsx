// src/components/auth/AuthGateClient.tsx
'use client';

import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useRawInitData } from '@tma.js/sdk-react';
import { api, ApiError } from '@/lib/apiClient';
import { loginWithInitData } from '@/lib/authApi';
import { tokenStorage } from '@/lib/tokenStorage';

type Named = { id: string; name: string };

type ProfileDto = {
	id: string;
	firstName: string | null;
	lastName: string | null;
	patronymic: string | null;
	phone: string | null;
	status: string | null;
	districts: Named[];
	specialties: Named[];
};

type MeResponse = {
	id: string;
	role: string;
	telegramUsername: string | null;
	profile: ProfileDto | null;
};

function normalizeInitData(raw: string): string {
	let s = raw.trim();
	if (s.startsWith('#')) s = s.slice(1);
	if (s.startsWith('tgWebAppData=')) s = s.slice('tgWebAppData='.length);
	return s;
}

function calcNeedsSetup(me: MeResponse): boolean {
	const p = me.profile;
	return !p || !p.firstName?.trim() || !p.lastName?.trim() || !p.phone?.trim();
}

/**
 * ✅ Глобальный singleton: 1 запрос /users/me на холодный старт,
 * дальше используем сохранённый результат (и не делаем повторные GET/OPTIONS).
 */
let bootPromise: Promise<{ me: MeResponse; needsSetup: boolean }> | null = null;
let bootResult: { me: MeResponse; needsSetup: boolean } | null = null;

async function bootstrap(initData: string): Promise<{ me: MeResponse; needsSetup: boolean }> {
	if (bootResult) return bootResult;
	if (bootPromise) return bootPromise;

	bootPromise = (async () => {
		const existing = tokenStorage.get();

		const fetchMe = async () => {
			const me = await api<MeResponse>('/users/me', { method: 'GET' });
			return { me, needsSetup: calcNeedsSetup(me) };
		};

		// 1) пробуем по текущему токену
		if (existing) {
			try {
				const res = await fetchMe();
				bootResult = res;
				return res;
			} catch (e) {
				if (e instanceof ApiError && (e.status === 401 || e.status === 403 || e.status === 404)) {
					tokenStorage.clear();
				} else {
					throw e;
				}
			}
		}

		// 2) логин по initData -> /users/me
		const loginRes = await loginWithInitData(initData);
		tokenStorage.set(loginRes.accessToken);

		const res = await fetchMe();
		bootResult = res;
		return res;
	})();

	try {
		return await bootPromise;
	} finally {
		// Promise оставляем (пусть шарится), но если упало — позволим повтор.
		// Если успех — bootResult уже заполнен.
		if (!bootResult) bootPromise = null;
	}
}

export function AuthGateClient({ children }: { children: ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const raw = useRawInitData();

	const initData = useMemo(() => (raw ? normalizeInitData(raw) : null), [raw]);

	const [ready, setReady] = useState(false);
	const [fatalError, setFatalError] = useState<string | null>(null);

	const needsSetupRef = useRef<boolean | null>(null);

	useEffect(() => {
		router.prefetch('/profile');
		router.prefetch('/profile/setup');
		router.prefetch('/orders');
	}, [router]);

	// ✅ 1) Bootstrap только один раз (без зависимости от pathname)
	useEffect(() => {
		if (!initData) return;

		let alive = true;

		(async () => {
			try {
				setFatalError(null);
				const { needsSetup } = await bootstrap(initData);
				if (!alive) return;

				needsSetupRef.current = needsSetup;
				setReady(true);
			} catch (e) {
				if (!alive) return;
				if (e instanceof ApiError && e.status === 401) {
					setFatalError('Сессия Telegram устарела. Закрой и заново открой Mini App.');
					return;
				}
				setFatalError(e instanceof Error ? e.message : 'Ошибка авторизации');
			}
		})();

		return () => {
			alive = false;
		};
	}, [initData]);

	// ✅ 2) Редиректы по pathname — без сети, только по needsSetupRef
	useEffect(() => {
		if (!ready) return;
		const needsSetup = needsSetupRef.current;
		if (needsSetup == null) return;

		if (needsSetup) {
			if (pathname !== '/profile/setup') router.replace('/profile/setup');
			return;
		}

		if (pathname === '/profile/setup') router.replace('/profile');
	}, [ready, pathname, router]);

	if (fatalError) {
		return (
			<div className="min-h-[50vh] p-4 flex items-center justify-center">
				<div className="card bg-base-100 shadow border border-base-200 w-full max-w-md">
					<div className="card-body gap-3">
						<h2 className="card-title">Ошибка</h2>
						<p className="opacity-70 text-sm">{fatalError}</p>
						<button className="btn btn-primary w-full" onClick={() => window.location.reload()}>
							Обновить
						</button>
					</div>
				</div>
			</div>
		);
	}

	if (!ready) {
		return (
			<div className="relative min-h-[40vh]">
				<div className="absolute left-0 right-0 top-0 h-[2px] bg-base-300 overflow-hidden">
					<div className="h-full w-1/3 bg-primary animate-[progress_1.1s_ease-in-out_infinite]" />
				</div>
				<style jsx global>{`
          @keyframes progress {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(80%); }
            100% { transform: translateX(220%); }
          }
        `}</style>
			</div>
		);
	}

	return <>{children}</>;
}
