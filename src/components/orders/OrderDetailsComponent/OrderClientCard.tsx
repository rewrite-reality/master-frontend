interface OrderClientCardProps {
	clientName?: string | null;
	clientPhone?: string | null;
	canSeeContacts: boolean;
}

export function OrderClientCard({ clientName, clientPhone, canSeeContacts }: OrderClientCardProps) {
	return (
		<div
			className={`card rounded-[24px] border border-dashed transition-colors ${canSeeContacts ? 'bg-[#1c1c1e] border-[#ccf333]/30' : 'bg-transparent border-gray-800'}`}
		>
			<div className="card-body p-5 gap-4">
				<h2 className="font-medium text-gray-300 flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
						<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
					</svg>
					Клиент
				</h2>

				{canSeeContacts ? (
					<div className="space-y-4">
						<div className="flex justify-between items-center pb-2 border-b border-white/5">
							<span className="text-gray-500 text-sm">Имя</span>
							<span className="text-white font-medium">{clientName || '—'}</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-gray-500 text-sm">Телефон</span>
							<a href={`tel:${clientPhone}`} className="text-[#ccf333] font-medium hover:underline">
								{clientPhone || '—'}
							</a>
						</div>
					</div>
				) : (
					<div className="text-center py-2 space-y-2">
						<p className="text-gray-600 text-sm">Примите заказ, чтобы увидеть контакты клиента и точный адрес.</p>
					</div>
				)}
			</div>
		</div>
	);
}
