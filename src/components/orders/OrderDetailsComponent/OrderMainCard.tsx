import { STATUS_LABELS, type UiOrderStatus } from './orderStatus';
import { OrderMapPreview } from './OrderMapPreview';

interface OrderMainCardProps {
	title?: string | null;
	price?: number | null;
	mapUrl?: string | null;
	lat?: number | null;
	lon?: number | null;
	description?: string | null;
	district: string;
	city?: string | null;
	specialty: string;
	address?: string | null;
	scheduledAt?: string | null;
	status?: UiOrderStatus | null;
}

function formatMoney(n?: number | null) {
	if (n == null) return '—';
	return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n);
}

function formatWhen(iso?: string | null) {
	if (!iso) return 'Не указано';
	const d = new Date(iso);
	return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function OrderMainCard({
	title,
	price,
	mapUrl,
	lat,
	lon,
	description,
	district,
	city,
	specialty,
	address,
	scheduledAt,
	status,
}: OrderMainCardProps) {
	const statusRu = status ? (STATUS_LABELS[status] ?? status) : '—';

	return (
		<div className="card bg-[#1c1c1e] rounded-[24px] overflow-hidden">
			{mapUrl && (
				<OrderMapPreview mapUrl={mapUrl} lat={lat} lon={lon} />
			)}

			<div className="card-body p-5 gap-5">
				<div className="flex items-start justify-between gap-4">
					<h2 className="text-xl font-medium leading-snug">{title}</h2>
					<span className="badge bg-[#ccf333] text-black font-bold h-8 px-3 rounded-full border-none whitespace-nowrap">
						{formatMoney(price)}
					</span>
				</div>

				<div className="flex flex-wrap gap-2">
					<span className="px-3 py-1.5 rounded-full bg-white/5 text-gray-300 text-xs font-medium border border-white/5">
						{city ? `${city}, ` : ''}{district}
					</span>
					<span className="px-3 py-1.5 rounded-full bg-white/5 text-gray-300 text-xs font-medium border border-white/5">
						{specialty}
					</span>
					<span className="px-3 py-1.5 rounded-full bg-white/5 text-[#ccf333] text-xs font-medium border border-white/5">
						{statusRu}
					</span>
				</div>

				<div className="p-4 rounded-2xl bg-black/40 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
					{description || 'Описание отсутствует'}
				</div>

				<div className="space-y-3 pt-2">
					<div className="flex items-start gap-3">
						<div className="mt-1 w-8 h-8 rounded-full bg-[#2c2c2e] flex items-center justify-center shrink-0 text-[#ccf333]">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
								<path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
								<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
							</svg>
						</div>
						<div className="flex flex-col">
							<span className="text-gray-500 text-xs">Адрес</span>
							<span className="text-white text-sm">{address || 'Скрыт до принятия'}</span>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<div className="mt-1 w-8 h-8 rounded-full bg-[#2c2c2e] flex items-center justify-center shrink-0 text-[#ccf333]">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<div className="flex flex-col">
							<span className="text-gray-500 text-xs">Время</span>
							<span className="text-white text-sm">{formatWhen(scheduledAt)}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
