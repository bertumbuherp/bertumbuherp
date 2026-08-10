'use client';
import React, { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store/financeStore';
import { formatCurrency } from '@/lib/utils';

export function LabaRugiTable() {
  const { journal } = useFinanceStore();

  const monthlyData = useMemo(() => {
    const data: Record<string, { revenue: number; cost: number; profit: number }> = {};

    journal.forEach(entry => {
      const monthStr = entry.date.substring(0, 7); // e.g., "2024-05"
      if (!data[monthStr]) {
        data[monthStr] = { revenue: 0, cost: 0, profit: 0 };
      }

      // Very simple logic:
      // Pendapatan = Credit to 'Pendapatan'
      if (entry.account === 'Pendapatan' && entry.type === 'credit') {
        data[monthStr].revenue += entry.amount;
      }
      // Beban = Debit to 'Biaya Operasional' or 'Biaya Gaji'
      if ((entry.account === 'Biaya Operasional' || entry.account === 'Biaya Gaji') && entry.type === 'debit') {
        data[monthStr].cost += entry.amount;
      }
    });

    // Calculate profit and format for display
    return Object.keys(data).sort().reverse().map(monthStr => {
      const { revenue, cost } = data[monthStr];
      return {
        month: monthStr, // Could format to 'Mei 2024'
        revenue,
        cost,
        profit: revenue - cost
      };
    });
  }, [journal]);

  return (
    <div className="space-y-6 fade-in">
      <h2 className="text-lg font-bold">Laporan Laba Rugi (P&L)</h2>
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-[#1a365d] text-white border-b">
            <tr>
              <th className="px-5 py-3 font-semibold">Bulan (YYYY-MM)</th>
              <th className="px-5 py-3 font-semibold">Pendapatan</th>
              <th className="px-5 py-3 font-semibold">Beban Operasional</th>
              <th className="px-5 py-3 font-semibold text-right">Laba Bersih</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((d, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800">{d.month}</td>
                <td className="px-5 py-3 text-emerald-600 font-medium">{formatCurrency(d.revenue)}</td>
                <td className="px-5 py-3 text-red-500 font-medium">{formatCurrency(d.cost)}</td>
                <td className="px-5 py-3 font-bold text-right text-blue-800">{formatCurrency(d.profit)}</td>
              </tr>
            ))}
            {monthlyData.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">Belum ada data transaksi tercatat.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
