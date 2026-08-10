import Sidebar from '@/components/layout/Sidebar';
import { Suspense } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Suspense fallback={<div className="w-64 bg-white border-r h-screen" />}>
        <Sidebar />
      </Suspense>
      <main className="flex-1 ml-64 min-w-0">
        {children}
      </main>
    </div>
  );
}
