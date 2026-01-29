'use client';

import Link from 'next/link';
import { type OrderDto } from '@/lib/ordersApi';

function formatMoney(n?: number | null) {
	if (n == null) return '—';
	return new Intl.NumberFormat('ru-RU', {
		style: 'currency',
		currency: 'RUB',
		maximumFractionDigits: 0,
	}).format(n);
}

function formatTime(iso?: string | null) {
	if (!iso) return '--:--';
	const d = new Date(iso);
	return d.toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso?: string | null) {
	if (!iso) return 'Нет даты';
	const d = new Date(iso);
	return d.toLocaleString('ru-RU', { day: 'numeric', month: 'short' });
}

const getStatusProgress = (status: string = '') => {
	const s = status.toUpperCase();
	if (s.includes('PENDING')) return 15;
	if (s.includes('ASSIGNED') || s.includes('ARRIVED') || s.includes('IN_PROGRESS') || s.includes('REVIEW')) return 50;
	if (s.includes('COMPLETED')) return 100;
	return 25;
};

type OrderCardProps = {
	o: OrderDto;
};

export default function OrderCard({ o }: OrderCardProps) {
	const district = o.district?.name ?? 'Город';
	const street = o.street ?? 'Адрес скрыт';
	const progressValue = getStatusProgress(o.status);

	return (
		<Link href={`/orders/${o.id}`} className="block group">
			<div className="card bg-[#1c1c1e] text-white shadow-lg border border-white/5 transition-transform active:scale-[0.99] rounded-[24px] overflow-hidden">
				{o.mapUrl && (
					<div className="relative">
						<img
							src={o.mapUrl}
							alt="Map"
							className="h-32 w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
						/>
						<div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#1c1c1e] to-transparent" />
					</div>
				)}
				<div className="card-body p-5 gap-5">
					<div className="flex items-center justify-between">
						<h2 className="card-title text-xl font-medium tracking-wide truncate pr-2">{o.title}</h2>
						<span className="badge border-none bg-[#ccf333] text-black font-bold h-8 px-4 rounded-full text-xs uppercase tracking-wider whitespace-nowrap">
							{formatMoney(o.price)}
						</span>
					</div>

					<div className="flex items-center justify-between text-sm">
						<div className="flex flex-col gap-1">
							<span className="text-gray-300 font-medium">{district}</span>
							<span className="text-gray-500 text-xs">{formatDate(o.scheduledAt)}</span>
						</div>
						<div className="flex text-[#ccf333] tracking-[-2px] opacity-80 text-lg mx-2">{'>>>'}</div>
						<div className="flex flex-col gap-1 text-right">
							<span className="text-gray-300 font-medium truncate max-w-[120px]">{o.specialty?.name ?? 'Мастер'}</span>
							<span className="text-gray-500 text-xs">{formatTime(o.scheduledAt)}</span>
						</div>
					</div>

					<div className="text-xs text-gray-500 line-clamp-1">{o.description || street}</div>

					<div className="flex flex-col gap-2 mt-1">
						<div className="h-[2px] w-full bg-[#3a3a3c] rounded-full relative overflow-hidden">
							<div
								className="absolute top-0 left-0 h-full bg-[#ccf333] transition-all duration-500"
								style={{ width: `${progressValue}%` }}
							/>
						</div>
						<div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
							<span className={progressValue >= 15 ? 'text-[#ccf333]' : 'text-gray-600'}>Поиск</span>
							<span className={progressValue >= 50 ? 'text-[#ccf333]' : 'text-gray-600'}>В работе</span>
							<span className={progressValue >= 100 ? 'text-[#ccf333]' : 'text-gray-600'}>Готово</span>
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
}
