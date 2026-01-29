import type { UiOrderStatus } from './orderStatus';

interface OrderProgressCardProps {
	status?: UiOrderStatus | null;
}

const STEPS_FLOW: UiOrderStatus[] = ['ASSIGNED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'];

const STEP_LABELS: Record<string, string> = {
	ASSIGNED: 'Принят',
	ARRIVED: 'На месте',
	IN_PROGRESS: 'Работает',
	COMPLETED: 'Завершён',
};

function isFlowStatus(status?: UiOrderStatus | null): status is 'ASSIGNED' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' {
	return ['ASSIGNED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(status || '');
}

function getProgressHint(status?: UiOrderStatus | null) {
	if (!status) return '';
	if (status === 'PENDING') return 'Сначала примите заказ — затем сможете двигать статусы.';
	if (status === 'COMPLETED') return 'Заказ завершён.';
	if (status === 'CANCELLED') return 'Заказ отменён.';
	if (status === 'DISPUTE') return 'Заказ в споре.';
	return 'Нажмите кнопку ниже, чтобы перейти к следующему шагу.';
}

export function OrderProgressCard({ status }: OrderProgressCardProps) {
	const showProgressBlock = status ? (status === 'PENDING' || isFlowStatus(status) || status === 'CANCELLED' || status === 'DISPUTE') : false;
	if (!showProgressBlock) return null;

	const stepIndex = isFlowStatus(status) ? STEPS_FLOW.indexOf(status) : -1;
	const progressIsActive = status ? (isFlowStatus(status) || status === 'COMPLETED') : false;
	const progressBorder = progressIsActive ? 'bg-[#1c1c1e] border-[#ccf333]/30' : 'bg-transparent border-gray-800';
	const progressHint = getProgressHint(status);

	return (
		<div className={`card rounded-[24px] border border-dashed transition-colors ${progressBorder}`}>
			<div className="card-body p-5 gap-4">
				<div className="flex items-center justify-between">
					<h2 className="font-medium text-gray-300 flex items-center gap-2">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
							<path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
							<path strokeLinecap="round" strokeLinejoin="round" d="M7 14l3-3 4 4 6-8" />
						</svg>
						Прогресс
					</h2>
					<span className="text-gray-500 text-xs">
						{isFlowStatus(status) ? `${stepIndex + 1}/4` : status === 'PENDING' ? '0/4' : '—'}
					</span>
				</div>

				<div className="rounded-2xl bg-black/30 border border-white/5 p-4">
					<ul className="steps w-full">
						{STEPS_FLOW.map((s, idx) => {
							const active = isFlowStatus(status) ? idx <= stepIndex : false;
							return (
								<li key={s} className={['step', active ? 'step-primary' : ''].join(' ')}>
									{STEP_LABELS[s] ?? s}
								</li>
							);
						})}
					</ul>
					<div className="mt-3 text-xs text-gray-500">{progressHint}</div>
				</div>
			</div>
		</div>
	);
}
