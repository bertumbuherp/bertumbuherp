'use client';
import React, { useState } from 'react';
import { useCrmStore } from '@/lib/store/crmStore';
import { formatCurrency } from '@/lib/utils';
import { Plus, CheckCircle2, Trash2, Copy, Check, X } from 'lucide-react';
import { AddPackageModal } from './AddPackageModal';
import { EditPackageModal } from './EditPackageModal';
import { ServicePackage } from '@/lib/types';

export function StrategiPackageView() {
  const packages = useCrmStore(s => s.packages);
  const deletePackage = useCrmStore(s => s.deletePackage);
  const addPackage = useCrmStore(s => s.addPackage);
  const updatePackageStatus = useCrmStore(s => s.updatePackageStatus);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<ServicePackage | null>(null);

  const handleDelete = (pkgId: string, pkgName: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus paket "${pkgName}"?`)) {
      deletePackage(pkgId);
    }
  };

  const handleDuplicate = (pkg: ServicePackage) => {
    addPackage({
      name: `${pkg.name} (Copy)`,
      description: pkg.description,
      basePrice: pkg.basePrice,
      deliverables: [...pkg.deliverables],
      color: pkg.color,
      requestedBy: 'AE (Duplicate)'
    });
  };

  const handleEditClick = (pkg: ServicePackage) => {
    setSelectedPkg(pkg);
    setIsEditOpen(true);
  };

  return (
    <div className="p-6">
      <AddPackageModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <EditPackageModal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelectedPkg(null); }} pkg={selectedPkg} />
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Bikin Strategi Package</h2>
          <p className="text-sm text-gray-500 mt-1">Daftar paket penawaran layanan. Penambahan paket butuh approval.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm">
          <Plus size={16} /> Buat Paket Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {packages.map((pkg) => (
          <div key={pkg.id} className="card p-5 relative overflow-hidden group hover:border-gray-300 transition-colors flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: pkg.color }}></div>
            
            <div>
              <div className="flex justify-between items-start mb-2 mt-1 gap-2">
                <h3 className="text-base font-bold text-gray-800 line-clamp-2">{pkg.name}</h3>
                {pkg.status === 'pending' && <span className="shrink-0 px-2 py-0.5 text-[9px] font-bold rounded-full bg-yellow-100 text-yellow-700 uppercase">Pending</span>}
                {pkg.status === 'approved' && <span className="shrink-0 px-2 py-0.5 text-[9px] font-bold rounded-full bg-green-100 text-green-700 uppercase">Approved</span>}
                {pkg.status === 'rejected' && <span className="shrink-0 px-2 py-0.5 text-[9px] font-bold rounded-full bg-red-100 text-red-700 uppercase">Rejected</span>}
              </div>

              <p className="text-2xl font-black mb-1.5" style={{ color: pkg.color }}>{formatCurrency(pkg.basePrice)}</p>
              <p className="text-xs text-gray-400 mb-4 italic">Diminta oleh: {pkg.requestedBy || 'Unknown'}</p>
              
              <div className="space-y-2 mb-6">
                {pkg.deliverables.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-gray-600 leading-tight">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t mt-auto">
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEditClick(pkg)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-colors text-center"
                  style={{ borderColor: pkg.color + '40', color: pkg.color, background: pkg.color + '10' }}
                >
                  Edit Paket
                </button>
                <button 
                  onClick={() => handleDuplicate(pkg)}
                  className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors flex items-center justify-center"
                  title="Duplikat Paket"
                >
                  <Copy size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(pkg.id, pkg.name)}
                  className="px-3 py-2 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors flex items-center justify-center"
                  title="Hapus Paket"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Demo Action (Mock approval workflow directly from view) */}
              {pkg.status === 'pending' && (
                <div className="bg-gray-50 rounded-lg p-2 flex items-center justify-between border border-gray-100 mt-2">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Mock Approval:</span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => updatePackageStatus(pkg.id, 'approved')}
                      className="p-1 rounded bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold flex items-center gap-0.5"
                      title="Approve Paket"
                    >
                      <Check size={10} /> OK
                    </button>
                    <button 
                      onClick={() => updatePackageStatus(pkg.id, 'rejected')}
                      className="p-1 rounded bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold flex items-center gap-0.5"
                      title="Reject Paket"
                    >
                      <X size={10} /> No
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
