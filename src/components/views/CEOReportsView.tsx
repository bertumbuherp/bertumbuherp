'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { usePMStore } from '@/lib/store/pmStore';
import { useHRStore } from '@/lib/store/hrStore';
import { useFinanceStore } from '@/lib/store/financeStore';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileSpreadsheet, TrendingUp, Users, DollarSign, 
  Printer, Download, CheckCircle, ArrowUpRight, 
  TrendingDown, Percent, Clock, Briefcase, Award 
} from 'lucide-react';

export default function CEOReportsView() {
  const [activeTab, setActiveTab] = useState('finance');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { session } = useAuth();
  
  // Data stores
  const { projects, tasks } = usePMStore();
  const { employees } = useHRStore();
  const { invoices, journal } = useFinanceStore();

  if (!session) {
    return <div className="p-6 text-center text-gray-500">Memuat Laporan Perusahaan...</div>;
  }

  // format currency in IDR
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // Toast trigger helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- 1. FINANCIAL REPORT CALCULATIONS ---
  // Revenue: Paid Invoices
  const revenueTotal = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  // Expenses: Operating (Biaya Operasional) and Salary (Biaya Gaji)
  const expenseOps = journal.filter(j => j.account === 'Biaya Operasional').reduce((sum, j) => sum + j.amount, 0);
  const expenseSalary = journal.filter(j => j.account === 'Biaya Gaji').reduce((sum, j) => sum + j.amount, 0);
  const expenseTotal = expenseOps + expenseSalary;
  
  const profitPreTax = revenueTotal - expenseTotal;
  const taxEst = profitPreTax > 0 ? Math.round(profitPreTax * 0.1) : 0; // 10% estimasi pajak penghasilan
  const netProfit = profitPreTax - taxEst;
  const netMarginPercent = revenueTotal > 0 ? Math.round((netProfit / revenueTotal) * 100) : 0;

  // Monthly breakdown map
  const financialMonthlyMap: Record<string, { revenue: number; ops: number; salary: number }> = {};
  
  const getYearMonth = (dateStr: string) => {
    if (!dateStr) return '';
    const match = dateStr.match(/^(\d{4})-(\d{2})/);
    return match ? `${match[1]}-${match[2]}` : '';
  };

  invoices.forEach(i => {
    if (i.status === 'paid') {
      const ym = getYearMonth((i as any).paidDate || (i as any).issueDate || i.dueDate);
      if (ym) {
        if (!financialMonthlyMap[ym]) financialMonthlyMap[ym] = { revenue: 0, ops: 0, salary: 0 };
        financialMonthlyMap[ym].revenue += i.total;
      }
    }
  });

  journal.forEach(j => {
    const ym = getYearMonth(j.date);
    if (ym) {
      if (!financialMonthlyMap[ym]) financialMonthlyMap[ym] = { revenue: 0, ops: 0, salary: 0 };
      if (j.account === 'Biaya Operasional') {
        financialMonthlyMap[ym].ops += j.amount;
      } else if (j.account === 'Biaya Gaji') {
        financialMonthlyMap[ym].salary += j.amount;
      }
    }
  });

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const sortedMonths = Object.keys(financialMonthlyMap).sort();

  // --- 2. PROJECT PROFITABILITY CALCULATIONS ---
  const projectReportsData = projects.map(p => {
    // Labor cost = tasks in this project * assignee cost rate (defaults to 50000 if not found)
    const projectTasks = tasks.filter(t => t.projectId === p.id);
    const laborCost = projectTasks.reduce((sum, t) => {
      const member = p.members?.find(m => m.userId === t.assigneeId);
      const rate = member ? member.costRate : 50000;
      return sum + (t.loggedHours * rate);
    }, 0);

    const totalDirectCost = p.actualCost;
    const totalProjectCost = totalDirectCost + laborCost;
    const grossProfit = p.contractValue - totalProjectCost;
    const margin = p.contractValue > 0 ? Math.round((grossProfit / p.contractValue) * 100) : 0;

    return {
      id: p.id,
      name: p.name,
      clientName: p.clientName,
      contractValue: p.contractValue,
      laborCost,
      directCost: totalDirectCost,
      totalCost: totalProjectCost,
      grossProfit,
      margin,
      status: p.status
    };
  });

  // --- 3. HR UTILIZATION CALCULATIONS ---
  const activeEmployees = employees.filter(e => e.status === 'active');
  const hrReportData = activeEmployees.map(emp => {
    const empTasks = tasks.filter(t => t.assigneeId === emp.id);
    const hoursLogged = empTasks.reduce((sum, t) => sum + t.loggedHours, 0);
    const standardCapacity = 160; // 160 hours standard per month
    const utilizationRate = Math.round((hoursLogged / standardCapacity) * 100);

    return {
      id: emp.id,
      name: emp.name,
      role: emp.role,
      div: emp.div,
      hoursLogged,
      standardCapacity,
      utilizationRate
    };
  });

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          aside, header, .no-print, button { display: none !important; }
          main, body, div { background: white !important; color: black !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important; }
          .print-container { width: 100% !important; max-width: 100% !important; padding: 20px !important; }
          table { border-collapse: collapse !important; width: 100% !important; }
          th, td { border: 1px solid #ddd !important; padding: 8px !important; text-align: left !important; }
          .card { border: none !important; }
        }
      `}} />

      <div className="no-print">
        <Header 
          title="Laporan Perusahaan" 
          subtitle="Analisis dan Statistik Kinerja Finansial, Proyek, dan Sumber Daya Manusia" 
        />
      </div>

      <div className="p-6 flex-1 max-w-7xl mx-auto w-full space-y-6 print-container">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-4 right-4 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-bounce no-print">
            <CheckCircle size={18} />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}

        {/* Tab Controls & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-2 no-print">
          <div className="flex overflow-x-auto gap-2">
            {[
              { id: 'finance', label: 'Keuangan (P&L)', icon: DollarSign },
              { id: 'project', label: 'Performa Proyek', icon: TrendingUp },
              { id: 'hr', label: 'SDM & Utilisasi', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold whitespace-nowrap transition-all ${
                    active 
                      ? 'border-red-500 text-red-600 bg-white/40 rounded-t-lg' 
                      : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 shrink-0 self-stretch md:self-auto">
            <button 
              onClick={handlePrint}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 shadow-sm transition-colors"
            >
              <Printer size={14} /> Cetak Laporan
            </button>
            <button 
              onClick={() => showToast(`Ekspor Excel berhasil untuk tab: ${activeTab === 'finance' ? 'Laporan Keuangan' : activeTab === 'project' ? 'Performa Proyek' : 'SDM & Utilisasi'}`)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-xs font-bold text-white shadow-sm transition-colors"
            >
              <Download size={14} /> Ekspor Excel
            </button>
          </div>
        </div>

        {/* Tab contents */}
        {activeTab === 'finance' && (
          <div className="space-y-6 fade-in">
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
              <div className="card p-5 border-l-4 border-emerald-500 hover:shadow-md transition-shadow">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Pemasukan Jasa</span>
                <h3 className="text-xl font-extrabold text-gray-800 mt-1">{formatIDR(revenueTotal)}</h3>
                <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-0.5"><ArrowUpRight className="text-emerald-500" size={12}/> Pendapatan Invoice Terbayar</p>
              </div>

              <div className="card p-5 border-l-4 border-red-500 hover:shadow-md transition-shadow">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Total Pengeluaran</span>
                <h3 className="text-xl font-extrabold text-gray-800 mt-1">{formatIDR(expenseTotal)}</h3>
                <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-0.5"><TrendingDown className="text-red-500" size={12}/> Operasional & Gaji Staf</p>
              </div>

              <div className="card p-5 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Laba Bersih (Setelah Pajak)</span>
                <h3 className="text-xl font-extrabold text-gray-800 mt-1">{formatIDR(netProfit)}</h3>
                <p className="text-[10px] text-gray-400 mt-2">Termasuk Potongan Pajak 10%</p>
              </div>

              <div className="card p-5 border-l-4 border-purple-500 hover:shadow-md transition-shadow">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Margin Laba Bersih</span>
                <h3 className="text-xl font-extrabold text-gray-800 mt-1">{netMarginPercent}%</h3>
                <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-0.5"><Percent size={12}/> Efisiensi Laba Arus Kas</p>
              </div>
            </div>

            {/* Income Statement Card */}
            <div className="card p-6 space-y-6">
              <div className="text-center pb-4 border-b">
                <h2 className="text-lg font-bold text-gray-800">Laporan Laba / Rugi (P&L) Komprehensif</h2>
                <p className="text-xs text-gray-400 mt-1">Bertumbuh Creative Agency | Akumulasi Real-time</p>
              </div>

              <div className="space-y-4">
                {/* 1. Summary Section */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">I. PENDAPATAN</h4>
                  <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
                    <span className="text-gray-700 font-medium pl-4">Pendapatan Jasa Agency (Invoice Paid)</span>
                    <span className="font-semibold text-gray-800">{formatIDR(revenueTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold py-2 bg-gray-50/50 px-3 rounded mt-2">
                    <span className="text-gray-800">TOTAL PENDAPATAN BERSIH</span>
                    <span className="text-gray-800">{formatIDR(revenueTotal)}</span>
                  </div>
                </div>

                {/* 2. Expense Section */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">II. BEBAN OPERASIONAL & BIAYA</h4>
                  <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
                    <span className="text-gray-700 font-medium pl-4">Beban Operasional & Kantor</span>
                    <span className="font-semibold text-gray-800">{formatIDR(expenseOps)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
                    <span className="text-gray-700 font-medium pl-4">Beban Gaji Karyawan & Freelancer</span>
                    <span className="font-semibold text-gray-800">{formatIDR(expenseSalary)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold py-2 bg-gray-50/50 px-3 rounded mt-2">
                    <span className="text-gray-800">TOTAL BEBAN OPERASIONAL</span>
                    <span className="text-red-600">({formatIDR(expenseTotal)})</span>
                  </div>
                </div>

                {/* 3. Summary Section */}
                <div className="pt-4 border-t-2 border-double border-gray-200">
                  <div className="flex justify-between items-center text-sm font-bold py-2">
                    <span className="text-gray-800 uppercase">III. LABA BERSIH SEBELUM PAJAK (EBT)</span>
                    <span className={profitPreTax >= 0 ? "text-emerald-600" : "text-red-600"}>
                      {formatIDR(profitPreTax)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
                    <span className="text-gray-700 font-medium pl-4">Estimasi Pajak Penghasilan (10%)</span>
                    <span className="text-red-500 font-medium">({formatIDR(taxEst)})</span>
                  </div>
                  <div className="flex justify-between items-center text-base font-extrabold py-3 bg-emerald-50 text-emerald-800 px-4 rounded-xl mt-2 border border-emerald-100">
                    <span>IV. LABA NETTO PERUSAHAAN (EAT)</span>
                    <span>{formatIDR(netProfit)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Breakdowns */}
            {sortedMonths.length > 0 && (
              <div className="card p-6 space-y-4">
                <h3 className="text-md font-bold text-gray-800">Breakdown Finansial Bulanan</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase">
                      <tr>
                        <th className="px-4 py-2 font-bold">Bulan / Periode</th>
                        <th className="px-4 py-2 font-bold text-right">Pendapatan</th>
                        <th className="px-4 py-2 font-bold text-right">Biaya Operasional</th>
                        <th className="px-4 py-2 font-bold text-right">Biaya Gaji</th>
                        <th className="px-4 py-2 font-bold text-right">Net Laba</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedMonths.map(ym => {
                        const [year, month] = ym.split('-');
                        const monthName = monthNames[parseInt(month, 10) - 1];
                        const data = financialMonthlyMap[ym];
                        const netVal = data.revenue - (data.ops + data.salary);
                        return (
                          <tr key={ym} className="border-b last:border-0 hover:bg-gray-50/50">
                            <td className="px-4 py-3 font-semibold text-gray-800">{monthName} {year}</td>
                            <td className="px-4 py-3 text-right text-emerald-600 font-bold">{formatIDR(data.revenue)}</td>
                            <td className="px-4 py-3 text-right text-gray-600">{formatIDR(data.ops)}</td>
                            <td className="px-4 py-3 text-right text-gray-600">{formatIDR(data.salary)}</td>
                            <td className={`px-4 py-3 text-right font-extrabold ${netVal >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{formatIDR(netVal)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'project' && (
          <div className="card p-6 space-y-6 fade-in">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Laporan Performa & Profitabilitas Proyek</h2>
              <p className="text-xs text-gray-400 mt-1">Efisiensi keuangan per proyek berdasarkan realisasi biaya langsung dan labor cost</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-bold">Nama Proyek / Klien</th>
                    <th className="px-4 py-3 font-bold text-right">Nilai Kontrak</th>
                    <th className="px-4 py-3 font-bold text-right">Biaya Langsung</th>
                    <th className="px-4 py-3 font-bold text-right">Labor Cost</th>
                    <th className="px-4 py-3 font-bold text-right">Total Biaya</th>
                    <th className="px-4 py-3 font-bold text-right">Laba Kotor</th>
                    <th className="px-4 py-3 font-bold text-center">Margin %</th>
                    <th className="px-4 py-3 font-bold text-center no-print">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projectReportsData.map(proj => (
                    <tr key={proj.id} className="border-b last:border-0 hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-800">{proj.name}</p>
                        <p className="text-[10px] text-gray-400">Klien: {proj.clientName}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatIDR(proj.contractValue)}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{formatIDR(proj.directCost)}</td>
                      <td className="px-4 py-3 text-right text-gray-600" title="Dihitung dari jam kerja x rate biaya anggota">{formatIDR(proj.laborCost)}</td>
                      <td className="px-4 py-3 text-right text-red-600 font-semibold">{formatIDR(proj.totalCost)}</td>
                      <td className={`px-4 py-3 text-right font-bold ${proj.grossProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{formatIDR(proj.grossProfit)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                          proj.margin > 40 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          proj.margin > 15 ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {proj.margin}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center no-print">
                        <span className={`badge uppercase text-[9px] ${
                          proj.status === 'completed' ? 'badge-gray' :
                          proj.status === 'on_track' ? 'badge-green' :
                          proj.status === 'at_risk' ? 'badge-yellow' :
                          'badge-red'
                        }`}>
                          {proj.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'hr' && (
          <div className="card p-6 space-y-6 fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Laporan SDM & Utilisasi Kerja Karyawan</h2>
                <p className="text-xs text-gray-400 mt-1">Presentase pemakaian kapasitas jam kerja per-karyawan (Target: 80%)</p>
              </div>
              <div className="flex gap-4 text-xs font-semibold text-gray-500 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-100">
                <div className="flex items-center gap-1"><Clock size={14} className="text-blue-500"/> Total Staf: {hrReportData.length}</div>
                <div className="flex items-center gap-1"><Briefcase size={14} className="text-emerald-500"/> Rata-rata Target: 80%</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-bold">Nama Karyawan</th>
                    <th className="px-4 py-3 font-bold">Departemen</th>
                    <th className="px-4 py-3 font-bold">Jabatan</th>
                    <th className="px-4 py-3 font-bold text-center">Standard Kapasitas</th>
                    <th className="px-4 py-3 font-bold text-center">Jam Kerja Tercatat</th>
                    <th className="px-4 py-3 font-bold text-center">Rasio Utilisasi %</th>
                    <th className="px-4 py-3 font-bold text-left no-print">Tingkat Produktivitas</th>
                  </tr>
                </thead>
                <tbody>
                  {hrReportData.map(emp => {
                    const isOverloaded = emp.utilizationRate > 90;
                    const isOptimal = emp.utilizationRate >= 70 && emp.utilizationRate <= 90;
                    return (
                      <tr key={emp.id} className="border-b last:border-0 hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-bold text-gray-800">{emp.name}</td>
                        <td className="px-4 py-3 text-gray-600">{emp.div}</td>
                        <td className="px-4 py-3 text-gray-500">{emp.role}</td>
                        <td className="px-4 py-3 text-center text-gray-500">{emp.standardCapacity} jam</td>
                        <td className="px-4 py-3 text-center text-gray-800 font-bold">{emp.hoursLogged} jam</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className={`w-12 text-right font-extrabold ${
                              isOverloaded ? 'text-red-600' :
                              isOptimal ? 'text-emerald-600' :
                              'text-amber-500'
                            }`}>
                              {emp.utilizationRate}%
                            </span>
                            <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden no-print">
                              <div className={`h-full rounded-full ${
                                isOverloaded ? 'bg-red-500' :
                                isOptimal ? 'bg-emerald-500' :
                                'bg-amber-400'
                              }`} style={{ width: `${Math.min(emp.utilizationRate, 100)}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 no-print">
                          <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                            isOverloaded ? 'bg-red-50 text-red-700' :
                            isOptimal ? 'bg-emerald-50 text-emerald-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {isOverloaded ? 'Sangat Sibuk (Overload)' : isOptimal ? 'Optimal' : 'Kurang Utilisasi'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
