// src/components/profile/ProfilePageWrapper.tsx
'use client';

import dynamic from 'next/dynamic';

const ProfilePageClient = dynamic(() => import('./ProfilePageClient'), { ssr: false });

export default function ProfilePageWrapper() {
	return <ProfilePageClient />;
}
