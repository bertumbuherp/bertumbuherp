'use client';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import { MemberTaskBoard } from '@/components/team/MemberTaskBoard';

export default function TeamMemberProjectBoardPage() {
  const params = useParams();
  const projectId = typeof params?.id === 'string' ? params.id : 'p1';

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header title="Tugas Saya" subtitle="Papan Kanban Pribadi" />
      <div className="p-6 flex-1 w-full overflow-hidden">
        <MemberTaskBoard projectId={projectId} />
      </div>
    </div>
  );
}
