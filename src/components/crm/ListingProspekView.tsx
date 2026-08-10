'use client';
import React, { useState } from 'react';
import { useCrmStore } from '@/lib/store/crmStore';
import { formatCurrency, STAGE_LABELS } from '@/lib/utils';
import { DealStage, Deal } from '@/lib/types';
import { Plus, Search, Eye, Trash2 } from 'lucide-react';
import { AddDealModal } from './AddDealModal';

const STAGE_COLORS: Record<DealStage, string> = {
  lead: '#9CA3AF', kualifikasi: 'var(--blue)', penawaran: 'var(--violet)',
  pitching: 'var(--yellow)', negosiasi: 'var(--orange)', won: 'var(--green)', lost: 'var(--red-err)',
};

export function ListingProspekView() {
  const deals = useCrmStore(s => s.deals);
  const deleteDeal = useCrmStore(s => s.deleteDeal);
  const updateDealStage = useCrmStore(s => s.updateDealStage);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('Semua');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filter deals for the prospects stages: lead & kualifikasi
  const filteredDeals = deals
    .filter(d => ['lead', 'kualifikasi'].includes(d.stage))
    .filter(d => {
      // Search filter
      const matchesSearch = 
        d.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Source filter
      let matchesSource = true;
      if (sourceFilter === 'Online') {
        matchesSource = ['Instagram', 'LinkedIn', 'Website'].includes(d.source);
      } else if (sourceFilter === 'Offline') {
        matchesSource = !['Instagram', 'LinkedIn', 'Website', 'Referral'].includes(d.source);
      } else if (sourceFilter === 'Referral') {
        matchesSource = d.source === 'Referral';
      }
      
      return matchesSearch && matchesSource;
    });

  const handleDelete = (dealId: string, clientName: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus prospek ${clientName}?`)) {
      deleteDeal(dealId);
    }
  };

  return (
    <div className="p-6">
      <AddDealModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Detail Modal */}
      {isDetailOpen && selectedDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl w-[500px] shadow-2xl">
            <div className="flex justify-between items-start mb-4 border-b pb-3">
              <h2 className="text-lg font-bold text-gray-800">Detail Prospek Klien</h2>
              <button 
                onClick={() => { setIsDetailOpen(false); setSelectedDeal(null); }} 
                className="text-gray-400 hover:text-gray-600 font-bold transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Nama Proyek / Deal</p>
                <p className="text-base font-bold text-gray-800">{selectedDeal.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">Klien / Perusahaan</p>
                  <p className="font-semibold text-gray-800">{selectedDeal.clientName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">Nilai Potensi</p>
                  <p className="font-bold text-emerald-600">{formatCurrency(selectedDeal.value)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">Sumber Lead</p>
                  <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium border">
                    {selectedDeal.source}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">Probabilitas Closing</p>
                  <p className="font-semibold text-gray-800">{selectedDeal.probability}%</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">Account Executive</p>
                  <p className="text-gray-700">{selectedDeal.aeName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">Tanggal Masuk</p>
                  <p className="text-gray-700">
                    {selectedDeal.createdAt 
                      ? new Date(selectedDeal.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                      : '-'}
                  </p>
                </div>
              </div>
              {selectedDeal.pitchingDate && (
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase">Jadwal Pitching</p>
                  <p className="text-gray-800 font-medium">
                    {new Date(selectedDeal.pitchingDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                  {selectedDeal.pitchingLocation && (
                    <p className="text-gray-600 text-xs mt-1">Lokasi: {selectedDeal.pitchingLocation}</p>
                  )}
                  {selectedDeal.pitchingNotes && (
                    <p className="text-gray-600 text-xs mt-1">Catatan: {selectedDeal.pitchingNotes}</p>
                  )}
                </div>
              )}
              {selectedDeal.notes && (
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase">Catatan AE</p>
                  <p className="text-gray-600 mt-1 whitespace-pre-wrap">{selectedDeal.notes}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button 
                onClick={() => { setIsDetailOpen(false); setSelectedDeal(null); }} 
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Listing Prospek New Client</h2>
          <p className="text-sm text-gray-500 mt-1">Daftar klien baru yang masuk dan butuh di-follow up</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm self-start md:self-auto"
        >
          <Plus size={16} /> Input Prospek
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <Search size={16} />
          </span>
          <input 
            type="text" 
            placeholder="Cari nama klien / deal..." 
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:border-red-500 bg-gray-50"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div>
          <select 
            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-red-500 bg-gray-50 font-medium"
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
          >
            <option value="Semua">Semua Sumber</option>
            <option value="Online">Jalur Online (IG, LinkedIn, Web)</option>
            <option value="Offline">Jalur Offline (Event, Outreach)</option>
            <option value="Referral">Referral</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-page)' }}>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Nama Klien / Perusahaan</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Prospek Deal</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Sumber</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tanggal Masuk</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status Tahap</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.map(d => (
                <tr key={d.id} className="border-b hover:bg-black/5 transition-colors" style={{ borderColor: 'var(--border)' }}>
                  <td className="py-3 px-4">
                    <p className="text-sm font-bold text-gray-800">{d.clientName}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm font-semibold">{d.title}</p>
                    <p className="text-xs text-blue-600 font-semibold">{formatCurrency(d.value)}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] px-2 py-1 rounded bg-gray-100 text-gray-600 font-medium border">
                      {d.source}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {d.createdAt 
                      ? new Date(d.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <select 
                      value={d.stage}
                      onChange={(e) => updateDealStage(d.id, e.target.value as DealStage)}
                      className="text-xs border rounded p-1.5 font-semibold bg-white focus:outline-none focus:border-red-500"
                    >
                      <option value="lead">LEAD</option>
                      <option value="kualifikasi">KUALIFIKASI</option>
                      <option value="penawaran">PENAWARAN</option>
                      <option value="pitching">PITCHING</option>
                      <option value="negosiasi">NEGOSIASI</option>
                      <option value="won">WON</option>
                      <option value="lost">LOST</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => { setSelectedDeal(d); setIsDetailOpen(true); }}
                        className="p-1.5 text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-md transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(d.id, d.clientName)}
                        className="p-1.5 text-red-600 hover:text-white bg-red-50 hover:bg-red-600 rounded-md transition-colors"
                        title="Hapus Prospek"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDeals.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">Tidak ada prospek yang cocok dengan kriteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
