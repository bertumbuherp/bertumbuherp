import Header from '@/components/layout/Header';
import { DealKanbanBoard } from '@/components/crm/DealKanbanBoard';

export default function CRMDealsPage() {
  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header title="Deals & Pipeline" subtitle="Visualisasi Sales Pipeline" />
      <div className="p-6 flex-1 w-full overflow-hidden">
        <DealKanbanBoard />
      </div>
    </div>
  );
}
