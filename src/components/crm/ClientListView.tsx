'use client';
import React, { useState } from 'react';
import { useCrmStore } from '@/lib/store/crmStore';
import { formatCurrency } from '@/lib/utils';
import { Search, Building2, Mail, Phone, ExternalLink } from 'lucide-react';
import { Client } from '@/lib/types';

export function ClientListView() {
  const { clients, updateClientStatus } = useCrmStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold">Database Klien</h2>
          <p className="text-sm text-gray-500">Kelola master data klien dan kontak perusahaan.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari klien / industri..." 
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-red-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-primary py-2 px-4 whitespace-nowrap" onClick={() => alert('Fitur tambah klien baru dapat diakses via CRM deals.')}>
            Tambah Klien
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredClients.map(client => (
          <div key={client.id} className="card p-0 overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
            <div className="p-5 border-b flex justify-between items-start bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center font-bold text-xl shrink-0">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 leading-tight flex items-center gap-2">
                    {client.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">{client.industry}</p>
                </div>
              </div>
              <select 
                value={client.status} 
                onChange={(e) => updateClientStatus(client.id, e.target.value as Client['status'])}
                className={`text-xs font-bold px-2 py-1 rounded-md border-0 cursor-pointer ${
                  client.status === 'active' ? 'bg-green-100 text-green-700' :
                  client.status === 'prospect' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <option value="active">Active</option>
                <option value="prospect">Prospect</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div className="p-5 flex-1">
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
                  <p className="font-bold text-gray-800">{formatCurrency(client.totalRevenue)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Active Projects</p>
                  <p className="font-bold text-gray-800">{client.activeProjects} Proyek</p>
                </div>
              </div>

              <h4 className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-3">Kontak Utama</h4>
              <div className="space-y-3">
                {client.contacts.slice(0, 2).map(contact => (
                  <div key={contact.id} className="flex items-start gap-2 text-sm bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <div className="shrink-0 mt-0.5"><Building2 size={16} className="text-gray-400"/></div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{contact.name}</p>
                      <p className="text-xs text-gray-500 mb-1">{contact.role}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                        <span className="flex items-center gap-1"><Mail size={12}/> {contact.email}</span>
                        {contact.phone && <span className="flex items-center gap-1"><Phone size={12}/> {contact.phone}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedClient(client)}
                className="text-sm font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
              >
                Lihat Detail <ExternalLink size={14}/>
              </button>
            </div>
          </div>
        ))}

        {filteredClients.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed">
            Klien tidak ditemukan.
          </div>
        )}
      </div>

      {/* Modal Detail Klien */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 fade-in">
            <div className="flex justify-between items-start border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center font-bold text-xl">
                  {selectedClient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900">{selectedClient.name}</h3>
                  <p className="text-xs text-gray-500">{selectedClient.industry} · Bergabung: {selectedClient.createdAt || '2026'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedClient(null)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Total Kontribusi Revenue</p>
                <p className="text-lg font-black text-emerald-600 mt-1">{formatCurrency(selectedClient.totalRevenue)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Status Kemitraan</p>
                <span className="inline-block mt-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase">
                  {selectedClient.status}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-800 mb-3">Daftar Kontak Perusahaan ({selectedClient.contacts.length})</h4>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {selectedClient.contacts.map(c => (
                  <div key={c.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1 text-xs">
                    <p className="font-bold text-gray-800">{c.name} — <span className="text-gray-500 font-normal">{c.role}</span></p>
                    <p className="text-gray-600">✉ {c.email}</p>
                    {c.phone && <p className="text-gray-600">📞 {c.phone}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button 
                onClick={() => setSelectedClient(null)} 
                className="btn-primary px-5 py-2 text-xs font-bold rounded-xl"
              >
                Tutup Detail Klien
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
