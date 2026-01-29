'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useRawInitData } from '@tma.js/sdk-react';
import { ApiError, api } from '@/lib/apiClient';
import { calcNeedsSetup, useMeQuery } from '@/components/auth/meQuery';
import { ProfileSkeleton } from './ProfileSkeleton';
import { ProfileBlockedAlert } from './ProfileComponent/ProfileBlockedAlert';
import { ProfileDetailsCard } from './ProfileComponent/ProfileDetailsCard';
import { ProfileFinanceSection } from './ProfileComponent/ProfileFinanceSection';
import { ProfileHeader } from './ProfileComponent/ProfileHeader';
import { ProfileHero } from './ProfileComponent/ProfileHero';
import { ProfileSettingsCard } from './ProfileComponent/ProfileSettingsCard';
import { ProfileSpecialtiesCard } from './ProfileComponent/ProfileSpecialtiesCard';
import { ProfileStatsGrid } from './ProfileComponent/ProfileStatsGrid';
import { ProfileToast } from './ProfileComponent/ProfileToast';
import { formatPhonePretty, initials } from './ProfileComponent/profileUtils';

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

	const statusLabel = blocked ? 'Блок' : isAvailable ? 'Онлайн' : 'Офлайн';
	const statusClassName = blocked
		? 'bg-red-500 text-white'
		: isAvailable
			? 'bg-[#ccf333] text-black'
			: 'bg-gray-600 text-white';

	const balance = balanceData?.balance ?? null;
	const payoutPercent = balanceData?.payoutPercent ?? null;
	const rating = 4.9;
	const reviewsText = 'Нет отзывов';

	return (
		<div className="min-h-screen text-white font-sans pb-20">
			{/* {(isFetching || isBalanceFetching) && (
				<TopProgressBar className="fixed left-0 right-0 top-0 z-50 bg-[#ccf333]" />
			)} */}

			<ProfileHeader onBack={router.back} />

			<ProfileHero
				fullName={fullName}
				tgPhotoUrl={tgPhotoUrl}
				initials={initials(profile?.firstName, profile?.lastName)}
				avatarBorderColor={avatarBorderColor}
				rating={rating}
				reviewsText={reviewsText}
				statusLabel={statusLabel}
				statusClassName={statusClassName}
			/>

			<ProfileStatsGrid rating={rating} balance={balance} />

			<ProfileFinanceSection finance={profile?.finance ?? null} />

			<div className="px-4 space-y-4">
				<ProfileSpecialtiesCard specialties={specialties} />
				<ProfileDetailsCard
					phonePretty={phonePretty}
					phoneE164={phoneE164}
					onCopyPhone={copyPhone}
					districts={districts}
				/>
				<ProfileSettingsCard onOpenSetup={() => router.push('/profile/setup')} />
				<ProfileBlockedAlert blocked={blocked} />
			</div>

			<ProfileToast message={toast} />
		</div>
	);
}
