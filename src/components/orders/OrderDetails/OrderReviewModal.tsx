import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface OrderReviewModalProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (files: File[]) => void;
	isSubmitting: boolean;
	resetKey?: number;
}

export function OrderReviewModal({ open, onClose, onSubmit, isSubmitting, resetKey }: OrderReviewModalProps) {
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
	if (resetKey != null) {
		// Reset previews after a successful submit without lifting file state to the container.
		setSelectedFiles([]);
	}
}, [resetKey]);

	return (
		<AnimatePresence>
			{open && (
				<div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
					<motion.div
						initial={{ opacity: 0, y: 100 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 100 }}
						className="w-full max-w-md bg-[#1c1c1e] rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
					>
						<div className="p-6 space-y-6">
							<h3 className="text-xl font-medium text-white text-center">Завершение работы</h3>

							<div
								onClick={() => fileInputRef.current?.click()}
								className="border-2 border-dashed border-gray-600 rounded-2xl p-8 text-center cursor-pointer hover:border-[#ccf333] hover:bg-white/5 transition-all group"
							>
								<input
									type="file"
									multiple
									accept="image/*"
									className="hidden"
									ref={fileInputRef}
									onChange={(e) => {
										if (e.target.files) {
											setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
										}
									}}
								/>
								<div className="w-12 h-12 rounded-full bg-[#2c2c2e] text-gray-400 group-hover:text-[#ccf333] group-hover:scale-110 transition-all flex items-center justify-center mx-auto mb-3">
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
										<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
									</svg>
								</div>
								<p className="text-sm text-gray-400 group-hover:text-white transition-colors">
									Нажмите, чтобы добавить фото-подтверждения
								</p>
							</div>

							{selectedFiles.length > 0 && (
								<div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
									{selectedFiles.map((file, idx) => (
										<div key={idx} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-white/10 group">
											<img
												src={URL.createObjectURL(file)}
												alt="preview"
												className="w-full h-full object-cover"
											/>
											<button
												onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== idx))}
												className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
											>
												×
											</button>
										</div>
									))}
								</div>
							)}

							<div className="grid grid-cols-2 gap-3 pt-2">
								<button
									onClick={onClose}
									className="btn btn-ghost rounded-full hover:bg-white/5 font-normal text-white"
								>
									Отмена
								</button>
								<button
									onClick={() => onSubmit(selectedFiles)}
									disabled={isSubmitting || selectedFiles.length === 0}
									className="btn bg-[#ccf333] hover:bg-[#b0d42b] text-black border-none rounded-full font-bold disabled:bg-gray-800 disabled:text-gray-500"
								>
									{isSubmitting ? <span className="loading loading-spinner" /> : 'Отправить'}
								</button>
							</div>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
