export function initials(first?: string | null, last?: string | null) {
	const a = (first?.trim()?.[0] ?? '').toUpperCase();
	const b = (last?.trim()?.[0] ?? '').toUpperCase();
	return (b + a) || 'M';
}

export function formatPhonePretty(e164?: string | null) {
	if (!e164) return '';
	const d = e164.replace(/\D/g, '');
	if (d.length === 11 && d.startsWith('7')) {
		const n = d.slice(1);
		return `+7 (${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6, 8)}-${n.slice(8, 10)}`;
	}
	return e164;
}

export function formatMoneyCompact(n?: number | null) {
	if (n == null) return '—';
	// balance может быть Decimal->number уже на API, если нет — придёт как number
	return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n) + ' ₽';
}
