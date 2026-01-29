import { InputMask } from '@react-input/mask';

type ProfileContactsSectionProps = {
	phone: string;
	phoneE164: string;
	onChangePhone: (v: string) => void;
};

export function ProfileContactsSection({ phone, phoneE164, onChangePhone }: ProfileContactsSectionProps) {
	const showError = phone.length > 0 && !phoneE164;

	return (
		<div className="space-y-4">
			<h2 className="text-xs uppercase tracking-widest text-gray-500 font-semibold pl-1">Контакты</h2>
			<div>
				<InputMask
					mask="+7 (___) ___-__-__"
					replacement={{ _: /\d/ }}
					className={`w-full bg-[#1c1c1e] text-white p-4 rounded-[16px] outline-none border transition-colors placeholder:text-gray-600 ${showError ? 'border-red-500' : 'border-transparent focus:border-[#ccf333]'}`}
					placeholder="+7 (___) ___-__-__"
					value={phone}
					onChange={(e) => onChangePhone(e.target.value)}
					inputMode="tel"
				/>
				{showError && (
					<p className="text-xs text-red-500 mt-2 pl-2">Неверный формат номера</p>
				)}
			</div>
		</div>
	);
}
