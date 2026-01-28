'use client';

import { useMemo, useState } from 'react';
import { PaymentModal } from './PaymentModal';

type FinanceData = {
	debt: number;
	debtLimit: number;
	usagePercent: number;
	statusColor: 'red' | 'orange' | 'green';
};

interface DebtWidgetProps {
	finance: FinanceData;
}

export function DebtWidget({ finance }: DebtWidgetProps) {
	const [isModalOpen, setModalOpen] = useState(false);

	const progressColor = useMemo(() => {
		switch (finance.statusColor) {
			case 'red': return 'bg-red-500';
			case 'orange': return 'bg-orange-500';
			case 'green':
			default: return 'bg-[#ccf333]'; // Default green
		}
	}, [finance.statusColor]);

	const percent = Math.min(Math.max(finance.usagePercent, 0), 100);

	const formatRub = (n: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n);

	return (
		<>
			<div className="bg-[#1c1c1e] rounded-[24px] p-5">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-gray-500 text-xs uppercase tracking-widest font-semibold">Финансы</h3>
					{finance.debt > 0 && (
						<button
							onClick={() => setModalOpen(true)}
							className="text-[#ccf333] text-xs font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
						>
							Погасить
						</button>
					)}
				</div>

				<div className="space-y-3">
					<div className="flex justify-between items-end">
						<div>
							<span className="text-2xl font-bold text-white">{formatRub(finance.debt)} ₽</span>
							<span className="text-sm text-gray-500 ml-2">/ {formatRub(finance.debtLimit)} ₽</span>
						</div>
						<span className={`text-xs font-medium px-2 py-1 rounded bg-white/5 ${finance.statusColor === 'red' ? 'text-red-500' : finance.statusColor === 'orange' ? 'text-orange-500' : 'text-[#ccf333]'}`}>
							{finance.usagePercent.toFixed(0)}%
						</span>
					</div>

					{/* Progress Bar */}
					<div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
						<div
							className={`h-full ${progressColor} transition-all duration-500 ease-out`}
							style={{ width: `${percent}%` }}
						/>
					</div>

					<p className="text-xs text-gray-500">
						{finance.debt > 0
							? 'Пожалуйста, погасите задолженность для продолжения работы.'
							: 'У вас нет задолженности. Приятной работы!'}
					</p>
				</div>
			</div>

			<PaymentModal
				isOpen={isModalOpen}
				onClose={() => setModalOpen(false)}
				initialAmount={finance.debt}
			/>
		</>
	);
}
