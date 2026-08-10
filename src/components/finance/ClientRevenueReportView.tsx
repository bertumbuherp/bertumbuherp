'use client';
import React, { useMemo, useState } from 'react';
import { useFinanceStore } from '@/lib/store/financeStore';
import { formatCurrency } from '@/lib/utils';
import { Users, DollarSign, TrendingUp, CheckCircle, Search, ExternalLink } from 'lucide-react';

export function ClientRevenueReportView() {
  const { invoices } = useFinanceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');

  // Compute Revenue dynamically linked from Paid Invoices
  const clientRevenueSummary = useMemo(() => {
    const paidInvoices = invoices.filter(i => i.status === 'paid');

    const clientMap: Record<string, {
      clientId: string;
      clientName: string;
      totalInvoices: number;
      retainerRevenue: number;
      adsRevenue: number;
      addonRevenue: number;
      totalRevenue: number;
      latestInvoiceNo: string;
      latestDate: string;
    }> = {};

    paidInvoices.forEach(inv => {
      const key = inv.clientName || inv.clientId || 'Klien Umum';
      if (!clientMap[key]) {
        clientMap[key] = {
          clientId: inv.clientId,
          clientName: key,
          totalInvoices: 0,
          retainerRevenue: 0,
          adsRevenue: 0,
          addonRevenue: 0,
          totalRevenue: 0,
          latestInvoiceNo: inv.invoiceNumber,
          latestDate: inv.dueDate
        };
      }

      clientMap[key].totalInvoices += 1;

      if (inv.lineItems && inv.lineItems.length > 0) {
        inv.lineItems.forEach(item => {
          if (item.type === 'ads_spend') clientMap[key].adsRevenue += item.total;
          else if (item.type === 'addon_kol') clientMap[key].addonRevenue += item.total;
          else clientMap[key].retainerRevenue += item.total;
        });
      } else {
        clientMap[key].retainerRevenue += inv.total;
      }

      clientMap[key].totalRevenue += inv.total;
    });

    return Object.values(clientMap).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [invoices]);

  const filteredClients = clientRevenueSummary.filter(c => 
    c.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grandTotalRevenue = clientRevenueSummary.reduce((s, c) => s + c.totalRevenue, 0);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Rekap Pendapatan Bulanan per Klien (Link Invoice → Revenue)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Breakdown Realisasi Omset per Klien Dihitung Otomatis dari Pelunasan Invoice
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="card px-4 py-2 bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] text-emerald-800 font-bold uppercase block">Total Omset Klien Lunas</span>
            <span className="text-lg font-black text-emerald-700">{formatCurrency(grandTotalRevenue)}</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama klien..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white"
        />
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
            <tr>
              <th className="py-3 px-4">Nama Klien</th>
              <th className="py-3 px-4 text-center">Inv. Lunas</th>
              <th className="py-3 px-4 text-right">Pendapatan Retainer</th>
              <th className="py-3 px-4 text-right">Pendapatan Ads Spend</th>
              <th className="py-3 px-4 text-right">Pendapatan Add-on KOL</th>
              <th className="py-3 px-4 text-right">Total Revenue (Rp)</th>
              <th className="py-3 px-4 text-center">Share Omset</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filteredClients.map(client => {
              const sharePct = grandTotalRevenue > 0 ? Math.round((client.totalRevenue / grandTotalRevenue) * 100) : 0;
              return (
                <tr key={client.clientName} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-gray-900">{client.clientName}</p>
                    <p className="text-[10px] text-gray-400">Ref Inv: {client.latestInvoiceNo}</p>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-gray-700">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {client.totalInvoices} Paid
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-800">
                    {formatCurrency(client.retainerRevenue)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                    {formatCurrency(client.adsRevenue)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-purple-700">
                    {formatCurrency(client.addonRevenue)}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-gray-900 text-sm">
                    {formatCurrency(client.totalRevenue)}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600">
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${sharePct}%` }} />
                      </div>
                      <span>{sharePct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50 border-t-2 border-gray-200 font-bold text-gray-900">
            <tr>
              <td colSpan={2} className="py-3 px-4 text-xs">TOTAL REKAP REVENUE ({filteredClients.length} KLIEN)</td>
              <td className="py-3 px-4 text-right text-xs">{formatCurrency(filteredClients.reduce((s, c) => s + c.retainerRevenue, 0))}</td>
              <td className="py-3 px-4 text-right text-xs text-emerald-700">{formatCurrency(filteredClients.reduce((s, c) => s + c.adsRevenue, 0))}</td>
              <td className="py-3 px-4 text-right text-xs text-purple-700">{formatCurrency(filteredClients.reduce((s, c) => s + c.addonRevenue, 0))}</td>
              <td className="py-3 px-4 text-right text-sm font-black text-emerald-800">{formatCurrency(grandTotalRevenue)}</td>
              <td className="py-3 px-4 text-center text-xs text-emerald-700">100%</td>
            </tr>
          </tfoot>
        </table>
        {filteredClients.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-xs">
            Belum ada data pelunasan invoice klien.
          </div>
        )}
      </div>
    </div>
  );
}
