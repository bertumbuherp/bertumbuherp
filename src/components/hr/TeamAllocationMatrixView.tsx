'use client';

import React, { useState, useMemo } from 'react';
import { useHRStore } from '@/lib/store/hrStore';
import { Users, Briefcase, Plus, Search, Filter, CheckCircle, AlertTriangle, ShieldAlert, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface Allocation {
  id: string;
  userId: string;
  userName: string;
  department: string;
  projectName: string;
  clientName: string;
  allocationPercent: number; // e.g. 40%
  hoursPerWeek: number; // e.g. 16h
  roleInProject: string;
}

const initialAllocations: Allocation[] = [];

export function TeamAllocationMatrixView() {
  const { employees } = useHRStore();
  const [allocations, setAllocations] = useState<Allocation[]>(initialAllocations);
  const [selectedDivFilter, setSelectedDivFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Allocation Form State
  const [formData, setFormData] = useState({
    userId: '',
    clientName: '',
    projectName: '',
    allocationPercent: 30,
    roleInProject: 'Team Member'
  });

  // Calculate allocation per employee
  const employeeMatrix = useMemo(() => {
    return employees.map(emp => {
      const empAlloc = allocations.filter(a => a.userId === emp.id || a.userName === emp.name);
      const totalPercent = empAlloc.reduce((s, a) => s + a.allocationPercent, 0);
      const totalHours = empAlloc.reduce((s, a) => s + a.hoursPerWeek, 0);

      let capacityStatus: 'Over-allocated' | 'Ideal' | 'Available' = 'Ideal';
      if (totalPercent > 100) capacityStatus = 'Over-allocated';
      else if (totalPercent < 70) capacityStatus = 'Available';

      return {
        ...emp,
        allocations: empAlloc,
        totalPercent,
        totalHours,
        capacityStatus
      };
    }).filter(e => {
      const matchDiv = selectedDivFilter === 'All' || e.div === selectedDivFilter;
      const matchSearch = !searchQuery || e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.role.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDiv && matchSearch;
    });
  }, [employees, allocations, selectedDivFilter, searchQuery]);

  const handleAddAllocation = () => {
    if (!formData.userId) return;
    const emp = employees.find(e => e.id === formData.userId);
    if (!emp) return;

    const hours = Math.round((formData.allocationPercent / 100) * 40);
    const newAlloc: Allocation = {
      id: 'al_' + Date.now(),
      userId: emp.id,
      userName: emp.name,
      department: emp.div,
      clientName: formData.clientName,
      projectName: formData.projectName,
      allocationPercent: formData.allocationPercent,
      hoursPerWeek: hours,
      roleInProject: formData.roleInProject
    };

    setAllocations([...allocations, newAlloc]);
    setIsModalOpen(false);
    setFormData({ userId: '', clientName: 'Kopi Nusantara', projectName: 'Social Media Branding 2026', allocationPercent: 30, roleInProject: 'Team Member' });
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Performance Team &amp; Client Allocation Matrix
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Matriks Distibusi Alokasi Karyawan per Klien, Utilisasi Jam Kerja &amp; Kapasitas Tim
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary text-xs font-bold px-4 py-2 flex items-center gap-2 shrink-0 shadow-md"
        >
          <Plus size={14} /> Alokasi Klien Baru
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 border-l-4 border-blue-500">
          <span className="text-[10px] text-gray-400 font-bold uppercase block">Total Karyawan Ter-alokasi</span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">{employeeMatrix.length} Karyawan</span>
          <span className="text-[10px] text-gray-500 block mt-1">100% Active in Projects</span>
        </div>

        <div className="card p-4 border-l-4 border-emerald-500">
          <span className="text-[10px] text-gray-400 font-bold uppercase block">Kapasitas Kerja Ideal</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {employeeMatrix.filter(e => e.capacityStatus === 'Ideal').length} Anggota
          </span>
          <span className="text-[10px] text-gray-500 block mt-1">Alokasi 70% - 100%</span>
        </div>

        <div className="card p-4 border-l-4 border-amber-500">
          <span className="text-[10px] text-gray-400 font-bold uppercase block">Kapasitas Tersedia</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">
            {employeeMatrix.filter(e => e.capacityStatus === 'Available').length} Anggota
          </span>
          <span className="text-[10px] text-gray-500 block mt-1">Siap untuk Proyek Baru</span>
        </div>

        <div className="card p-4 border-l-4 border-rose-500">
          <span className="text-[10px] text-gray-400 font-bold uppercase block">Over-allocated Warning</span>
          <span className="text-2xl font-black text-rose-700 mt-1 block">
            {employeeMatrix.filter(e => e.capacityStatus === 'Over-allocated').length} Anggota
          </span>
          <span className="text-[10px] text-gray-500 block mt-1">Alokasi &gt; 100% (Overload)</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={14} className="text-gray-400" />
          <span className="text-xs font-bold text-gray-700">Divisi:</span>
          {['All', 'Design', 'Social Media', 'Production', 'Performance', 'Operations'].map(div => (
            <button
              key={div}
              onClick={() => setSelectedDivFilter(div)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                selectedDivFilter === div ? 'bg-slate-900 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {div}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari tim atau posisi..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Allocation Matrix Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">Nama Tim &amp; Peran</th>
              <th className="py-3.5 px-4">Divisi</th>
              <th className="py-3.5 px-4">Breakdown Alokasi Klien &amp; Proyek</th>
              <th className="py-3.5 px-4 text-center">Total Alokasi</th>
              <th className="py-3.5 px-4 text-center">Total Jam/Minggu</th>
              <th className="py-3.5 px-4 text-center">Status Kapasitas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {employeeMatrix.map(emp => (
              <tr key={emp.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-gray-900">
                  <span className="font-bold block text-sm">{emp.name}</span>
                  <span className="text-[11px] text-gray-500">{emp.role} • <span className="text-purple-600 font-bold">{emp.type}</span></span>
                </td>

                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    {emp.div}
                  </span>
                </td>

                <td className="py-3.5 px-4 space-y-1.5">
                  {emp.allocations.length > 0 ? (
                    emp.allocations.map(al => (
                      <div key={al.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100 text-[11px]">
                        <div>
                          <span className="font-bold text-gray-800">{al.clientName}</span>
                          <span className="text-gray-500 block text-[10px]">{al.projectName} ({al.roleInProject})</span>
                        </div>
                        <div className="text-right pl-2">
                          <span className="font-black text-blue-700 block">{al.allocationPercent}%</span>
                          <span className="text-[10px] text-gray-400">{al.hoursPerWeek}h/mgg</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">Belum ada alokasi proyek</span>
                  )}
                </td>

                <td className="py-3.5 px-4 text-center">
                  <div className="w-24 mx-auto space-y-1">
                    <span className="font-black text-sm text-gray-900">{emp.totalPercent}%</span>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          emp.totalPercent > 100 ? 'bg-rose-500' : emp.totalPercent >= 70 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(emp.totalPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-center font-bold text-gray-800 text-sm">
                  {emp.totalHours} Jam
                </td>

                <td className="py-3.5 px-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    emp.capacityStatus === 'Over-allocated' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                    emp.capacityStatus === 'Ideal' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {emp.capacityStatus === 'Over-allocated' ? '🔴 Overload' : emp.capacityStatus === 'Ideal' ? '🟢 Ideal' : '🟡 Tersedia'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Item 5.1: Modal Tambah Alokasi Proyek Klien */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Briefcase size={16} className="text-blue-600" /> Alokasikan Karyawan ke Klien
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Pilih Karyawan</label>
                <select
                  value={formData.userId}
                  onChange={e => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full border rounded-xl p-2.5 bg-white font-semibold text-gray-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Pilih Anggota Tim --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.div} - {e.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Klien</label>
                <select
                  value={formData.clientName}
                  onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full border rounded-xl p-2.5 bg-white font-semibold text-gray-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Kopi Nusantara">Kopi Nusantara</option>
                  <option value="Sambal Bu Nik">Sambal Bu Nik</option>
                  <option value="Skincare Glowing">Skincare Glowing</option>
                  <option value="Internal PT Bertumbuh">Internal PT Bertumbuh</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Proyek</label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full border rounded-xl p-2.5 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Persentase Alokasi (%)</label>
                  <input
                    type="number"
                    value={formData.allocationPercent}
                    onChange={e => setFormData({ ...formData, allocationPercent: Number(e.target.value) })}
                    className="w-full border rounded-xl p-2.5 focus:border-blue-500 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Peran dalam Proyek</label>
                  <input
                    type="text"
                    value={formData.roleInProject}
                    onChange={e => setFormData({ ...formData, roleInProject: e.target.value })}
                    className="w-full border rounded-xl p-2.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-xl font-semibold">Batal</button>
              <button onClick={handleAddAllocation} className="btn-primary px-4 py-2 font-bold shadow-md">Simpan Alokasi</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
