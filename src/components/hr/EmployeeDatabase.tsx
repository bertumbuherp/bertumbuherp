'use client';
import React, { useState } from 'react';
import { useHRStore, Employee } from '@/lib/store/hrStore';
import { formatCurrency } from '@/lib/utils';
import { Search, Plus, UserX, UserCheck, Edit, X } from 'lucide-react';

export function EmployeeDatabase() {
  const { employees, updateEmployeeStatus, addEmployee, updateEmployee } = useHRStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [div, setDiv] = useState('');
  const [type, setType] = useState<'Full-Time' | 'Freelance' | 'Intern'>('Full-Time');
  const [baseSalary, setBaseSalary] = useState('');

  const filteredEmployees = employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.div.toLowerCase().includes(searchTerm.toLowerCase()));

  const openAddModal = () => {
    setEditingEmployee(null);
    setName('');
    setRole('');
    setDiv('');
    setType('Full-Time');
    setBaseSalary('');
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setRole(emp.role);
    setDiv(emp.div);
    setType(emp.type);
    setBaseSalary(emp.baseSalary.toString());
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, {
        name, role, div, type, baseSalary: Number(baseSalary)
      });
    } else {
      addEmployee({
        id: `e${Date.now()}`,
        name, role, div, type, baseSalary: Number(baseSalary), status: 'active'
      });
    }
    closeModal();
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-bold">Database Master Karyawan</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari nama atau divisi..." 
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-red-500" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={openAddModal} className="btn-primary py-2 px-4 text-sm flex items-center gap-2 shrink-0">
            <Plus size={16} /> Tambah Data
          </button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-5 py-3 font-semibold text-gray-600">ID</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Nama Karyawan</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Divisi & Peran</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Tipe</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Gaji Pokok (Base)</th>
              <th className="px-5 py-3 font-semibold text-gray-600 text-center">Status/Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(emp => (
              <tr key={emp.id} className={`border-b last:border-0 hover:bg-gray-50 ${emp.status === 'inactive' ? 'opacity-50' : ''}`}>
                <td className="px-5 py-3 font-mono text-xs text-gray-500">{emp.id.toUpperCase()}</td>
                <td className="px-5 py-3 font-bold text-gray-800">{emp.name}</td>
                <td className="px-5 py-3">
                  <span className="block font-medium">{emp.role}</span>
                  <span className="text-xs text-gray-500">{emp.div}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${
                    emp.type === 'Full-Time' ? 'bg-blue-100 text-blue-700' :
                    emp.type === 'Freelance' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {emp.type}
                  </span>
                </td>
                <td className="px-5 py-3 font-mono font-medium">{formatCurrency(emp.baseSalary)}</td>
                <td className="px-5 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => openEditModal(emp)} className="text-gray-400 hover:text-blue-500 transition-colors" title="Edit Profil">
                      <Edit size={16} />
                    </button>
                    {emp.status === 'active' ? (
                      <button onClick={() => updateEmployeeStatus(emp.id, 'inactive')} className="text-gray-400 hover:text-red-500 transition-colors" title="Nonaktifkan Karyawan">
                        <UserX size={16} />
                      </button>
                    ) : (
                      <button onClick={() => updateEmployeeStatus(emp.id, 'active')} className="text-gray-400 hover:text-emerald-500 transition-colors" title="Aktifkan Kembali">
                        <UserCheck size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredEmployees.length === 0 && (
              <tr><td colSpan={6} className="text-center py-6 text-gray-500">Tidak ada data karyawan ditemukan.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">{editingEmployee ? 'Edit Data Karyawan' : 'Tambah Data Karyawan'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                <input required type="text" className="w-full p-2 border rounded-lg text-sm" value={name} onChange={e => setName(e.target.value)} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Peran (Role)</label>
                  <input required type="text" className="w-full p-2 border rounded-lg text-sm" value={role} onChange={e => setRole(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Divisi</label>
                  <input required type="text" className="w-full p-2 border rounded-lg text-sm" value={div} onChange={e => setDiv(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipe</label>
                  <select className="w-full p-2 border rounded-lg text-sm" value={type} onChange={e => setType(e.target.value as any)}>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gaji Pokok</label>
                  <input required type="number" className="w-full p-2 border rounded-lg text-sm" value={baseSalary} onChange={e => setBaseSalary(e.target.value)} />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t mt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                  {editingEmployee ? 'Simpan Perubahan' : 'Tambah Karyawan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
