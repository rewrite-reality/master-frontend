'use client';

import React from 'react';

export function EmptyStateSkeleton() {
	return (
		<div className="card bg-[#1c1c1e] text-center py-10 rounded-[24px]">
			<div className="card-body items-center">
				<div className="skeleton h-6 w-24 rounded-full mb-4" />
				<div className="skeleton h-4 w-72 max-w-full rounded-full mb-2" />
				<div className="skeleton h-4 w-60 max-w-full rounded-full" />
			</div>
		</div>
	);
}

export function OrderCardSkeleton() {
	return (
		<div className="card bg-[#1c1c1e] text-white shadow-lg border border-white/5 rounded-[24px]">
			<div className="card-body p-5 gap-5">
				<div className="flex items-center justify-between">
					<div className="skeleton h-6 w-40 rounded-full" />
					<div className="skeleton h-8 w-20 rounded-full" />
				</div>

				<div className="flex items-center justify-between">
					<div className="flex flex-col gap-2">
						<div className="skeleton h-4 w-24 rounded-full" />
						<div className="skeleton h-3 w-16 rounded-full" />
					</div>

					<div className="skeleton h-4 w-10 rounded-full opacity-40" />

					<div className="flex flex-col gap-2 items-end">
						<div className="skeleton h-4 w-24 rounded-full" />
						<div className="skeleton h-3 w-12 rounded-full" />
					</div>
				</div>

				<div className="skeleton h-3 w-full rounded-full" />

				<div className="flex flex-col gap-2 mt-1">
					<div className="h-[2px] w-full bg-[#3a3a3c] rounded-full overflow-hidden">
						<div className="h-full w-3/3 skeleton rounded-full" />
					</div>

					<div className="flex justify-between">
						<div className="skeleton h-3 w-10 rounded-full" />
						<div className="skeleton h-3 w-12 rounded-full" />
						<div className="skeleton h-3 w-10 rounded-full" />
					</div>
				</div>
			</div>
		</div>
	);
}

export function OrdersListSkeleton({ count = 6 }: { count?: number }) {
	return (
		<div className="space-y-4">
			{Array.from({ length: count }).map((_, i) => (
				<OrderCardSkeleton key={i} />
			))}
		</div>
	);
}
