'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useRawInitData } from '@tma.js/sdk-react'; // <--- Используем useRawInitData
import { ApiError, api } from '@/lib/apiClient';
import { calcNeedsSetup, useMeQuery } from '@/components/auth/meQuery';
import { ProfileSkeleton } from './ProfileSkeleton';
// import { TopProgressBar } from '../ui/TopProgressBar';

// --- Helpers ---

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

function formatMoneyCompact(n?: number | null) {
	if (n == null) return '—';
	// balance может быть Decimal->number уже на API, если нет — придёт как number
	return (
		new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n) + ' ₽'
	);
}

// --- API ---

type BalanceResponseDto = {
	balance: number | null;
	payoutPercent: number | null;
	// payouts?: any[]; // если нужно потом
};

async function getMyBalance() {
	return api<BalanceResponseDto>('/users/balance', { method: 'GET' });
}

// --- Components ---

export default function ProfilePageClient() {
	const router = useRouter();

	// 1. Получаем сырую строку инициализации
	const rawInitData = useRawInitData();

	const { data: me, isLoading, isFetching, error } = useMeQuery();
	const [toast, setToast] = useState<string | null>(null);

	const showToast = useCallback((msg: string) => {
		setToast(msg);
		window.setTimeout(() => setToast(null), 2000);
	}, []);

	const needsSetup = useMemo(() => (me ? calcNeedsSetup(me) : false), [me]);

	// 2. Парсим данные пользователя из сырой строки вручную
	const tgPhotoUrl = useMemo(() => {
		if (!rawInitData) return null;

		try {
			// Очищаем строку от возможных префиксов, если они есть
			let cleanData = rawInitData;
			if (cleanData.startsWith('#')) cleanData = cleanData.slice(1);
			if (cleanData.startsWith('tgWebAppData=')) cleanData = cleanData.slice('tgWebAppData='.length);

			const params = new URLSearchParams(cleanData);
			const userStr = params.get('user');

			if (!userStr) return null;

			const user = JSON.parse(userStr);
			// В сыром JSON поле называется photo_url (snake_case)
			return user?.photo_url || null;
		} catch (e) {
			console.error('Error parsing telegram user data:', e);
			return null;
		}
	}, [rawInitData]);


	// --- Effects ---

	useEffect(() => {
		if (me && needsSetup) {
			router.replace('/profile/setup');
		}
	}, [me, needsSetup, router]);

	// --- Render Logic ---

	const profile = me?.profile ?? null;

	const {
		data: balanceData,
		isFetching: isBalanceFetching,
	} = useQuery({
		queryKey: ['users', 'balance'],
		queryFn: getMyBalance,
		enabled: !!me && !needsSetup,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});

	if (!me && isLoading) {
		return <ProfileSkeleton />;
	}

	if (error) {
		const message =
			error instanceof ApiError
				? error.message
				: error instanceof Error
					? error.message
					: 'Failed to load profile';

		return (
			<div className="min-h-screen bg-black flex items-center justify-center p-6">
				<div className="text-center space-y-4">
					<div className="w-16 h-16 mx-auto bg-red-900/20 text-red-500 rounded-full flex items-center justify-center">!</div>
					<p className="text-gray-400">{message}</p>
					<button
						className="btn btn-outline text-white border-white/20 hover:bg-white hover:text-black rounded-full"
						onClick={() => window.location.reload()}
					>
						Обновить
					</button>
				</div>
			</div>
		);
	}

	// if (!me || needsSetup) {
	// 	return <TopProgressBar className="fixed left-0 right-0 top-0 z-50 bg-[#ccf333]" />;
	// }

	// --- Data Preparation ---

	const fullName = (() => {
		const ln = profile?.lastName?.trim() ?? '';
		const fn = profile?.firstName?.trim() ?? '';
		const name = [fn, ln].filter(Boolean).join(' ');
		return name || 'Мастер';
	})();

	const isAvailable = (() => {
		const hours = new Date().getHours();
		return hours >= 8 && hours < 20;
	})();

	const blocked = profile?.status === 'BLOCKED';
	const phoneE164 = profile?.phone ?? '';
	const phonePretty = formatPhonePretty(phoneE164);
	const specialties = profile?.specialties ?? [];
	const districts = profile?.districts ?? [];

	const copyPhone = async () => {
		const text = phoneE164 || phonePretty;
		if (!text) return;
		try {
			await navigator.clipboard.writeText(text);
			showToast('Телефон скопирован');
			if (navigator.vibrate) navigator.vibrate(50);
		} catch {
			showToast('Скопировано');
		}
	};

	const avatarBorderColor = blocked
		? 'border-red-500'
		: isAvailable
			? 'border-[#ccf333]'
			: 'border-gray-600';

	const balance = balanceData?.balance ?? null;
	const payoutPercent = balanceData?.payoutPercent ?? null;

	return (
		<div className="min-h-screen text-white font-sans pb-20">
			{/* {(isFetching || isBalanceFetching) && (
				<TopProgressBar className="fixed left-0 right-0 top-0 z-50 bg-[#ccf333]" />
			)} */}

			{/* Header */}
			<div className="px-4 pt-4 pb-2 flex items-center justify-between">
				<button
					className="w-10 h-10 rounded-full bg-[#1c1c1e] flex items-center justify-center text-white hover:bg-[#2c2c2e] transition-colors"
					onClick={() => router.back()}
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M19 12H5M12 19l-7-7 7-7" />
					</svg>
				</button>
				<div className="text-sm font-medium text-gray-500">Профиль</div>
				<div className="w-10" />
			</div>

			{/* Hero Section */}
			<div className="flex flex-col items-center pt-6 pb-8">
				<div className={`relative p-1 rounded-full border-2 ${avatarBorderColor} transition-colors duration-500`}>
					<div className="w-24 h-24 rounded-full bg-[#1c1c1e] flex items-center justify-center overflow-hidden">
						{tgPhotoUrl ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img src={tgPhotoUrl} alt="avatar" className="w-full h-full object-cover" />
						) : (
							<span className="text-3xl font-bold text-gray-400 select-none">
								{initials(profile?.firstName, profile?.lastName)}
							</span>
						)}
					</div>

					<div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-black ${blocked ? 'bg-red-500 text-white' : isAvailable ? 'bg-[#ccf333] text-black' : 'bg-gray-600 text-white'}`}>
						{blocked ? 'Блок' : isAvailable ? 'Онлайн' : 'Офлайн'}
					</div>
				</div>

				<h1 className="mt-5 text-2xl font-semibold tracking-tight">{fullName}</h1>

				<div className="flex items-center gap-1.5 mt-2 text-sm text-gray-400">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#ccf333]">
						<path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
					</svg>
					<span className="text-white font-medium">4.9</span>
					<span>•</span>
					<span>Нет отзывов</span>
				</div>
			</div>

			{/* Stats Grid (убрали "Заказы", оставили рейтинг + баланс) */}
			<div className="px-4 mb-6">
				<div className="grid grid-cols-2 gap-3">
					<div className="bg-[#1c1c1e] rounded-[20px] p-4 flex flex-col items-center justify-center gap-1">
						<span className="text-2xl font-bold text-[#ccf333]">4.9</span>
						<span className="text-[10px] text-gray-500 uppercase tracking-widest">Рейтинг</span>
					</div>

					<div className="bg-[#1c1c1e] rounded-[20px] p-4 flex flex-col items-center justify-center gap-1">
						<span className="text-2xl font-bold text-white">{formatMoneyCompact(balance)}</span>
						<span className="text-[10px] text-gray-500 uppercase tracking-widest">Баланс</span>
					</div>
				</div>
			</div>

			{/* Info Section */}
			<div className="px-4 space-y-4">
				{/* Specialties */}
				<div className="bg-[#1c1c1e] rounded-[24px] p-5">
					<h3 className="text-gray-500 text-xs uppercase tracking-widest font-semibold mb-4">Специализация</h3>
					<div className="flex flex-wrap gap-2">
						{specialties.length > 0 ? (
							specialties.map((s) => (
								<span key={s.id} className="px-3 py-1.5 rounded-full bg-[#ccf333]/10 text-[#ccf333] text-sm border border-[#ccf333]/20">
									{s.name}
								</span>
							))
						) : (
							<span className="text-gray-600 text-sm">Не указано</span>
						)}
					</div>
				</div>

				{/* Details */}
				<div className="bg-[#1c1c1e] rounded-[24px] p-5">
					<h3 className="text-gray-500 text-xs uppercase tracking-widest font-semibold mb-4">Детали</h3>

					<div className="space-y-4">
						<div
							className="flex items-center justify-between group cursor-pointer active:opacity-70 transition-opacity"
							onClick={copyPhone}
						>
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
										<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
									</svg>
								</div>
								<span className="text-white font-medium">{phonePretty || phoneE164}</span>
							</div>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors">
								<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
							</svg>
						</div>

						<div className="h-[1px] bg-white/5 w-full my-2" />

						<div className="flex items-start gap-3">
							<div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
									<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
									<circle cx="12" cy="10" r="3" />
								</svg>
							</div>
							<div className="flex flex-col">
								<span className="text-white text-sm font-medium">Районы работы</span>
								<span className="text-gray-500 text-sm mt-0.5">
									{districts.length ? districts.map((d) => d.name).join(', ') : 'Не указаны'}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Settings card (как "Детали", редирект на /profile/setup) */}
				<div
					className="bg-[#1c1c1e] rounded-[24px] p-5 cursor-pointer active:opacity-80 transition-opacity"
					onClick={() => router.push('/profile/setup')}
				>
					<h3 className="text-gray-500 text-xs uppercase tracking-widest font-semibold mb-4">Настройки</h3>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
									<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h3M12 3v3m6.364 2.136-2.121 2.121m1.414 7.071-2.121-2.121M21 12h-3M6 10.5v3M3 12h3m2.136-6.364 2.121 2.121m-2.121 9.9 2.121-2.121M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z" />
								</svg>
							</div>

							<div className="flex flex-col">
								<span className="text-white font-medium">Профиль мастера</span>
								<span className="text-gray-500 text-sm mt-0.5">Изменить районы, специализацию и данные</span>
							</div>
						</div>

						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-600">
							<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
						</svg>
					</div>
				</div>

				{blocked && (
					<div className="alert bg-red-900/50 text-red-200 border-none rounded-2xl">
						<svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>Ваш аккаунт заблокирован. Обратитесь к менеджеру.</span>
					</div>
				)}
			</div>

			{/* Toast Notification */}
			{toast && (
				<div className="toast toast-top toast-center z-[60] w-full max-w-sm px-4 mt-4">
					<div className="alert bg-[#323232] text-white border border-[#ccf333]/50 shadow-2xl rounded-2xl flex justify-center">
						<span className="font-medium">{toast}</span>
					</div>
				</div>
			)}
		</div>
	);
}
