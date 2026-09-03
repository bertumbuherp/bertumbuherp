'use client';
import UserManagementView from '@/components/admin/UserManagementView';
import Header from '@/components/layout/Header';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <Header
        title="Kelola User & Hak Akses"
        subtitle="Manajemen akun karyawan, role access control, divisi, dan status pengguna"
      />
      <div className="p-6">
        <UserManagementView />
      </div>
    </div>
  );
}
