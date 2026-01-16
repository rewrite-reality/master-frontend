'use client';

import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { InputMask } from '@react-input/mask';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/apiClient';
import { calcNeedsSetup, emitNeedsSetup, meQueryKey, type MeResponse } from '@/components/auth/meQuery';

type Item = { id: number; name: string };

function toE164Ru(input: string): string {
	const digits = input.replace(/\D/g, '');
	if (!digits) return '';

	let d = digits;

	// allow: 10 digits (without country), 11 digits (7/8 + number)
	if (d.length === 10) d = '7' + d;
	if (d.length === 11 && d.startsWith('8')) d = '7' + d.slice(1);

	if (d.length !== 11 || !d.startsWith('7')) return '';
	return `+${d}`; // +79001234567
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

		return () => {
			cancelled = true;
		};
	}, []);

	const phoneE164 = useMemo(() => toE164Ru(phone), [phone]);

	const isValid = useMemo(() => {
		const ln = lastName.trim().length >= 2;
		const fn = firstName.trim().length >= 2;
		const pn = patronymic.trim().length >= 2; // по ошибке бэка похоже требуется
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
					phone: phoneE164, // +79001234567
					districtIds,
					specialtyIds,
				}),
			});

			// refresh me cache to unblock AuthGate redirects
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
	}, [isValid, firstName, lastName, patronymic, phoneE164, districtIds, specialtyIds, router]);

	return (
		<div className="p-4 space-y-4">
			<div className="card bg-base-100 shadow border border-base-200">
				<div className="card-body space-y-4">
					<div>
						<h1 className="card-title">Настройка профиля</h1>
						<p className="text-sm opacity-70">Заполни данные, чтобы продолжить</p>
					</div>

					{error && (
						<div className="alert alert-error">
							<span>{error}</span>
						</div>
					)}

					<div className="grid grid-cols-1 gap-3">
						<div className="form-control">
							<label className="label">
								<span className="label-text">Фамилия</span>
							</label>
							<input
								className="input input-bordered w-full"
								placeholder="Иванов"
								value={lastName}
								onChange={(e: ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
							/>
						</div>

						<div className="form-control">
							<label className="label">
								<span className="label-text">Имя</span>
							</label>
							<input
								className="input input-bordered w-full"
								placeholder="Иван"
								value={firstName}
								onChange={(e: ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
							/>
						</div>

						<div className="form-control">
							<label className="label">
								<span className="label-text">Отчество</span>
							</label>
							<input
								className="input input-bordered w-full"
								placeholder="Иванович"
								value={patronymic}
								onChange={(e: ChangeEvent<HTMLInputElement>) => setPatronymic(e.target.value)}
							/>
						</div>
					</div>

					<div className="form-control">
						<label className="label">
							<span className="label-text">Телефон</span>
						</label>

						<InputMask
							mask="+7 (___) ___-__-__"
							replacement={{ _: /\d/ }}
							className="input input-bordered w-full"
							placeholder="+7 (___) ___-__-__"
							value={phone}
							onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
							inputMode="tel"
						/>
						{phone.length > 0 && !phoneE164 && (
							<p className="text-xs text-error mt-1">Неверный формат, нужен вид +79001234567</p>
						)}
					</div>

					<div className="form-control">
						<label className="label">
							<span className="label-text">Районы работы</span>
						</label>

						{loading ? (
							<div className="flex items-center gap-2 opacity-70">
								<span className="loading loading-spinner loading-sm" />
								<span className="text-sm">Загрузка…</span>
							</div>
						) : (
							<select
								multiple
								className="select select-bordered w-full min-h-40"
								value={districtIds}
								onChange={(e: ChangeEvent<HTMLSelectElement>) => {
									const ids = Array.from(e.target.selectedOptions).map((o) => String(o.value));
									setDistrictIds(ids);
								}}
							>
								{districts.map((d) => (
									<option key={d.id} value={String(d.id)}>
										{d.name}
									</option>
								))}
							</select>
						)}
						<p className="text-xs opacity-60 mt-2">Можно выбрать несколько (Ctrl/⌘ + клик)</p>
					</div>

					<div className="form-control">
						<label className="label">
							<span className="label-text">Специальности</span>
						</label>

						{loading ? (
							<div className="flex items-center gap-2 opacity-70">
								<span className="loading loading-spinner loading-sm" />
								<span className="text-sm">Загрузка…</span>
							</div>
						) : (
							<select
								multiple
								className="select select-bordered w-full min-h-40"
								value={specialtyIds}
								onChange={(e: ChangeEvent<HTMLSelectElement>) => {
									const ids = Array.from(e.target.selectedOptions).map((o) => String(o.value));
									setSpecialtyIds(ids);
								}}
							>
								{specialties.map((s) => (
									<option key={s.id} value={String(s.id)}>
										{s.name}
									</option>
								))}
							</select>
						)}
						<p className="text-xs opacity-60 mt-2">Можно выбрать несколько (Ctrl/⌘ + клик)</p>
					</div>

					<button className="btn btn-primary w-full" onClick={handleSubmit} disabled={!isValid}>
						{submitting ? 'Сохраняем…' : 'Сохранить'}
					</button>
				</div>
			</div>
		</div>
	);
}
