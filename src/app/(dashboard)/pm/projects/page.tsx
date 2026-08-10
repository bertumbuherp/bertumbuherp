import Header from '@/components/layout/Header';
import { ProjectListView } from '@/components/pm/ProjectListView';

export default function PMProjects() {
  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header title="Manajemen Proyek" subtitle="Daftar Proyek Aktif" />
      <div className="p-6 flex-1 max-w-7xl mx-auto w-full">
        <ProjectListView />
      </div>
    </div>
  );
}
