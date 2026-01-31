'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getVerificationStatus } from '@/lib/verificationApi';
import { VerificationUploadModal } from '../ProfileSetupComponent/VerificationUploadModal';

export function VerificationStatusCard() {
	const [isUploadModalOpen, setUploadModalOpen] = useState(false);

	const { data: verification, isLoading } = useQuery({
		queryKey: ['verification', 'status'],
		queryFn: getVerificationStatus,
		// Enable polling and window focus refetching to ensure status is always up to date
		// The global config disables window focus refetching, so we enable it here specifically.
		refetchOnWindowFocus: true,
		staleTime: 0,
		refetchInterval: (query) => {
			const status = query.state.data?.verificationStatus;
			return status === 'PENDING' ? 3000 : false;
		},
	});

	if (isLoading) {
		return (
			<div className="card bg-[#1c1c1e] border border-white/10 p-4 animate-pulse">
				<div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
				<div className="h-10 bg-white/10 rounded w-full"></div>
			</div>
		);
	}

	const status = verification?.verificationStatus;
	const docsCount = verification?.documentsCount ?? 0;
	const isVerified = status === 'VERIFIED';
	const isRejected = status === 'REJECTED';
	const isPending = status === 'PENDING';

	// If verified, we might want to show a small green badge or nothing at all depending on design.
	// But per requirements: "Зелёную карточку "Подтверждено" если status === 'VERIFIED'"

	if (!status && docsCount === 0) {
		// No verification info yet or clean state
		return null;
	}

	return (
		<>
			<div className="bg-[#1c1c1e] rounded-[24px] p-5 border border-white/5">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-gray-500 text-xs uppercase tracking-widest font-semibold">Статус верификации</h3>
					{isPending && (
						<div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
							<span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
							<span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">На проверке</span>
						</div>
					)}
					{isVerified && (
						<div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
							<span className="w-1.5 h-1.5 rounded-full bg-green-500" />
							<span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Подтверждено</span>
						</div>
					)}
					{isRejected && (
						<div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20">
							<span className="w-1.5 h-1.5 rounded-full bg-red-500" />
							<span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Отклонено</span>
						</div>
					)}
					{!status && (
						<div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-500/10 border border-gray-500/20">
							<span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
							<span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ожидает</span>
						</div>
					)}
				</div>

				<div className="space-y-4">
					{/* Progress Bar */}
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-white font-medium">Загружено документов</span>
							<span className="text-gray-400">{docsCount} из 2</span>
						</div>
						<div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
							<div
								className={`h-full transition-all duration-500 rounded-full ${isRejected ? 'bg-red-500' : 'bg-[#ccf333]'}`}
								style={{ width: `${Math.min((docsCount / 2) * 100, 100)}%` }}
							/>
						</div>
					</div>

					{/* Rejected Content */}
					{isRejected && (
						<div className="bg-red-500/5 rounded-xl p-4 border border-red-500/10 space-y-3">
							<div className="flex gap-3 items-start">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500 shrink-0 mt-0.5">
									<path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
								</svg>
								<div className="space-y-1">
									{verification?.rejectionReason && (
										<p className="text-xs text-red-200/60 leading-relaxed">
											{verification.rejectionReason}
										</p>
									)}
								</div>
							</div>

							<button
								onClick={() => setUploadModalOpen(true)}
								className="w-full h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-medium transition-colors border border-red-500/20"
							>
								Загрузить документы повторно
							</button>
						</div>
					)}

					{/* Verified Content */}
					{isVerified && (
						<div className="text-sm text-gray-400 bg-white/5 p-4 rounded-xl border border-white/5 flex items-center gap-3">
							<div className="w-4 h-4 rounded-full bg-[#ccf333]/10 flex items-center justify-center text-[#ccf333] shrink-0">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
									<path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
								</svg>
							</div>
							<span>Ваш профиль подтвержден.</span>
						</div>
					)}
				</div>
			</div>

			<VerificationUploadModal
				isOpen={isUploadModalOpen}
				onClose={() => setUploadModalOpen(false)}
			/>
		</>
	);
}
