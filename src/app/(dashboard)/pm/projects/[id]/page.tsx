'use client';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import { ProjectKanbanBoard } from '@/components/pm/ProjectKanbanBoard';

export default function PMProjectBoardPage() {
  const params = useParams();
  const projectId = typeof params?.id === 'string' ? params.id : 'p1';

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header title="Papan Kanban" subtitle="Manajemen Tugas Proyek" />
      <div className="p-6 flex-1 w-full overflow-hidden">
        <ProjectKanbanBoard projectId={projectId} />
      </div>
    </div>
  );
}
