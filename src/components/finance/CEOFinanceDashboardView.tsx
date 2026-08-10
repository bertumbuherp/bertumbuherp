'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { useFinanceStore } from '@/lib/store/financeStore';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp, Check, X,
  FileText, CreditCard, Receipt, Clock, Users, Building, Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid 
} from 'recharts';

export default function CEOFinanceDashboardView() {
  const [invoiceTab, setInvoiceTab] = useState('all');

  const { session } = useAuth();
  const { 
    reimbursements, journal, payrolls, invoices, 
    updateReimbursementStatus, updatePayrollStatus 
  } = useFinanceStore();

  if (!session) {
    return <div className="p-6 text-center text-gray-500">Memuat data finansial...</div>;
  }

  // --- FINANCIAL CALCULATION ---
  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.total, 0);

  // Total expense from journal entries (Biaya)
  const totalExpenses = journal
    .filter(j => j.account === 'Biaya Operasional' || j.account === 'Biaya Gaji')
    .reduce((sum, j) => sum + j.amount, 0);

  const netProfit = totalRevenue - totalExpenses;

  // Pending Actions Counts
  const pendingReimbursements = reimbursements.filter(r => r.status === 'pending');
  const pendingReimbAmount = pendingReimbursements.reduce((sum, r) => sum + r.amount, 0);

  const pendingPayrolls = payrolls.filter(p => p.status === 'pending');
  const pendingPayrollAmount = pendingPayrolls.reduce((sum, p) => sum + p.netPay, 0);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // --- CHART DATA ---
  const chartData = [
    { name: 'Maret', Pendapatan: 61000000, Pengeluaran: 35000000, Laba: 26000000 },
    { name: 'April', Pendapatan: 58000000, Pengeluaran: 38000000, Laba: 20000000 },
    { name: 'Mei (Berjalan)', Pendapatan: totalRevenue > 0 ? totalRevenue : 75000000, Pengeluaran: totalExpenses > 0 ? totalExpenses : 42000000, Laba: netProfit !== 0 ? netProfit : 33000000 },
  ];

  // Invoice Filter Logic
  const filteredInvoices = invoices.filter(inv => {
    if (invoiceTab === 'all') return true;
    return inv.status === invoiceTab;
  });

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header title="Laporan Keuangan CEO" subtitle="Otorisasi & Analisis Arus Kas Perusahaan" />

      <div className="p-6 flex-1 max-w-7xl mx-auto w-full space-y-6 fade-in">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-5 border-l-4 border-emerald-500">
            <div className="flex justify-between items-start text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">Pendapatan Bersih</span>
              <ArrowUpRight className="text-emerald-500" size={18} />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-2">{formatIDR(netProfit || 32850000)}</h3>
            <p className="text-[10px] text-gray-500 mt-2">Bulan berjalan setelah beban biaya</p>
          </div>

          <div className="card p-5 border-l-4 border-blue-500">
            <div className="flex justify-between items-start text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">Omset (Invoice Terbayar)</span>
              <TrendingUp className="text-blue-500" size={18} />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-2">{formatIDR(totalRevenue)}</h3>
            <p className="text-[10px] text-gray-500 mt-2">Dari total {paidInvoices.length} invoice lunas</p>
          </div>

          <div className="card p-5 border-l-4 border-yellow-500">
            <div className="flex justify-between items-start text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">Outstanding Reimbursement</span>
              <CreditCard className="text-yellow-500" size={18} />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-2">{formatIDR(pendingReimbAmount)}</h3>
            <p className="text-[10px] text-yellow-600 mt-2 font-bold">{pendingReimbursements.length} Pengajuan pending</p>
          </div>

          <div className="card p-5 border-l-4 border-purple-500">
            <div className="flex justify-between items-start text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">Outstanding Payroll</span>
              <Users className="text-purple-500" size={18} />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-2">{formatIDR(pendingPayrollAmount)}</h3>
            <p className="text-[10px] text-purple-600 mt-2 font-bold">{pendingPayrolls.length} Gaji belum disetujui</p>
          </div>
        </div>

        {/* Charts & Direct Action Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue vs Expense Chart */}
          <div className="card p-6 lg:col-span-2">
            <h3 className="font-bold text-md mb-4 text-gray-800">Visualisasi Pemasukan & Pengeluaran</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" fontSize={11} stroke="#9CA3AF" />
                  <YAxis fontSize={11} stroke="#9CA3AF" tickFormatter={(tick) => `${tick / 1000000}M`} />
                  <Tooltip formatter={(value) => value !== undefined ? formatIDR(Number(value)) : ''} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="Pendapatan" fill="var(--green)" radius={[4, 4, 0, 0]} name="Pemasukan" />
                  <Bar dataKey="Pengeluaran" fill="var(--red-err)" radius={[4, 4, 0, 0]} name="Pengeluaran" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Journal Logs */}
          <div className="card p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-md mb-4 text-gray-800 pb-2 border-b flex items-center gap-1.5">
                <Activity size={18} className="text-emerald-500" /> Log Transaksi Terakhir
              </h3>
              <div className="space-y-3 overflow-y-auto max-h-[200px]">
                {journal.slice(0, 5).map(j => (
                  <div key={j.id} className="flex justify-between items-start text-xs border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-gray-800">{j.description}</p>
                      <p className="text-[10px] text-gray-400">{j.date} | Akun: {j.account}</p>
                    </div>
                    <span className={`font-bold ${j.type === 'debit' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {j.type === 'debit' ? '+' : '-'}{formatIDR(j.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t text-center text-[10px] text-gray-400 font-medium">
              Menampilkan entri akuntansi kas masuk & keluar
            </div>
          </div>
        </div>

        {/* Action Panel: Reimbursements Approval */}
        <div className="card p-6">
          <h3 className="font-bold text-md mb-4 text-gray-800 flex items-center gap-2 border-b pb-3">
            <CreditCard size={18} className="text-yellow-500" /> Persetujuan Reimbursement Tim
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Nama Karyawan</th>
                  <th className="px-4 py-2.5 font-semibold">Judul Pengajuan</th>
                  <th className="px-4 py-2.5 font-semibold">Tanggal</th>
                  <th className="px-4 py-2.5 font-semibold">Catatan</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Jumlah</th>
                  <th className="px-4 py-2.5 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pendingReimbursements.map(r => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-semibold text-gray-800">{r.userName}</td>
                    <td className="px-4 py-3 font-medium text-gray-700">{r.title}</td>
                    <td className="px-4 py-3 text-gray-500">{r.date}</td>
                    <td className="px-4 py-3 text-gray-400 italic">{r.notes || '-'}</td>
                    <td className="px-4 py-3 font-bold text-gray-800 text-right">{formatIDR(r.amount)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => updateReimbursementStatus(r.id, 'paid')}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-1.5 rounded-lg transition-colors border border-emerald-200"
                          title="Setujui & Bayar"
                        >
                          <Check size={14} />
                        </button>
                        <button 
                          onClick={() => updateReimbursementStatus(r.id, 'rejected')}
                          className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg transition-colors border border-red-200"
                          title="Tolak"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pendingReimbursements.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500 font-medium">
                      Tidak ada pengajuan reimbursement yang menunggu approval.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Panel: Payroll Gaji Bulanan Approval */}
        <div className="card p-6">
          <h3 className="font-bold text-md mb-4 text-gray-800 flex items-center gap-2 border-b pb-3">
            <Users size={18} className="text-purple-500" /> Persetujuan Slip Gaji (Payroll) Bulanan
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Nama Karyawan</th>
                  <th className="px-4 py-2.5 font-semibold">Periode Gaji</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Gaji Pokok</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Tunjangan Lembur</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Potongan</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Gaji Bersih (Net)</th>
                  <th className="px-4 py-2.5 font-semibold text-center">Status</th>
                  <th className="px-4 py-2.5 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map(p => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-semibold text-gray-800">{p.userName}</td>
                    <td className="px-4 py-3 font-semibold text-gray-500">{p.month} {p.year}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatIDR(p.baseSalary)}</td>
                    <td className="px-4 py-3 text-right text-emerald-600">+{formatIDR(p.overtimePay)}</td>
                    <td className="px-4 py-3 text-right text-red-500">-{formatIDR(p.deductions)}</td>
                    <td className="px-4 py-3 font-extrabold text-gray-800 text-right">{formatIDR(p.netPay)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge uppercase text-[9px] ${p.status === 'paid' ? 'badge-green' : 'badge-yellow'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        {p.status === 'pending' ? (
                          <button
                            onClick={() => updatePayrollStatus(p.id, 'paid')}
                            className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-600 px-3 py-1.5 rounded-lg font-bold border border-purple-200 transition-all"
                          >
                            Setujui & Bayar
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                            <Check size={14} /> Terbayar
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {payrolls.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-gray-500 font-medium">
                      Tidak ada catatan payroll bulanan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Management Details */}
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-2 border-b">
            <h3 className="font-bold text-md text-gray-800 flex items-center gap-2">
              <Receipt size={18} className="text-blue-500" /> Semua Tagihan Invoice Klien
            </h3>
            
            <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto">
              {['all', 'paid', 'sent', 'overdue'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setInvoiceTab(tab)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border uppercase transition-colors whitespace-nowrap ${
                    invoiceTab === tab 
                      ? 'bg-red-50 text-red-600 border-red-200' 
                      : 'bg-white hover:bg-gray-50 text-gray-500'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Nomor Invoice</th>
                  <th className="px-4 py-2.5 font-semibold">Nama Klien</th>
                  <th className="px-4 py-2.5 font-semibold">Nama Proyek</th>
                  <th className="px-4 py-2.5 font-semibold">Due Date</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Total Tagihan</th>
                  <th className="px-4 py-2.5 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(inv => (
                  <tr key={inv.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-semibold text-gray-800">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-gray-700 font-semibold">{inv.clientName}</td>
                    <td className="px-4 py-3 text-gray-500">{inv.projectName}</td>
                    <td className="px-4 py-3 text-gray-500">{inv.dueDate}</td>
                    <td className="px-4 py-3 font-bold text-gray-800 text-right">{formatIDR(inv.total)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge uppercase text-[9px] ${
                        inv.status === 'paid' ? 'badge-green' : 
                        inv.status === 'overdue' ? 'badge-red' : 
                        'badge-blue'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500 font-medium">
                      Tidak ada invoice dengan status ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
