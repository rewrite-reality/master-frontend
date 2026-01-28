'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { createPayment } from '@/lib/paymentApi';
import { ApiError } from '@/lib/apiClient';

interface PaymentModalProps {
	isOpen: boolean;
	onClose: () => void;
	initialAmount: number;
}

export function PaymentModal({ isOpen, onClose, initialAmount }: PaymentModalProps) {
	const [amount, setAmount] = useState<string>(initialAmount > 0 ? String(initialAmount) : '');
	const [error, setError] = useState<string | null>(null);

	// Telegram WebApp exposes a custom openLink helper; use a narrow type to avoid ts-ignore while keeping runtime checks.
	const openPaymentLink = (url: string) => {
		if (typeof window === 'undefined') return;

		const tgWebApp = (window as Window & { Telegram?: { WebApp?: { openLink?: (u: string) => void } } }).Telegram?.WebApp;

		if (tgWebApp?.openLink) {
			tgWebApp.openLink(url);
		} else {
			window.open(url, '_blank', 'noopener,noreferrer');
		}
	};

	const paymentMutation = useMutation({
		mutationFn: (val: number) => createPayment(val),
		onSuccess: (data) => {
			openPaymentLink(data.paymentUrl);
			onClose();
		},
		onError: (e: unknown) => {
			setError(e instanceof ApiError ? (e.message || 'Ошибка создания платежа') : 'Ошибка');
		}
	});

	const handleSubmit = () => {
		const val = parseFloat(amount);
		if (isNaN(val) || val <= 0) {
			setError('Введите корректную сумму');
			return;
		}
		setError(null);
		paymentMutation.mutate(val);
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
					<motion.div
						initial={{ opacity: 0, y: 100 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 100 }}
						className="w-full max-w-sm bg-[#1c1c1e] rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
					>
						<div className="p-6 space-y-6">
							<h3 className="text-xl font-medium text-white text-center">Оплата задолженности</h3>

							<div className="space-y-2">
								<label className="text-xs text-gray-500 uppercase tracking-widest pl-1">Сумма (₽)</label>
								<input
									type="number"
									className="w-full bg-[#2c2c2e] text-white p-4 rounded-xl outline-none border border-transparent focus:border-[#ccf333] transition-colors text-lg font-medium placeholder:text-gray-600"
									placeholder="0"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									autoFocus
								/>
								{error && <p className="text-red-500 text-sm pl-1">{error}</p>}
							</div>

							<div className="grid grid-cols-2 gap-3 pt-2">
								<button
									onClick={onClose}
									className="btn btn-ghost rounded-full hover:bg-white/5 font-normal text-white"
								>
									Отмена
								</button>
								<button
									onClick={handleSubmit}
									disabled={paymentMutation.isPending}
									className="btn bg-[#ccf333] hover:bg-[#b0d42b] text-black border-none rounded-full font-bold disabled:bg-gray-800 disabled:text-gray-500"
								>
									{paymentMutation.isPending ? <span className="loading loading-spinner" /> : 'Оплатить'}
								</button>
							</div>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
