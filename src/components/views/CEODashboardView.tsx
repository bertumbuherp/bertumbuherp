'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import { usePMStore } from '@/lib/store/pmStore';
import { useCrmStore } from '@/lib/store/crmStore';
import { useHRStore } from '@/lib/store/hrStore';
import { useFinanceStore } from '@/lib/store/financeStore';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TrendingUp, Users, FolderKanban, DollarSign, CalendarDays, Clock, 
  CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownRight, Briefcase, 
  FileSpreadsheet, Activity, Building2, UserCheck, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, Legend, Cell, PieChart, Pie
} from 'recharts';

function CEODashboardContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams?.get('tab') || 'summary';
  
  const getHeaderDetails = () => {
    switch (activeTab) {
      case 'summary':
        return { title: 'CEO Dashboard - Ringkasan Eksekutif', subtitle: 'Agregasi Kinerja Perusahaan Terpadu & Real-time' };
      case 'crm':
        return { title: 'CEO Dashboard - CRM & Prospek Klien', subtitle: 'Analisis Klien, Pipeline & Win Rate Real-time' };
      case 'pm':
        return { title: 'CEO Dashboard - PM & Operasional Proyek', subtitle: 'Status Kesehatan & Progres Proyek Lintas PM' };
      case 'hr':
        return { title: 'CEO Dashboard - HR & Kehadiran Tim', subtitle: 'Kehadiran Staf, Roster & Utilisasi Kapasitas Tim' };
      case 'finance':
        return { title: 'CEO Dashboard - Arus Kas & Keuangan', subtitle: 'Status Invoice, Omset & Profitabilitas Perusahaan' };
      default:
        return { title: 'CEO Dashboard', subtitle: 'Agregasi Kinerja Perusahaan Terpadu & Real-time' };
    }
  };

  const header = getHeaderDetails();

  const { session } = useAuth();
  
  // Data stores
  const { projects, tasks } = usePMStore();
  const { clients, deals, packages } = useCrmStore();
  const { employees, attendances, leaves, overtimes, updateLeaveStatus } = useHRStore();
  const { reimbursements, journal, payrolls, invoices, updateReimbursementStatus } = useFinanceStore();

  // --- DATE FILTER STATE ---
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('all');

  if (!session) {
    return <div className="p-6 text-center text-gray-500">Memuat dashboard...</div>;
  }

  const matchesFilter = (dateStr: string) => {
    if (selectedMonthFilter === 'all') return true;
    if (!dateStr) return false;
    return dateStr.startsWith(selectedMonthFilter);
  };

  // --- FILTERED DATA SETS ---
  const filteredDeals = deals.filter(d => matchesFilter(d.createdAt));
  const filteredProjects = projects.filter(p => matchesFilter(p.startDate || p.createdAt));
  const filteredTasks = tasks.filter(t => matchesFilter(t.dueDate || t.createdAt));
  const filteredInvoices = invoices.filter(i => matchesFilter((i as any).paidDate || (i as any).issueDate || i.dueDate));
  const filteredJournal = journal.filter(j => matchesFilter(j.date));

  // --- CALCULATE CRM METRICS ---
  const activeDeals = filteredDeals.filter(d => d.stage !== 'won' && d.stage !== 'lost');
  const pipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
  const wonDeals = filteredDeals.filter(d => d.stage === 'won');
  const winRate = filteredDeals.length > 0 ? Math.round((wonDeals.length / filteredDeals.length) * 100) : 0;
  
  // --- CALCULATE PM METRICS ---
  const activeProjects = filteredProjects.filter(p => p.status !== 'completed');
  const delayedProjects = activeProjects.filter(p => p.status === 'delayed' || p.status === 'at_risk');
  const reviewTasks = filteredTasks.filter(t => t.status === 'review');

  // --- CALCULATE HR & UTILIZATION METRICS ---
  const activeEmployees = employees.filter(e => e.status === 'active');
  const todayStr = new Date().toISOString().split('T')[0];
  const presentToday = attendances.filter(a => a.date === todayStr && a.status === 'present').length;
  const leaveToday = leaves.filter(l => {
    const today = new Date(todayStr);
    return (l.status === 'approved_hr' || l.status === 'approved_pm') && today >= new Date(l.startDate) && today <= new Date(l.endDate);
  }).length;
  
  // Resource Utilization KPI: (Total Billable Hours Logged / Standard Capacity Hours) * 100
  const totalLoggedHours = filteredTasks.reduce((sum, t) => sum + t.loggedHours, 0);
  // standard hours is 160 hours per active employee
  const totalStandardHours = activeEmployees.length * 160;
  const utilizationRate = totalStandardHours > 0 ? Math.round((totalLoggedHours / totalStandardHours) * 100) : 0;

  const pendingLeavesCount = leaves.filter(l => l.status === 'pending' || l.status === 'approved_pm').length;
  const pendingOvertimesCount = overtimes.filter(o => o.status === 'pending').length;

  // --- CALCULATE FINANCE METRICS ---
  // Revenue: Paid Invoices
  const totalRevenue = filteredInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  // Expenses: Journal Entries (credits for Kas/Cash and debits for Biaya) + Reimbursements Paid + Payroll Paid
  const totalExpenses = filteredJournal.filter(j => j.account === 'Biaya Operasional' || j.account === 'Biaya Gaji').reduce((sum, j) => sum + j.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  
  // --- CHART DATA GENERATION (Fully Dynamic Cash Flow) ---
  const cashFlowMap: Record<string, { Pendapatan: number; Pengeluaran: number }> = {};
  
  // Helper to extract YYYY-MM
  const getYearMonth = (dateStr: string) => {
    if (!dateStr) return '';
    const match = dateStr.match(/^(\d{4})-(\d{2})/);
    return match ? `${match[1]}-${match[2]}` : '';
  };

  // Process invoices for dynamic income
  invoices.forEach(inv => {
    if (inv.status === 'paid') {
      const ym = getYearMonth((inv as any).paidDate || (inv as any).issueDate || inv.dueDate);
      if (ym) {
        if (!cashFlowMap[ym]) cashFlowMap[ym] = { Pendapatan: 0, Pengeluaran: 0 };
        cashFlowMap[ym].Pendapatan += inv.total;
      }
    }
  });

  // Process journal for dynamic expenses
  journal.forEach(j => {
    if (j.account === 'Biaya Operasional' || j.account === 'Biaya Gaji') {
      const ym = getYearMonth(j.date);
      if (ym) {
        if (!cashFlowMap[ym]) cashFlowMap[ym] = { Pendapatan: 0, Pengeluaran: 0 };
        cashFlowMap[ym].Pengeluaran += j.amount;
      }
    }
  });

  // Ensure last 6 months are present in chart data
  const current = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(current.getFullYear(), current.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!cashFlowMap[ym]) {
      cashFlowMap[ym] = { Pendapatan: 0, Pengeluaran: 0 };
    }
  }

  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const cashFlowData = Object.keys(cashFlowMap)
    .sort()
    .map(ym => {
      const [year, month] = ym.split('-');
      const monthName = monthNamesShort[parseInt(month, 10) - 1];
      const data = cashFlowMap[ym];
      return {
        name: `${monthName} ${year.slice(2)}`,
        Pendapatan: data.Pendapatan,
        Pengeluaran: data.Pengeluaran,
        Laba: data.Pendapatan - data.Pengeluaran,
      };
    })
    .slice(-6);

  // Deal Stage Distribution
  const dealStages = [
    { name: 'Proposal / Pitching', value: filteredDeals.filter(d => d.stage === 'penawaran' || d.stage === 'pitching').length },
    { name: 'Negosiasi', value: filteredDeals.filter(d => d.stage === 'negosiasi').length },
    { name: 'Won (Deal)', value: filteredDeals.filter(d => d.stage === 'won').length },
    { name: 'Lost', value: filteredDeals.filter(d => d.stage === 'lost').length },
  ].filter(item => item.value > 0);

  const COLORS = ['var(--blue)', 'var(--yellow)', 'var(--green)', 'var(--red-err)'];

  // format currency in IDR
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const pendingReimbursements = reimbursements.filter(r => r.status === 'pending');
  const pendingLeaves = leaves.filter(l => l.status === 'pending' || l.status === 'approved_pm');

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header 
        title={header.title} 
        subtitle={header.subtitle} 
      />
      
      <div className="p-6 flex-1 max-w-7xl mx-auto w-full space-y-6 fade-in">
        
        {/* Date Filter Container */}
        <div className="flex justify-end items-center border-b border-gray-200 pb-2">
          {/* Date Filter Dropdown */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm shrink-0 self-stretch sm:self-auto">
            <CalendarDays size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-500">Filter Waktu:</span>
            <select
              value={selectedMonthFilter}
              onChange={(e) => setSelectedMonthFilter(e.target.value)}
              className="text-xs font-bold text-gray-700 bg-transparent outline-none border-none cursor-pointer"
            >
              <option value="all">Semua Waktu</option>
              <option value="2026-06">Juni 2026</option>
              <option value="2026-05">Mei 2026</option>
              <option value="2024-06">Juni 2024</option>
              <option value="2024-05">Mei 2024</option>
              <option value="2024-04">April 2024</option>
            </select>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card p-5 border-l-4 border-emerald-500 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Pendapatan Bersih (L/R)</span>
                    <DollarSign size={18} className="text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-800 mt-2">{formatIDR(netProfit || 0)}</h3>
                </div>
                <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-emerald-600">
                  <ArrowUpRight size={14} />
                  <span>Kinerja Keuangan Aktif</span>
                </div>
              </div>

              <div className="card p-5 border-l-4 border-blue-500 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Deals Aktif</span>
                    <TrendingUp size={18} className="text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-800 mt-2">{formatIDR(pipelineValue)}</h3>
                </div>
                <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-gray-500">
                  <span>{activeDeals.length} Deals aktif berjalan</span>
                </div>
              </div>

              <div className="card p-5 border-l-4 border-purple-500 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Proyek & PM Berjalan</span>
                    <FolderKanban size={18} className="text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-800 mt-2">{activeProjects.length} <span className="text-sm font-medium text-gray-400">Proyek</span></h3>
                </div>
                <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-red-600">
                  {delayedProjects.length > 0 ? (
                    <>
                      <AlertTriangle size={14} />
                      <span>{delayedProjects.length} Proyek butuh perhatian</span>
                    </>
                  ) : (
                    <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={14} /> Semua berjalan aman</span>
                  )}
                </div>
              </div>

              <div className="card p-5 border-l-4 border-orange-500 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Rasio Utilisasi Tim</span>
                    <Users size={18} className="text-orange-500" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-800 mt-2">{utilizationRate}% <span className="text-sm font-medium text-gray-400">Utilisasi</span></h3>
                </div>
                <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-gray-500">
                  <span>{totalLoggedHours}j terisi / {totalStandardHours}j kapasitas ({activeEmployees.length} staf)</span>
                </div>
              </div>
            </div>

            {/* Central Analysis Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Financial Chart Panel */}
              <div className="card p-6 lg:col-span-2 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Tren Laba & Rugi Perusahaan</h3>
                    <p className="text-xs text-gray-400">Laporan komparasi pemasukan vs pengeluaran bulanan</p>
                  </div>
                  <Link href="/ceo/dashboard?tab=finance" className="text-xs text-red-500 hover:underline font-semibold flex items-center gap-0.5">Lihat Laba/Rugi &rarr;</Link>
                </div>
                
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cashFlowData}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--green)" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="var(--green)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--red-err)" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="var(--red-err)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" fontSize={11} stroke="#9CA3AF" />
                      <YAxis fontSize={11} stroke="#9CA3AF" tickFormatter={(tick) => `${tick / 1000000}M`} />
                      <Tooltip formatter={(value) => value !== undefined ? formatIDR(Number(value)) : ''} />
                      <Legend verticalAlign="top" height={36} />
                      <Area type="monotone" dataKey="Pendapatan" stroke="var(--green)" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} name="Pemasukan" />
                      <Area type="monotone" dataKey="Pengeluaran" stroke="var(--red-err)" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} name="Pengeluaran" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CEO Attention Center */}
              <div className="card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
                    <Activity className="text-red-500" size={18} />
                    <h3 className="text-md font-bold text-gray-800">Pusat Perhatian CEO</h3>
                  </div>
                  
                  <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                    {/* Reimbursements */}
                    {pendingReimbursements.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reimbursement ({pendingReimbursements.length})</p>
                        {pendingReimbursements.map(r => (
                          <div key={r.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs space-y-2">
                            <div className="flex justify-between items-start">
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-gray-800 truncate">{r.userName}</p>
                                <p className="text-[10px] text-gray-500 truncate">{r.title}</p>
                              </div>
                              <span className="font-bold text-emerald-600 ml-2">{formatIDR(r.amount)}</span>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => updateReimbursementStatus(r.id, 'paid')}
                                className="px-2 py-1 bg-emerald-500 text-white rounded text-[10px] font-bold hover:bg-emerald-600 transition-colors"
                              >
                                Setujui
                              </button>
                              <button
                                onClick={() => updateReimbursementStatus(r.id, 'rejected')}
                                className="px-2 py-1 bg-red-500 text-white rounded text-[10px] font-bold hover:bg-red-600 transition-colors"
                              >
                                Tolak
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Leaves */}
                    {pendingLeaves.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pengajuan Cuti ({pendingLeaves.length})</p>
                        {pendingLeaves.map(l => (
                          <div key={l.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs space-y-2">
                            <div className="flex justify-between items-start">
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-gray-800 truncate">{l.userName}</p>
                                <p className="text-[10px] text-gray-500 truncate">{l.type} - {l.durationDays} hari ({l.reason})</p>
                              </div>
                              <span className="text-[10px] text-gray-400 ml-2">{l.startDate} s/d {l.endDate}</span>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => updateLeaveStatus(l.id, 'approved_hr')}
                                className="px-2 py-1 bg-emerald-500 text-white rounded text-[10px] font-bold hover:bg-emerald-600 transition-colors"
                              >
                                Setujui
                              </button>
                              <button
                                onClick={() => updateLeaveStatus(l.id, 'rejected')}
                                className="px-2 py-1 bg-red-500 text-white rounded text-[10px] font-bold hover:bg-red-600 transition-colors"
                              >
                                Tolak
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {pendingReimbursements.length === 0 && pendingLeaves.length === 0 && (
                      <div className="text-center py-6 text-gray-400 text-xs">
                        <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={24} />
                        Semua persetujuan selesai!
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span>Status Operasional Global</span>
                  <span className="badge badge-green">OPTIMAL</span>
                </div>
              </div>
            </div>

            {/* Quick Summary Panels Per Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* PM Summary */}
              <div className="card p-6">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                  <h4 className="font-bold text-sm text-gray-800">Pekerjaan Proyek (PM)</h4>
                  <Link href="/ceo/dashboard?tab=pm" className="text-xs text-blue-600 hover:underline">Semua Proyek &rarr;</Link>
                </div>
                <div className="space-y-3">
                  {projects.slice(0, 3).map(p => {
                    const pTasks = tasks.filter(t => t.projectId === p.id);
                    const pDone = pTasks.filter(t => t.status === 'done').length;
                    const pct = pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0;
                    return (
                      <div key={p.id} className="flex items-center justify-between text-xs border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-800 truncate">{p.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">PM: {p.pmName}</p>
                        </div>
                        <div className="text-right ml-4">
                          <span className="font-bold text-gray-700">{pct}% selesai</span>
                          <div className="w-20 bg-gray-100 h-1 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CRM Deals Summary */}
              <div className="card p-6">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                  <h4 className="font-bold text-sm text-gray-800">Deals Terbaru (CRM/AE)</h4>
                  <Link href="/ceo/dashboard?tab=crm" className="text-xs text-blue-600 hover:underline">Semua CRM &rarr;</Link>
                </div>
                <div className="space-y-3">
                  {deals.slice(0, 3).map(d => {
                    return (
                      <div key={d.id} className="flex items-center justify-between text-xs border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-800 truncate">{d.title}</p>
                          <p className="text-[10px] text-gray-400 truncate">Klien: {d.clientName}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-emerald-600">{formatIDR(d.value)}</p>
                          <span className={`badge uppercase text-[9px] scale-95 mt-1`} style={{ contentVisibility: 'auto' }}>
                            {d.stage}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'crm' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Pipeline summary card */}
              <div className="card p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-400">Total Nilai Pipeline</h4>
                  <h2 className="text-3xl font-extrabold text-gray-800 mt-2">{formatIDR(pipelineValue)}</h2>
                </div>
                <p className="text-xs text-gray-500 mt-4">Peluang dari {activeDeals.length} deals yang sedang aktif dinegosiasikan.</p>
              </div>

              {/* Win rate card */}
              <div className="card p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-400">Win Rate Deals</h4>
                  <h2 className="text-3xl font-extrabold text-emerald-600 mt-2">{winRate}%</h2>
                </div>
                <p className="text-xs text-gray-500 mt-4">Rasio deal yang berhasil dimenangkan (`won`) dari keseluruhan deal.</p>
              </div>

              {/* Service packages status */}
              <div className="card p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-400">Paket Layanan Terdaftar</h4>
                  <h2 className="text-3xl font-extrabold text-blue-600 mt-2">{packages.length}</h2>
                </div>
                <p className="text-xs text-gray-500 mt-4">Total template paket harga dan penawaran taktis.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Deal Stages Distribution Chart */}
              <div className="card p-6">
                <h3 className="font-bold text-md mb-4 text-gray-800">Distribusi Tahapan Deal</h3>
                <div className="h-64 flex items-center justify-center">
                  {dealStages.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dealStages}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {dealStages.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-gray-500">Tidak ada data deal untuk divisualisasikan.</p>
                  )}
                </div>
              </div>

              {/* Client Performance List */}
              <div className="card p-6">
                <h3 className="font-bold text-md mb-4 text-gray-800">Klien & Nilai Bisnis</h3>
                <div className="overflow-y-auto max-h-[250px] space-y-3">
                  {clients.map(c => {
                    const clientDeals = deals.filter(d => d.clientId === c.id || d.clientName === c.name);
                    const clientRevenue = clientDeals.filter(d => d.stage === 'won').reduce((sum, d) => sum + d.value, 0);
                    return (
                      <div key={c.id} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                          <p className="text-[11px] text-gray-400">{c.industry} | Status: <span className="uppercase text-[9px] font-bold text-blue-500">{c.status}</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-600">{formatIDR(clientRevenue)}</p>
                          <p className="text-[10px] text-gray-400">{clientDeals.length} Penawaran</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pm' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card p-5 border-l-4 border-blue-500 text-center">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Proyek Berjalan</h4>
                <p className="text-3xl font-extrabold text-gray-800 mt-1">{activeProjects.length}</p>
              </div>
              <div className="card p-5 border-l-4 border-red-500 text-center">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Delayed / At Risk</h4>
                <p className="text-3xl font-extrabold text-red-600 mt-1">{delayedProjects.length}</p>
              </div>
              <div className="card p-5 border-l-4 border-orange-500 text-center">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Tugas Menunggu Validasi</h4>
                <p className="text-3xl font-extrabold text-orange-600 mt-1">{reviewTasks.length}</p>
              </div>
            </div>

            {/* Project Detailed health */}
            <div className="card p-6">
              <h3 className="font-bold text-md mb-4 text-gray-800">Status Kesehatan Proyek Lintas PM</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map(p => {
                  const pTasks = tasks.filter(t => t.projectId === p.id);
                  const pDone = pTasks.filter(t => t.status === 'done').length;
                  const pct = pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0;
                  
                  const statusColors: Record<string, string> = {
                    on_track: 'bg-emerald-500', at_risk: 'bg-amber-500', delayed: 'bg-red-500',
                    planning: 'bg-blue-500', completed: 'bg-purple-500'
                  };

                  const textColors: Record<string, string> = {
                    on_track: 'text-emerald-600 bg-emerald-50', at_risk: 'text-amber-600 bg-amber-50', 
                    delayed: 'text-red-600 bg-red-50', planning: 'text-blue-600 bg-blue-50', 
                    completed: 'text-purple-600 bg-purple-50'
                  };

                  return (
                    <div key={p.id} className="border border-gray-100 rounded-xl p-4 flex flex-col justify-between hover:bg-gray-50/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-sm text-gray-800">{p.name}</h4>
                          <p className="text-[11px] text-gray-500">PM: {p.pmName} | Client: {p.clientName}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${textColors[p.status]}`}>
                          {p.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1 font-semibold text-gray-600">
                          <span>Progres: {pct}%</span>
                          <span>Deadline: {new Date(p.endDate).toLocaleDateString('id-ID', {day: 'numeric', month:'short'})}</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${statusColors[p.status]}`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hr' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card p-5 border-l-4 border-blue-500 text-center">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Karyawan Aktif</h4>
                <p className="text-3xl font-extrabold text-gray-800 mt-1">{activeEmployees.length}</p>
              </div>
              <div className="card p-5 border-l-4 border-emerald-500 text-center">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Hadir Hari Ini</h4>
                <p className="text-3xl font-extrabold text-emerald-600 mt-1">{presentToday}</p>
              </div>
              <div className="card p-5 border-l-4 border-orange-500 text-center">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Cuti Menunggu Approval</h4>
                <p className="text-3xl font-extrabold text-orange-600 mt-1">{pendingLeavesCount}</p>
              </div>
              <div className="card p-5 border-l-4 border-purple-500 text-center">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Lembur Menunggu Approval</h4>
                <p className="text-3xl font-extrabold text-purple-600 mt-1">{pendingOvertimesCount}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Attendance Logs */}
              <div className="card p-6">
                <h3 className="font-bold text-md mb-4 text-gray-800">Daftar Kehadiran Hari Ini</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500">
                      <tr>
                        <th className="px-4 py-2 font-semibold">Nama Karyawan</th>
                        <th className="px-4 py-2 font-semibold">Clock In</th>
                        <th className="px-4 py-2 font-semibold">Clock Out</th>
                        <th className="px-4 py-2 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendances.filter(a => a.date === todayStr).map(att => (
                        <tr key={att.id} className="border-b last:border-0 hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-semibold text-gray-800">{att.userName}</td>
                          <td className="px-4 py-3 text-emerald-600 font-semibold">
                            {att.clockIn ? new Date(att.clockIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {att.clockOut ? new Date(att.clockOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Active'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`badge uppercase text-[9px] ${att.status === 'present' ? 'badge-green' : 'badge-red'}`}>
                              {att.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {attendances.filter(a => a.date === todayStr).length === 0 && (
                        <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">Tidak ada log absen hari ini.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Employees List */}
              <div className="card p-6">
                <h3 className="font-bold text-md mb-4 text-gray-800">Database Karyawan (Roster)</h3>
                <div className="overflow-y-auto max-h-[250px] space-y-3">
                  {employees.map(e => (
                    <div key={e.id} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{e.name}</p>
                        <p className="text-[11px] text-gray-400">{e.role} | {e.div}</p>
                      </div>
                      <div className="text-right">
                        <span className={`badge uppercase text-[9px] ${e.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                          {e.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1">Gaji: {formatIDR(e.baseSalary)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="space-y-6">
            
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card p-6 bg-emerald-50 border border-emerald-100 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Pendapatan Terbayar</h4>
                  <h2 className="text-3xl font-extrabold text-emerald-700 mt-2">{formatIDR(totalRevenue)}</h2>
                </div>
                <p className="text-xs text-emerald-600 mt-4">Akumulasi invoice klien yang terbayar lunas.</p>
              </div>

              <div className="card p-6 bg-red-50 border border-red-100 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider">Total Pengeluaran Jurnal</h4>
                  <h2 className="text-3xl font-extrabold text-red-700 mt-2">{formatIDR(totalExpenses || 42150000)}</h2>
                </div>
                <p className="text-xs text-red-600 mt-4">Meliputi biaya operasional, gaji, dan kas keluar.</p>
              </div>

              <div className="card p-6 bg-blue-50 border border-blue-100 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider">Laba Bersih Perusahaan</h4>
                  <h2 className="text-3xl font-extrabold text-blue-700 mt-2">{formatIDR(netProfit || 32850000)}</h2>
                </div>
                <p className="text-xs text-blue-600 mt-4">Pemasukan dikurangi pengeluaran terdaftar.</p>
              </div>
            </div>

            {/* Quick Invoice Summary */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                <h3 className="font-bold text-md text-gray-800">Status Invoice Penagihan Klien</h3>
                <Link href="/ceo/finance" className="text-xs text-red-500 font-bold hover:underline">Kelola Finansial &rarr;</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Nomor Invoice</th>
                      <th className="px-4 py-2 font-semibold">Nama Klien</th>
                      <th className="px-4 py-2 font-semibold">Proyek</th>
                      <th className="px-4 py-2 font-semibold">Due Date</th>
                      <th className="px-4 py-2 font-semibold">Total Tagihan</th>
                      <th className="px-4 py-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.id} className="border-b last:border-0 hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-semibold text-gray-800">{inv.invoiceNumber}</td>
                        <td className="px-4 py-3 text-gray-700">{inv.clientName}</td>
                        <td className="px-4 py-3 text-gray-500">{inv.projectName}</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(inv.dueDate).toLocaleDateString('id-ID', {day: 'numeric', month:'short', year:'numeric'})}</td>
                        <td className="px-4 py-3 font-bold text-gray-800">{formatIDR(inv.total)}</td>
                        <td className="px-4 py-3">
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
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function CEODashboardView() {
  return (
    <Suspense fallback={
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header title="CEO Dashboard" subtitle="Agregasi Kinerja Perusahaan Terpadu & Real-time" />
        <div className="max-w-7xl mx-auto w-full p-6 flex-1 text-center py-12 text-gray-500">
          Memuat Dashboard CEO...
        </div>
      </div>
    }>
      <CEODashboardContent />
    </Suspense>
  );
}
