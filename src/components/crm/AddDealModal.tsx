'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DealStage } from '@/lib/types';
import { useCrmStore } from '@/lib/store/crmStore';
import { STAGE_LABELS } from '@/lib/utils';

const STAGES: DealStage[] = ['lead', 'kualifikasi', 'penawaran', 'pitching', 'negosiasi', 'won', 'lost'];

export function AddDealModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const addDeal = useCrmStore(s => s.addDeal);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    title: '', clientName: '', value: 0, probability: 50, source: 'Website', stage: 'lead' as DealStage
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDeal({
      organizationId: 'org-1',
      title: formData.title,
      clientName: formData.clientName,
      value: Number(formData.value),
      probability: Number(formData.probability),
      aeId: 'ae-1',
      aeName: 'Anda (AE)',
      source: formData.source,
      stage: formData.stage,
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white p-6 rounded-2xl w-[400px] shadow-2xl max-w-full border border-gray-100 text-gray-800">
        <h2 className="text-lg font-bold mb-4 text-gray-900">Input Prospek / Deal Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Nama Prospek / Proyek</label>
            <input required type="text" className="w-full border rounded-lg p-2 text-sm focus:outline-red-500 bg-gray-50 font-medium" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Nama Klien / Brand</label>
            <input required type="text" className="w-full border rounded-lg p-2 text-sm focus:outline-red-500 bg-gray-50 font-medium" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Nilai Potensi (Rp)</label>
            <input required type="number" className="w-full border rounded-lg p-2 text-sm focus:outline-red-500 bg-gray-50 font-medium" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Probabilitas (%)</label>
              <input required type="number" min="0" max="100" className="w-full border rounded-lg p-2 text-sm focus:outline-red-500 bg-gray-50 font-medium" value={formData.probability} onChange={e => setFormData({...formData, probability: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Tahap (Stage)</label>
              <select className="w-full border rounded-lg p-2 text-sm focus:outline-red-500 bg-gray-50 font-semibold" value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value as DealStage})}>
                {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Sumber (Source)</label>
            <select className="w-full border rounded-lg p-2 text-sm focus:outline-red-500 bg-gray-50 font-semibold" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}>
              <option value="Instagram">Instagram</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Event">Event</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 font-semibold hover:bg-gray-100 rounded-lg">Batal</button>
            <button type="submit" className="px-4 py-2 text-sm bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-md">Simpan Prospek</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
