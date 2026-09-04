'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard, TrendingUp, Users, FolderKanban,
  UserCheck, Settings, ChevronRight, LogOut, Layers, CalendarDays,
  FileText, Clock, Send, CreditCard, Receipt, Building, FileSpreadsheet, DollarSign, Calculator, UserMinus, ShieldCheck, Activity, Server, BookOpen, LucideIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS_MAP } from '@/lib/permissions';

interface NavSubItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  subItems?: NavSubItem[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { session, logout, primaryRole } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r bg-white dark:bg-slate-900" />;
  }

  // Define menus dynamically based on primaryRole
  let navItems: NavItem[] = [];
  
  if (primaryRole === 'owner') {
    navItems = [
      { label: 'Ringkasan Eksekutif', href: '/ceo/dashboard?tab=summary', icon: ShieldCheck },
      { label: 'Kelola User & Hak Akses', href: '/super_admin?tab=users', icon: Users },
      { label: 'Log Aktivitas (Audit)', href: '/super_admin?tab=activity-logs', icon: Activity },
      { label: 'Status System & Health', href: '/super_admin?tab=system-status', icon: Server },
      { label: 'CRM & Prospek Klien', href: '/ceo/dashboard?tab=crm', icon: TrendingUp },
      { label: 'PM & Operasional Proyek', href: '/ceo/dashboard?tab=pm', icon: FolderKanban },
      { label: 'HR & Kehadiran Tim', href: '/ceo/dashboard?tab=hr', icon: Users },
      { label: 'Arus Kas & Keuangan', href: '/ceo/dashboard?tab=finance', icon: DollarSign },
      { label: 'Kalender Global', href: '/ceo/calendar', icon: CalendarDays },
      { label: 'Otorisasi Finansial', href: '/ceo/finance', icon: CreditCard },
      { label: 'Laporan Perusahaan', href: '/ceo/reports', icon: FileSpreadsheet },
    ];
  } else if (primaryRole === 'super_admin') {
    navItems = [
      { label: 'Kelola User & Hak Akses', href: '/super_admin?tab=users', icon: Users },
      { label: 'Log Aktivitas (Audit)', href: '/super_admin?tab=activity-logs', icon: Activity },
      { label: 'Status System & Health', href: '/super_admin?tab=system-status', icon: Server },
    ];
  } else if (primaryRole === 'team_member') {
    navItems = [
      { label: 'Dashboard', href: '/team_member/dashboard', icon: LayoutDashboard },
      { label: 'Manajemen Proyek', href: '/team_member/projects', icon: FolderKanban },
      { label: 'Pengajuan Lembur', href: '/team_member/overtime', icon: Clock },
      { label: 'Pengajuan Cuti', href: '/team_member/cuti', icon: UserMinus },
      { label: 'Reimbursement', href: '/team_member/reimbursement', icon: CreditCard },
      { label: 'Kalender Global', href: '/team_member/calendar', icon: CalendarDays },
      { label: 'Pengaturan', href: '/team_member/settings', icon: Settings },
    ];
  } else if (primaryRole === 'pm') {
    navItems = [
      { label: 'PM Dashboard', href: '/pm/dashboard', icon: Layers },
      { label: 'Manajemen Proyek', href: '/pm/projects', icon: FolderKanban },
      { label: 'Approval Cuti', href: '/pm/cuti', icon: UserCheck },
      { label: 'Kalender Global', href: '/pm/calendar', icon: CalendarDays },
      { label: 'Report Klien', href: '/pm/reports', icon: FileText },
      { label: 'Pengaturan', href: '/pm/settings', icon: Settings },
    ];
  } else if (primaryRole === 'hr') {
    navItems = [
      { label: 'HR Dashboard', href: '/hr/dashboard', icon: UserCheck, subItems: [
          { label: 'Matriks Alokasi Tim', href: '/hr/dashboard?tab=matrix' },
          { label: 'Guarding Cuti PM', href: '/hr/dashboard?tab=guarding_cuti' },
          { label: 'HR Performance & Overdue', href: '/hr/dashboard?tab=performance_tracking' },
          { label: 'Dashboard Performa KPI', href: '/hr/dashboard?tab=kpi' },
          { label: 'Cuti & Absen', href: '/hr/dashboard?tab=cuti' },
          { label: 'Payroll Gaji Bulanan', href: '/hr/dashboard?tab=payroll_bulanan' },
          { label: 'Payroll Fee Freelance', href: '/hr/dashboard?tab=payroll_freelance' },
          { label: 'Absen Lembur', href: '/hr/dashboard?tab=lembur' },
          { label: 'Slip Gaji (Detail)', href: '/hr/dashboard?tab=slip' },
        ]
      },
      { label: 'Approval Lembur', href: '/hr/overtime', icon: Clock },
      { label: 'Approval Cuti', href: '/hr/cuti', icon: UserMinus },
      { label: 'Database Karyawan', href: '/hr/employees', icon: Users },
      { label: 'Kalender Global', href: '/hr/calendar', icon: CalendarDays },
      { label: 'Pengaturan', href: '/hr/settings', icon: Settings },
    ];
  } else if (primaryRole === 'finance') {
    navItems = [
      { label: 'Dashboard Finance', href: '/finance/dashboard', icon: DollarSign },
      { label: 'Accounting', href: '/finance/accounting', icon: Calculator, subItems: [
          { label: 'Input Jurnal & Simulasi', href: '/finance/accounting?tab=input' },
          { label: 'Master COA', href: '/finance/accounting?tab=coa' },
          { label: 'Buku Besar per Akun', href: '/finance/accounting?tab=buku_besar' },
          { label: 'Revenue Klien', href: '/finance/accounting?tab=client_revenue' },
          { label: 'Arus Kas (3 Aktivitas)', href: '/finance/accounting?tab=cash_flow' },
          { label: 'Reporting Multi-Periode', href: '/finance/accounting?tab=multi_period' },
          { label: 'Laporan BOD', href: '/finance/accounting?tab=bod_report' },
          { label: 'Neraca Saldo', href: '/finance/accounting?tab=neraca_saldo' },
          { label: 'Laporan L/R', href: '/finance/accounting?tab=laba_rugi' },
          { label: 'Laporan Posisi Keuangan', href: '/finance/accounting?tab=posisi_keuangan' },
          { label: 'Laporan Modal', href: '/finance/accounting?tab=modal' },
        ] 
      },
      { label: 'Penagihan Piutang', href: '/finance/dashboard?tab=penagihan', icon: Send },
      { label: 'Invoice Payment', href: '/finance/dashboard?tab=invoice_payment', icon: Receipt },
      { label: 'Reimburs Tim', href: '/finance/dashboard?tab=reimburs', icon: CreditCard },
      { label: 'Gaji & Freelance', href: '/finance/dashboard?tab=gaji', icon: Users },
      { label: 'Pengeluaran Vendor', href: '/finance/dashboard?tab=vendor', icon: Building },
      { label: 'Pajak', href: '/finance/dashboard?tab=pajak', icon: FileSpreadsheet },
      { label: 'Kalender Global', href: '/finance/calendar', icon: CalendarDays },
      { label: 'Pengaturan', href: '/finance/settings', icon: Settings },
    ];
  } else if (primaryRole === 'ae') {
    navItems = [
      { label: 'Summary', href: '/crm/dashboard', icon: TrendingUp },
      { label: 'Listing Prospek New Client', href: '/crm/dashboard?tab=prospek', icon: Users },
      { label: 'Prospek Offline & Online', href: '/crm/dashboard?tab=offline-online', icon: TrendingUp },
      { label: 'Bikin Strategi Package', href: '/crm/dashboard?tab=strategi', icon: Layers },
      { label: 'Propose & Pitching Client', href: '/crm/dashboard?tab=pitching', icon: Send },
      { label: 'Quotation (Penawaran)', href: '/crm/dashboard?tab=penawaran', icon: FileText },
      { label: 'Generate Kontrak', href: '/crm/dashboard?tab=kontrak', icon: FileText },
      { label: 'Manajemen Klien', href: '/crm/clients', icon: Users },
      { label: 'Kalender Global', href: '/crm/calendar', icon: CalendarDays },
      { label: 'Pengaturan', href: '/crm/settings', icon: Settings },
    ];
  } else {
    // Fallback or generic
    navItems = [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ];
  }

  // Always attach Manual Guide for all roles
  navItems.push({ label: 'Panduan Pengguna', href: '/manualguide', icon: BookOpen });

  const roleLabel = primaryRole ? (ROLE_LABELS_MAP[primaryRole] ?? primaryRole) : '';

  return (
    <aside className="fixed inset-y-0 left-0 w-56 flex flex-col z-50"
      style={{ background: 'var(--sidebar-bg)' }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'var(--red)' }}>
          <span className="text-white font-bold text-sm">B</span>
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">Bertumbuh</p>
          <p className="text-xs leading-tight" style={{ color: 'var(--sidebar-text)' }}>Agency ERP</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const { label, href, icon: Icon, subItems } = item;
          let active = false;
          if (href.includes('?tab=')) {
            const [pathPart, queryPart] = href.split('?');
            const tabVal = queryPart.replace('tab=', '');
            const currentTab = searchParams?.get('tab');
            active = pathname === pathPart && (currentTab === tabVal || (!currentTab && tabVal === 'summary'));
          } else {
            const hasTabQuery = searchParams && searchParams.has('tab');
            active = (pathname === href || pathname.startsWith(href + '/')) && !hasTabQuery;
          }

          if (subItems) {
            // Check if any subitem is active
            const isSubItemActive = subItems.some((sub) => {
              if (sub.href.includes('?tab=')) {
                const [pathPart, queryPart] = sub.href.split('?');
                const tabVal = queryPart.replace('tab=', '');
                const currentTab = searchParams?.get('tab');
                return pathname === pathPart && (currentTab === tabVal || (!currentTab && tabVal === 'summary'));
              }
              return pathname === sub.href;
            });
            const anyActive = active || isSubItemActive;

            return (
              <div key={href} className="relative group">
                <Link href={href}
                  className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: anyActive ? 'var(--sidebar-active-bg)' : 'transparent',
                    color: anyActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
                  }}
                  onMouseEnter={e => { if (!anyActive) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-text-hover)'; } }}
                  onMouseLeave={e => { if (!anyActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-text)'; } }}
                >
                  {anyActive && (
                    <div className="absolute left-0 w-0.5 h-6 rounded-r"
                      style={{ background: 'var(--red)' }} />
                  )}
                  <Icon size={16} style={{ color: anyActive ? 'var(--red)' : 'inherit', opacity: anyActive ? 1 : 0.7 }} />
                  <span className="flex-1 text-[13px]">{label}</span>
                  <ChevronRight size={13} className={`opacity-50 transition-transform ${isSubItemActive ? 'rotate-90' : 'group-hover:rotate-90'}`} />
                </Link>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSubItemActive ? 'max-h-[300px]' : 'max-h-0 group-hover:max-h-[300px]'}`}>
                  <div className="pt-1 pb-1 pl-9 space-y-0.5">
                    {subItems.map((sub) => {
                      let subActive = false;
                      if (sub.href.includes('?tab=')) {
                        const [pathPart, queryPart] = sub.href.split('?');
                        const tabVal = queryPart.replace('tab=', '');
                        subActive = pathname === pathPart && searchParams?.get('tab') === tabVal;
                      } else {
                        subActive = pathname === sub.href;
                      }
                      return (
                        <Link key={sub.href} href={sub.href}
                          className="block px-2 py-1.5 rounded-md text-[12px] font-medium transition-colors"
                          style={{
                            color: subActive ? '#fff' : 'var(--sidebar-text)',
                            background: subActive ? 'rgba(255,255,255,0.1)' : 'transparent'
                          }}
                          onMouseEnter={e => { if (!subActive) (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-text-hover)'; }}
                          onMouseLeave={e => { if (!subActive) (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-text)'; }}
                        >
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <Link key={href} href={href}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: active ? 'var(--sidebar-active-bg)' : 'transparent',
                color: active ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
              }}
              onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-text-hover)'; } }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-text)'; } }}
            >
              {active && (
                <div className="absolute left-0 w-0.5 h-6 rounded-r"
                  style={{ background: 'var(--red)' }} />
              )}
              <Icon size={16} style={{ color: active ? 'var(--red)' : 'inherit', opacity: active ? 1 : 0.7 }} />
              <span className="text-[13px]">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="p-4 mx-3 mb-4 rounded-xl relative" style={{ background: 'rgba(0,0,0,0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm font-bold text-sm"
            style={{ background: 'var(--red-dim2)', color: 'var(--red)', borderColor: 'var(--red-dim)' }}>
            {session?.name ? session.name.charAt(0) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">{session?.name || 'Loading...'}</p>
            <p className="text-[11px] mt-0.5 truncate uppercase tracking-wider font-semibold"
              style={{ color: 'var(--red)' }}>
              {roleLabel}
            </p>
          </div>
        </div>
        
        <button onClick={logout} className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/10 text-white/70 hover:text-white">
          <LogOut size={14} /> Keluar
        </button>
      </div>
    </aside>
  );
}
