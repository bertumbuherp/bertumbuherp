'use client';
import React, { useState } from 'react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Plus } from 'lucide-react';

export function VendorTable() {
  const [vendorData, setVendorData] = useState([
    { id: 'v1', vendor: 'PIPPIT AI', service: 'Software Subscription', amount: 183000, date: '2026-01-10' },
    { id: 'v2', vendor: 'Biznet', service: 'Wifi Biznet 4 Bulan', amount: 721500, date: '2026-01-26' },
    { id: 'v3', vendor: 'Adobe', service: 'Akun Adobe 2 Renew', amount: 1598000, date: '2026-05-08' },
  ]);

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [service, setService] = useState('');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState('2026-06-01');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName || !service || amount <= 0) {
      alert('Mohon isi nama vendor, jenis layanan, dan nominal biaya.');
      return;
    }

    const newVendor = {
      id: `v-${Date.now()}`,
      vendor: vendorName,
      service,
      amount: Number(amount),
      date
    };

    setVendorData([newVendor, ...vendorData]);
    setVendorName('');
    setService('');
    setAmount(0);
    setIsOpenModal(false);
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">Pengeluaran Fee Vendor Luar</h2>
          <p className="text-xs text-gray-500">Pencatatan tagihan dan pengeluaran vendor jasa / lisensi agensi</p>
        </div>
        <button 
          onClick={() => setIsOpenModal(true)} 
          className="btn-primary text-xs flex items-center gap-2 font-bold px-3 py-2 cursor-pointer"
        >
          <Plus size={14}/> Input Vendor
        </button>
      </div>

      <div className="card p-0 overflow-hidden border border-gray-200">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-5 py-3 font-semibold text-gray-600">Tanggal</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Vendor</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Layanan</th>
              <th className="px-5 py-3 font-semibold text-gray-600 text-right">Nominal</th>
            </tr>
          </thead>
          <tbody>
            {vendorData.map(v => (
              <tr key={v.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3 text-gray-600">{formatDate(v.date)}</td>
                <td className="px-5 py-3 font-semibold text-gray-900">{v.vendor}</td>
                <td className="px-5 py-3 text-gray-600">{v.service}</td>
                <td className="px-5 py-3 font-bold text-right text-red-600">{formatCurrency(v.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Input Vendor */}
      {isOpenModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 fade-in">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-gray-800">Form Input Vendor &amp; Beban Luar</h3>
              <button onClick={() => setIsOpenModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Vendor / Penyedia Jasa</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Biznet / Midtrans / Freelance KOL" 
                  value={vendorName} 
                  onChange={e => setVendorName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-red-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Jenis Layanan / Keterangan</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Langganan Server Cloud" 
                  value={service} 
                  onChange={e => setService(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-red-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nominal Biaya (Rp)</label>
                <input 
                  type="number" 
                  placeholder="500000" 
                  value={amount || ''} 
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-red-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Transaksi</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-red-500" 
                  required 
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setIsOpenModal(false)} 
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn-primary px-5 py-2 text-xs font-bold rounded-xl shadow-md"
                >
                  Simpan Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
