import Header from '@/components/layout/Header';
import { LeaveApprovalTable } from '@/components/hr/LeaveApprovalTable';

export default function HRCuti() {
  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header title="Approval Cuti" subtitle="Manajemen HR" />
      <div className="p-6 flex-1 max-w-7xl mx-auto w-full">
        <LeaveApprovalTable />
      </div>
    </div>
  );
}
