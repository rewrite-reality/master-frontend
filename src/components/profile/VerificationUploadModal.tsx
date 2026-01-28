'use client';

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiError } from '@/lib/apiClient';
import { uploadDocument } from '@/lib/verificationApi';

interface VerificationUploadModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function VerificationUploadModal({ isOpen, onClose }: VerificationUploadModalProps) {
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const queryClient = useQueryClient();

	const uploadMutation = useMutation({
		mutationFn: (file: File) => uploadDocument(file),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['verification', 'status'] });
			// Don't close modal immediately, user might want to upload more or see progress
			setError(null);
		},
		onError: (e: unknown) => {
			setError(e instanceof ApiError ? (e.message || 'Ошибка загрузки') : 'Ошибка');
		},
		onSettled: () => {
			setUploading(false);
		}
	});

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const file = e.target.files[0];
			setUploading(true);
			setError(null);
			uploadMutation.mutate(file);
			// Reset input
			e.target.value = '';
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
					<motion.div
						initial={{ opacity: 0, y: 100 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 100 }}
						className="w-full max-w-md bg-[#1c1c1e] rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
					>
						<div className="p-6 space-y-6">
							<h3 className="text-xl font-medium text-white text-center">Загрузка документов</h3>

							<div
								onClick={() => !uploading && fileInputRef.current?.click()}
								className={`
									border-2 border-dashed border-gray-600 rounded-2xl p-8 text-center transition-all group
									${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#ccf333] hover:bg-white/5'}
								`}
							>
								<input
									type="file"
									accept="image/*"
									className="hidden"
									ref={fileInputRef}
									onChange={handleFileSelect}
									disabled={uploading}
								/>
								<div className="w-12 h-12 rounded-full bg-[#2c2c2e] text-gray-400 group-hover:text-[#ccf333] group-hover:scale-110 transition-all flex items-center justify-center mx-auto mb-3">
									{uploading ? (
										<span className="loading loading-spinner text-[#ccf333]" />
									) : (
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
											<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
										</svg>
									)}
								</div>
								<p className="text-sm text-gray-400 group-hover:text-white transition-colors">
									{uploading ? 'Загрузка...' : 'Нажмите, чтобы загрузить фото паспорта или селфи'}
								</p>
							</div>

							{error && (
								<div className="text-red-500 text-sm text-center bg-red-900/20 p-2 rounded-lg">
									{error}
								</div>
							)}

							<div className="grid grid-cols-1 gap-3 pt-2">
								<button
									onClick={onClose}
									className="btn btn-ghost rounded-full hover:bg-white/5 font-normal text-white"
								>
									Закрыть
								</button>
							</div>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
