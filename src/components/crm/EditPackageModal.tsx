'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCrmStore } from '@/lib/store/crmStore';
import { ServicePackage } from '@/lib/types';

interface EditPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: ServicePackage | null;
}

export function EditPackageModal({ isOpen, onClose, pkg }: EditPackageModalProps) {
  const updatePackage = useCrmStore(s => s.updatePackage);
  const [mounted, setMounted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: 0,
    deliverables: '',
    color: 'var(--blue)'
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (pkg) {
      setFormData({
        name: pkg.name,
        description: pkg.description,
        basePrice: pkg.basePrice,
        deliverables: pkg.deliverables.join('\n'),
        color: pkg.color
      });
    }
  }, [pkg]);

  if (!isOpen || !pkg || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePackage(pkg.id, {
      name: formData.name,
      description: formData.description,
      basePrice: Number(formData.basePrice),
      deliverables: formData.deliverables.split('\n').filter(Boolean),
      color: formData.color
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white p-6 rounded-2xl w-[450px] shadow-2xl max-w-full border border-gray-100 text-gray-800">
        <h2 className="text-lg font-bold mb-4 text-gray-900">Edit Paket Strategi</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Nama Paket</label>
            <input 
              required 
              type="text" 
              className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:border-red-500 bg-gray-50 font-medium" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Deskripsi Pendek</label>
            <input 
              required 
              type="text" 
              className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:border-red-500 bg-gray-50 font-medium" 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Harga Dasar (Rp)</label>
            <input 
              required 
              type="number" 
              className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:border-red-500 bg-gray-50 font-medium" 
              value={formData.basePrice} 
              onChange={e => setFormData({...formData, basePrice: Number(e.target.value)})} 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Fitur/Layanan (1 per baris)</label>
            <textarea 
              required 
              rows={4} 
              className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:border-red-500 bg-gray-50 font-medium" 
              value={formData.deliverables} 
              onChange={e => setFormData({...formData, deliverables: e.target.value})} 
              placeholder="Contoh:&#10;Social Media Setup&#10;Logo Design"
            ></textarea>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Tema Warna Kategori</label>
            <select 
              className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:border-red-500 bg-gray-50 font-semibold" 
              value={formData.color} 
              onChange={e => setFormData({...formData, color: e.target.value})}
            >
              <option value="var(--red)">Merah (Brand / Campaign)</option>
              <option value="var(--blue)">Biru (Social Media / Retainer)</option>
              <option value="var(--green)">Hijau (Rebranding)</option>
              <option value="var(--orange)">Oranye (Performance / Ads)</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-sm text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all shadow-md"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
