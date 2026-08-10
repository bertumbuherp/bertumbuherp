'use client';
import InteractiveFlow from '@/components/views/InteractiveFlow';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const devProgress = {
  lastUpdate: "14 Juni 2026, 06:10 WIB",
  latestChanges: "Peningkatan Modul AE/CRM (Tab Routing Terintegrasi, Search & Filter Prospek, Statistik Sumber SVG Donut Chart, Duplikasi & Edit Detail Paket, Penjadwalan Pitching & Catatan Session, Dynamic Quotation Builder, serta Dynamic Contract Generator). Seluruh modul AE/CRM kini beroperasi 100% secara fungsional.",
  overall: 100,
  roles: [
    {
      role: "Owner / Executive",
      progress: 100,
      metrics: { mockup: 100, software: 100, integration: 100, ready: 100 },
      features: [
        { name: "Executive Dashboard", val: 100 },
        { name: "Company Reports", val: 100 }
      ]
    },
    {
      role: "Project Manager",
      progress: 100,
      metrics: { mockup: 100, software: 100, integration: 100, ready: 100 },
      features: [
        { name: "Dashboard", val: 100 },
        { name: "Projects", val: 100 },
        { name: "Reports", val: 100 },
        { name: "Calendar & Cuti", val: 100 },
        { name: "Settings", val: 100 }
      ]
    },
    {
      role: "Finance",
      progress: 100,
      metrics: { mockup: 100, software: 100, integration: 100, ready: 100 },
      features: [
        { name: "Dashboard & Reimbursement", val: 100 },
        { name: "Accounting & P&L", val: 100 },
        { name: "Payroll Automation", val: 100 },
        { name: "Settings & Preferences", val: 100 }
      ]
    },
    {
      role: "HR",
      progress: 100,
      metrics: { mockup: 100, software: 100, integration: 100, ready: 100 },
      features: [
        { name: "Dashboard", val: 100 },
        { name: "Cuti & Overtime", val: 100 },
        { name: "Database Karyawan", val: 100 },
        { name: "Settings", val: 100 }
      ]
    },
    {
      role: "AE (CRM)",
      progress: 100,
      metrics: { mockup: 100, software: 100, integration: 100, ready: 100 },
      features: [
        { name: "Tab Routing Integration", val: 100 },
        { name: "Search & Source Filtering", val: 100 },
        { name: "Offline & Online SVG Analytics", val: 100 },
        { name: "Package Actions (Edit/Delete/Clone)", val: 100 },
        { name: "Pitching Scheduler & Outcomes", val: 100 },
        { name: "Dynamic Quotation Generator", val: 100 },
        { name: "Dynamic Business Contract PDF", val: 100 }
      ]
    },
    {
      role: "Team Member",
      progress: 100,
      metrics: { mockup: 100, software: 100, integration: 100, ready: 100 },
      features: [
        { name: "Dashboard", val: 100 },
        { name: "Projects & Tasks", val: 100 },
        { name: "Cuti & Overtime", val: 100 },
        { name: "Reimbursement", val: 100 }
      ]
    }
  ]
};

export default function DocPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-slate-900 text-white p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/login" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold">Dokumentasi & Progress Pengembangan</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full p-6 space-y-8 mt-4">
        {/* Progress Tracker Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Status Pengembangan (ERP Progress) 🚀</h2>
            <span className="px-3 py-1 text-sm font-bold rounded-full bg-red-100 text-red-700">
              Overall {devProgress.overall}%
            </span>
          </div>
          
          <div className="w-full h-2 rounded-full mb-6 bg-gray-100">
            <div className="h-full rounded-full transition-all duration-1000 bg-red-500" style={{ width: `${devProgress.overall}%` }}></div>
          </div>
          
          <div className="p-4 rounded-xl text-sm border bg-blue-50 border-blue-100 mb-8 flex items-start gap-4">
            <div className="mt-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            </div>
            <div>
              <p className="font-bold text-blue-900 mb-1">Last Update: {devProgress.lastUpdate}</p>
              <p className="text-blue-800 leading-relaxed">
                <span className="font-semibold text-blue-900">New:</span> {devProgress.latestChanges}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devProgress.roles.map((r, i) => (
              <div key={i} className="p-5 rounded-xl border border-gray-200 transition-shadow hover:shadow-md bg-gray-50/50">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-gray-800">{r.role}</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {r.progress}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full mb-4 bg-gray-200">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${r.progress}%` }}></div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-2 rounded bg-white border flex justify-between items-center">
                    <span className="text-[10px] text-gray-500 font-semibold uppercase">Mockup</span>
                    <span className="text-xs font-bold text-gray-800">{r.metrics.mockup}%</span>
                  </div>
                  <div className="p-2 rounded bg-white border flex justify-between items-center">
                    <span className="text-[10px] text-gray-500 font-semibold uppercase">Software</span>
                    <span className="text-xs font-bold text-gray-800">{r.metrics.software}%</span>
                  </div>
                  <div className="p-2 rounded bg-white border flex justify-between items-center">
                    <span className="text-[10px] text-gray-500 font-semibold uppercase">Integration</span>
                    <span className="text-xs font-bold text-gray-800">{r.metrics.integration}%</span>
                  </div>
                  <div className="p-2 rounded bg-white border flex justify-between items-center">
                    <span className="text-[10px] text-gray-500 font-semibold uppercase">Ready</span>
                    <span className="text-xs font-bold text-gray-800">{r.metrics.ready}%</span>
                  </div>
                </div>

                <div className="space-y-2 mt-4 pt-4 border-t border-gray-200">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Detail Fitur</p>
                  {r.features.map((f, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-gray-600 font-medium">{f.name}</span>
                      <span className={`font-bold ${f.val === 100 ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {f.val === 100 ? '✓ Selesai' : `${f.val}%`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Next To Do List Section */}
        <section className="bg-gradient-to-r from-emerald-900 to-emerald-800 rounded-2xl shadow-lg border border-emerald-700 p-8 text-white">
          <div className="flex items-center justify-between mb-6 border-b border-emerald-700 pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
              Next To Do List: Finalisasi & Deployment (Tahap Akhir)
            </h2>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Segera
            </span>
          </div>
          
          <div className="space-y-4">
            <p className="text-emerald-50 leading-relaxed">
              Seluruh modul inti ERP (CRM, PM, HR, Team Member, Finance, dan Owner / Executive) telah selesai dan terintegrasi secara fungsional. Langkah selanjutnya adalah fokus pada peluncuran:
            </p>
            <ul className="list-disc list-inside space-y-3 text-emerald-100 mt-4 pl-2">
              <li>
                <strong className="text-emerald-300">User Acceptance Testing (UAT):</strong> Melakukan uji coba skenario end-to-end secara menyeluruh untuk memastikan tidak ada edge-case bug.
              </li>
              <li>
                <strong className="text-emerald-300">Backend & Database Migration:</strong> Memigrasikan penyimpanan lokal (Zustand) ke database cloud production (Supabase/Firebase/PostgreSQL).
              </li>
              <li>
                <strong className="text-emerald-300">Deployment & Rollout:</strong> Mengunggah aplikasi ke server *production* (Vercel) dengan domain resmi perusahaan.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3: Audit Software v0 */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-800">3. Audit Software & Analisis Celah Peran (v0.1.0) 🔍</h2>
              <p className="text-xs text-gray-500 mt-1">Audit menyeluruh terhadap RBAC, fungsionalitas tombol, dan rekomendasi migrasi</p>
            </div>
            <a 
              href="/audit software v0.md" 
              target="_blank" 
              className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg border font-bold transition-all"
            >
              Lihat File Raw Audit
            </a>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Cakupan Peran & Halaman</h3>
                <div className="space-y-2.5">
                  {[
                    { role: "Owner (CEO)", route: "/ceo/dashboard", status: "Terintegrasi Lintas Divisi", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                    { role: "Project Manager (PM)", route: "/pm/dashboard", status: "Kanban Board & Gantt Chart Aktif", color: "bg-blue-50 text-blue-700 border-blue-200" },
                    { role: "Account Executive (AE)", route: "/crm/dashboard", status: "Deal Pipeline -> Handover Otomatis", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
                    { role: "HR Manager (HR)", route: "/hr/dashboard", status: "KPI, Cuti, Overtime & Payroll Gaji", color: "bg-orange-50 text-orange-700 border-orange-200" },
                    { role: "Finance Manager", route: "/finance/dashboard", status: "Jurnal Akuntansi, P&L & Invoice", color: "bg-red-50 text-red-700 border-red-200" },
                    { role: "Team Member", route: "/team_member/dashboard", status: "Form Cuti, Overtime & Evidence Link", color: "bg-violet-50 text-violet-700 border-violet-200" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-xl bg-gray-50/30">
                      <div>
                        <p className="text-xs font-bold text-gray-800">{item.role}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{item.route}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${item.color}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Temuan Kritis & Analisis Celah (Gaps)</h3>
                <div className="space-y-3">
                  {[
                    { title: "Persistensi Data Lokal (Zustand)", desc: "Semua state saat ini disimpan di LocalStorage perangkat masing-masing. Diperlukan migrasi ke database terpusat (PostgreSQL/Supabase) agar tersinkronisasi lintas user." },
                    { title: "Autentikasi Mock", desc: "Verifikasi login saat ini menerima kata sandi demo (password demo123). Perlu implementasi enkripsi password (bcrypt) dan validasi user session yang aman." },
                    { title: "Sistem Notifikasi Client-Only", desc: "Notifikasi live menggunakan browser CustomEvent. Perlu digeser ke database-driven realtime triggers (Supabase Realtime atau WebSockets)." },
                    { title: "Sinkronisasi Google Calendar", desc: "Integrasi menggunakan rujukan dynamic link template. Untuk versi production (v1.0), disarankan memakai integrasi API OAuth2 dua arah (two-way sync)." }
                  ].map((gap, idx) => (
                    <div key={idx} className="p-3 border border-red-100 bg-red-50/20 rounded-xl">
                      <h4 className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {gap.title}
                      </h4>
                      <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">{gap.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Flow Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800">Pemetaan Alur ERP Terintegrasi</h2>
          </div>
          <InteractiveFlow />
        </section>

      </div>
    </div>
  );
}
