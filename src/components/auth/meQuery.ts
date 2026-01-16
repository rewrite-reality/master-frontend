'use client';

import { useQuery, type QueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/apiClient';
import { loginWithInitData } from '@/lib/authApi';
import { tokenStorage } from '@/lib/tokenStorage';

export type Named = { id: string; name: string };

export type ProfileDto = {
	id: string;
	firstName: string | null;
	lastName: string | null;
	patronymic: string | null;
	phone: string | null;
	status: string | null;
	districts: Named[];
	specialties: Named[];
};

export type MeResponse = {
	id: string;
	role: string;
	telegramUsername: string | null;
	profile: ProfileDto | null;
};

export type BootstrapResult = { me: MeResponse; needsSetup: boolean };

export const meQueryKey = ['me'] as const;

export function calcNeedsSetup(me: MeResponse): boolean {
	const p = me.profile;
	return !p || !p.firstName?.trim() || !p.lastName?.trim() || !p.phone?.trim();
}

type NeedsSetupListener = (value: boolean) => void;
const needsSetupListeners = new Set<NeedsSetupListener>();

export function subscribeNeedsSetup(listener: NeedsSetupListener) {
	needsSetupListeners.add(listener);
	return () => {
		needsSetupListeners.delete(listener);
	};
}

export function emitNeedsSetup(value: boolean) {
	needsSetupListeners.forEach((listener) => listener(value));
}

async function fetchMe(): Promise<MeResponse> {
	return api<MeResponse>('/users/me', { method: 'GET' });
}

let bootPromise: Promise<BootstrapResult> | null = null;
let bootResult: BootstrapResult | null = null;

export async function bootstrapMe(initData: string, queryClient: QueryClient): Promise<BootstrapResult> {
	if (!initData) {
		throw new Error('Init data is missing. Telegram WebApp data is required.');
	}

	if (bootResult) return bootResult;

	const cached = queryClient.getQueryData<MeResponse>(meQueryKey);
	if (cached) {
		const result = { me: cached, needsSetup: calcNeedsSetup(cached) };
		bootResult = result;
		emitNeedsSetup(result.needsSetup);
		return result;
	}

	if (bootPromise) return bootPromise;

	const resolveAndCache = async (): Promise<BootstrapResult> => {
		const me = await fetchMe();
		const result = { me, needsSetup: calcNeedsSetup(me) };
		queryClient.setQueryData(meQueryKey, me);
		bootResult = result;
		emitNeedsSetup(result.needsSetup);
		return result;
	};

	bootPromise = (async () => {
		const existing = tokenStorage.get();

		if (existing) {
			try {
				return await resolveAndCache();
			} catch (e) {
				if (e instanceof ApiError && (e.status === 401 || e.status === 403 || e.status === 404)) {
					tokenStorage.clear();
				} else {
					throw e;
				}
			}
		}

		const loginRes = await loginWithInitData(initData);
		tokenStorage.set(loginRes.accessToken);

		return await resolveAndCache();
	})();

	try {
		return await bootPromise;
	} finally {
		bootPromise = null;
	}
}

export function useMeQuery() {
	return useQuery({
		queryKey: meQueryKey,
		queryFn: fetchMe,
		staleTime: 5 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});
}
