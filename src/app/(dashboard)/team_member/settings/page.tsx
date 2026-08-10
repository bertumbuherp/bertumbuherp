'use client';

import dynamic from 'next/dynamic';

const SettingsView = dynamic(
  () => import('@/components/views/SettingsView').then(mod => mod.SettingsView),
  { ssr: false }
);

export default function TeamSettingsPage() {
  return <SettingsView role="Team Member" />;
}
