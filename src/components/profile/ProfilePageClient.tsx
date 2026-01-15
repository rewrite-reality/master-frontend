// src/components/profile/ProfilePageClient.tsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/apiClient';

type Named = { id: string; name: string };

type ProfileDto = {
	id: string;
	firstName: string | null;
	lastName: string | null;
	patronymic: string | null;
	phone: string | null; // +79001234567
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

function initials(first?: string | null, last?: string | null) {
	const a = (first?.trim()?.[0] ?? '').toUpperCase();
	const b = (last?.trim()?.[0] ?? '').toUpperCase();
	return (b + a) || 'M';
}

function formatPhonePretty(e164?: string | null) {
	if (!e164) return '';
	const d = e164.replace(/\D/g, '');
	if (d.length === 11 && d.startsWith('7')) {
		const n = d.slice(1);
		return `+7 (${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6, 8)}-${n.slice(8, 10)}`;
	}
	return e164;
}

export default function ProfilePageClient() {
	const router = useRouter();

	const [me, setMe] = useState<MeResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [toast, setToast] = useState<string | null>(null);

	const showToast = useCallback((msg: string) => {
		setToast(msg);
		window.setTimeout(() => setToast(null), 2000);
	}, []);

	useEffect(() => {
		let cancelled = false;

		(async () => {
			try {
				setLoading(true);
				setError(null);

				const data = await api<MeResponse>('/users/me', { method: 'GET' });
				if (cancelled) return;

				setMe(data);

				// Redirect to setup only if profile is missing or key fields empty
				const p = data.profile;
				const needsSetup =
					!p ||
					!p.firstName?.trim() ||
					!p.lastName?.trim() ||
					!p.phone?.trim(); // patronymic optional here

				if (needsSetup) {
					router.replace('/profile/setup');
				}
			} catch (e) {
				if (cancelled) return;
				if (e instanceof ApiError) setError(e.message || `Ошибка ${e.status}`);
				else setError(e instanceof Error ? e.message : 'Ошибка загрузки профиля');
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [router]);

	const profile = me?.profile ?? null;

	const fullName = useMemo(() => {
		const ln = profile?.lastName?.trim() ?? '';
		const fn = profile?.firstName?.trim() ?? '';
		const pt = profile?.patronymic?.trim() ?? '';
		const name = [ln, fn, pt].filter(Boolean).join(' ');
		return name || 'Профиль';
	}, [profile]);

	const isAvailable = useMemo(() => {
		const hours = new Date().getHours();
		return hours >= 8 && hours < 20;
	}, []);

	const blocked = profile?.status === 'BLOCKED';

	const phoneE164 = profile?.phone ?? '';
	const phonePretty = formatPhonePretty(phoneE164);

	const handleBack = useCallback(() => {
		const wa = (window as any)?.Telegram?.WebApp;
		if (wa?.close) {
			wa.close();
			return;
		}
		if (history.length > 1) router.back();
	}, [router]);

	const copyPhone = useCallback(async () => {
		const text = phoneE164 || phonePretty;
		if (!text) return;

		try {
			await navigator.clipboard.writeText(text);
			showToast('Номер скопирован');
			if (navigator.vibrate) navigator.vibrate(50);
		} catch {
			const ta = document.createElement('textarea');
			ta.value = text;
			document.body.appendChild(ta);
			ta.select();
			document.execCommand('copy');
			ta.remove();
			showToast('Номер скопирован');
			if (navigator.vibrate) navigator.vibrate(50);
		}
	}, [phoneE164, phonePretty, showToast]);

	const handleMainAction = useCallback(() => {
		showToast('Скоро: назначение на заказ');
	}, [showToast]);

	if (loading) {
		return (
			<div className="min-h-dvh p-4 flex items-center justify-center">
				<div className="flex items-center gap-3 opacity-80">
					<span className="loading loading-spinner loading-md" />
					<span>Загрузка профиля…</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-dvh p-4 flex items-center justify-center">
				<div className="card bg-base-100 shadow border border-base-200 w-full max-w-md">
					<div className="card-body gap-3">
						<h2 className="card-title">Ошибка</h2>
						<p className="opacity-70 text-sm">{error}</p>
						<div className="card-actions">
							<button className="btn btn-primary w-full" onClick={() => window.location.reload()}>
								Обновить
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const specialties = profile?.specialties ?? [];
	const districts = profile?.districts ?? [];

	return (
		<div className="min-h-dvh bg-base-200">
			{/* Header */}
			<div className="px-4 pt-3">
				<button className="btn btn-ghost btn-sm gap-2" onClick={handleBack}>
					<svg width="18" height="18" viewBox="0 0 24 24" className="opacity-80">
						<path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
					</svg>
					Назад
				</button>
			</div>

			{/* Hero */}
			<div className="px-4 pt-4">
				<div className="flex flex-col items-center text-center gap-2">
					<div className="relative">
						<div className="avatar">
							<div className="w-28 rounded-full ring ring-base-300 ring-offset-base-200 ring-offset-2 bg-base-100">
								<div className="w-full h-full flex items-center justify-center text-xl font-bold opacity-70">
									{initials(profile?.firstName, profile?.lastName)}
								</div>
							</div>
						</div>

						<span
							className={[
								'absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-base-100',
								blocked ? 'bg-error' : isAvailable ? 'bg-success' : 'bg-neutral',
							].join(' ')}
							title={blocked ? 'Заблокирован' : isAvailable ? 'Доступен' : 'Недоступен'}
						/>
					</div>

					<div>
						<h1 className="text-2xl font-bold leading-tight">{fullName}</h1>
						<div className="flex items-center justify-center gap-2 mt-1 text-sm opacity-70">
							<span className="inline-flex items-center gap-1">
								<svg width="16" height="16" viewBox="0 0 24 24">
									<path
										fill="currentColor"
										className="text-warning"
										d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
									/>
								</svg>
								<span className="font-semibold text-base-content">4.9</span>
							</span>
							<span className="opacity-70">(0 отзывов)</span>
						</div>
					</div>

					{blocked && (
						<div className="alert alert-error mt-2 w-full max-w-md">
							<span>Аккаунт заблокирован</span>
						</div>
					)}
				</div>
			</div>

			{/* Stats */}
			<div className="px-4 mt-5">
				<div className="grid grid-cols-3 gap-2">
					<div className="card bg-base-100 shadow-sm border border-base-200">
						<div className="card-body items-center py-4 px-2">
							<div className="text-xl font-bold">—</div>
							<div className="text-[11px] uppercase tracking-wide opacity-60">Заказов</div>
						</div>
					</div>

					<div className="card bg-base-100 shadow-sm border border-base-200">
						<div className="card-body items-center py-4 px-2">
							<div className="text-xl font-bold">4.9</div>
							<div className="text-[11px] uppercase tracking-wide opacity-60">Рейтинг</div>
						</div>
					</div>

					<div className="card bg-base-100 shadow-sm border border-base-200">
						<div className="card-body items-center py-4 px-2">
							<div className="text-xl font-bold">—</div>
							<div className="text-[11px] uppercase tracking-wide opacity-60">Опыт</div>
						</div>
					</div>
				</div>
			</div>

			{/* Info */}
			<div className="px-4 mt-4 pb-28">
				<div className="card bg-base-100 shadow-sm border border-base-200">
					<div className="card-body gap-5">
						{/* Specialties */}
						<div className="space-y-2">
							<h2 className="text-base font-semibold">Специализация</h2>
							<div className="flex flex-wrap gap-2">
								{specialties.length > 0 ? (
									specialties.map((s) => (
										<span key={s.id} className="badge badge-primary badge-outline px-3 py-3">
											{s.name}
										</span>
									))
								) : (
									<span className="text-sm opacity-60">Не указано</span>
								)}
							</div>
						</div>

						<div className="divider my-0" />

						{/* Contacts */}
						<div className="space-y-2">
							<h2 className="text-base font-semibold">Контакты</h2>

							<div className="flex items-center justify-between py-1">
								<span className="text-sm">Телефон</span>
								<button
									className="btn btn-link btn-sm px-0 gap-2"
									onClick={copyPhone}
									disabled={!phoneE164 && !phonePretty}
								>
									<svg width="18" height="18" viewBox="0 0 24 24" className="opacity-80">
										<path
											fill="currentColor"
											d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
										/>
									</svg>
									{phonePretty || phoneE164}
								</button>
							</div>

							<div className="flex items-start justify-between py-1 gap-3">
								<span className="text-sm shrink-0">Районы</span>
								<span className="text-sm opacity-70 text-right">
									{districts.length ? districts.map((d) => d.name).join(', ') : 'Не указано'}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom action
			<div className="fixed inset-x-0 bottom-0 z-50">
				<div className="bg-gradient-to-t from-base-200 via-base-200/80 to-base-200/0 px-4 pt-6 pb-[max(16px,env(safe-area-inset-bottom))]">
					<button className="btn btn-primary w-full h-12 rounded-2xl shadow-lg" onClick={handleMainAction} disabled={blocked}>
						Назначить на заказ
					</button>
				</div>
			</div> */}

			{toast && (
				<div className="toast toast-top toast-center z-[60]">
					<div className="alert alert-info shadow-lg">
						<span>{toast}</span>
					</div>
				</div>
			)}
		</div>
	);
}
