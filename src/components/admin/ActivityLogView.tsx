'use client';
import { useState } from 'react';
import { useActivityLogStore, SystemModule, ActivityLog } from '@/lib/store/activityLogStore';
import { ROLE_LABELS_MAP } from '@/lib/permissions';
import { Role } from '@/lib/types';
import { Activity, ShieldAlert, Filter, Search, Download, RefreshCw, Clock, Layers, UserCheck } from 'lucide-react';

export default function ActivityLogView() {
  const { logs, clearLogs } = useActivityLogStore();

  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = logs.filter((log) => {
    const matchesModule = selectedModule === 'all' || log.module === selectedModule;
    const matchesRole = selectedRole === 'all' || log.userRole === selectedRole;
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesModule && matchesRole && matchesSearch;
  });

  const getModuleBadge = (mod: SystemModule) => {
    switch (mod) {
      case 'AUTH':
        return <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold">AUTH</span>;
      case 'USER_MGMT':
        return <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-bold">USER MGMT</span>;
      case 'CRM':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">CRM</span>;
      case 'PM':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold">PM</span>;
      case 'FINANCE':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">FINANCE</span>;
      case 'HR':
        return <span className="bg-pink-100 text-pink-800 border border-pink-200 px-2 py-0.5 rounded text-[10px] font-bold">HR</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 border border-gray-200 px-2 py-0.5 rounded text-[10px] font-bold">SYSTEM</span>;
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Waktu', 'Pengguna', 'Role', 'Modul', 'Aksi', 'Rincian Aktivitas', 'IP Address'];
    const rows = filteredLogs.map((l) => [
      l.id,
      new Date(l.timestamp).toLocaleString('id-ID'),
      `"${l.userName}"`,
      `"${l.userRole}"`,
      l.module,
      l.action,
      `"${l.details.replace(/"/g, '""')}"`,
      l.ipAddress || '-'
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Activity_Log_Bertumbuh_ERP_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary */}
      <div className="card p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Log Aktivitas System &amp; Audit Trail Pengawas</h2>
            <p className="text-xs text-slate-300">
              Mencatat seluruh aksi operasional, autentikasi, transaksi, dan perubahan data pengguna di sistem.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs border border-slate-600"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card p-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari user, rincian aktivitas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-red-500"
            />
          </div>

          {/* Module Filter */}
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-red-500"
          >
            <option value="all">Semua Modul</option>
            <option value="AUTH">AUTH (Login/Logout)</option>
            <option value="USER_MGMT">USER MGMT (Kelola User)</option>
            <option value="CRM">CRM (Prospek &amp; Deal)</option>
            <option value="PM">PM (Proyek &amp; Task)</option>
            <option value="FINANCE">FINANCE (Invoice &amp; Jurnal)</option>
            <option value="HR">HR (Absen, Cuti, Lembur)</option>
          </select>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-red-500"
          >
            <option value="all">Semua Role</option>
            <option value="owner">Owner / Direktur</option>
            <option value="super_admin">Super Admin</option>
            <option value="ae">Account Executive</option>
            <option value="pm">Project Manager</option>
            <option value="finance">Finance Manager</option>
            <option value="hr">HR Manager</option>
            <option value="team_member">Anggota Tim</option>
          </select>
        </div>

        <div className="text-xs text-gray-500 font-semibold">
          Total Log: <span className="font-bold text-gray-900">{filteredLogs.length}</span> Entri
        </div>
      </div>

      {/* Activity Log Table */}
      <div className="card bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Waktu (Timestamp)</th>
                <th className="py-3.5 px-4">Pengguna &amp; Role</th>
                <th className="py-3.5 px-4">Modul</th>
                <th className="py-3.5 px-4">Aksi / Event</th>
                <th className="py-3.5 px-4">Rincian Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredLogs.map((log) => {
                const roleLabel = ROLE_LABELS_MAP[log.userRole] ?? log.userRole;
                const formattedDate = new Date(log.timestamp).toLocaleString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                return (
                  <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-gray-400" />
                        <span>{formattedDate}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-gray-900">{log.userName}</p>
                        <p className="text-[10px] text-gray-500 font-semibold">{roleLabel}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {getModuleBadge(log.module)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-gray-700 font-normal leading-relaxed">{log.details}</p>
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    Tidak ditemukan log aktivitas yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
