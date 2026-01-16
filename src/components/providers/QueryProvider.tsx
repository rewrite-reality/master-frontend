'use client';

import { type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const defaultQueryOptions = {
	queries: {
		staleTime: 5 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: 1,
	},
};

export function QueryProvider({ children }: { children: ReactNode }) {
	const [client] = useState(() => new QueryClient({ defaultOptions: defaultQueryOptions }));

	return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
