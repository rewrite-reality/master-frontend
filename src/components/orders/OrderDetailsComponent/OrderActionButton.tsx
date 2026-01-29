interface OrderActionButtonProps {
	canSeeContacts: boolean;
	canAdvance: boolean;
	nextStatusRu?: string | null;
	onAccept: () => void;
	onAdvance: () => void;
	isAcceptPending: boolean;
	isAdvancePending: boolean;
}

export function OrderActionButton({
	canSeeContacts,
	canAdvance,
	nextStatusRu,
	onAccept,
	onAdvance,
	isAcceptPending,
	isAdvancePending,
}: OrderActionButtonProps) {
	return (
		<div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-40 max-w-md mx-auto">
			{!canSeeContacts ? (
				<button
					className="btn w-full h-14 rounded-full bg-[#ccf333] hover:bg-[#bbe02f] text-black text-lg font-bold border-none shadow-[0_0_20px_rgba(204,243,51,0.3)] disabled:bg-gray-800 disabled:text-gray-500"
					onClick={onAccept}
					disabled={isAcceptPending}
				>
					{isAcceptPending ? <span className="loading loading-spinner" /> : 'Принять заказ'}
				</button>
			) : (
				<button
					className="btn w-full h-14 rounded-full bg-[#ccf333] hover:bg-[#bbe02f] text-black text-lg font-bold border-none shadow-[0_0_20px_rgba(204,243,51,0.3)] disabled:bg-gray-800 disabled:text-gray-500"
					onClick={onAdvance}
					disabled={!canAdvance || isAdvancePending}
				>
					{isAdvancePending ? (
						<span className="loading loading-spinner" />
					) : (
						<span className="flex items-center justify-center gap-2">
							<span>Следующий шаг</span>
							{nextStatusRu ? <span className="text-black/70 text-sm font-semibold">→ {nextStatusRu}</span> : null}
						</span>
					)}
				</button>
			)}
		</div>
	);
}
