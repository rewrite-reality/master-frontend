type ProfilePersonalInfoSectionProps = {
	lastName: string;
	firstName: string;
	patronymic: string;
	onChangeLastName: (v: string) => void;
	onChangeFirstName: (v: string) => void;
	onChangePatronymic: (v: string) => void;
};

export function ProfilePersonalInfoSection({
	lastName,
	firstName,
	patronymic,
	onChangeLastName,
	onChangeFirstName,
	onChangePatronymic,
}: ProfilePersonalInfoSectionProps) {
	return (
		<div className="space-y-4">
			<h2 className="text-xs uppercase tracking-widest text-gray-500 font-semibold pl-1">Личные данные</h2>

			<input
				type="text"
				className="w-full bg-[#1c1c1e] text-white p-4 rounded-[16px] outline-none border border-transparent focus:border-[#ccf333] transition-colors placeholder:text-gray-600"
				placeholder="Фамилия"
				value={lastName}
				onChange={(e) => onChangeLastName(e.target.value)}
			/>
			<input
				type="text"
				className="w-full bg-[#1c1c1e] text-white p-4 rounded-[16px] outline-none border border-transparent focus:border-[#ccf333] transition-colors placeholder:text-gray-600"
				placeholder="Имя"
				value={firstName}
				onChange={(e) => onChangeFirstName(e.target.value)}
			/>
			<input
				type="text"
				className="w-full bg-[#1c1c1e] text-white p-4 rounded-[16px] outline-none border border-transparent focus:border-[#ccf333] transition-colors placeholder:text-gray-600"
				placeholder="Отчество"
				value={patronymic}
				onChange={(e) => onChangePatronymic(e.target.value)}
			/>
		</div>
	);
}
