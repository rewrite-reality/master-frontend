import clsx from 'clsx';

type Props = {
	className?: string;
};

export function TopProgressBar({ className }: Props) {
	return (
		<div className={clsx('relative h-[3px] w-full overflow-hidden bg-base-300/90', className)}>
			<div
				className="absolute inset-y-0 w-1/3 bg-primary"
				style={{ animation: 'app-progress 1.1s ease-in-out infinite' }}
			/>
		</div>
	);
}
