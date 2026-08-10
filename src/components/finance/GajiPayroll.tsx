'use client';
import React, { useState, useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Plus, XCircle, ChevronDown, FileText, RefreshCw, Printer, CheckCircle, Award, UserCheck } from 'lucide-react';
import { useFinanceStore, PayrollHistory } from '@/lib/store/financeStore';
import { useHRStore } from '@/lib/store/hrStore';
import { createPortal } from 'react-dom';

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

interface GajiPayrollProps {
  filterType?: 'Full-Time' | 'Freelance' | 'All';
  mode?: 'summary' | 'input' | 'slip';
}

export function GajiPayroll({ filterType = 'All', mode }: GajiPayrollProps = {}) {
  const [gajiSubTab, setGajiSubTab] = useState<'summary' | 'input'>(mode === 'input' || mode === 'slip' ? 'input' : 'summary');
  const [isGajiModalOpen, setIsGajiModalOpen] = useState(false);
  const [selectedSlipPayroll, setSelectedSlipPayroll] = useState<PayrollHistory | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [slipEmployeeId, setSlipEmployeeId] = useState<string>('e1'); // Default for Slip Gaji (Detail) mode
  
  const [gajiFilterYear, setGajiFilterYear] = useState(new Date().getFullYear().toString());
  const [isMonthSelectOpen, setIsMonthSelectOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  
  const [isYearSelectOpen, setIsYearSelectOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const yearsList = Array.from({length: 10}, (_, i) => 2024 + i);

  const { employees, overtimes } = useHRStore();
  const { payrolls, addPayroll, syncHRPayrolls, updatePayrollStatus } = useFinanceStore();

  const [formUserId, setFormUserId] = useState('');
  const [formNominal, setFormNominal] = useState(0);

  const formatRupiah = (amount: number) => {
    if (!amount || amount === 0) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 2 }).format(amount).replace(/\s/g, '');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Item 4.2: Direct HR-to-Finance Payroll Link
  const handleSyncHRPayroll = () => {
    const hrPayrolls: PayrollHistory[] = employees.map(emp => {
      const monthIndex = new Date().getMonth();
      const monthStr = (monthIndex + 1).toString().padStart(2, '0');
      const yearStr = new Date().getFullYear().toString();
      
      const approvedOvertimes = overtimes.filter(ot =>
        (ot.userId === emp.id || ot.userName === emp.name) &&
        ot.status === 'approved' &&
        ot.date.startsWith(`${yearStr}-${monthStr}`)
      );
      const totalOtHours = approvedOvertimes.reduce((s, o) => s + (o.durationHours || 0), 0);
      const overtimePay = totalOtHours * 50000;
      const baseSalary = emp.baseSalary || 8000000;
      const allowance = 1000000;
      const deductions = Math.round((baseSalary + allowance) * 0.03); // 3% BPJS/Tax
      const netPay = baseSalary + allowance + overtimePay - deductions;

      return {
        id: `hr_pay_${emp.id}_${new Date().getFullYear()}_${monthIndex}`,
        userId: emp.id,
        userName: emp.name,
        department: emp.div || 'Operations',
        month: MONTHS[monthIndex],
        year: new Date().getFullYear(),
        baseSalary,
        allowance,
        overtimePay,
        deductions,
        netPay,
        status: 'pending' as const
      };
    });

    syncHRPayrolls(hrPayrolls);
    showToast(`⚡ Berhasil mensinkronkan ${hrPayrolls.length} data payroll langsung dari HR!`);
  };

  // Build the dynamic summary data
  const summaryData = useMemo(() => {
    return employees.map(emp => {
      const empPayrolls = payrolls.filter(p => p.userId === emp.id && p.year.toString() === gajiFilterYear);
      
      const row: any = {
        div: emp.div,
        class: emp.type,
        name: emp.name,
      };

      MONTHS.forEach(m => {
        const pay = empPayrolls.find(p => p.month === m);
        row[m.toLowerCase()] = pay ? pay.netPay : 0;
      });
      
      const thr = empPayrolls.find(p => p.month === 'THR');
      row['thr'] = thr ? thr.netPay : 0;

      return row;
    }).sort((a, b) => a.div.localeCompare(b.div));
  }, [employees, payrolls, gajiFilterYear]);

  const getColTotal = (data: any[], key: string, filterFt = false) => {
    let sum = 0;
    for (let r of data) {
      if (filterFt && r.class !== 'Full-Time') continue;
      sum += (r[key] as number) || 0;
    }
    return sum;
  };

  const handleAutoCalculate = (userId: string) => {
    const emp = employees.find(e => e.id === userId);
    if (!emp) return;

    const monthIndex = MONTHS.indexOf(selectedMonth);
    let totalOvertimeHours = 0;
    
    if (monthIndex >= 0) {
      const monthStr = (monthIndex + 1).toString().padStart(2, '0');
      totalOvertimeHours = overtimes
        .filter(ot => ot.userId === userId && ot.status === 'approved' && ot.date.startsWith(`${selectedYear}-${monthStr}`))
        .reduce((sum, ot) => sum + ot.durationHours, 0);
    }

    const overtimeRate = 50000;
    const overtimePay = totalOvertimeHours * overtimeRate;
    
    const base = emp.baseSalary || 8000000;
    setFormNominal(base + overtimePay);
  };

  const handleAddPayroll = () => {
    const emp = employees.find(e => e.id === formUserId);
    if (!emp || formNominal <= 0) return;

    const baseSalary = emp.baseSalary || 8000000;
    const allowance = 1000000;
    const overtimePay = Math.max(0, formNominal - baseSalary);
    const deductions = Math.round((baseSalary + allowance) * 0.03);

    const newPayroll: PayrollHistory = {
      id: 'pay_' + Date.now(),
      userId: emp.id,
      userName: emp.name,
      department: emp.div,
      month: selectedMonth,
      year: parseInt(selectedYear),
      baseSalary,
      allowance,
      overtimePay,
      deductions,
      netPay: formNominal,
      status: 'paid'
    };

    addPayroll(newPayroll);
    setIsGajiModalOpen(false);
    setFormUserId('');
    setFormNominal(0);
    showToast(`✅ Gaji untuk ${emp.name} berhasil dicatat & jurnal terposting!`);
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Toast Notif */}
      {toastMessage && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-semibold rounded-xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)}><XCircle size={16} /></button>
        </div>
      )}

      {/* Header & Direct Link Sync */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Gaji Team &amp; Freelance</h2>
          <p className="text-xs text-gray-500">Integrasi Direct HR-to-Finance Payroll &amp; Slip Gaji PDF</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Item 4.2: Direct HR Sync Button */}
          <button
            onClick={handleSyncHRPayroll}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition-opacity"
          >
            <RefreshCw size={14} className="animate-spin-slow" /> ⚡ Direct HR Payroll Sync
          </button>
          
          {gajiSubTab === 'summary' && (
            <select 
              value={gajiFilterYear} 
              onChange={e => setGajiFilterYear(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium focus:ring-red-500 focus:border-red-500 bg-white"
            >
              {yearsList.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          )}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setGajiSubTab('summary')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${gajiSubTab === 'summary' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >Summary Payroll</button>
            <button 
              onClick={() => setGajiSubTab('input')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${gajiSubTab === 'input' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >Daftar Slip &amp; Input</button>
          </div>
        </div>
      </div>

      {gajiSubTab === 'summary' ? (
        <div className="card p-0 overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#1a365d] text-white">
              <tr>
                <th className="px-4 py-3 font-semibold border-r border-blue-900 sticky left-0 z-10 bg-[#1a365d]">Divisi</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-900">Class</th>
                <th className="px-4 py-3 font-semibold border-r border-blue-900">Nama</th>
                <th className="px-4 py-3 font-semibold">Januari</th>
                <th className="px-4 py-3 font-semibold">Februari</th>
                <th className="px-4 py-3 font-semibold">Maret</th>
                <th className="px-4 py-3 font-semibold">THR</th>
                <th className="px-4 py-3 font-semibold">April</th>
                <th className="px-4 py-3 font-semibold">Mei</th>
                <th className="px-4 py-3 font-semibold">Juni</th>
                <th className="px-4 py-3 font-semibold">Juli</th>
                <th className="px-4 py-3 font-semibold">Agustus</th>
                <th className="px-4 py-3 font-semibold">September</th>
                <th className="px-4 py-3 font-semibold">Oktober</th>
                <th className="px-4 py-3 font-semibold">November</th>
                <th className="px-4 py-3 font-semibold">Desember</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {summaryData.map((row, i) => {
                const prevRow = i > 0 ? summaryData[i - 1] : null;
                const isNewDiv = !prevRow || prevRow.div !== row.div;
                const rowspan = summaryData.filter(r => r.div === row.div).length;

                return (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    {isNewDiv && (
                      <td rowSpan={rowspan} className="px-4 py-3 font-bold bg-white sticky left-0 z-10 border-r border-gray-200 shadow-[inset_-1px_0_0_rgba(0,0,0,0.1)] align-top">{row.div}</td>
                    )}
                    <td className="px-4 py-2 border-r">{row.class}</td>
                    <td className="px-4 py-2 border-r font-medium">{row.name}</td>
                    <td className="px-4 py-2 text-right">{formatRupiah(row.januari)}</td>
                    <td className="px-4 py-2 text-right">{formatRupiah(row.februari)}</td>
                    <td className="px-4 py-2 text-right">{formatRupiah(row.maret)}</td>
                    <td className="px-4 py-2 text-right">{formatRupiah(row.thr)}</td>
                    <td className="px-4 py-2 text-right">{formatRupiah(row.april)}</td>
                    <td className="px-4 py-2 text-right">{formatRupiah(row.mei)}</td>
                    <td className="px-4 py-2 text-right">{formatRupiah(row.juni)}</td>
                    <td className="px-4 py-2 text-right">{formatRupiah(row.juli)}</td>
                    <td className="px-4 py-2 text-right">{formatRupiah(row.agustus)}</td>
                    <td className="px-4 py-2 text-right">{formatRupiah(row.september)}</td>
                    <td className="px-4 py-2 text-right">{formatRupiah(row.oktober)}</td>
                    <td className="px-4 py-2 text-right">{formatRupiah(row.november)}</td>
                    <td className="px-4 py-2 text-right">{formatRupiah(row.desember)}</td>
                  </tr>
                );
              })}
              <tr className="bg-[#e2efda] font-bold border-b">
                <td colSpan={3} className="px-4 py-3 border-r sticky left-0 z-10 bg-[#e2efda]">Total Gaji Full-time</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'januari', true))}</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'februari', true))}</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'maret', true))}</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'thr', true))}</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'april', true))}</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'mei', true))}</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'juni', true))}</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'juli', true))}</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'agustus', true))}</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'september', true))}</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'oktober', true))}</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'november', true))}</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'desember', true))}</td>
              </tr>
              <tr className="bg-[#f2dcdb] font-bold border-b text-red-900">
                <td colSpan={3} className="px-4 py-3 border-r sticky left-0 z-10 bg-[#f2dcdb]">Total Gaji Keseluruhan</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'januari'))}</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'februari'))}</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'maret'))}</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'thr'))}</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'april'))}</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'mei'))}</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'juni'))}</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'juli'))}</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'agustus'))}</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'september'))}</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'oktober'))}</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'november'))}</td>
                <td className="px-4 py-3 text-right">{formatRupiah(getColTotal(summaryData, 'desember'))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card p-6">
          <div className="flex justify-between items-center border-b pb-4 mb-4 flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-gray-900">Daftar Input Gaji &amp; Slip Karyawan</h3>
              <p className="text-xs text-gray-500">Mencatat pembayaran bulanan, sync HR, dan cetak Rincian Slip Gaji</p>
            </div>
            <button onClick={() => setIsGajiModalOpen(true)} className="btn-primary text-xs flex items-center gap-2">
              <Plus size={14}/> Tambah Gaji Manual
            </button>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-gray-600 font-semibold">Tipe</th>
                <th className="px-4 py-3 text-gray-600 font-semibold">Nama / Penerima</th>
                <th className="px-4 py-3 text-gray-600 font-semibold">Bulan / Periode</th>
                <th className="px-4 py-3 text-gray-600 font-semibold text-right">Gaji Bersih (THP)</th>
                <th className="px-4 py-3 text-gray-600 font-semibold text-center">Status</th>
                <th className="px-4 py-3 text-gray-600 font-semibold text-center">Aksi &amp; Slip Gaji</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map(pay => {
                const emp = employees.find(e => e.id === pay.userId);
                return (
                  <tr key={pay.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-1 rounded uppercase font-bold ${emp?.type === 'Freelance' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {emp?.type || 'Full-Time'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{pay.userName}</td>
                    <td className="px-4 py-3 text-gray-600">{pay.month} {pay.year}</td>
                    <td className="px-4 py-3 font-bold text-right text-gray-900">{formatCurrency(pay.netPay)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] px-2 py-1 rounded uppercase font-bold ${pay.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {pay.status === 'paid' ? 'Terbayar' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Item 4.1: View Slip Gaji Button */}
                        <button
                          onClick={() => setSelectedSlipPayroll(pay)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-200 hover:bg-blue-100"
                        >
                          <FileText size={12} /> Slip Gaji
                        </button>
                        
                        {pay.status === 'pending' && (
                          <button
                            onClick={() => {
                              updatePayrollStatus(pay.id, 'paid');
                              showToast(`✅ Status Gaji ${pay.userName} diubah ke Terbayar & Jurnal dibuat!`);
                            }}
                            className="text-xs bg-green-50 text-green-600 px-2.5 py-1 rounded-lg hover:bg-green-100 font-bold border border-green-200"
                          >
                            Bayar &amp; Jurnal
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {payrolls.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-400">Belum ada riwayat penggajian. Klik "⚡ Direct HR Payroll Sync" untuk mensinkronkan data.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Item 4.1: SLIP GAJI DETAILED MODAL (PRINTABLE PDF) */}
      {selectedSlipPayroll && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 text-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 no-print">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" /> Rincian Komponen Slip Gaji
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 font-bold"
                >
                  <Printer size={14} /> Cetak / Export PDF
                </button>
                <button onClick={() => setSelectedSlipPayroll(null)} className="text-gray-400 hover:text-gray-600">
                  <XCircle size={20} />
                </button>
              </div>
            </div>

            {/* Slip Document Header */}
            <div className="border border-gray-200 rounded-xl p-5 space-y-4 bg-white">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <h2 className="text-xl font-black text-blue-900 tracking-tight">BERTUMBUH CREATIVE</h2>
                  <p className="text-xs text-gray-500">PT Bertumbuh Digital Indonesia</p>
                  <p className="text-xs font-semibold text-gray-700 mt-1">SLIP GAJI KARYAWAN</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                    Periode: {selectedSlipPayroll.month} {selectedSlipPayroll.year}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1">ID: {selectedSlipPayroll.id}</p>
                </div>
              </div>

              {/* Employee Info */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-lg">
                <div>
                  <span className="text-gray-400 block text-[10px]">NAMA KARYAWAN</span>
                  <span className="font-bold text-gray-900 text-sm">{selectedSlipPayroll.userName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">DIVISI / DEPARTEMEN</span>
                  <span className="font-semibold text-gray-800">{selectedSlipPayroll.department || 'Operations'}</span>
                </div>
              </div>

              {/* Salary Breakdown Table */}
              <div className="space-y-3 text-xs">
                <div className="border-b pb-2">
                  <p className="font-bold text-emerald-700 uppercase text-[11px] mb-1">A. KOMPONEN PENERIMAAN (+)</p>
                  <div className="space-y-1 pl-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gaji Pokok</span>
                      <span className="font-medium">{formatCurrency(selectedSlipPayroll.baseSalary || 8000000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tunjangan Operasional / Transport</span>
                      <span className="font-medium">{formatCurrency(selectedSlipPayroll.allowance || 1000000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uang Lembur (Approved HR)</span>
                      <span className="font-medium text-emerald-600">+{formatCurrency(selectedSlipPayroll.overtimePay || 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-b pb-2">
                  <p className="font-bold text-red-700 uppercase text-[11px] mb-1">B. POTONGAN (-)</p>
                  <div className="space-y-1 pl-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Potongan BPJS &amp; PPh 21 Est.</span>
                      <span className="font-medium text-red-600">-{formatCurrency(selectedSlipPayroll.deductions || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Net Pay Total */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-emerald-900 uppercase block">GAJI BERSIH (TAKE HOME PAY)</span>
                    <span className="text-[10px] text-emerald-700">Sudah ditransfer ke rekening karyawan</span>
                  </div>
                  <span className="text-xl font-black text-emerald-700">
                    {formatCurrency(selectedSlipPayroll.netPay)}
                  </span>
                </div>
              </div>

              {/* Digital Signatures */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-center text-xs">
                <div>
                  <p className="text-gray-400 text-[10px]">Disetujui oleh Finance</p>
                  <div className="h-10 flex items-center justify-center text-gray-300 italic">Signed Digitally</div>
                  <p className="font-bold text-gray-800">Hadi Nugroho</p>
                  <p className="text-[10px] text-gray-400">Finance Manager</p>
                </div>
                <div>
                  <p className="text-gray-400 text-[10px]">Penerima</p>
                  <div className="h-10 flex items-center justify-center text-gray-300 italic">Signed Digitally</div>
                  <p className="font-bold text-gray-800">{selectedSlipPayroll.userName}</p>
                  <p className="text-[10px] text-gray-400">Karyawan</p>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Gaji Add Manual Modal */}
      {isGajiModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-800">Tambah Data Gaji</h3>
              <button onClick={() => setIsGajiModalOpen(false)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Karyawan</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
                  value={formUserId}
                  onChange={(e) => {
                    setFormUserId(e.target.value);
                    handleAutoCalculate(e.target.value);
                  }}
                >
                  <option value="" disabled>Pilih Karyawan...</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.type} - {e.div})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
                    <button 
                      type="button"
                      onClick={() => setIsMonthSelectOpen(!isMonthSelectOpen)}
                      className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
                    >
                      {selectedMonth}
                      <ChevronDown size={16} className="text-gray-400" />
                    </button>
                    {isMonthSelectOpen && (
                      <div className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                        <button 
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm font-bold bg-green-50 text-green-700 hover:bg-green-100 border-b border-gray-100"
                          onClick={() => { setSelectedMonth('THR'); setIsMonthSelectOpen(false); handleAutoCalculate(formUserId); }}
                        >
                          THR
                        </button>
                        <div className="max-h-[110px] overflow-y-auto">
                          {MONTHS.map(m => (
                            <button 
                              key={m}
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700"
                              onClick={() => { setSelectedMonth(m); setIsMonthSelectOpen(false); handleAutoCalculate(formUserId); }}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                    <button 
                      type="button"
                      onClick={() => setIsYearSelectOpen(!isYearSelectOpen)}
                      className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
                    >
                      {selectedYear}
                      <ChevronDown size={16} className="text-gray-400" />
                    </button>
                    {isYearSelectOpen && (
                      <div className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                        <div className="max-h-[110px] overflow-y-auto">
                          {yearsList.map(y => (
                            <button 
                              key={y}
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700"
                              onClick={() => { setSelectedYear(y.toString()); setIsYearSelectOpen(false); handleAutoCalculate(formUserId); }}
                            >
                              {y}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nominal THP (Rp)</label>
                  <input 
                    type="number" 
                    placeholder="Contoh: 3000000" 
                    value={formNominal}
                    onChange={(e) => setFormNominal(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" 
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Dihitung otomatis: Gaji Pokok + Lembur</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsGajiModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
              <button 
                onClick={handleAddPayroll} 
                disabled={!formUserId || formNominal <= 0}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-sm disabled:opacity-50"
              >
                Bayar &amp; Masukkan Jurnal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

