'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Users, Briefcase, FileText, CreditCard, ShieldAlert } from 'lucide-react';

const roles = [
  { 
    id: 'ae', label: 'AE (CRM)', icon: Users,
    menus: [
      { id: 'ae-dashboard', name: 'Dashboard CRM', desc: 'Ringkasan pipeline', detailDesc: 'Menampilkan funnel penjualan dan pencapaian target bulanan.', integrations: 'Mengambil total nilai kontrak berjalan.' },
      { id: 'ae-clients', name: 'Database Klien', desc: 'Master data klien', detailDesc: 'Manajemen kontak klien dan histori proyek aktif tiap klien.', integrations: 'Menyediakan referensi Master Klien untuk entitas Proyek (PM) dan Penagihan (Finance).' },
      { id: 'ae-projects', name: 'Deals Kanban', desc: 'Pipeline Penjualan', detailDesc: 'Papan drag-and-drop dari tahapan Lead hingga Closed Won.', integrations: 'Otomatis men-trigger pembuatan draf Proyek (PM) ketika deal statusnya disetujui (Won).' },
    ]
  },
  { 
    id: 'pm', label: 'Project Manager', icon: Briefcase,
    menus: [
      { id: 'pm-dashboard', name: 'Dashboard Operasional', desc: 'Status semua proyek', detailDesc: 'Memantau jumlah proyek aktif, yang tertunda (delayed), dan tugas tim yang butuh diperiksa.', integrations: 'Membaca status tasks (team) dan cuti pending.' },
      { id: 'pm-projects', name: 'Manajemen Proyek', desc: 'Papan Kanban tugas PM', detailDesc: 'Pembuatan milestones proyek dan penugasan spesifik ke anggota tim.', integrations: 'Tasks yang dibuat langsung muncul di dashboard Team Member. Menunggu tim submit evidence.' },
      { id: 'pm-cuti', name: 'Approval Cuti', desc: 'Filter izin level proyek', detailDesc: 'Berlaku sebagai pintu persetujuan pertama sebelum izin diteruskan ke HR.', integrations: 'Mengubah status cuti dari pending menjadi approved_pm.' },
    ]
  },
  { 
    id: 'team', label: 'Team Member', icon: ShieldAlert,
    menus: [
      { id: 'team-tasks', name: 'Papan Tugas', desc: 'Mengerjakan tugas PM', detailDesc: 'Kanban tugas pribadi, geser status In Progress ke Review dan wajib melampirkan link bukti hasil kerja.', integrations: 'Notifikasi status & link bukti otomatis terupdate di layar PM.' },
      { id: 'team-cuti', name: 'Cuti & Lembur', desc: 'Form pengajuan', detailDesc: 'Mencatat kehadiran harian dan form pengajuan izin/lembur.', integrations: 'Terkirim ke PM (untuk cuti) lalu ke HR. Kemudian jadi dasar hitungan Payroll (Finance).' },
      { id: 'team-reimburse', name: 'Reimbursement', desc: 'Klaim operasional', detailDesc: 'Upload struk/bukti transaksi terkait keperluan proyek (contoh: bensin, print, langganan software).', integrations: 'Langsung diverifikasi dan dibayarkan oleh bagian Finance.' },
    ]
  },
  { 
    id: 'hr', label: 'Human Resource', icon: FileText,
    menus: [
      { id: 'hr-dashboard', name: 'Verifikasi Absensi', desc: 'Approve final', detailDesc: 'Verifikasi final pengajuan cuti (yang telah di-approve PM) dan persetujuan lembur.', integrations: 'Approval ini menentukan uang lembur di sistem Payroll (Finance).' },
      { id: 'hr-payroll', name: 'Database Karyawan', desc: 'Data gaji & jabatan', detailDesc: 'Manajemen status keaktifan karyawan dan gaji pokok bulanan (Base Salary).', integrations: 'Sebagai Master Data acuan penggajian (Payroll) bulanan bagi modul Finance.' }
    ]
  },
  { 
    id: 'finance', label: 'Finance', icon: CreditCard,
    menus: [
      { id: 'fin-dashboard', name: 'Reimbursement', desc: 'Bayar klaim tim', detailDesc: 'Validasi kelayakan bukti klaim pengeluaran proyek dan eksekusi transfer pembayaran.', integrations: 'Mengubah status reimbursement dari Team Member menjadi "Dibayar".' },
      { id: 'fin-accounting', name: 'Invoicing', desc: 'Tagihan klien', detailDesc: 'Pencetakan invoice (tagihan) otomatis berdasarkan termin atau kontrak kesepakatan deal.', integrations: 'Menarik besaran nilai kontrak Master Klien dari CRM/PM.' },
      { id: 'fin-payroll', name: 'Payroll Auto-Calc', desc: 'Cetak Slip gaji', detailDesc: 'Kalkulasi otomatis Gaji Pokok + Uang Lembur - Potongan Absen.', integrations: 'Narik Base Salary (HR) + Total Lembur Approved (HR).' }
    ]
  }
];

const connections = [
  { source: 'ae-projects', target: 'pm-projects', label: 'Trigger Draf Proyek' },
  { source: 'pm-projects', target: 'team-tasks', label: 'Delegasi Tugas' },
  { source: 'team-tasks', target: 'pm-projects', label: 'Submit Evidence' },
  { source: 'team-cuti', target: 'pm-cuti', label: 'Req Cuti' },
  { source: 'pm-cuti', target: 'hr-dashboard', label: 'Approve Tahap 1' },
  { source: 'hr-dashboard', target: 'fin-payroll', label: 'Data Absensi' },
  { source: 'hr-payroll', target: 'fin-payroll', label: 'Gaji Pokok & Rate' },
  { source: 'team-reimburse', target: 'fin-dashboard', label: 'Klaim Biaya' },
];

export default function InteractiveFlow() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<any[]>([]);

  const calculatePaths = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const newPaths = connections.map(conn => {
      const srcEl = document.getElementById(conn.source);
      const tgtEl = document.getElementById(conn.target);
      if (!srcEl || !tgtEl) return null;

      const srcRect = srcEl.getBoundingClientRect();
      const tgtRect = tgtEl.getBoundingClientRect();

      let sx = srcRect.right - containerRect.left;
      let sy = srcRect.top + srcRect.height / 2 - containerRect.top;
      let ex = tgtRect.left - containerRect.left;
      let ey = tgtRect.top + tgtRect.height / 2 - containerRect.top;

      if (srcRect.left > tgtRect.left) {
        sx = srcRect.left - containerRect.left;
        ex = tgtRect.right - containerRect.left;
      }

      const dist = Math.abs(ex - sx) / 2;
      const d = `M ${sx} ${sy} C ${sx + dist} ${sy}, ${ex - dist} ${ey}, ${ex} ${ey}`;

      return {
        id: `${conn.source}-${conn.target}`,
        ...conn,
        d,
        midX: (sx + ex) / 2,
        midY: (sy + ey) / 2 - 10,
        isActive: activeMenu === conn.source || activeMenu === conn.target,
      };
    }).filter(Boolean);

    setPaths(newPaths);
  }, [activeMenu]);

  useEffect(() => {
    const timer = setTimeout(() => calculatePaths(), 100);
    window.addEventListener('resize', calculatePaths);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculatePaths);
    }
  }, [calculatePaths]);

  return (
    <div className="w-full bg-[#0a0a0a] py-20 px-4 md:px-12 overflow-hidden relative font-sans">
      <div className="max-w-6xl mx-auto text-center mb-16 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Pemetaan Fungsional ERP</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Klik pada menu manapun untuk melihat <strong>Detail Integrasi</strong> dan melihat persis bagaimana aliran data berlanjut antar-Modul Role.
        </p>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full max-w-[1400px] mx-auto min-h-[700px] border border-white/10 rounded-3xl bg-[#111111] overflow-visible shadow-2xl p-6 lg:p-12 flex flex-col md:flex-row gap-6 md:gap-8 justify-between"
      >
        <div className="absolute inset-0 z-0 rounded-3xl overflow-hidden" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
          <defs>
            <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="blurGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="rgba(255,255,255,0.2)" />
            </marker>
            <marker id="arrowhead-active" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#10b981" />
            </marker>
          </defs>
          
          {paths.map((p, idx) => (
            <g key={idx}>
              <path 
                d={p.d} 
                fill="none" 
                stroke="rgba(255,255,255,0.08)" 
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
              
              {p.isActive && (
                <path 
                  d={p.d} 
                  fill="none" 
                  stroke="url(#glow)" 
                  strokeWidth="3"
                  strokeLinecap="round"
                  filter="url(#blurGlow)"
                  markerEnd="url(#arrowhead-active)"
                  style={{ strokeDasharray: '10 10', animation: 'dash 1s linear infinite' }}
                />
              )}

              {p.isActive && (
                <text 
                  x={p.midX} 
                  y={p.midY} 
                  fill="#fff" 
                  fontSize="11" 
                  fontWeight="bold" 
                  textAnchor="middle" 
                  className="animate-pulse drop-shadow-md"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                >
                  {p.label}
                </text>
              )}
            </g>
          ))}
        </svg>

        {/* CSS Grid Columns for the Roles */}
        <div className="flex flex-col justify-center z-20 hover:z-50 w-full md:w-1/4 gap-6 transition-all">
          <RoleBlock role={roles.find(r => r.id === 'ae')!} activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        </div>
        
        <div className="flex flex-col justify-center z-20 hover:z-50 w-full md:w-1/4 gap-6 transition-all">
          <RoleBlock role={roles.find(r => r.id === 'pm')!} activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        </div>

        <div className="flex flex-col justify-center z-20 hover:z-50 w-full md:w-1/4 gap-12 transition-all">
          <RoleBlock role={roles.find(r => r.id === 'team')!} activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
          <RoleBlock role={roles.find(r => r.id === 'hr')!} activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        </div>

        <div className="flex flex-col justify-center z-20 hover:z-50 w-full md:w-1/4 gap-12 transition-all">
          <RoleBlock role={roles.find(r => r.id === 'finance')!} activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          to { stroke-dashoffset: -20; }
        }
      `}} />
    </div>
  );
}

function RoleBlock({ role, activeMenu, setActiveMenu }: { role: any, activeMenu: string | null, setActiveMenu: (m: string | null) => void }) {
  const Icon = role.icon;
  return (
    <div className="bg-black/60 border border-white/10 rounded-xl p-4 backdrop-blur-md shadow-lg flex flex-col gap-3 h-fit relative hover:z-50 transition-all">
      <div className="flex items-center gap-3 pb-3 border-b border-white/10">
        <div className="p-2 bg-white/10 rounded-lg text-gray-300">
          <Icon size={18} />
        </div>
        <h3 className="font-bold text-white text-sm">{role.label}</h3>
      </div>
      
      <div className="flex flex-col gap-2">
        {role.menus.map((menu: any) => {
          const isActive = activeMenu === menu.id;
          return (
            <div 
              key={menu.id}
              className="relative group z-30 hover:z-50"
            >
              <div
                id={menu.id}
                onClick={() => setActiveMenu(isActive ? null : menu.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-300
                  ${isActive ? 'bg-red-500/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'}
                `}
              >
                <h4 className={`font-bold text-xs mb-1 ${isActive ? 'text-red-300' : 'text-gray-200'}`}>{menu.name}</h4>
                <p className="text-[10px] text-gray-500 leading-tight">{menu.desc}</p>
              </div>

              {/* Descriptive Pop-up (Tooltip) */}
              <div className="absolute left-[105%] top-1/2 -translate-y-1/2 w-64 p-4 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                <h5 className="font-bold mb-1.5 text-white text-sm border-b border-slate-600 pb-1">{menu.name}</h5>
                <p className="mb-3 text-xs text-slate-300 leading-relaxed">{menu.detailDesc}</p>
                <div className="text-[10px] text-emerald-400 bg-emerald-900/30 p-2 rounded-lg border border-emerald-900/50">
                  <strong className="block mb-0.5 text-emerald-300">Integrasi Data:</strong> 
                  {menu.integrations}
                </div>
                {/* Small triangle arrow */}
                <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-slate-800 border-l border-b border-slate-600 rotate-45"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
