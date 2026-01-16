'use client';

import React from 'react';

export function ProfileSkeleton() {
	return (
		<div className="min-h-screen text-white font-sans pb-20">
			{/* Header */}
			<div className="px-4 pt-4 pb-2 flex items-center justify-between">
				<div className="skeleton w-10 h-10 rounded-full" />
				<div className="skeleton h-4 w-20 rounded-full" />
				<div className="w-10" />
			</div>

			{/* Hero */}
			<div className="flex flex-col items-center pt-6 pb-8">
				<div className="relative p-1 rounded-full border-2 border-white/10">
					<div className="w-24 h-24 rounded-full overflow-hidden bg-[#1c1c1e] flex items-center justify-center">
						<div className="skeleton w-24 h-24 rounded-full" />
					</div>

					<div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
						<div className="skeleton h-5 w-16 rounded-full" />
					</div>
				</div>

				<div className="mt-5 skeleton h-7 w-44 rounded-full" />

				<div className="flex items-center gap-2 mt-3">
					<div className="skeleton h-4 w-4 rounded" />
					<div className="skeleton h-4 w-10 rounded-full" />
					<div className="skeleton h-4 w-20 rounded-full" />
				</div>
			</div>

			{/* Stats */}
			<div className="px-4 mb-6">
				<div className="grid grid-cols-2 gap-3">
					<div className="bg-[#1c1c1e] rounded-[20px] p-4 flex flex-col items-center justify-center gap-2">
						<div className="skeleton h-8 w-16 rounded-full" />
						<div className="skeleton h-3 w-20 rounded-full" />
					</div>

					<div className="bg-[#1c1c1e] rounded-[20px] p-4 flex flex-col items-center justify-center gap-2">
						<div className="skeleton h-8 w-20 rounded-full" />
						<div className="skeleton h-3 w-20 rounded-full" />
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="px-4 space-y-4">
				{/* Specialties */}
				<div className="bg-[#1c1c1e] rounded-[24px] p-5">
					<div className="skeleton h-3 w-32 rounded-full mb-4" />
					<div className="flex flex-wrap gap-2">
						<div className="skeleton h-8 w-24 rounded-full" />
						<div className="skeleton h-8 w-28 rounded-full" />
						<div className="skeleton h-8 w-20 rounded-full" />
					</div>
				</div>

				{/* Details */}
				<div className="bg-[#1c1c1e] rounded-[24px] p-5">
					<div className="skeleton h-3 w-20 rounded-full mb-4" />

					<div className="space-y-4">
						{/* Phone row */}
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="skeleton w-8 h-8 rounded-full" />
								<div className="skeleton h-4 w-36 rounded-full" />
							</div>
							<div className="skeleton h-4 w-4 rounded" />
						</div>

						<div className="h-[1px] bg-white/5 w-full my-2" />

						{/* Districts row */}
						<div className="flex items-start gap-3">
							<div className="skeleton w-8 h-8 rounded-full shrink-0" />
							<div className="flex flex-col gap-2 flex-1">
								<div className="skeleton h-4 w-28 rounded-full" />
								<div className="skeleton h-3 w-full rounded-full" />
								<div className="skeleton h-3 w-2/3 rounded-full" />
							</div>
						</div>
					</div>
				</div>

				{/* Settings */}
				<div className="bg-[#1c1c1e] rounded-[24px] p-5">
					<div className="skeleton h-3 w-24 rounded-full mb-4" />

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="skeleton w-8 h-8 rounded-full" />
							<div className="flex flex-col gap-2">
								<div className="skeleton h-4 w-32 rounded-full" />
								<div className="skeleton h-3 w-52 rounded-full" />
							</div>
						</div>
						<div className="skeleton h-4 w-4 rounded" />
					</div>
				</div>

				{/* Optional blocked alert placeholder */}
				<div className="bg-[#1c1c1e] rounded-2xl p-5 border border-white/5">
					<div className="flex items-center gap-3">
						<div className="skeleton h-6 w-6 rounded" />
						<div className="flex-1 space-y-2">
							<div className="skeleton h-4 w-2/3 rounded-full" />
							<div className="skeleton h-3 w-1/2 rounded-full" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
