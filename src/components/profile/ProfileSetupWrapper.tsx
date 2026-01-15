'use client';

import dynamic from 'next/dynamic';

const ProfileSetupClient = dynamic(
	() => import('./ProfileSetupClient'),
	{ ssr: false }
);

export default function ProfileSetupWrapper() {
	return <ProfileSetupClient />;
}
