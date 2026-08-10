import Header from '@/components/layout/Header';
import { EmployeeDatabase } from '@/components/hr/EmployeeDatabase';

export default function HREmployees() {
  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header title="Database Karyawan" subtitle="Manajemen SDM" />
      <div className="p-6 flex-1 max-w-7xl mx-auto w-full">
        <EmployeeDatabase />
      </div>
    </div>
  );
}
