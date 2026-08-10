import React from 'react';
import { useFinanceStore } from '@/lib/store/financeStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Send, CheckCircle } from 'lucide-react';

export function PenagihanTable() {
  const { invoices, updateInvoiceStatus } = useFinanceStore();
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue' || inv.status === 'sent');
  
  return (
    <div className="space-y-6 fade-in">
      <h2 className="text-lg font-bold">Penagihan Piutang Client</h2>
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-5 py-3 font-semibold text-gray-600">No. Invoice</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Client / Project</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Jatuh Tempo</th>
              <th className="px-5 py-3 font-semibold text-gray-600 text-right">Nominal</th>
              <th className="px-5 py-3 font-semibold text-gray-600 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {overdueInvoices.map((inv) => (
              <tr key={inv.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-red-600">{inv.invoiceNumber}</td>
                <td className="px-5 py-3">
                  <p className="font-semibold">{inv.clientName}</p>
                  <p className="text-xs text-gray-500">{inv.projectName}</p>
                </td>
                <td className="px-5 py-3 text-red-500">{formatDate(inv.dueDate)}</td>
                <td className="px-5 py-3 font-bold text-right">{formatCurrency(inv.total)}</td>
                <td className="px-5 py-3 text-center flex items-center justify-center gap-2">
                  <button className="btn-ghost border text-xs px-2 py-1 flex items-center gap-1 text-blue-600 hover:bg-blue-50">
                    <Send size={12}/> Remind WA
                  </button>
                  <button onClick={() => updateInvoiceStatus(inv.id, 'paid')} className="btn-ghost border text-xs px-2 py-1 flex items-center gap-1 text-emerald-600 hover:bg-emerald-50">
                    <CheckCircle size={12}/> Lunas
                  </button>
                </td>
              </tr>
            ))}
            {overdueInvoices.length === 0 && (
              <tr><td colSpan={5} className="text-center py-5 text-gray-500">Tidak ada tagihan tertunda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
