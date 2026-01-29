'use client';

type OrdersErrorAlertProps = {
	message: string | null;
};

export default function OrdersErrorAlert({ message }: OrdersErrorAlertProps) {
	if (!message) return null;

	return (
		<div role="alert" className="alert alert-error bg-red-900/50 border-none text-red-200">
			<span>{message}</span>
		</div>
	);
}
