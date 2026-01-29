'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/apiClient';
import { getVerificationStatus, submitVerification } from '@/lib/verificationApi';
import { VerificationUploadModal } from './ProfileSetupComponent/VerificationUploadModal';
import { calcNeedsSetup, emitNeedsSetup, meQueryKey, type MeResponse } from '@/components/auth/meQuery';
import { ProfileSetupHeader } from './ProfileSetupComponent/ProfileSetupHeader';
import { ProfileSetupErrorAlert } from './ProfileSetupComponent/ProfileSetupErrorAlert';
import { ProfileVerificationSection } from './ProfileSetupComponent/ProfileVerificationSection';
import { ProfilePersonalInfoSection } from './ProfileSetupComponent/ProfilePersonalInfoSection';
import { ProfileContactsSection } from './ProfileSetupComponent/ProfileContactsSection';
import { ProfileDistrictsSection } from './ProfileSetupComponent/ProfileDistrictsSection';
import { ProfileSpecialtiesSection } from './ProfileSetupComponent/ProfileSpecialtiesSection';
import { ProfileSetupSubmitButton } from './ProfileSetupComponent/ProfileSetupSubmitButton';
import type { Item } from './ProfileSetupComponent/types';

function toE164Ru(input: string): string {
	const digits = input.replace(/\D/g, '');
	if (!digits) return '';
	let d = digits;
	if (d.length === 10) d = '7' + d;
	if (d.length === 11 && d.startsWith('8')) d = '7' + d.slice(1);
	if (d.length !== 11 || !d.startsWith('7')) return '';
	return `+${d}`;
}

export default function ProfileSetupClient() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const [lastName, setLastName] = useState('');
	const [firstName, setFirstName] = useState('');
	const [patronymic, setPatronymic] = useState('');
	const [phone, setPhone] = useState('');

	const [districts, setDistricts] = useState<Item[]>([]);
	const [specialties, setSpecialties] = useState<Item[]>([]);
	const [districtIds, setDistrictIds] = useState<string[]>([]);
	const [specialtyIds, setSpecialtyIds] = useState<string[]>([]);

	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [isUploadModalOpen, setUploadModalOpen] = useState(false);

	// --- Queries ---

	const { data: verification } = useQuery({
		queryKey: ['verification', 'status'],
		queryFn: getVerificationStatus,
		retry: false,
		staleTime: 10 * 1000,
	});

	const submitVerificationMutation = useMutation({
		mutationFn: submitVerification,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['verification', 'status'] });
		},
		onError: (e: unknown) => {
			setError(e instanceof ApiError ? (e.message || 'Ошибка отправки') : 'Ошибка');
		}
	});

	// --- Data Loading ---

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				setLoading(true);
				setError(null);
				const [d, s] = await Promise.all([
					api<Item[]>('/districts', { method: 'GET', auth: false as any }),
					api<Item[]>('/specialties', { method: 'GET', auth: false as any }),
				]);
				if (cancelled) return;
				setDistricts(Array.isArray(d) ? d : []);
				setSpecialties(Array.isArray(s) ? s : []);
			} catch (e) {
				if (cancelled) return;
				setError(e instanceof Error ? e.message : 'Не удалось загрузить справочники');
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => { cancelled = true; };
	}, []);

	// --- Logic ---

	const phoneE164 = useMemo(() => toE164Ru(phone), [phone]);

	const isValid = useMemo(() => {
		const ln = lastName.trim().length >= 2;
		const fn = firstName.trim().length >= 2;
		const pn = patronymic.trim().length >= 2;
		const ph = phoneE164.length > 0;
		const dOk = districtIds.length >= 1;
		const sOk = specialtyIds.length >= 1;
		return ln && fn && pn && ph && dOk && sOk && !loading && !submitting;
	}, [lastName, firstName, patronymic, phoneE164, districtIds, specialtyIds, loading, submitting]);

	const handleSubmit = useCallback(async () => {
		if (!isValid) return;
		try {
			setSubmitting(true);
			setError(null);

			await api('/users/profile', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					firstName: firstName.trim(),
					lastName: lastName.trim(),
					patronymic: patronymic.trim(),
					phone: phoneE164,
					districtIds,
					specialtyIds,
				}),
			});

			const updatedMe = await api<MeResponse>('/users/me', { method: 'GET' });
			queryClient.setQueryData(meQueryKey, updatedMe);
			emitNeedsSetup(calcNeedsSetup(updatedMe));

			router.replace('/profile');
		} catch (e) {
			if (e instanceof ApiError) {
				setError(e.message || `Ошибка ${e.status}`);
			} else {
				setError(e instanceof Error ? e.message : 'Ошибка сохранения профиля');
			}
		} finally {
			setSubmitting(false);
		}
	}, [isValid, firstName, lastName, patronymic, phoneE164, districtIds, specialtyIds, router, queryClient]);

	// --- Helpers for Chips UI ---

	const toggleDistrict = (id: string) => {
		setDistrictIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
	};

	const toggleSpecialty = (id: string) => {
		setSpecialtyIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
	};

	return (
		<div className="min-h-screen text-white font-sans p-4 pb-10">
			<ProfileSetupHeader />

			<ProfileSetupErrorAlert message={error} />

			<div className="space-y-6">
				<ProfileVerificationSection
					verification={verification}
					onOpenUploadModal={() => setUploadModalOpen(true)}
					onSubmitVerification={() => submitVerificationMutation.mutate()}
					isSubmitPending={submitVerificationMutation.isPending}
				/>

				<ProfilePersonalInfoSection
					lastName={lastName}
					firstName={firstName}
					patronymic={patronymic}
					onChangeLastName={setLastName}
					onChangeFirstName={setFirstName}
					onChangePatronymic={setPatronymic}
				/>

				<ProfileContactsSection
					phone={phone}
					phoneE164={phoneE164}
					onChangePhone={setPhone}
				/>

				<ProfileDistrictsSection
					loading={loading}
					districts={districts}
					selectedIds={districtIds}
					onToggle={toggleDistrict}
				/>

				<ProfileSpecialtiesSection
					loading={loading}
					specialties={specialties}
					selectedIds={specialtyIds}
					onToggle={toggleSpecialty}
				/>

				<ProfileSetupSubmitButton
					isValid={isValid}
					submitting={submitting}
					onSubmit={handleSubmit}
				/>
			</div>

			<VerificationUploadModal
				isOpen={isUploadModalOpen}
				onClose={() => setUploadModalOpen(false)}
			/>
		</div>
	);
}
