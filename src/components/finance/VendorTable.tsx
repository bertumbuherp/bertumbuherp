'use client';
import React, { useState } from 'react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Plus } from 'lucide-react';

export function VendorTable() {
  const [vendorData] = useState([
    { id: 'v1', vendor: 'PIPPIT AI', service: 'Software Subscription', amount: 183000, date: '2024-01-10' },
    { id: 'v2', vendor: 'Biznet', service: 'Wifi Biznet 4 Bulan', amount: 721500, date: '2024-01-26' },
    { id: 'v3', vendor: 'Adobe', service: 'Akun Adobe 2 Renew', amount: 1598000, date: '2024-05-08' },
  ]);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Pengeluaran Fee Vendor Luar</h2>
        <button className="btn-primary text-xs flex items-center gap-2"><Plus size={14}/> Input Vendor</button>
      </div>
      <div className="card p-0 overflow-hidden">
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
                <td className="px-5 py-3">{formatDate(v.date)}</td>
                <td className="px-5 py-3 font-medium">{v.vendor}</td>
                <td className="px-5 py-3 text-gray-500">{v.service}</td>
                <td className="px-5 py-3 font-bold text-right text-red-500">{formatCurrency(v.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
