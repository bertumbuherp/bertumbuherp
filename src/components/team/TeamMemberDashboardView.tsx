'use client';

import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useHRStore } from '@/lib/store/hrStore';
import { Clock, CalendarDays, CheckCircle, LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function TeamMemberDashboardView() {
  const { session } = useAuth();
  const { attendances, clockIn, clockOut, leaves, overtimes } = useHRStore();

  if (!session) return null;

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendances.find(a => a.userId === session.userId && a.date === today);
  const isClockedIn = !!todayAttendance?.clockIn;
  const isClockedOut = !!todayAttendance?.clockOut;

  const handleClockInOut = () => {
    if (!todayAttendance) {
      clockIn(session.userId, session.name);
    } else if (!todayAttendance.clockOut) {
      clockOut(session.userId);
    }
  };

  // Calculate Leave Balance
  const myLeaves = leaves.filter(l => (l.userId === session.userId || l.userName === session.name) && l.status === 'approved_hr');
  const usedLeaves = myLeaves.reduce((sum, l) => sum + (l.durationDays || 0), 0);
  const leaveBalance = 12 - usedLeaves;

  // Calculate Overtime this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const myOvertimes = overtimes.filter(o => {
    const d = new Date(o.date);
    return (o.userId === session.userId || o.userName === session.name) && 
           o.status === 'approved' && 
           d.getMonth() === currentMonth && 
           d.getFullYear() === currentYear;
  });
  const totalOvertimeHours = myOvertimes.reduce((sum, o) => sum + (o.durationHours || 0), 0);

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header title="Dashboard" subtitle={`Selamat datang, ${session.name}!`} />
      
      <div className="p-6 flex-1 max-w-7xl mx-auto w-full space-y-6 fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 card p-8 flex flex-col items-center justify-center text-center border-t-4 border-red-500 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><Clock size={120}/></div>
            <h3 className="text-gray-500 font-semibold mb-6 z-10">Time Tracker Kehadiran</h3>
            
            <div className="mb-8 z-10">
              <p className="text-4xl font-black text-gray-800 tracking-tight">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-sm font-medium text-gray-500 mt-1">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {isClockedOut ? (
              <div className="w-full py-4 px-6 bg-gray-100 rounded-xl border border-gray-200 text-gray-500 font-bold flex items-center justify-center gap-2 z-10">
                <CheckCircle size={20} /> Shift Selesai
              </div>
            ) : (
              <button 
                onClick={handleClockInOut}
                className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] z-10 ${
                  isClockedIn ? 'bg-orange-500 hover:bg-orange-600' : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                {isClockedIn ? <><LogOut size={20}/> Clock Out</> : <><LogIn size={20}/> Clock In</>}
              </button>
            )}

            <div className="w-full mt-6 grid grid-cols-2 gap-4 text-left z-10 border-t pt-4">
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-bold">In</p>
                <p className="text-sm font-semibold text-emerald-600">{todayAttendance?.clockIn ? new Date(todayAttendance.clockIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-bold">Out</p>
                <p className="text-sm font-semibold text-orange-600">{todayAttendance?.clockOut ? new Date(todayAttendance.clockOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-5 border flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <CalendarDays size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Sisa Kuota Cuti</p>
                  <p className="text-2xl font-bold text-gray-800">{leaveBalance} Hari</p>
                </div>
              </div>
              <div className="card p-5 border flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Total Jam Lembur</p>
                  <p className="text-2xl font-bold text-gray-800">{totalOvertimeHours} Jam <span className="text-xs text-gray-400 font-medium">(Bulan ini)</span></p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold mb-4">Akses Cepat</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/team_member/cuti" className="p-4 border rounded-xl hover:border-red-500 hover:shadow-sm transition-all flex flex-col gap-3 group">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform"><CalendarDays size={20}/></div>
                  <div>
                    <p className="font-bold text-sm text-gray-800 group-hover:text-red-600">Ajukan Cuti/Sakit</p>
                    <p className="text-xs text-gray-500 mt-1">Buat pengajuan ketidakhadiran</p>
                  </div>
                </Link>
                <Link href="/team_member/overtime" className="p-4 border rounded-xl hover:border-red-500 hover:shadow-sm transition-all flex flex-col gap-3 group">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Clock size={20}/></div>
                  <div>
                    <p className="font-bold text-sm text-gray-800 group-hover:text-red-600">Catat Lembur</p>
                    <p className="text-xs text-gray-500 mt-1">Input jam lembur harian</p>
                  </div>
                </Link>
                <Link href="/team_member/reimbursement" className="p-4 border rounded-xl hover:border-red-500 hover:shadow-sm transition-all flex flex-col gap-3 group">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform"><span className="font-bold">$</span></div>
                  <div>
                    <p className="font-bold text-sm text-gray-800 group-hover:text-red-600">Reimbursement</p>
                    <p className="text-xs text-gray-500 mt-1">Klaim biaya operasional</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
