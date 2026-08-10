'use client';
import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Settings as SettingsIcon, Bell, Lock, User, CheckCircle } from 'lucide-react';

export function SettingsView({ role }: { role: string }) {
  const [activeTab, setActiveTab] = useState('profil');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header title="Pengaturan Sistem" subtitle={`Preferensi Akun (${role})`} />
      
      <div className="p-6 flex-1 max-w-7xl mx-auto w-full relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-2">
            <button 
              onClick={() => setActiveTab('profil')}
              className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl transition-colors text-sm ${activeTab === 'profil' ? 'bg-white text-blue-600 shadow-sm border border-blue-100' : 'hover:bg-white text-gray-600 border border-transparent'}`}
            >
              <User size={18} /> Profil Pengguna
            </button>
            <button 
              onClick={() => setActiveTab('notifikasi')}
              className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors text-sm ${activeTab === 'notifikasi' ? 'bg-white text-blue-600 shadow-sm border border-blue-100' : 'hover:bg-white text-gray-600 border border-transparent'}`}
            >
              <Bell size={18} /> Notifikasi
            </button>
            <button 
              onClick={() => setActiveTab('keamanan')}
              className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors text-sm ${activeTab === 'keamanan' ? 'bg-white text-blue-600 shadow-sm border border-blue-100' : 'hover:bg-white text-gray-600 border border-transparent'}`}
            >
              <Lock size={18} /> Keamanan & Password
            </button>
            <button 
              onClick={() => setActiveTab('sistem')}
              className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors text-sm ${activeTab === 'sistem' ? 'bg-white text-blue-600 shadow-sm border border-blue-100' : 'hover:bg-white text-gray-600 border border-transparent'}`}
            >
              <SettingsIcon size={18} /> Preferensi Sistem
            </button>
          </div>
          
          <div className="md:col-span-3 card p-8 fade-in relative">
            {activeTab === 'profil' && (
              <>
                <h2 className="text-xl font-bold mb-6 text-gray-800">Informasi Profil</h2>
                <div className="space-y-6 max-w-lg">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Foto Profil</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                        <User size={24} />
                      </div>
                      <button onClick={() => showToast('Fitur unggah foto belum tersedia.')} className="btn-secondary px-4 py-2 text-sm">Ubah Foto</button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" defaultValue={`Pengguna ${role}`} />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat Email</label>
                    <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" defaultValue={`${role.toLowerCase().replace(' ', '')}@bertumbuh.id`} disabled />
                    <p className="text-xs text-gray-500 mt-1">Email perusahaan tidak dapat diubah secara mandiri.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role Akses</label>
                    <input type="text" className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 font-semibold" value={role} disabled />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <button onClick={() => showToast('Profil berhasil diperbarui!')} className="btn-primary px-6 py-2">Simpan Perubahan</button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'notifikasi' && (
              <>
                <h2 className="text-xl font-bold mb-6 text-gray-800">Pengaturan Notifikasi</h2>
                <div className="space-y-4 max-w-lg">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold text-sm">Notifikasi Email</h4>
                      <p className="text-xs text-gray-500">Terima update harian via email</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold text-sm">Notifikasi Push</h4>
                      <p className="text-xs text-gray-500">Pemberitahuan langsung di browser</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                  <div className="pt-4 border-t mt-6">
                    <button onClick={() => showToast('Preferensi notifikasi disimpan!')} className="btn-primary px-6 py-2">Simpan Pengaturan</button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'keamanan' && (
              <>
                <h2 className="text-xl font-bold mb-6 text-gray-800">Keamanan & Password</h2>
                <div className="space-y-6 max-w-lg">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password Saat Ini</label>
                    <input type="password" placeholder="••••••••" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password Baru</label>
                    <input type="password" placeholder="••••••••" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Konfirmasi Password Baru</label>
                    <input type="password" placeholder="••••••••" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="pt-4 border-t">
                    <button onClick={() => showToast('Password berhasil diperbarui!')} className="btn-primary px-6 py-2">Update Password</button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'sistem' && (
              <>
                <h2 className="text-xl font-bold mb-6 text-gray-800">Preferensi Sistem</h2>
                <div className="space-y-6 max-w-lg">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tema Aplikasi</label>
                    <select className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                      <option>Terang (Light)</option>
                      <option>Gelap (Dark)</option>
                      <option>Ikuti Sistem (System Default)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bahasa</label>
                    <select className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                      <option>Bahasa Indonesia</option>
                      <option>English</option>
                    </select>
                  </div>
                  <div className="pt-4 border-t">
                    <button onClick={() => showToast('Preferensi sistem disimpan!')} className="btn-primary px-6 py-2">Simpan Preferensi</button>
                  </div>
                </div>
              </>
            )}

            {toast && (
              <div className="absolute bottom-8 right-8 bg-gray-800 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-up z-50">
                <CheckCircle size={20} className="text-emerald-400" />
                <span className="font-medium text-sm">{toast}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
