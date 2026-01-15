'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRawInitData } from '@tma.js/sdk-react';
import { loginWithInitData } from '@/lib/authApi';
import { tokenStorage } from '@/lib/tokenStorage';
import { ApiError } from '@/lib/apiClient';

function normalizeInitData(raw: string): string {
	let s = raw.trim();
	if (s.startsWith('#')) s = s.slice(1);
	if (s.startsWith('tgWebAppData=')) s = s.slice('tgWebAppData='.length);
	return s;
}

export function SplashClient() {
	const router = useRouter();
	const initDataRawHook = useRawInitData();

	const initData = useMemo(
		() => (initDataRawHook ? normalizeInitData(initDataRawHook) : null),
		[initDataRawHook],
	);

	const [error, setError] = useState<string | null>(null);
	const didRun = useRef(false);

	useEffect(() => {
		if (!initData) return;
		if (didRun.current) return;
		didRun.current = true;

		let cancelled = false;

		(async () => {
			try {
				setError(null);

				// если токен уже есть — можно сразу дальше
				const existing = tokenStorage.get();
				if (existing) {
					router.replace('/profile/setup');
					return;
				}

				const res = await loginWithInitData(initData);
				tokenStorage.set(res.accessToken);

				if (!cancelled) router.replace('/profile/setup');
			} catch (e) {
				if (cancelled) return;

				if (e instanceof ApiError) {
					// если initData истёк — просим переоткрыть Mini App
					if (e.status === 401) {
						setError('Сессия Telegram устарела. Закрой и заново открой Mini App.');
						return;
					}
					setError(e.message);
					return;
				}

				setError(e instanceof Error ? e.message : 'Unknown error');
				didRun.current = false; // разрешим повтор после reload
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [initData, router]);

	return (
		<main className="min-h-dvh flex items-center justify-center p-6">
			<div className="w-full max-w-md">
				<div className="card bg-base-100 shadow-xl border border-base-200">
					<div className="card-body">
						<div className="flex items-center gap-3">
							<span className="loading loading-spinner loading-md" />
							<div>
								<h1 className="card-title">Авторизация…</h1>
								<p className="text-sm opacity-70">
									{initData ? 'Отправляем initData на сервер' : 'Ждём initData из Telegram'}
								</p>
							</div>
						</div>

						{!initData && (
							<div className="mt-4 alert">
								<span>Открой Mini App внутри Telegram — initData в обычном браузере нет.</span>
							</div>
						)}

						{error && (
							<div className="mt-4 alert alert-error">
								<span>{error}</span>
							</div>
						)}

						{error && (
							<div className="mt-4">
								<button className="btn btn-primary w-full" onClick={() => window.location.reload()}>
									Повторить
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</main>
	);
}
