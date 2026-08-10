import Header from '@/components/layout/Header';
import { OvertimeApprovalTable } from '@/components/hr/OvertimeApprovalTable';

export default function HROvertime() {
  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header title="Approval Lembur" subtitle="Manajemen HR" />
      <div className="p-6 flex-1 max-w-7xl mx-auto w-full">
        <OvertimeApprovalTable />
      </div>
    </div>
  );
}
