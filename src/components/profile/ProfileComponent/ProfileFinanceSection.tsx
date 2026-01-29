'use client';

import type { ProfileDto } from '@/components/auth/meQuery';
import { DebtWidget } from './DebtWidget';

type ProfileFinanceSectionProps = {
	finance: ProfileDto['finance'] | null;
};

export function ProfileFinanceSection({ finance }: ProfileFinanceSectionProps) {
	if (!finance) return null;

	return (
		<div className="px-4 mb-4">
			<DebtWidget finance={finance} />
		</div>
	);
}
