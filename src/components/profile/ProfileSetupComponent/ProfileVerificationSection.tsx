import type { VerificationStatusResponse } from '@/lib/verificationApi';

type ProfileVerificationSectionProps = {
	verification?: VerificationStatusResponse;
	onOpenUploadModal: () => void;
	onSubmitVerification: () => void;
	isSubmitPending: boolean;
};

export function ProfileVerificationSection({
	verification,
	onOpenUploadModal,
	onSubmitVerification,
	isSubmitPending,
}: ProfileVerificationSectionProps) {
	const status = verification?.verificationStatus;
	const documentsCount = verification?.documentsCount ?? 0;
	const isPending = status === 'PENDING';
	const showSubmit = documentsCount >= 2 && !isPending;

	return (
		<div className="bg-[#1c1c1e] rounded-[24px] p-5 space-y-4">
			<div className="flex justify-between items-start">
				<h2 className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Верификация</h2>
				{status && (
					<span className={`text-xs font-bold px-2 py-1 rounded bg-white/5 
						${status === 'VERIFIED' ? 'text-[#ccf333]' :
							status === 'REJECTED' ? 'text-red-500' :
								status === 'PENDING' ? 'text-orange-400' : 'text-gray-400'}`}>
						{status === 'VERIFIED' ? 'Подтвержден' :
							status === 'REJECTED' ? 'Отклонен' :
								status === 'PENDING' ? 'На проверке' : 'Не подтвержден'}
					</span>
				)}
			</div>

			{status === 'REJECTED' && verification?.rejectionReason && (
				<div className="bg-red-900/20 p-3 rounded-xl border border-red-900/50">
					<p className="text-red-400 text-sm">Причина отклонения: {verification.rejectionReason}</p>
				</div>
			)}

			{status === 'VERIFIED' ? (
				<p className="text-sm text-gray-400">Ваш профиль подтвержден. Вы можете принимать заказы.</p>
			) : (
				<div className="space-y-3">
					<div className="flex justify-between items-center text-sm">
						<span className="text-gray-400">Загружено документов:</span>
						<span className="text-white font-medium">{documentsCount} / 2</span>
					</div>

					<button
						onClick={onOpenUploadModal}
						disabled={isPending}
						className="btn btn-outline w-full rounded-full border-gray-600 text-white hover:bg-white hover:text-black hover:border-white disabled:opacity-50"
					>
						{isPending ? 'Ожидайте проверки' : 'Загрузить документы'}
					</button>

					{showSubmit && (
						<button
							onClick={onSubmitVerification}
							disabled={isSubmitPending}
							className="btn w-full rounded-full bg-[#ccf333] hover:bg-[#b0d42b] text-black border-none font-bold"
						>
							{isSubmitPending ? <span className="loading loading-spinner" /> : 'Отправить на проверку'}
						</button>
					)}
				</div>
			)}
		</div>
	);
}
