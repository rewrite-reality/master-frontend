import { api } from './apiClient';

export type VerificationStatus = 'NOT_VERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NONE';

export type VerificationStatusResponse = {
	verificationStatus: VerificationStatus;
	rejectionReason?: string | null;
	documentsCount: number;
};

export type UploadDocumentResponse = {
	masterId: number;
	url: string;
	documentsCount: number;
	verificationStatus: VerificationStatus;
};

export async function getVerificationStatus(): Promise<VerificationStatusResponse> {
	return api<VerificationStatusResponse>('/verification/status', {
		method: 'GET',
	});
}

export async function uploadDocument(file: File): Promise<UploadDocumentResponse> {
	const formData = new FormData();
	formData.append('file', file);

	return api<UploadDocumentResponse>('/verification/upload', {
		method: 'POST',
		body: formData,
		// Content-Type header is automatically set by browser for FormData
	});
}

export async function submitVerification(): Promise<VerificationStatusResponse> {
	return api<VerificationStatusResponse>('/verification/submit', {
		method: 'POST',
	});
}
