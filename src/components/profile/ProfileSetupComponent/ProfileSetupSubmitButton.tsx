type ProfileSetupSubmitButtonProps = {
	isValid: boolean;
	submitting: boolean;
	onSubmit: () => void;
};

export function ProfileSetupSubmitButton({
	isValid,
	submitting,
	onSubmit,
}: ProfileSetupSubmitButtonProps) {
	return (
		<div className="pt-4">
			<button
				className="btn w-full h-14 rounded-full bg-[#ccf333] hover:bg-[#bbe02f] text-black text-lg font-bold border-none disabled:bg-[#1c1c1e] disabled:text-gray-600"
				onClick={onSubmit}
				disabled={!isValid}
			>
				{submitting ? <span className="loading loading-spinner text-black"></span> : 'Сохранить профиль'}
			</button>
		</div>
	);
}
