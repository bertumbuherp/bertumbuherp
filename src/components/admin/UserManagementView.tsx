'use client';
import { useState } from 'react';
import { useUserStore, UserAccount } from '@/lib/store/userStore';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS_MAP } from '@/lib/permissions';
import { Role } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Users, UserPlus, Edit3, Trash2, ShieldCheck, CheckCircle, XCircle, Search, Key, Shield } from 'lucide-react';

export default function UserManagementView() {
  const { session } = useAuth();
  const { users, addUser, updateUser, deleteUser, toggleUserStatus } = useUserStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Brand',
    position: 'Staff',
    role: 'team_member' as Role,
    monthlySalary: 5000000,
    standardHoursPerMonth: 160,
    billableRate: 100000,
    isActive: true,
  });

  const actorName = session?.name || 'Admin';
  const actorRole = (session?.roles[0] || 'super_admin') as Role;

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.roles.includes(roleFilter as Role);
    const matchesStatus =
      statusFilter === 'all' || (statusFilter === 'active' ? u.isActive : !u.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUser(
      {
        name: formData.name,
        email: formData.email,
        department: formData.department,
        position: formData.position,
        roles: [formData.role],
        monthlySalary: Number(formData.monthlySalary),
        standardHoursPerMonth: Number(formData.standardHoursPerMonth),
        billableRate: Number(formData.billableRate),
        isActive: formData.isActive,
      },
      actorName,
      actorRole
    );
    setShowAddModal(false);
    resetForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUser(
      editingUser.id,
      {
        name: formData.name,
        email: formData.email,
        department: formData.department,
        position: formData.position,
        roles: [formData.role],
        monthlySalary: Number(formData.monthlySalary),
        standardHoursPerMonth: Number(formData.standardHoursPerMonth),
        billableRate: Number(formData.billableRate),
        isActive: formData.isActive,
      },
      actorName,
      actorRole
    );
    setEditingUser(null);
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (!deletingUser) return;
    deleteUser(deletingUser.id, actorName, actorRole);
    setDeletingUser(null);
  };

  const openEditModal = (u: UserAccount) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      department: u.department,
      position: u.position,
      role: u.roles[0] || 'team_member',
      monthlySalary: u.monthlySalary,
      standardHoursPerMonth: u.standardHoursPerMonth || 160,
      billableRate: u.billableRate || 100000,
      isActive: u.isActive,
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      department: 'Brand',
      position: 'Staff',
      role: 'team_member',
      monthlySalary: 5000000,
      standardHoursPerMonth: 160,
      billableRate: 100000,
      isActive: true,
    });
  };

  const activeUsersCount = users.filter((u) => u.isActive).length;
  const totalPayrollBudget = users.reduce((acc, u) => acc + (u.isActive ? u.monthlySalary : 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Total Pengguna Terdaftar</p>
            <p className="text-2xl font-black text-gray-900">{users.length} <span className="text-xs font-normal text-gray-500">Karyawan</span></p>
          </div>
        </div>

        <div className="card p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Status Akun Aktif</p>
            <p className="text-2xl font-black text-emerald-600">{activeUsersCount} <span className="text-xs font-normal text-gray-500">dari {users.length} Aktif</span></p>
          </div>
        </div>

        <div className="card p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Total Anggaran Gaji</p>
            <p className="text-xl font-black text-gray-900">{formatCurrency(totalPayrollBudget)}</p>
          </div>
        </div>
      </div>

      {/* Filter & Action Bar */}
      <div className="card p-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, email, posisi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-red-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-red-500"
          >
            <option value="all">Semua Role</option>
            <option value="owner">Owner / Direktur</option>
            <option value="super_admin">Super Admin</option>
            <option value="ae">Account Executive (CRM)</option>
            <option value="pm">Project Manager (PM)</option>
            <option value="finance">Finance Manager</option>
            <option value="hr">HR Manager</option>
            <option value="team_member">Anggota Tim / Pelaksana</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-red-500"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Non-Aktif</option>
          </select>
        </div>

        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="w-full md:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-red-600/20 transition-all cursor-pointer shrink-0"
        >
          <UserPlus size={16} />
          <span>Tambah User Baru</span>
        </button>
      </div>

      {/* Users Data Table */}
      <div className="card bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Pengguna</th>
                <th className="py-3.5 px-4">Role &amp; Otorisasi</th>
                <th className="py-3.5 px-4">Divisi &amp; Posisi</th>
                <th className="py-3.5 px-4">Gaji Pokok</th>
                <th className="py-3.5 px-4 text-center">Status Akun</th>
                <th className="py-3.5 px-4 text-right">Aksi Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredUsers.map((u) => {
                const primaryRole = u.roles[0] || 'team_member';
                const roleLabel = ROLE_LABELS_MAP[primaryRole] ?? primaryRole;

                return (
                  <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          {u.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{u.name}</p>
                          <p className="text-[11px] text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        primaryRole === 'owner' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        primaryRole === 'super_admin' ? 'bg-red-100 text-red-800 border border-red-200' :
                        primaryRole === 'finance' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        primaryRole === 'pm' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        primaryRole === 'ae' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        primaryRole === 'hr' ? 'bg-pink-100 text-pink-800 border border-pink-200' :
                        'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {roleLabel}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-gray-800 font-semibold">{u.position}</p>
                      <p className="text-[10px] text-gray-500">Divisi: {u.department}</p>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-gray-800">
                      {formatCurrency(u.monthlySalary)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => toggleUserStatus(u.id, actorName, actorRole)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all border ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                        title="Klik untuk ubah status"
                      >
                        {u.isActive ? '● Aktif' : '○ Non-Aktif'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-100 transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingUser(u)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-100 transition-colors cursor-pointer"
                          title="Hapus User"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Tidak ditemukan pengguna yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah User */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 fade-in">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <UserPlus size={20} className="text-red-600" /> Tambah User Internal Baru
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Lengkap Karyawan</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-red-500"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Akun (@bertumbuh.id)</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-red-500"
                  placeholder="budi@bertumbuh.id"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Role / Hak Akses</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-red-500 font-semibold text-gray-800"
                  >
                    <option value="team_member">Anggota Tim / Pelaksana</option>
                    <option value="pm">Project Manager (PM)</option>
                    <option value="ae">Account Executive (CRM)</option>
                    <option value="finance">Finance Manager</option>
                    <option value="hr">HR Manager</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="owner">Owner / Direktur</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Divisi / Departemen</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-red-500 font-semibold text-gray-800"
                  >
                    <option value="Brand">Brand</option>
                    <option value="Design">Design</option>
                    <option value="Sosmed/CC">Sosmed &amp; CC</option>
                    <option value="Performance">Performance</option>
                    <option value="Production">Production</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Posisi / Jabatan</label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-red-500"
                    placeholder="Senior Specialist"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Gaji Pokok Bulanan (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formData.monthlySalary}
                    onChange={(e) => setFormData({ ...formData, monthlySalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-red-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 font-bold text-gray-600 bg-gray-100 rounded-xl">Batal</button>
                <button type="submit" className="px-5 py-2 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md cursor-pointer">Simpan User Baru</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit User */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 fade-in">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Edit3 size={20} className="text-blue-600" /> Edit Pengguna: {editingUser.name}
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-red-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Akun</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Role / Hak Akses</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-red-500 font-semibold text-gray-800"
                  >
                    <option value="team_member">Anggota Tim / Pelaksana</option>
                    <option value="pm">Project Manager (PM)</option>
                    <option value="ae">Account Executive (CRM)</option>
                    <option value="finance">Finance Manager</option>
                    <option value="hr">HR Manager</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="owner">Owner / Direktur</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Divisi / Departemen</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-red-500 font-semibold text-gray-800"
                  >
                    <option value="Brand">Brand</option>
                    <option value="Design">Design</option>
                    <option value="Sosmed/CC">Sosmed &amp; CC</option>
                    <option value="Performance">Performance</option>
                    <option value="Production">Production</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Posisi / Jabatan</label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-red-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Gaji Pokok Bulanan (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formData.monthlySalary}
                    onChange={(e) => setFormData({ ...formData, monthlySalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-red-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 font-bold text-gray-600 bg-gray-100 rounded-xl">Batal</button>
                <button type="submit" className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 fade-in text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <h3 className="font-bold text-lg text-gray-900">Hapus User Permanen?</h3>
            <p className="text-xs text-gray-600">
              Apakah Anda yakin ingin menghapus user <strong>{deletingUser.name}</strong> ({deletingUser.email})? Tindakan ini akan dicatat dalam log aktivitas.
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button onClick={() => setDeletingUser(null)} className="px-4 py-2 font-bold text-gray-600 bg-gray-100 rounded-xl text-xs">Batal</button>
              <button onClick={handleConfirmDelete} className="px-5 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl text-xs shadow-md cursor-pointer">Hapus User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
