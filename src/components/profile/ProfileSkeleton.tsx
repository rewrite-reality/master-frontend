export function ProfileSkeleton() {
	return (
		<div className="min-h-dvh bg-base-200 animate-pulse">
			{/* Header (кнопка Назад) */}
			<div className="px-4 pt-3">
				<div className="w-20 h-8 rounded bg-base-300 opacity-50"></div>
			</div>

			{/* Hero (Аватар + Имя) */}
			<div className="px-4 pt-4">
				<div className="flex flex-col items-center text-center gap-2">
					{/* Avatar */}
					<div className="relative">
						<div className="w-28 h-28 rounded-full bg-base-300 ring ring-base-300 ring-offset-base-200 ring-offset-2"></div>
						{/* Status dot */}
						<div className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-base-100 bg-base-300"></div>
					</div>

					{/* Name & Rating */}
					<div className="w-full flex flex-col items-center gap-1">
						<div className="h-7 w-48 bg-base-300 rounded mt-1"></div>
						<div className="h-4 w-24 bg-base-300 rounded opacity-70"></div>
					</div>
				</div>
			</div>

			{/* Stats (3 карточки) */}
			<div className="px-4 mt-5">
				<div className="grid grid-cols-3 gap-2">
					{[1, 2, 3].map((i) => (
						<div key={i} className="card bg-base-100 shadow-sm border border-base-200 h-[74px]">
							<div className="card-body items-center justify-center p-2 gap-1">
								<div className="h-6 w-8 bg-base-200 rounded"></div>
								<div className="h-3 w-12 bg-base-200 rounded opacity-60"></div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Info Card (Специализация и контакты) */}
			<div className="px-4 mt-4 pb-28">
				<div className="card bg-base-100 shadow-sm border border-base-200 h-64">
					<div className="card-body gap-5">

						{/* Specialties */}
						<div className="space-y-2">
							<div className="h-5 w-32 bg-base-200 rounded"></div>
							<div className="flex gap-2">
								<div className="h-8 w-24 rounded-full bg-base-200"></div>
								<div className="h-8 w-32 rounded-full bg-base-200"></div>
							</div>
						</div>

						<div className="h-px bg-base-200 w-full my-0"></div>

						{/* Contacts */}
						<div className="space-y-3">
							<div className="h-5 w-24 bg-base-200 rounded"></div>

							<div className="flex justify-between">
								<div className="h-4 w-16 bg-base-200 rounded opacity-70"></div>
								<div className="h-4 w-32 bg-base-200 rounded"></div>
							</div>

							<div className="flex justify-between">
								<div className="h-4 w-16 bg-base-200 rounded opacity-70"></div>
								<div className="h-4 w-24 bg-base-200 rounded"></div>
							</div>
						</div>

					</div>
				</div>
			</div>
		</div>
	);
}
