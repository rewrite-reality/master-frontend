'use client';

type OrdersHeaderProps = {
	title: string;
	onRefetch: () => void;
};

export default function OrdersHeader({ title, onRefetch }: OrdersHeaderProps) {
	return (
		<div className="flex items-center justify-between pt-2">
			<h1 className="text-xl font-medium tracking-tight">{title}</h1>
			<button onClick={onRefetch} className="btn btn-circle btn-sm btn-ghost text-gray-400 hover:text-white">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					className="w-5 h-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
					/>
				</svg>
			</button>
		</div>
	);
}
