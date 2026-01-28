'use client';

import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InputMask } from '@react-input/mask';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/apiClient';
import { getVerificationStatus, submitVerification } from '@/lib/verificationApi';
import { VerificationUploadModal } from './VerificationUploadModal';
import { calcNeedsSetup, emitNeedsSetup, meQueryKey, type MeResponse } from '@/components/auth/meQuery';

type Item = { id: number; name: string };

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

			{/* Header */}
			<div className="py-4 mb-4">
				<h1 className="text-2xl font-semibold tracking-tight">Настройка профиля</h1>
				<p className="text-gray-500 text-sm mt-1">Заполните данные для начала работы</p>
			</div>

			{/* Error Alert */}
			{error && (
				<div className="alert bg-red-900/50 text-red-200 border-none rounded-2xl mb-6">
					<svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
					<span>{error}</span>
				</div>
			)}

			<div className="space-y-6">

				{/* Verification Section */}
				<div className="bg-[#1c1c1e] rounded-[24px] p-5 space-y-4">
					<div className="flex justify-between items-start">
						<h2 className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Верификация</h2>
						{verification?.verificationStatus && (
							<span className={`text-xs font-bold px-2 py-1 rounded bg-white/5 
								${verification.verificationStatus === 'VERIFIED' ? 'text-[#ccf333]' :
									verification.verificationStatus === 'REJECTED' ? 'text-red-500' :
										verification.verificationStatus === 'PENDING' ? 'text-orange-400' : 'text-gray-400'}`}>
								{verification.verificationStatus === 'VERIFIED' ? 'Подтвержден' :
									verification.verificationStatus === 'REJECTED' ? 'Отклонен' :
										verification.verificationStatus === 'PENDING' ? 'На проверке' : 'Не подтвержден'}
							</span>
						)}
					</div>

					{verification?.verificationStatus === 'REJECTED' && verification.rejectionReason && (
						<div className="bg-red-900/20 p-3 rounded-xl border border-red-900/50">
							<p className="text-red-400 text-sm">Причина отклонения: {verification.rejectionReason}</p>
						</div>
					)}

					{verification?.verificationStatus === 'VERIFIED' ? (
						<p className="text-sm text-gray-400">Ваш профиль подтвержден. Вы можете принимать заказы.</p>
					) : (
						<div className="space-y-3">
							<div className="flex justify-between items-center text-sm">
								<span className="text-gray-400">Загружено документов:</span>
								<span className="text-white font-medium">{verification?.documentsCount ?? 0} / 2</span>
							</div>

							<button
								onClick={() => setUploadModalOpen(true)}
								disabled={verification?.verificationStatus === 'PENDING'}
								className="btn btn-outline w-full rounded-full border-gray-600 text-white hover:bg-white hover:text-black hover:border-white disabled:opacity-50"
							>
								{verification?.verificationStatus === 'PENDING' ? 'Ожидайте проверки' : 'Загрузить документы'}
							</button>

							{(verification?.documentsCount ?? 0) >= 2 && verification?.verificationStatus !== 'PENDING' && (
								<button
									onClick={() => submitVerificationMutation.mutate()}
									disabled={submitVerificationMutation.isPending}
									className="btn w-full rounded-full bg-[#ccf333] hover:bg-[#b0d42b] text-black border-none font-bold"
								>
									{submitVerificationMutation.isPending ? <span className="loading loading-spinner" /> : 'Отправить на проверку'}
								</button>
							)}
						</div>
					)}
				</div>

				{/* Section: Personal Info */}
				<div className="space-y-4">
					<h2 className="text-xs uppercase tracking-widest text-gray-500 font-semibold pl-1">Личные данные</h2>

					<input
						type="text"
						className="w-full bg-[#1c1c1e] text-white p-4 rounded-[16px] outline-none border border-transparent focus:border-[#ccf333] transition-colors placeholder:text-gray-600"
						placeholder="Фамилия"
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
					/>
					<input
						type="text"
						className="w-full bg-[#1c1c1e] text-white p-4 rounded-[16px] outline-none border border-transparent focus:border-[#ccf333] transition-colors placeholder:text-gray-600"
						placeholder="Имя"
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
					/>
					<input
						type="text"
						className="w-full bg-[#1c1c1e] text-white p-4 rounded-[16px] outline-none border border-transparent focus:border-[#ccf333] transition-colors placeholder:text-gray-600"
						placeholder="Отчество"
						value={patronymic}
						onChange={(e) => setPatronymic(e.target.value)}
					/>
				</div>

				{/* Section: Contacts */}
				<div className="space-y-4">
					<h2 className="text-xs uppercase tracking-widest text-gray-500 font-semibold pl-1">Контакты</h2>
					<div>
						<InputMask
							mask="+7 (___) ___-__-__"
							replacement={{ _: /\d/ }}
							className={`w-full bg-[#1c1c1e] text-white p-4 rounded-[16px] outline-none border transition-colors placeholder:text-gray-600 ${phone.length > 0 && !phoneE164 ? 'border-red-500' : 'border-transparent focus:border-[#ccf333]'}`}
							placeholder="+7 (___) ___-__-__"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							inputMode="tel"
						/>
						{phone.length > 0 && !phoneE164 && (
							<p className="text-xs text-red-500 mt-2 pl-2">Неверный формат номера</p>
						)}
					</div>
				</div>

				{/* Section: Professional (Chips) */}
				<div className="space-y-4">
					<div className="flex justify-between items-end">
						<h2 className="text-xs uppercase tracking-widest text-gray-500 font-semibold pl-1">Районы работы</h2>
						<span className="text-xs text-gray-600">{districtIds.length} выбрано</span>
					</div>

					{loading ? (
						<div className="flex gap-2 justify-center py-4">
							<span className="loading loading-dots loading-md text-[#ccf333]"></span>
						</div>
					) : (
						<div className="flex flex-wrap gap-2">
							{districts.map(d => {
								const isSelected = districtIds.includes(String(d.id));
								return (
									<button
										key={d.id}
										onClick={() => toggleDistrict(String(d.id))}
										className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${isSelected
											? 'bg-[#ccf333] text-black border-[#ccf333]'
											: 'bg-[#1c1c1e] text-gray-400 border-white/5 hover:border-white/20'
											}`}
									>
										{d.name}
									</button>
								)
							})}
						</div>
					)}
				</div>

				<div className="space-y-4">
					<div className="flex justify-between items-end">
						<h2 className="text-xs uppercase tracking-widest text-gray-500 font-semibold pl-1">Специальности</h2>
						<span className="text-xs text-gray-600">{specialtyIds.length} выбрано</span>
					</div>

					{loading ? (
						<div className="flex gap-2 justify-center py-4">
							<span className="loading loading-dots loading-md text-[#ccf333]"></span>
						</div>
					) : (
						<div className="flex flex-wrap gap-2">
							{specialties.map(s => {
								const isSelected = specialtyIds.includes(String(s.id));
								return (
									<button
										key={s.id}
										onClick={() => toggleSpecialty(String(s.id))}
										className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${isSelected
											? 'bg-[#ccf333] text-black border-[#ccf333]'
											: 'bg-[#1c1c1e] text-gray-400 border-white/5 hover:border-white/20'
											}`}
									>
										{s.name}
									</button>
								)
							})}
						</div>
					)}
				</div>

				{/* Submit Button */}
				<div className="pt-4">
					<button
						className="btn w-full h-14 rounded-full bg-[#ccf333] hover:bg-[#bbe02f] text-black text-lg font-bold border-none disabled:bg-[#1c1c1e] disabled:text-gray-600"
						onClick={handleSubmit}
						disabled={!isValid}
					>
						{submitting ? <span className="loading loading-spinner text-black"></span> : 'Сохранить профиль'}
					</button>
				</div>

			</div>
			<VerificationUploadModal
				isOpen={isUploadModalOpen}
				onClose={() => setUploadModalOpen(false)}
			/>
		</div>
	);
}
