'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search, BookOpen, ShieldCheck, Users, Activity, Server, TrendingUp,
  FolderKanban, FolderTree, DollarSign, CalendarDays, CreditCard, FileSpreadsheet,
  UserCheck, Clock, UserMinus, Layers, FileText, Send, Receipt,
  Building, Calculator, ChevronDown, ChevronRight, ArrowLeft, Printer,
  ExternalLink, Sparkles, CheckCircle2, HelpCircle, Info, Briefcase,
  Award, Scale, ArrowLeftRight, PieChart, Landmark, Wallet, LogIn
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
  // 👑 OWNER / CEO
  // ==========================================
  {
    id: 'owner-summary',
    role: 'owner',
    roleName: '👑 Owner / CEO',
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
    roleName: '👑 Owner / CEO',
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
    roleName: '👑 Owner / CEO',
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
  // 🛡️ SUPER ADMIN
  // ==========================================
  {
    id: 'admin-users',
    role: 'super_admin',
    roleName: '🛡️ Super Admin',
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
    roleName: '🛡️ Super Admin',
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
    roleName: '🛡️ Super Admin',
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
  // 💰 FINANCE MANAGER
  // ==========================================
  {
    id: 'fin-accounting-entry',
    role: 'finance',
    roleName: '💰 Finance Manager',
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
    roleName: '💰 Finance Manager',
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
    roleName: '💰 Finance Manager',
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
    icon: ArrowLeftRight,
  },
  {
    id: 'fin-invoicing',
    role: 'finance',
    roleName: '💰 Finance Manager',
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
    roleName: '💰 Finance Manager',
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
    roleName: '💰 Finance Manager',
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
  // 👥 HR MANAGER
  // ==========================================
  {
    id: 'hr-matrix',
    role: 'hr',
    roleName: '👥 HR Manager',
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
    roleName: '👥 HR Manager',
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
    roleName: '👥 HR Manager',
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
    roleName: '👥 HR Manager',
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
  // 📂 PROJECT MANAGER (PM)
  // ==========================================
  {
    id: 'pm-overview',
    role: 'pm',
    roleName: '📂 Project Manager (PM)',
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
    roleName: '📂 Project Manager (PM)',
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
    roleName: '📂 Project Manager (PM)',
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
    roleName: '📂 Project Manager (PM)',
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
  // 📈 ACCOUNT EXECUTIVE (AE)
  // ==========================================
  {
    id: 'ae-leads',
    role: 'ae',
    roleName: '📈 Account Executive (AE)',
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
    roleName: '📈 Account Executive (AE)',
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
    roleName: '📈 Account Executive (AE)',
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
  // 💻 TEAM MEMBER
  // ==========================================
  {
    id: 'team-dashboard',
    role: 'team_member',
    roleName: '💻 Team Member (Anggota Tim)',
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
    roleName: '💻 Team Member (Anggota Tim)',
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
    roleName: '💻 Team Member (Anggota Tim)',
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
    roleName: '💻 Team Member (Anggota Tim)',
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
    roleName: '💻 Team Member (Anggota Tim)',
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
  { id: 'all', label: 'Semua Role', icon: Sparkles, color: 'from-emerald-600 to-teal-600' },
  { id: 'owner', label: '👑 Owner / CEO', icon: ShieldCheck, color: 'from-amber-500 to-orange-600' },
  { id: 'super_admin', label: '🛡️ Super Admin', icon: Server, color: 'from-red-600 to-rose-700' },
  { id: 'finance', label: '💰 Finance Manager', icon: DollarSign, color: 'from-emerald-600 to-teal-700' },
  { id: 'hr', label: '👥 HR Manager', icon: Users, color: 'from-blue-600 to-indigo-700' },
  { id: 'pm', label: '📂 Project Manager (PM)', icon: FolderKanban, color: 'from-purple-600 to-violet-700' },
  { id: 'ae', label: '📈 Account Executive (AE)', icon: TrendingUp, color: 'from-pink-600 to-rose-600' },
  { id: 'team_member', label: '💻 Team Member', icon: Briefcase, color: 'from-cyan-600 to-blue-600' },
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col print:bg-white print:text-black">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-emerald-600/20">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">
                Bertumbuh Agency ERP
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold tracking-wide uppercase border border-emerald-300 dark:border-emerald-800">
                User Manual v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Panduan Pengoperasian Sistem Terpadu Per Role & Fungsi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Printer size={15} /> Cetak / Save PDF
          </button>
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
          >
            <LogIn size={15} /> Masuk ke App ERP
          </Link>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white px-4 lg:px-8 py-10 lg:py-14 print:hidden border-b border-emerald-900/40 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                <BookOpen size={14} /> Official Standard Operating Procedure (SOP)
              </div>
              <h2 className="text-2xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Pusat Panduan & Operasional <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  PT Bertumbuh Creative Agency
                </span>
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Panduan lengkap dan instruksi langkah-demi-langkah penggunaan modul ERP bagi 7 role utama:
                Owner, Super Admin, Finance Manager, HR Manager, Project Manager, Account Executive, dan Team Member.
              </p>
            </div>

            {/* Quick Stats Badges */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl text-center">
                <p className="text-2xl font-black text-emerald-400">7 Role</p>
                <p className="text-[11px] text-slate-300 font-medium mt-0.5">Hak Akses Sistem</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl text-center">
                <p className="text-2xl font-black text-teal-400">40+ Modul</p>
                <p className="text-[11px] text-slate-300 font-medium mt-0.5">Prosedur Operasional</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl text-center col-span-2">
                <p className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={14} /> 100% Real Operational State
                </p>
              </div>
            </div>
          </div>

          {/* Instant Search Bar */}
          <div className="mt-8 relative max-w-3xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari fitur atau instruksi (contoh: reimbursement, cuti, jurnal, quotation, invoice, lembur)..."
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium border border-slate-200 dark:border-slate-800 shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-lg transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Role Tab Navigation Bar */}
        <section className="print:hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Filter Berdasarkan Role Pengguna
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan {filteredTopics.length} dari {MANUAL_TOPICS.length} Prosedur
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {ROLES_LIST.map((r) => {
              const IconComp = r.icon;
              const isActive = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300'
                  }`}
                >
                  <IconComp size={15} />
                  {r.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Results List */}
        {filteredTopics.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <HelpCircle size={24} />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Tidak Ada Panduan Ditemukan
            </h4>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Kata kunci <span className="font-semibold text-slate-800 dark:text-slate-200">"{searchQuery}"</span> tidak cocok dengan instruksi role manapun. Coba cari dengan kata kunci lain.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRole('all');
              }}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              Reset Filter & Pencarian
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTopics.map((topic, index) => {
              const TopicIcon = topic.icon;
              const isExpanded = expandedTopicId === topic.id || !!searchQuery;

              return (
                <article
                  key={topic.id}
                  className={`bg-white dark:bg-slate-900 border rounded-3xl transition-all overflow-hidden ${
                    isExpanded
                      ? 'border-emerald-500/80 ring-2 ring-emerald-500/20 shadow-lg'
                      : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 shadow-sm'
                  }`}
                >
                  {/* Topic Header Card */}
                  <header
                    onClick={() => toggleAccordion(topic.id)}
                    className="p-5 lg:p-6 cursor-pointer flex items-start justify-between gap-4 select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <TopicIcon size={22} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-extrabold tracking-wide uppercase">
                            {topic.roleName}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                            {topic.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                          {topic.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {topic.summary}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-1 print:hidden">
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hidden sm:inline-block">
                        {isExpanded ? 'Tutup Detail' : 'Lihat Langkah'}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </div>
                    </div>
                  </header>

                  {/* Topic Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-5 lg:p-6 space-y-6">
                      {/* Prerequisites Box */}
                      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 rounded-2xl p-4 flex items-start gap-3">
                        <Info size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                            Syarat & Permisi Hak Akses:
                          </p>
                          <p className="text-xs text-amber-800 dark:text-amber-400">
                            {topic.prerequisites}
                          </p>
                        </div>
                      </div>

                      {/* Step-by-Step Instructions */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-600" /> Prosedur Langkah demi Langkah:
                        </h4>
                        <ol className="space-y-2.5">
                          {topic.steps.map((step, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-3 bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 p-3.5 rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-200"
                            >
                              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="pt-0.5 leading-relaxed">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Pro-Tips Banner */}
                      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 rounded-2xl p-4 flex items-start gap-3">
                        <Sparkles size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                            Pro-Tip & Praktik Terbaik Operasional:
                          </p>
                          <p className="text-xs text-emerald-800 dark:text-emerald-400 leading-relaxed">
                            {topic.tips}
                          </p>
                        </div>
                      </div>

                      {/* Quick Shortcut Link to Feature */}
                      {topic.targetRoute && (
                        <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800 print:hidden">
                          <span className="text-xs text-slate-500 font-medium">
                            Siap mengeksekusi fitur ini di aplikasi?
                          </span>
                          <Link
                            href={topic.targetRoute}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all shadow-sm"
                          >
                            Buka Modul Fitur <ExternalLink size={14} />
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

      {/* Footer Standard */}
      <footer className="mt-12 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 px-4 lg:px-8 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} PT Bertumbuh Creative Agency ERP. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Standard Operating Procedure v1.0</span>
            <span>•</span>
            <button onClick={handlePrint} className="hover:text-slate-600 transition-colors">
              Cetak Dokumen Manual
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
