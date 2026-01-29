'use client';

type ProfileToastProps = {
	message: string | null;
};

export function ProfileToast({ message }: ProfileToastProps) {
	if (!message) return null;

	return (
		<div className="toast toast-top toast-center z-[60] w-full max-w-sm px-4 mt-4">
			<div className="alert bg-[#323232] text-white border border-[#ccf333]/50 shadow-2xl rounded-2xl flex justify-center">
				<span className="font-medium">{message}</span>
			</div>
		</div>
	);
}
