'use client';

import React from 'react';

export function OrderDetailsSkeleton() {
	return (
		<div className="min-h-screen text-white font-sans pb-24 relative">
			{/* Header with Back Button + Title (как в реальной странице) */}
			<div className="px-4 pt-4 pb-2 flex items-center gap-4">
				<button
					type="button"
					disabled
					aria-disabled="true"
					className="w-10 h-10 rounded-full bg-[#1c1c1e] flex items-center justify-center text-white opacity-60"
				>
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M19 12H5M12 19l-7-7 7-7" />
					</svg>
				</button>

				<h1 className="text-lg font-medium">Детали заказа</h1>
			</div>

			<div className="p-4 space-y-4 max-w-md mx-auto">
				{/* Main Info Card */}
				<div className="card bg-[#1c1c1e] rounded-[24px] overflow-hidden">
					<div className="card-body p-5 gap-5">
						{/* Title & Price */}
						<div className="flex items-start justify-between gap-4">
							<div className="space-y-2 flex-1">
								<div className="skeleton h-6 w-3/4 rounded-full" />
								<div className="skeleton h-6 w-1/2 rounded-full" />
							</div>
							<div className="skeleton h-8 w-24 rounded-full" />
						</div>

						{/* Tags */}
						<div className="flex flex-wrap gap-2">
							<div className="skeleton h-8 w-32 rounded-full" />
							<div className="skeleton h-8 w-28 rounded-full" />
							<div className="skeleton h-8 w-24 rounded-full" />
						</div>

						{/* Description */}
						<div className="p-4 rounded-2xl bg-black/40 border border-white/5">
							<div className="space-y-2">
								<div className="skeleton h-4 w-full rounded-full" />
								<div className="skeleton h-4 w-11/12 rounded-full" />
								<div className="skeleton h-4 w-2/3 rounded-full" />
							</div>
						</div>

						{/* Meta rows */}
						<div className="space-y-3 pt-2">
							<div className="flex items-start gap-3">
								<div className="mt-1 skeleton w-8 h-8 rounded-full" />
								<div className="flex flex-col gap-2 flex-1">
									<div className="skeleton h-3 w-14 rounded-full" />
									<div className="skeleton h-4 w-5/6 rounded-full" />
								</div>
							</div>

							<div className="flex items-start gap-3">
								<div className="mt-1 skeleton w-8 h-8 rounded-full" />
								<div className="flex flex-col gap-2 flex-1">
									<div className="skeleton h-3 w-14 rounded-full" />
									<div className="skeleton h-4 w-2/3 rounded-full" />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Progress Card */}
				<div className="card rounded-[24px] border border-dashed bg-transparent border-gray-800">
					<div className="card-body p-5 gap-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="skeleton h-5 w-5 rounded" />
								<div className="skeleton h-4 w-24 rounded-full" />
							</div>
							<div className="skeleton h-3 w-10 rounded-full" />
						</div>

						<div className="rounded-2xl bg-black/30 border border-white/5 p-4">
							<div className="flex items-center justify-between gap-2">
								<div className="skeleton h-4 w-16 rounded-full" />
								<div className="skeleton h-4 w-16 rounded-full" />
								<div className="skeleton h-4 w-16 rounded-full" />
								<div className="skeleton h-4 w-16 rounded-full" />
							</div>

							<div className="mt-4 space-y-2">
								<div className="skeleton h-3 w-full rounded-full" />
								<div className="skeleton h-3 w-2/3 rounded-full" />
							</div>
						</div>
					</div>
				</div>

				{/* Contacts Card */}
				<div className="card rounded-[24px] border border-dashed bg-transparent border-gray-800">
					<div className="card-body p-5 gap-4">
						<div className="flex items-center gap-2">
							<div className="skeleton h-5 w-5 rounded" />
							<div className="skeleton h-4 w-20 rounded-full" />
						</div>

						<div className="text-center py-2 space-y-3">
							<div className="skeleton h-4 w-5/6 mx-auto rounded-full" />
							<div className="skeleton h-4 w-2/3 mx-auto rounded-full" />
						</div>
					</div>
				</div>
			</div>

			{/* Bottom button placeholder */}
			<div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-40 max-w-md mx-auto">
				<div className="skeleton w-full h-14 rounded-full" />
			</div>
		</div>
	);
}
