import { tokenStorage } from '@/lib/tokenStorage';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');

export class ApiError extends Error {
	status: number;
	payload: any;

	constructor(status: number, message: string, payload: any) {
		super(message);
		this.status = status;
		this.payload = payload;
	}
}

async function parseBody(res: Response) {
	const text = await res.text();
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}

export async function api<T>(
	path: string,
	init: RequestInit & { auth?: boolean; ngrok?: boolean } = {},
): Promise<T> {
	if (!API_BASE && !path.startsWith('http')) {
		throw new Error('NEXT_PUBLIC_API_BASE_URL is missing');
	}

	const url = path.startsWith('http')
		? path
		: `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;

	const headers = new Headers(init.headers);

	// ngrok free warning bypass (safe even if not ngrok)
	if (init.ngrok !== false) {
		headers.set('ngrok-skip-browser-warning', 'true');
	}

	// json by default when body exists
	if (init.body && !headers.has('Content-Type')) {
		headers.set('Content-Type', 'application/json');
	}
	if (!headers.has('Accept')) headers.set('Accept', 'application/json');

	const useAuth = init.auth !== false;
	if (useAuth) {
		const token = tokenStorage.get();
		if (token) headers.set('Authorization', `Bearer ${token}`);
	}

	const res = await fetch(url, {
		...init,
		headers,
	});

	const payload = await parseBody(res);

	if (!res.ok) {
		const msg =
			(payload && typeof payload === 'object' && (payload.message || payload.error)) ||
			(typeof payload === 'string' ? payload : null) ||
			`HTTP ${res.status}`;

		throw new ApiError(res.status, msg, payload);
	}

	return payload as T;
}
