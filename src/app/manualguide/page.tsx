'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search, BookOpen, ShieldCheck, Users, Activity, Server, TrendingUp,
  FolderKanban, FolderTree, DollarSign, CalendarDays, CreditCard, FileSpreadsheet,
  UserCheck, Clock, UserMinus, Layers, FileText, Send, Receipt,
  Building, Calculator, ChevronDown, ChevronRight, Printer,
  ExternalLink, Sparkles, CheckCircle2, Info, Briefcase, LogIn, ArrowRight
} from 'lucide-react';

interface ManualTopic {
  id: string;
  role: 'owner' | 'super_admin' | 'finance' | 'hr' | 'pm' | 'ae' | 'team_member';
  roleName: string;
  category: string;
  title: string;
  summary: string;
  targetRoute?: string;
  prerequisites: string;
  steps: string[];
  tips: string;
  icon: any;
}

const MANUAL_TOPICS: ManualTopic[] = [
  // ==========================================
  // OWNER / CEO
  // ==========================================
  {
    id: 'owner-summary',
    role: 'owner',
    roleName: 'Owner / CEO',
    category: 'Eksekutif & Oversight',
    title: 'Ringkasan Eksekutif & Health Check Perusahaan',
    summary: 'Memantau performa kesehatan bisnis, pendapatan, proyek aktif, dan efisiensi tim secara menyeluruh.',
    targetRoute: '/ceo/dashboard?tab=summary',
    prerequisites: 'Akses role Owner / CEO',
    steps: [
      'Buka menu "Ringkasan Eksekutif" pada Sidebar.',
      'Periksa Widget Ringkasan Finansial (Total Revenue, Gross Profit Margin, Net Cash Flow).',
      'Pantau Widget Project Health (Proyek On-Track vs Delayed).',
      'Evaluasi Matriks Performa Tim & Utilization Rate seluruh departemen.',
      'Gunakan switcher periode (Bulanan/Kuartalan/Tahunan) untuk melihat tren pertumbuhan.'
    ],
    tips: 'Lakukan peninjauan widget ini setiap awal minggu untuk mendeteksi bottleneck operasional lebih awal.',
    icon: ShieldCheck,
  },
  {
    id: 'owner-finance-auth',
    role: 'owner',
    roleName: 'Owner / CEO',
    category: 'Otorisasi Finansial',
    title: 'Otorisasi Finansial & Pengeluaran Skala Besar',
    summary: 'Persetujuan akhir untuk pengeluaran di atas ambang batas (threshold), pengajuan modal, dan pembayaran vendor utama.',
    targetRoute: '/ceo/finance',
    prerequisites: 'Akses role Owner / CEO dengan hak otorisasi tunggal/ganda',
    steps: [
      'Navigasi ke menu "Otorisasi Finansial".',
      'Tinjau daftar tagihan/pengajuan reimbursement yang berstatus "Pending CEO Approval".',
      'Klik detail pengajuan untuk memeriksa nota lampiran, breakdown biaya, dan catatan dari Finance Manager.',
      'Klik "Setujui & Otorisasi" untuk memproses pencairan dana, atau "Tolak dengan Catatan" jika memerlukan klarifikasi.'
    ],
    tips: 'Setiap otorisasi yang disetujui akan secara otomatis dicatat ke dalam Audit Log System.',
    icon: CreditCard,
  },
  {
    id: 'owner-reports',
    role: 'owner',
    roleName: 'Owner / CEO',
    category: 'Reporting Eksekutif',
    title: 'Laporan Konsolidasi BOD & Keuangan Perusahaan',
    summary: 'Melihat laporan keuangan terstruktur untuk Dewan Direksi (BOD), laporan laba rugi konsolidasi, dan proyeksi arus kas.',
    targetRoute: '/ceo/reports',
    prerequisites: 'Akses role Owner / CEO',
    steps: [
      'Buka menu "Laporan Perusahaan".',
      'Pilih jenis laporan yang diinginkan: Laporan BOD, Konsolidasi Profit & Loss, atau Proyeksi Arus Kas.',
      'Tentukan rentang tanggal/periode laporan.',
      'Gunakan tombol "Export PDF" atau "Download Excel" untuk kebutuhan rapat pemegang saham.'
    ],
    tips: 'Laporan BOD secara otomatis menyertakan rasio likuiditas dan rasio profitabilitas terkini.',
    icon: FileSpreadsheet,
  },

  // ==========================================
  // SUPER ADMIN
  // ==========================================
  {
    id: 'admin-users',
    role: 'super_admin',
    roleName: 'Super Admin',
    category: 'User & Permission Management',
    title: 'Manajemen Akun User & Penetapan Hak Akses Role',
    summary: 'Menambah user baru, memperbarui role (Owner, Finance, HR, PM, AE, Team Member), mereset password, dan mengaktifkan/menonaktifkan akun.',
    targetRoute: '/super_admin?tab=users',
    prerequisites: 'Hak Akses Super Admin / System Administrator',
    steps: [
      'Buka menu "Kelola User & Hak Akses" di bawah grup Super Admin.',
      'Klik tombol "+ Tambah User Baru".',
      'Isi Nama Lengkap, Email Resmi Perusahaan, Jabatan, Departemen, dan Pilih Primary Role.',
      'Atur password awal atau kirimkan email verifikasi otomatis.',
      'Klik "Simpan User". User kini dapat login menggunakan role yang ditugaskan.'
    ],
    tips: 'Pastikan setiap email karyawan menggunakan domain perusahaan resmi untuk menjaga keamanan sistem.',
    icon: Users,
  },
  {
    id: 'admin-audit',
    role: 'super_admin',
    roleName: 'Super Admin',
    category: 'Keamanan & Audit',
    title: 'Pengawasan Log Aktivitas (Audit Trail)',
    summary: 'Melacak seluruh riwayat tindakan pengguna di sistem (login, ubah data, hapus data, otorisasi transaksi, export laporan).',
    targetRoute: '/super_admin?tab=activity-logs',
    prerequisites: 'Hak Akses Super Admin',
    steps: [
      'Pilih menu "Log Aktivitas (Audit)".',
      'Gunakan kolom pencarian untuk memfilter log berdasarkan nama user, alamat IP, atau jenis tindakan.',
      'Periksa stempel waktu (timestamp) dan rincian perubahan data (Sebelum vs Sesudah).',
      'Export log audit jika diperlukan untuk kepatuhan regulasi atau investigasi internal.'
    ],
    tips: 'Log aktivitas dilindungi oleh enkripsi dan tidak dapat diubah/dihapus oleh role manapun.',
    icon: Activity,
  },
  {
    id: 'admin-health',
    role: 'super_admin',
    roleName: 'Super Admin',
    category: 'System Administration',
    title: 'Monitoring Status Sistem & Kesehatan Database',
    summary: 'Memantau koneksi Supabase Cloud PostgreSQL, latensi API, kapasitas penyimpanan, dan penanganan error log backend.',
    targetRoute: '/super_admin?tab=system-status',
    prerequisites: 'Hak Akses Super Admin',
    steps: [
      'Navigasi ke halaman "Status System & Health".',
      'Periksa status indikator koneksi database Supabase (Online / Degradasi).',
      'Pantau tabel "Real-Time Error Logs" untuk mendeteksi kendala query atau kebocoran memori.',
      'Jalankan tes diagnostik jaringan dengan mengklik "Run Health Check".'
    ],
    tips: 'Apabila status database mengalami kendala, segera hubungi tim Cloud Infrastructure.',
    icon: Server,
  },

  // ==========================================
  // FINANCE MANAGER
  // ==========================================
  {
    id: 'fin-accounting-entry',
    role: 'finance',
    roleName: 'Finance Manager',
    category: 'Accounting & Buku Besar',
    title: 'Input Jurnal Akuntansi & Simulasi Transaksi',
    summary: 'Mencatat entri jurnal umum, penyesuaian debit/kredit, dan menguji keseimbangan saldo transaksi sebelum dibukukan.',
    targetRoute: '/finance/accounting?tab=input',
    prerequisites: 'Role Finance Manager',
    steps: [
      'Buka menu "Accounting" ➔ Tab "Input Jurnal & Simulasi".',
      'Pilih Tanggal Transaksi dan Masukkan Deskripsi Jurnal.',
      'Tambahkan baris Debit: Pilih Akun COA dan Masukkan Nominal.',
      'Tambahkan baris Kredit: Pilih Akun COA penyimbang dan Masukkan Nominal.',
      'Pastikan Total Debit = Total Kredit (Keseimbangan 100%).',
      'Klik "Simpan & Pembukuan Jurnal".'
    ],
    tips: 'Gunakan fitur simulasi untuk melihat dampak jurnal terhadap Laba Rugi sebelum posting permanen.',
    icon: Calculator,
  },
  {
    id: 'fin-coa',
    role: 'finance',
    roleName: 'Finance Manager',
    category: 'Master Data Keuangan',
    title: 'Pengelolaan Chart of Accounts (Master COA)',
    summary: 'Mengatur kode akun standar perusahaan (Aset, Liabilitas, Ekuitas, Pendapatan, Beban Operasional).',
    targetRoute: '/finance/accounting?tab=coa',
    prerequisites: 'Role Finance Manager',
    steps: [
      'Pilih Tab "Master COA" pada halaman Accounting.',
      'Tinjau hirarki struktur akun (1000-Aset, 2000-Kewajiban, 3000-Modal, 4000-Pendapatan, 5000-Beban).',
      'Untuk menambah akun baru: Klik "+ Tambah Akun COA", isi Kode Akun, Nama Akun, Kategori, dan Saldo Normal (Debit/Kredit).',
      'Simpan data akun.'
    ],
    tips: 'Jangan menghapus akun COA yang sudah memiliki histori transaksi; gunakan fitur Non-aktifkan jika akun tidak lagi dipakai.',
    icon: FolderTree,
  },
  {
    id: 'fin-cashflow',
    role: 'finance',
    roleName: 'Finance Manager',
    category: 'Laporan Keuangan',
    title: 'Laporan Arus Kas 3 Aktivitas (Cash Flow)',
    summary: 'Analisis pergerakan kas dari Aktivitas Operasional, Aktivitas Investasi, dan Aktivitas Pendanaan secara tepat.',
    targetRoute: '/finance/accounting?tab=cash_flow',
    prerequisites: 'Role Finance Manager',
    steps: [
      'Buka Tab "Arus Kas (3 Aktivitas)".',
      'Pilih Periode Laporan (Bulan/Kuartal/Tahun).',
      'Tinjau Arus Kas Operasional (Penerimaan dari Klien minus Pembayaran Beban & Gaji).',
      'Tinjau Arus Kas Investasi & Pendanaan.',
      'Periksa Saldo Akhir Kas yang terekonsiliasi dengan rekening bank.'
    ],
    tips: 'Saldo akhir kas pada laporan ini harus cocok dengan total saldo di Tab Kas & Bank.',
    icon: DollarSign,
  },
  {
    id: 'fin-invoicing',
    role: 'finance',
    roleName: 'Finance Manager',
    category: 'Piutang & Invoicing',
    title: 'Penagihan Invoice & Penerimaan Pembayaran Klien',
    summary: 'Membuat invoice tagihan berdasarkan Quotation AE, mengirimkan ke klien, dan mencatat bukti penerimaan pembayaran.',
    targetRoute: '/finance/dashboard?tab=penagihan',
    prerequisites: 'Role Finance Manager',
    steps: [
      'Buka menu "Penagihan Piutang" / "Invoice Payment".',
      'Pilih daftar Quotation/Deal yang telah disetujui AE.',
      'Klik "Generate Invoice Tagihan".',
      'Isi nomor invoice, jatuh tempo, dan rincian terminator pembayaran (Down Payment / Full Payment).',
      'Kirim invoice PDF ke email klien.',
      'Jika klien telah membayar: Klik "Konfirmasi Pembayaran", unggah bukti transfer, dan pilih Akun Bank Penerima.'
    ],
    tips: 'Sistem akan mengirimkan pengingat jatuh tempo otomatis 3 hari sebelum dueDate invoice.',
    icon: Receipt,
  },
  {
    id: 'fin-reimbursement',
    role: 'finance',
    roleName: 'Finance Manager',
    category: 'Pengeluaran Tim',
    title: 'Verifikasi & Pencairan Reimbursement Tim',
    summary: 'Memeriksa keabsahan bukti nota pengajuan klaim biaya dari tim operasional dan mengotorisasi transfer pencairan.',
    targetRoute: '/finance/dashboard?tab=reimburs',
    prerequisites: 'Role Finance Manager',
    steps: [
      'Navigasi ke Tab "Reimburs Tim".',
      'Klik item klaim berstatus "Pending Finance Review".',
      'Periksa foto/file kwitansi, nominal, serta kategori beban (Travel, Client Meeting, Equipment, dll.).',
      'Klik "Setujui & Transfer" jika valid, atau "Tolak" dengan menyertakan alasan ketidaksesuaian nota.'
    ],
    tips: 'Pastikan tanggal nota pengajuan berada dalam bulan berjalan untuk menjaga kepatuhan pembukuan.',
    icon: CreditCard,
  },
  {
    id: 'fin-payroll',
    role: 'finance',
    roleName: 'Finance Manager',
    category: 'Gaji & Vendor',
    title: 'Proses Pencairan Payroll Gaji & Fee Freelance',
    summary: 'Menerima draf perhitungkan payroll dari HR Manager dan melakukan pembayaran gaji rutin serta fee vendor / freelancer.',
    targetRoute: '/finance/dashboard?tab=gaji',
    prerequisites: 'Role Finance Manager',
    steps: [
      'Buka Tab "Gaji & Freelance".',
      'Tinjau Daftar Payroll Bulanan yang telah diverifikasi oleh HR Manager.',
      'Periksa akumulasi Take Home Pay, potongan BPJS, serta bukti PPh 21.',
      'Jalankan batch pencairan melalui koneksi Bank Transfer.',
      'Klik "Mark as Paid" untuk mengirimkan Slip Gaji elektronik ke masing-masing karyawan.'
    ],
    tips: 'Pencairan payroll secara otomatis membuat entri Jurnal Umum Kredit Kas & Debit Beban Gaji.',
    icon: DollarSign,
  },

  // ==========================================
  // HR MANAGER
  // ==========================================
  {
    id: 'hr-matrix',
    role: 'hr',
    roleName: 'HR Manager',
    category: 'Alokasi & Capacity Planning',
    title: 'Matriks Alokasi Tim & Beban Kerja (Workload)',
    summary: 'Memantau tingkat alokasi kapasitas karyawan (Under-allocated, Optimal, Over-allocated) untuk mencegah burnout.',
    targetRoute: '/hr/dashboard?tab=matrix',
    prerequisites: 'Role HR Manager',
    steps: [
      'Buka menu "HR Dashboard" ➔ Tab "Matriks Alokasi Tim".',
      'Tinjau grafik % utilitas kapasitas kerja per karyawan.',
      'Identifikasi tim yang memiliki status >100% (Overload).',
      'Koordinasikan dengan Project Manager (PM) untuk meredistribusi tugas proyek.'
    ],
    tips: 'Kapasitas optimal kerja tim berada pada rentang 75% - 85% untuk menjaga fleksibilitas tugas darurat.',
    icon: Users,
  },
  {
    id: 'hr-cuti-guarding',
    role: 'hr',
    roleName: 'HR Manager',
    category: 'Manajemen Cuti',
    title: 'Guarding Cuti PM & Final Approval Cuti Karyawan',
    summary: 'Memeriksa pengajuan cuti yang telah disetujui PM, memastikan ketersediaan sisa kuota cuti tahunan, dan verifikasi akhir.',
    targetRoute: '/hr/dashboard?tab=guarding_cuti',
    prerequisites: 'Role HR Manager',
    steps: [
      'Navigasi ke Tab "Guarding Cuti PM" atau Halaman "Approval Cuti".',
      'Filter pengajuan berstatus "Approved by PM".',
      'Periksa sisa jatah cuti karyawan dan apakah jadwal cuti berbenturan dengan milestone penting proyek.',
      'Klik "Final Approve" untuk memotong saldo cuti secara otomatis, atau "Escalate to Owner" jika terjadi kondisi khusus.'
    ],
    tips: 'Pengajuan cuti yang disetujui akan otomatis mengupdate Kalender Global Perusahaan.',
    icon: UserMinus,
  },
  {
    id: 'hr-payroll-calc',
    role: 'hr',
    roleName: 'HR Manager',
    category: 'Payroll & Kompensasi',
    title: 'Perhitungan Payroll Gaji Bulanan & Fee Freelance',
    summary: 'Mengkalkulasi akumulasi gaji pokok, tunjangan, potongan absensi/terlambat, lembur disetujui, dan fee tim freelance.',
    targetRoute: '/hr/dashboard?tab=payroll_bulanan',
    prerequisites: 'Role HR Manager',
    steps: [
      'Buka Tab "Payroll Gaji Bulanan".',
      'Pilih Periode Bulan & Tahun penggajian.',
      'Klik "Kalkulasi Rekapitulasi Presensi & Lembur". Sistem akan menyedot data jam kerja real tim.',
      'Tinjau slip rincian tiap karyawan.',
      'Klik "Kirim Draf ke Finance Manager" untuk otorisasi pembayaran.'
    ],
    tips: 'Pastikan seluruh lembur bulan berjalan telah berstatus "Approved" oleh HR sebelum melakukan kalkulasi payroll.',
    icon: FileSpreadsheet,
  },
  {
    id: 'hr-employees',
    role: 'hr',
    roleName: 'HR Manager',
    category: 'Database Karyawan',
    title: 'Manajemen Database Karyawan & Kontrak Kerja',
    summary: 'Mengelola berkas profil karyawan, nomor identitas, tanggal bergabung, status hubungan kerja (Permanent/Contract/Freelance).',
    targetRoute: '/hr/employees',
    prerequisites: 'Role HR Manager',
    steps: [
      'Buka menu "Database Karyawan".',
      'Untuk menambah karyawan baru: Klik "+ Registrasi Karyawan Baru".',
      'Lengkapi data personal, kontak darurat, informasi rekening bank, dan nomor NPWP/BPJS.',
      'Upload dokumen pendukung (KTP, Kontrak Kerja PDF).',
      'Simpan profil.'
    ],
    tips: 'Gunakan pengingat otomatis untuk memantau masa berlaku kontrak kerja karyawan yang akan habis 30 hari lagi.',
    icon: UserCheck,
  },

  // ==========================================
  // PROJECT MANAGER (PM)
  // ==========================================
  {
    id: 'pm-overview',
    role: 'pm',
    roleName: 'Project Manager (PM)',
    category: 'Project Management',
    title: 'PM Dashboard & Monitoring Multi-Proyek',
    summary: 'Melihat status perkembangan seluruh proyek aktif agency, persentase penyelesaian milestone, dan peringatan keterlambatan (delays).',
    targetRoute: '/pm/dashboard',
    prerequisites: 'Role Project Manager (PM)',
    steps: [
      'Buka menu "PM Dashboard".',
      'Periksa Widget Overview: Total Active Projects, Delivery Progress %, dan Delayed Task Alerts.',
      'Lihat daftar proyek berstatus "At Risk" (Warna Merah/Oranye).',
      'Klik nama proyek untuk masuk ke detail manajemen Kanban Board & alokasi anggota tim.'
    ],
    tips: 'Update status task secara berkala setiap sore agar grafik kesehatan proyek selalu mencerminkan kondisi riil.',
    icon: Layers,
  },
  {
    id: 'pm-projects-detail',
    role: 'pm',
    roleName: 'Project Manager (PM)',
    category: 'Eksekusi Proyek',
    title: 'Detail Proyek, Alokasi Task & Timeline Kanban',
    summary: 'Membuat task baru, menentukan assignee (penanggung jawab), mengatur priority, deadline, serta mengontrol Kanban Board proyek.',
    targetRoute: '/pm/projects',
    prerequisites: 'Role Project Manager (PM)',
    steps: [
      'Buka menu "Manajemen Proyek", pilih proyek yang ingin dikelola.',
      'Di dalam papan Kanban proyek, klik "+ Buat Task Baru".',
      'Isi Judul Task, Deskripsi Pekerjaan, Assignee Karyawan, Due Date, dan Est. Hours.',
      'Geser task antar kolom (To Do ➔ In Progress ➔ Review ➔ Done) sesuai progress pengerjaan tim.',
      'Gunakan fitur Komentar pada task untuk meninjau revisi desainer/developer.'
    ],
    tips: 'Penetapan Estimasi Jam Kerja (Est. Hours) sangat penting untuk menghitung Utilization Rate di HR Matrix.',
    icon: FolderKanban,
  },
  {
    id: 'pm-leave-approval',
    role: 'pm',
    roleName: 'Project Manager (PM)',
    category: 'Manajemen Tim Proyek',
    title: 'Approval Cuti Anggota Tim Proyek',
    summary: 'Meninjau pengajuan cuti dari anggota tim proyek untuk memastikan jadwal pengajuan tidak mengganggu penyelesaian deadline proyek.',
    targetRoute: '/pm/cuti',
    prerequisites: 'Role Project Manager (PM)',
    steps: [
      'Buka menu "Approval Cuti".',
      'Tinjau pengajuan cuti tim yang berstatus "Pending PM Review".',
      'Cek dampak ketidakhadiran karyawan pada jadwal delivery proyek di minggu tersebut.',
      'Jika aman: Klik "Approve & Forward to HR". Jika merugikan deadline: Klik "Reject" atau komunikasikan penyesuaian tanggal.'
    ],
    tips: 'Selalu pastikan ada pengganti (backup person) yang memegang kewajiban task sebelum menyetujui cuti tim.',
    icon: UserMinus,
  },
  {
    id: 'pm-reports',
    role: 'pm',
    roleName: 'Project Manager (PM)',
    category: 'Client Reporting',
    title: 'Penyusunan Report Progress Klien & Delay Analysis',
    summary: 'Meng-generate laporan status berkala untuk disampaikan kepada klien dan menganalisis penyebab penundaan pengerjaan.',
    targetRoute: '/pm/reports',
    prerequisites: 'Role Project Manager (PM)',
    steps: [
      'Navigasi ke menu "Report Klien".',
      'Pilih Klien dan Proyek yang ingin dibuatkan laporan.',
      'Sistem akan merangkum daftar task yang diselesaikan, revisi yang dilakukan, dan deliverables utama.',
      'Klik "Generate Executive Client Report PDF".',
      'Kirimkan laporan langsung ke pihak Account Executive (AE) atau perwakilan klien.'
    ],
    tips: 'Laporan ini membantu mengamankan bukti progres bila terjadi klaim perselisihan waktu pengerjaan dari klien.',
    icon: FileText,
  },

  // ==========================================
  // ACCOUNT EXECUTIVE (AE)
  // ==========================================
  {
    id: 'ae-leads',
    role: 'ae',
    roleName: 'Account Executive (AE)',
    category: 'CRM & Pipeline Sales',
    title: 'Listing Prospek New Client & Management Leads',
    summary: 'Mencatat prospek klien baru (Online/Offline), melacak status stage pipeline CRM, dan mengelola kontak keputusan klien.',
    targetRoute: '/crm/dashboard?tab=prospek',
    prerequisites: 'Role Account Executive (AE)',
    steps: [
      'Buka menu "Summary" / "Listing Prospek New Client" di CRM Dashboard.',
      'Klik tombol "+ Tambah Prospek Klien".',
      'Input Nama Perusahaan Klien, Contact Person, Nomor WhatsApp, Email, Nilai Estimasi Deals, dan Sumber Lead.',
      'Pindahkan card prospek mengikuti tahapan deal: Lead ➔ Discovery Call ➔ Proposal ➔ Negotiation ➔ Deal Won / Lost.'
    ],
    tips: 'Tambahkan catatan hasil meeting secara detail pada histori aktivitas deal untuk mempermudah follow-up.',
    icon: TrendingUp,
  },
  {
    id: 'ae-quotation',
    role: 'ae',
    roleName: 'Account Executive (AE)',
    category: 'Penawaran & Kontrak',
    title: 'Generator Quotation (Penawaran) & Kontrak Kerjasama',
    summary: 'Membuat dokumen resmi Quotation Penawaran Harga Layanan Agency dan menerbitkan draf Kontrak Perjanjian Kerjasama.',
    targetRoute: '/crm/dashboard?tab=penawaran',
    prerequisites: 'Role Account Executive (AE)',
    steps: [
      'Buka Tab "Quotation (Penawaran)".',
      'Klik "Buat Quotation Baru" dan pilih Klien sasaran.',
      'Pilih paket layanan (Social Media Management, Branding, Performance Ads, SEO, Website, dll.).',
      'Atur besaran diskon, skema termin pembayaran (misal DP 50%, Pelunasan 50%), dan masa berlaku penawaran.',
      'Klik "Generate Quotation PDF" untuk diunduh / dikirim langsung via Email & WhatsApp.',
      'Jika disetujui klien: Pindah ke Tab "Generate Kontrak" untuk menerbitkan draf perjanjian kerja sama resmi.'
    ],
    tips: 'Quotation yang telah berstatus "Client Approved" secara otomatis dapat ditarik oleh Finance Manager untuk penerbitan Invoice.',
    icon: FileText,
  },
  {
    id: 'ae-clients',
    role: 'ae',
    roleName: 'Account Executive (AE)',
    category: 'Direktori Klien',
    title: 'Manajemen Direktori Klien & Retainer History',
    summary: 'Melihat direktori lengkap seluruh klien aktif & alumni agency, histori transaksi, serta masa berlaku paket retainer.',
    targetRoute: '/crm/clients',
    prerequisites: 'Role Account Executive (AE)',
    steps: [
      'Pilih menu "Manajemen Klien".',
      'Gunakan fitur pencarian untuk menemukan nama klien atau industri.',
      'Klik profil klien untuk melihat daftar proyek aktif, kontak pic, histori invoice, dan dokumen kontrak PDF yang diunggah.',
      'Lakukan update data penanggung jawab klien jika terjadi perubahan internal di pihak klien.'
    ],
    tips: 'Pantau tanggal kadaluarsa kontrak retainer 30 hari sebelum berakhir untuk melakukan pitching perpanjangan (upsell/renewal).',
    icon: Building,
  },

  // ==========================================
  // TEAM MEMBER
  // ==========================================
  {
    id: 'team-dashboard',
    role: 'team_member',
    roleName: 'Team Member',
    category: 'Dashboard Personal',
    title: 'Dashboard Personal & Task Summary Harian',
    summary: 'Melihat ringkasan tugas proyek yang ditugaskan kepada Anda, prioritas deadline harian, dan absensi jam kerja.',
    targetRoute: '/team_member/dashboard',
    prerequisites: 'Role Team Member / Specialist',
    steps: [
      'Login ke aplikasi dan buka "Dashboard".',
      'Periksa Widget "Tugas Saya Hari Ini" (My Tasks Due Today).',
      'Periksa status persetujuan pengajuan lembur & cuti pribadi Anda.',
      'Klik task yang harus dikerjakan untuk melihat rincian instruksi dari Project Manager.'
    ],
    tips: 'Biasakan memeriksa dashboard personal setiap pagi saat mulai jam operasional kantor.',
    icon: Clock,
  },
  {
    id: 'team-projects',
    role: 'team_member',
    roleName: 'Team Member',
    category: 'Eksekusi Pekerjaan',
    title: 'Manajemen Proyek & Update Progress Task',
    summary: 'Mengerjakan tugas proyek, mengunggah bukti hasil kerja (link Figma, Drive, Code), dan memperbarui status task.',
    targetRoute: '/team_member/projects',
    prerequisites: 'Role Team Member',
    steps: [
      'Buka menu "Manajemen Proyek".',
      'Pilih proyek tempat Anda ditugaskan.',
      'Klik pada card task Anda, lalu ubah status dari "To Do" menjadi "In Progress" saat Anda mulai mengerjakan.',
      'Unggah attachment hasil karya / masukan link sampel pada kolom komentar task.',
      'Setelah selesai, ubah status task menjadi "Review" agar Project Manager melakukan pengecekan kualitas.'
    ],
    tips: 'Selalu berikan catatan singkat pada kolom komentar saat memindahkan task ke status Review.',
    icon: FolderKanban,
  },
  {
    id: 'team-overtime',
    role: 'team_member',
    roleName: 'Team Member',
    category: 'Pengajuan Mandiri',
    title: 'Pengajuan Jam Lembur (Overtime Claim)',
    summary: 'Mengajukan klaim jam lembur resmi jika diminta pengerjaan di luar jam kerja reguler untuk diverifikasi oleh HR & Finance.',
    targetRoute: '/team_member/overtime',
    prerequisites: 'Role Team Member',
    steps: [
      'Navigasi ke menu "Pengajuan Lembur".',
      'Klik tombol "+ Buat Pengajuan Lembur".',
      'Pilih Tanggal Lembur, Jam Mulai s/d Jam Selesai, serta pilih Proyek terkait.',
      'Isi alasan / deskripsi pekerjaan lembur yang dilakukan.',
      'Kirim pengajuan. Pengajuan Anda akan masuk ke daftar verifikasi HR Manager.'
    ],
    tips: 'Pastikan pengajuan lembur dibuat maksimal 24 jam setelah kegiatan lembur dilaksanakan.',
    icon: Clock,
  },
  {
    id: 'team-cuti',
    role: 'team_member',
    roleName: 'Team Member',
    category: 'Pengajuan Mandiri',
    title: 'Pengajuan Cuti Karyawan',
    summary: 'Mengajukan permohonan cuti tahunan / cuti khusus secara online dan memantau sisa kuota cuti pribadi Anda.',
    targetRoute: '/team_member/cuti',
    prerequisites: 'Role Team Member',
    steps: [
      'Buka menu "Pengajuan Cuti".',
      'Periksa sisa jatah kuota cuti tahunan Anda di bagian atas halaman.',
      'Klik "+ Pengajuan Cuti Baru".',
      'Pilih Jenis Cuti (Cuti Tahunan, Cuti Sakit, Cuti Alasan Penting), Tanggal Mulai s/d Selesai, dan Alasan Cuti.',
      'Kirimkan form. Sistem akan menembuskan persetujuan bertahap ke Project Manager dan HR Manager.'
    ],
    tips: 'Sediakan nama kawan tim pengganti (backup) dalam deskripsi pengajuan agar PM dapat menyetujui lebih cepat.',
    icon: UserMinus,
  },
  {
    id: 'team-reimbursement',
    role: 'team_member',
    roleName: 'Team Member',
    category: 'Pengajuan Mandiri',
    title: 'Klaim Reimbursement Operasional',
    summary: 'Mengajukan penggantian uang untuk pengeluaran operasional proyek pribadi (bensin, meeting klien, pembelian aset kecil).',
    targetRoute: '/team_member/reimbursement',
    prerequisites: 'Role Team Member',
    steps: [
      'Buka menu "Reimbursement".',
      'Klik "+ Pengajuan Reimbursement Baru".',
      'Isi Tanggal Transaksi, Kategori Biaya, Keterangan Pengeluaran, dan Nominal.',
      'Upload foto/scan struk kwitansi pembayaran yang jelas dan terlegitimasi.',
      'Klik "Kirim Klaim". Anda dapat melacak status pencairan oleh Finance Manager di halaman ini.'
    ],
    tips: 'Kwitansi yang buram atau tanpa rincian item transaksi berisiko ditolak oleh Finance Manager.',
    icon: CreditCard,
  },
];

const ROLES_LIST = [
  { id: 'all', label: 'Semua Role', icon: Sparkles },
  { id: 'owner', label: 'Owner / CEO', icon: ShieldCheck },
  { id: 'super_admin', label: 'Super Admin', icon: Server },
  { id: 'finance', label: 'Finance Manager', icon: DollarSign },
  { id: 'hr', label: 'HR Manager', icon: Users },
  { id: 'pm', label: 'Project Manager (PM)', icon: FolderKanban },
  { id: 'ae', label: 'Account Executive (AE)', icon: TrendingUp },
  { id: 'team_member', label: 'Team Member', icon: Briefcase },
];

export default function PublicManualGuidePage() {
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  // Filter topics based on role & search query
  const filteredTopics = useMemo(() => {
    return MANUAL_TOPICS.filter((topic) => {
      const matchRole = selectedRole === 'all' || topic.role === selectedRole;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        topic.title.toLowerCase().includes(query) ||
        topic.summary.toLowerCase().includes(query) ||
        topic.category.toLowerCase().includes(query) ||
        topic.roleName.toLowerCase().includes(query) ||
        topic.steps.some((step) => step.toLowerCase().includes(query));

      return matchRole && matchSearch;
    });
  }, [selectedRole, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  const toggleAccordion = (id: string) => {
    setExpandedTopicId(expandedTopicId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans print:bg-white print:text-black">
      {/* Minimalist Clean Top Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#E8304A] flex items-center justify-center text-white font-bold text-sm shadow-xs">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 text-sm leading-tight tracking-tight">
                Bertumbuh Agency ERP
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
                User Manual v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Panduan Operasional Per Role & Fitur
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Printer size={14} /> Cetak / PDF
          </button>
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#E8304A] hover:bg-[#FF4D6A] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <LogIn size={14} /> Masuk ke App ERP
          </Link>
        </div>
      </header>

      {/* Clean Minimal Hero Header */}
      <section className="bg-white border-b border-slate-200 px-6 py-8 print:hidden">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold tracking-wider text-[#E8304A] uppercase bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-md inline-block">
              Standard Operating Procedure (SOP)
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Panduan Penggunaan Bertumbuh ERP
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Petunjuk operasional langkah-demi-langkah bagi seluruh role pengguna (Owner, Super Admin, Finance, HR, PM, AE, dan Team Member).
            </p>
          </div>

          {/* Minimalist Search Bar */}
          <div className="relative max-w-2xl pt-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari instruksi (contoh: reimbursement, cuti, jurnal, quotation, invoice, lembur)..."
              className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-[#F9FAFB] text-slate-900 placeholder-slate-400 text-xs font-medium border border-slate-200 shadow-2xs focus:outline-none focus:border-[#E8304A] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] bg-slate-200 hover:bg-slate-300 text-slate-600 px-2 py-0.5 rounded-md transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-6 space-y-6">
        {/* Minimalist Role Pill Tabs */}
        <section className="print:hidden">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Pilih Role Pengguna
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Menampilkan {filteredTopics.length} dari {MANUAL_TOPICS.length} Prosedur
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            {ROLES_LIST.map((r) => {
              const IconComp = r.icon;
              const isActive = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap border shrink-0 ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <IconComp size={14} className={isActive ? 'text-rose-400' : 'text-slate-400'} />
                  {r.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Topic Accordions */}
        {filteredTopics.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-800">
              Tidak ada panduan ditemukan
            </p>
            <p className="text-xs text-slate-500">
              Kata kunci <span className="font-semibold text-slate-700">"{searchQuery}"</span> tidak cocok dengan instruksi manapun.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRole('all');
              }}
              className="mt-2 text-xs font-medium text-[#E8304A] hover:underline"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTopics.map((topic) => {
              const TopicIcon = topic.icon;
              const isExpanded = expandedTopicId === topic.id || !!searchQuery;

              return (
                <article
                  key={topic.id}
                  className={`bg-white border rounded-xl transition-all overflow-hidden ${
                    isExpanded ? 'border-slate-300 shadow-sm' : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {/* Topic Item Header */}
                  <header
                    onClick={() => toggleAccordion(topic.id)}
                    className="p-4 cursor-pointer flex items-center justify-between gap-4 select-none hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                        <TopicIcon size={18} />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {topic.roleName}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">
                            • {topic.category}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 truncate">
                          {topic.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 print:hidden">
                      <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
                        {isExpanded ? 'Tutup' : 'Lihat Detail'}
                      </span>
                      {isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                    </div>
                  </header>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-[#FAFAFB] p-4 space-y-4 text-xs">
                      <p className="text-slate-600 leading-relaxed font-medium">
                        {topic.summary}
                      </p>

                      {/* Prerequisites */}
                      <div className="bg-amber-50/80 border border-amber-200/60 rounded-lg p-3 flex items-start gap-2.5">
                        <Info size={15} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-amber-900 block text-[11px]">Syarat Akses:</span>
                          <span className="text-amber-800">{topic.prerequisites}</span>
                        </div>
                      </div>

                      {/* Step by Step */}
                      <div className="space-y-2">
                        <span className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] block">
                          Langkah demi Langkah:
                        </span>
                        <ol className="space-y-1.5">
                          {topic.steps.map((step, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2.5 bg-white border border-slate-200 p-2.5 rounded-lg text-slate-700 font-medium shadow-2xs"
                            >
                              <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="leading-normal">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Tips */}
                      <div className="bg-emerald-50/80 border border-emerald-200/60 rounded-lg p-3 flex items-start gap-2.5">
                        <Sparkles size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-emerald-900 block text-[11px]">Pro-Tip:</span>
                          <span className="text-emerald-800">{topic.tips}</span>
                        </div>
                      </div>

                      {/* Shortcut Link */}
                      {topic.targetRoute && (
                        <div className="pt-2 flex items-center justify-end print:hidden border-t border-slate-200/60">
                          <Link
                            href={topic.targetRoute}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8304A] hover:text-[#FF4D6A] transition-colors"
                          >
                            Buka Halaman Modul <ArrowRight size={13} />
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="mt-8 bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <p>© {new Date().getFullYear()} PT Bertumbuh Creative Agency ERP</p>
          <button onClick={handlePrint} className="hover:text-slate-800 transition-colors">
            Cetak Manual PDF
          </button>
        </div>
      </footer>
    </div>
  );
}
