import { api } from '@/lib/apiClient';

export type LoginResponse = {
	accessToken: string; // у тебя бэк возвращает accessToken
	user?: any;
};

export async function loginWithInitData(initData: string) {
	return api<LoginResponse>('/auth/login', {
		method: 'POST',
		auth: false,
		body: JSON.stringify({ initData }),
	});
}
