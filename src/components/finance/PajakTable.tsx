'use client';
import React, { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

export function PajakTable() {
  const [pajakData] = useState([
    { id: 'tx1', type: 'Pajak Bulanan', period: 'Januari 2024', amount: 207653, status: 'paid' },
    { id: 'tx2', type: 'Pajak Bulanan', period: 'Februari 2024', amount: 261099, status: 'paid' },
    { id: 'tx3', type: 'Pajak Bulanan', period: 'Maret 2024', amount: 202580, status: 'pending' },
  ]);

  return (
    <div className="space-y-6 fade-in">
      <h2 className="text-lg font-bold">Pajak (PPN, PPh)</h2>
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-5 py-3 font-semibold text-gray-600">Periode</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Jenis Pajak</th>
              <th className="px-5 py-3 font-semibold text-gray-600 text-right">Nominal</th>
              <th className="px-5 py-3 font-semibold text-gray-600 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {pajakData.map(tx => (
              <tr key={tx.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium">{tx.period}</td>
                <td className="px-5 py-3">{tx.type}</td>
                <td className="px-5 py-3 font-bold text-right">{formatCurrency(tx.amount)}</td>
                <td className="px-5 py-3 text-center">
                  <span className={`text-[10px] px-2 py-1 rounded uppercase font-bold ${tx.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {tx.status === 'paid' ? 'Sudah Dibayar' : 'Menunggu'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
