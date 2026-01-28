import { api } from './apiClient';

export type CreatePaymentDto = {
	amount: number;
};

export type CreatePaymentResponse = {
	paymentUrl: string;
	paymentId: string;
};

export async function createPayment(amount: number): Promise<CreatePaymentResponse> {
	return api<CreatePaymentResponse>('/integrations/yookassa/create-payment', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ amount }),
	});
}
