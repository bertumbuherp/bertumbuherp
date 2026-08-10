import Header from '@/components/layout/Header';
import { PMLeaveApprovalTable } from '@/components/pm/PMLeaveApprovalTable';

export default function PMApprovalCuti() {
  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header title="Approval Cuti Tim" subtitle="Tahap 1 - Manajemen Proyek" />
      <div className="p-6 flex-1 max-w-7xl mx-auto w-full">
        <PMLeaveApprovalTable />
      </div>
    </div>
  );
}
