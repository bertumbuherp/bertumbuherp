import React, { useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import { LineChart } from 'lucide-react';
import { useFinanceStore } from '@/lib/store/financeStore';

export function FinanceOverview() {
  const { journal, invoices } = useFinanceStore();

  const { revenueMtd, totalExpenses, arOutstanding, margin } = useMemo(() => {
    const currentMonthPrefix = new Date().toISOString().substring(0, 7); // YYYY-MM
    let rev = 0;
    let exp = 0;

    journal.forEach(j => {
      if (j.date.startsWith(currentMonthPrefix)) {
        if (j.account === 'Pendapatan' && j.type === 'credit') rev += j.amount;
        if ((j.account === 'Biaya Operasional' || j.account === 'Biaya Gaji') && j.type === 'debit') exp += j.amount;
      }
    });

    const ar = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((sum, i) => sum + i.total, 0);
    const mrg = rev > 0 ? Math.round(((rev - exp) / rev) * 100) : 0;

    return { revenueMtd: rev, totalExpenses: exp, arOutstanding: ar, margin: mrg };
  }, [journal, invoices]);

  return (
    <div className="space-y-6 fade-in">
      <h2 className="text-lg font-bold">Summary Keuangan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 border-l-4 border-green-500">
          <p className="text-sm font-semibold text-gray-500">Pendapatan MTD</p>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(revenueMtd)}</p>
        </div>
        <div className="card p-5 border-l-4 border-yellow-500">
          <p className="text-sm font-semibold text-gray-500">Piutang Beredar</p>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(arOutstanding)}</p>
        </div>
        <div className="card p-5 border-l-4 border-red-500">
          <p className="text-sm font-semibold text-gray-500">Total Pengeluaran MTD</p>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="card p-5 border-l-4 border-blue-500">
          <p className="text-sm font-semibold text-gray-500">Profit Margin MTD</p>
          <p className="text-2xl font-bold text-gray-800">{margin}%</p>
        </div>
      </div>
      {/* Quick Chart Placeholder */}
      <div className="card p-6 border-dashed border-2">
        <div className="h-64 flex items-center justify-center text-gray-400">
          <LineChart size={48} className="opacity-20" />
          <span className="ml-4 font-medium">Grafik Arus Kas (Visualisasi)</span>
        </div>
      </div>
    </div>
  );
}
