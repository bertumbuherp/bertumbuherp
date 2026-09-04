# LOG CATATAN PERUBAHAN & UPDATE PEKERJAAN (WORK LOG)
## BERTUMBUH AGENCY ERP

Dokumen ini mencatat secara sistematis seluruh perubahan file, penambahan fitur, refactoring, dan perbaikan bug dalam proyek **Bertumbuh Agency ERP**. Setiap aktivitas pembaruan kode akan selalu dicatat di sini.

## 📅 Tanggal: 04 September 2026

### 5. Pembuatan Standalone Public User Manual Guide (`/manualguide`) per Role & Fungsi (Minimalist ERP Style)

#### 📄 [NEW] `src/app/manualguide/page.tsx`
- **Tujuan**: Menyediakan dokumen panduan pengguna (User Manual & SOP) interaktif per role dan per fungsi yang minimalis, elegan, dan selaras 100% dengan tema visual Bertumbuh Agency ERP.
- **Detail Perubahan**:
  - **Desain Minimalis & Clean ERP Theme**: Menggantikan latar gelap heavy dengan latar bersih khas Bertumbuh ERP (`bg-[#F8FAFC]`), kartu putih berbatas halus (`bg-white border-slate-200 rounded-xl shadow-2xs`), serta aksen merah brand (`#E8304A`).
  - **Header Navigasi Ringkas**: Menampilkan logo brand lingkaran merah Bertumbuh, badge versi, tombol "Cetak / PDF", dan tombol "Masuk ke App ERP".
  - **Bilah Pencarian Minimalis**: Input pencarian bersih dengan icon Lucide untuk menyaring instruksi secara real-time.
  - **Pill Role Tab Elegan**: Filter role bersih (`Semua Role`, `Owner / CEO`, `Super Admin`, `Finance Manager`, `HR Manager`, `Project Manager`, `Account Executive`, `Team Member`) tanpa emoji ganda yang mengganggu.
  - **Accordion Langkah-demi-Langkah**: Rincian instruksi bersih dengan penomoran badge gelap (`bg-slate-900 text-white`), syarat akses info box, pro-tips hijau, dan shortcut link langsung ke modul terkait.

#### 📄 [MODIFY] `src/components/layout/Sidebar.tsx`
- **Tujuan**: Menambahkan opsi navigasi langsung "Panduan Pengguna" untuk seluruh role.
- **Detail Perubahan**: Menambahkan `{ label: 'Panduan Pengguna', href: '/manualguide', icon: BookOpen }` ke dalam menu sidebar seluruh role pengguna.

### 4. Redesign UI Tab Navigasi Accounting & Buku Besar (Bertumbuh Branding & Pill Modern)

#### 📄 [MODIFY] `src/app/(dashboard)/finance/accounting/page.tsx`
- **Tujuan**: Meredesain total tampilan navigasi tab `Accounting & Buku Besar` agar rapi, modern, tidak bertumpuk/terpotong, dan konsisten 100% dengan branding PT Bertumbuh Creative Agency.
- **Detail Perubahan**:
  - Mengubah container tab dari baris blok rektangular kaku `rounded-t-lg bg-gray-200` menjadi **Glassmorphic Floating Pill Container** (`bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-gray-200/80 shadow-sm`).
  - Menambahkan `whitespace-nowrap` pada seluruh item tab sehingga label nama tab (misal: "Chart of Accounts (COA)", "Penyesuaian & Closing Period") tidak pernah terlipat kaku secara vertikal 2-3 baris.
  - Mengintegrasikan ikon Lucide-react yang presisi pada masing-masing dari 11 tab (`FilePlus`, `FolderTree`, `BookOpen`, `TrendingUp`, `ArrowLeftRight`, `BarChart3`, `Award`, `Scale`, `PieChart`, `Landmark`, `Wallet`).
  - Menerapkan status tab aktif dengan **Emerald-Teal Brand Gradient** (`from-emerald-600 to-teal-600 text-white shadow-md rounded-xl`) khas PT Bertumbuh Creative Agency.
  - Mempercantik wrapper kontainer utama section menjadi `rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[65vh]`.

### 3. Pembersihan 100% Mock Data untuk Operasional Nyata (Clean Operational Reset)

#### 📄 [MODIFY] `src/lib/store/*` (`hrStore.ts`, `financeStore.ts`, `crmStore.ts`, `pmStore.ts`, `calendarStore.ts`, `activityLogStore.ts`, `systemStatusStore.ts`)
- **Tujuan**: Mereset seluruh array initial state simulasi/mock data menjadi array kosong `[]`.
- **Detail Perubahan**: Mengosongkan data transaksi demo (cuti, lembur, absensi, jurnal akuntansi, reimbursement, payroll, invoice, clients, deals, projects, tasks, event kalender, audit log, dan error logs). Mempertahankan 9 akun pegawai internal untuk 6 role.

#### 📄 [MODIFY] Komponen UI (`LeaveTimelineGuardingView.tsx`, `HRPerformanceTrackingView.tsx`, `TeamAllocationMatrixView.tsx`, `src/app/(dashboard)/pm/reports/page.tsx`)
- **Tujuan**: Mengubah tampilan komponen UI dari data sampel hardcoded menjadi 100% kalkulasi dinamis & empty states bersih.
- **Detail Perubahan**: Menghapus fallback hardcoded nama "Ghani Affan", "Amalia", "PT Maju Bersama", "Kopi Nusantara", dll. Menambahkan *empty state* pada tabel dan form selector.

#### 📄 [MODIFY] `src/backend/repositories/mockRepository.ts`
- **Tujuan**: Mereset repository sampel data dummy backend.
- **Detail Perubahan**: Mengosongkan seluruh array transaksional `clients`, `deals`, `projects`, `tasks`, `invoices`, `expenses`, `overtimeEntries`, `clientReports`, `teamWorkload`, `atRiskAlerts` menjadi `[]`.

### 2. Perbaikan Next.js Production Build (Suspense Boundary Vercel Deployment)

#### 📄 [MODIFY] `src/app/(dashboard)/super_admin/page.tsx`
- **Tujuan**: Membungkus komponen `SuperAdminPageContent` yang menggunakan `useSearchParams()` dengan `<Suspense>` boundary.
- **Detail Perubahan**: Mencegah error Next.js static prerendering export saat build di Vercel (`useSearchParams() should be wrapped in a suspense boundary`). Memastikan proses `npm run build` dan deployment Vercel berjalan 100% sukses tanpa error.

### 1. Pembersihan Mock Data & Persiapan Operations Real 100%

#### 📄 [NEW] `src/lib/services/supabaseDataService.ts`
- **Tujuan**: Service terpusat operasi CRUD database Supabase PostgreSQL Cloud.
- **Detail Perubahan**: Menyediakan method async untuk sinkronisasi live data ke 27 tabel PostgreSQL Supabase (`profiles`, `clients`, `deals`, `service_packages`, `quotations`, `projects`, `tasks`, `journal_entries`, `reimbursements`, `employee_leaves`, `employee_overtimes`, `employee_attendances`, `activity_logs`).

#### 📄 [MODIFY] Refactoring 8 Zustand Stores (`src/lib/store/*`)
- **Tujuan**: Menghubungkan state lokal ke Supabase Cloud dan menyediakan opsi *Clean Operational Reset*.
- **Detail Perubahan**:
  - `userStore.ts`: Menambahkan `fetchFromSupabase()`, `clearMockData()`, dan sinkronisasi `upsertEmployee()` ke Supabase.
  - `pmStore.ts`: Menambahkan `fetchFromSupabase()`, `clearMockData()`, dan sinkronisasi `upsertProject()`, `upsertTask()`, `deleteTask()` ke Supabase.
  - `crmStore.ts`: Menambahkan `fetchFromSupabase()`, `clearMockData()`, dan sinkronisasi `upsertClient()`, `upsertDeal()`, `upsertPackage()`, `upsertQuotation()`.
  - `financeStore.ts`: Menambahkan `fetchFromSupabase()`, `clearMockData()`, dan sinkronisasi `upsertJournalEntry()`, `upsertReimbursement()`.
  - `hrStore.ts`: Menambahkan `fetchFromSupabase()`, `clearMockData()`, dan sinkronisasi `upsertLeave()`, `upsertOvertime()`, `upsertAttendance()`.
  - `calendarStore.ts`: Menambahkan `clearMockData()`.
  - `activityLogStore.ts`: Menambahkan `fetchFromSupabase()`, `clearMockData()`, dan sinkronisasi `addActivityLog()`.

#### 📄 [MODIFY] Refactoring Komponen UI (Menghapus Import Direct Mock Data)
- **Tujuan**: Mengubah tampilan komponen UI agar 100% dinamik dari store dan session user login.
- **Detail Perubahan**:
  - `src/components/views/ProjectDetailsView.tsx`: Membaca `employees` & `clients` secara dinamis dari `useUserStore()` dan `useCrmStore()`.
  - `src/components/views/CalendarView.tsx`: Membaca `employees` secara dinamis dari `useUserStore()`.
  - `src/components/pm/PMOverview.tsx`: Menggunakan `usePMStore()` dan `useUserStore()` untuk menghitung metrik & proyek delay secara dinamis.
  - `src/components/pm/PMTodoList.tsx`: Menggunakan `usePMStore()`.
  - `src/components/pm/PMTeam.tsx`: Menghitung *team workload* dan jam kerja secara dinamis dari perolehan tugas pengguna.
  - `src/components/pm/PMClientReport.tsx`: Menghasilkan laporan progress klien secara dinamis berdasarkan data proyek aktif.
  - `src/components/pm/ProjectKanbanBoard.tsx`: Membaca tim penanggung jawab dari `useUserStore()`.
  - `src/components/team/WeeklyReportBuilderView.tsx`: Menghitung beban kerja dan laporan progress secara dinamis.
  - `src/components/team/WorkloadTrackingView.tsx`: Menghitung alokasi jam kerja tim secara dinamis.
  - `src/components/team/MemberTaskBoard.tsx`: Menghapus fallback hardcoded nama 'Dimas Prasetyo' dan menyaring tugas berdasarkan session aktif.
  - `src/components/pm/GoogleCalendarSyncWidget.tsx` & `src/lib/services/GoogleCalendarSync.ts`: Menggunakan email user login `session.email` secara dinamis.
  - `src/components/pm/ProjectListView.tsx` & `src/components/crm/CRMDashboard.tsx`: Menghapus fallback paksa ke array mock saat proyek/deals berukuran 0.

#### 📄 [MODIFY] `src/components/admin/SystemStatusView.tsx`
- **Tujuan**: Menambahkan panel *Manajemen Operations Real & Database State* di dashboard Super Admin.
- **Detail Perubahan**: Menyediakan tombol **"Sinkronkan Supabase Cloud"** dan **"Bersihkan Mock Data & Operational Clean State"** beserta notifikasi status live.

---

## 📅 Tanggal: 03 September 2026


### 1. Penyesuaian Aplikasi untuk Penggunaan Real (Internal ERP PT Bertumbuh)

### 2. Modul Admin (Kelola User & Log Aktivitas Audit Trail)

#### 📄 [NEW] `src/lib/store/activityLogStore.ts`
- **Tujuan**: Store terpusat sistem audit log aktivitas seluruh pengguna.
- **Detail Perubahan**: Menyimpan timestamp, pengguna, role, modul, jenis aksi, dan rincian aktivitas sistem secara real-time.

#### 📄 [NEW] `src/lib/store/userStore.ts`
- **Tujuan**: Store terpusat manajemen pengguna ERP (pengembangan karyawan).
- **Detail Perubahan**: Fungsi `addUser`, `updateUser`, `deleteUser`, dan `toggleUserStatus` yang secara otomatis terintegrasi dengan pencatatan audit log.

#### 📄 [NEW] `src/components/admin/UserManagementView.tsx`
- **Tujuan**: Tampilan antarmuka Kelola User & Hak Akses bagi Admin & Owner.
- **Detail Perubahan**: Tabel data user, filter role & status, modal tambah user baru, modal edit profil & gaji, serta konfirmasi hapus/nonaktifkan user.

#### 📄 [NEW] `src/components/admin/ActivityLogView.tsx`
- **Tujuan**: Tampilan antarmuka Log Aktivitas (Audit Trail Pengawas).
- **Detail Perubahan**: Tabel audit trail dengan filter modul (`AUTH`, `USER_MGMT`, `CRM`, `PM`, `FINANCE`, `HR`), filter role, pencarian kata kunci, serta tombol **Export CSV Report**.

#### 📄 [NEW] Rute App Router:
- `src/app/(dashboard)/super_admin/page.tsx`
- `src/app/(dashboard)/super_admin/users/page.tsx`
- `src/app/(dashboard)/super_admin/activity-logs/page.tsx`

#### 📄 [MODIFY] `src/lib/permissions.ts` & `src/components/layout/Sidebar.tsx`
- **Tujuan**: Integrasi hak akses dan navigasi menu Admin/Owner.
- **Detail Perubahan**: Menambahkan menu **Kelola User & Hak Akses** dan **Log Aktivitas (Audit)** pada Sidebar Owner dan Super Admin.

#### 📄 [MODIFY] `src/contexts/AuthContext.tsx`
- **Tujuan**: Pencatatan otomatis audit log pada autentikasi.
- **Detail Perubahan**: Menambahkan pengiriman event audit log otomatis saat pengguna Login dan Logout.

#### 📄 [NEW] `.env.local` & `.env.example`
- **Tujuan**: Menyimpan konfigurasi environment variable & daftar kredensial akun internal per role.
- **Detail Perubahan**:
  - Menyediakan variabel environment untuk 6 role internal (`Owner`, `PM`, `Finance`, `AE`, `HR`, `Karyawan`).
  - Menyediakan variabel konfigurasi koneksi Supabase & app environment.

#### 📄 [MODIFY] `.gitignore`
- **Tujuan**: Mencegah kebocoran file environment ke repositori Git.
- **Detail Perubahan**: Menambahkan `.env*.local`, `.env`, `.env.production`, `.env.development` ke `.gitignore`.

#### 📄 [MODIFY] `src/app/login/page.tsx`
- **Tujuan**: Mengubah halaman login dari mode demo/multi-tenant menjadi Portal Login Internal Resmi PT Bertumbuh Creative.
- **Detail Perubahan**:
  - Menghapus banner `DEMO ACCESS / Lingkungan Sandbox Aktif`.
  - Menghapus pembungkus tombol `Akses Cepat Mode Demo` (Owner, PM, Finance, AE, HR, Karyawan).
  - Menghapus tab dan form `Ajukan Demo` / `Daftar Agensi Baru` (multi-tenant registration).
  - Memperbarui teks header & branding panel menjadi portal operasional internal resmi Bertumbuh ERP.

#### 📄 [MODIFY] `src/backend/services/AuthService.ts`
- **Tujuan**: Pengetatan autentikasi login pengguna.
- **Detail Perubahan**:
  - Menghapus bypass kata sandi bebas mode demo.
  - Mewajibkan validasi kata sandi terenkripsi/terdaftar untuk akun internal.

#### 📄 [MODIFY] `src/components/crm/StrategiPackageView.tsx`
- **Tujuan**: Pembersihan label demo UI.
- **Detail Perubahan**:
  - Mengubah label `Mock Approval` menjadi `Persetujuan Direksi`.

---

## 📅 Tanggal: 25 Juli 2026

### 1. Penambahan & Pembaruan File

#### 📄 [NEW] `implementation.md`
- **Tujuan**: Dokumen master implementasi & roadmap teknis v1.0.0.
- **Detail Perubahan**:
  - Menyusun blueprint arsitektur database relasional Supabase PostgreSQL.
  - Memetakan solusi teknis detail untuk seluruh masukan divisi (PM, AE, Team, Finance, HR, Owner).
  - Menyusun tahapan eksekusi (Phase 1 s/d Phase 5) dan rencana pengujian (unit & UAT).

#### 📄 [MODIFY] `src/lib/types.ts`
- **Tujuan**: Penambahan interface & tipe data TypeScript untuk fitur-fitur baru v1.0.0.
- **Detail Perubahan**:
  - `PackageTier` & `PackageTierType`: Tipe tier paket layanan klien (`TIER_A`, `TIER_B`, `TIER_C`).
  - `ExtendedProjectAddOn` & `AddOnCategoryType`: Tipe data biaya tambahan PM (`TALENT_KOL`, `PRINTING`, `MEDIA_PLACEMENT`, dll).
  - `AdsSpendRecord` & `AdsPlatform`: Tipe pencatatan budget iklan tim performance (Meta, Google, TikTok, Shopee Ads).
  - `DivisionalWeeklyReport`: Model laporan mingguan terkolaborasi antar leader divisi.
  - `ChartOfAccount`, `JournalEntry`, `JournalLine`: Tipe master COA, Jurnal Umum, dan Buku Besar.
  - `CashFlowItem`: Model Laporan Arus Kas 3 Aktivitas (Operasional, Investasi, Pendanaan).
  - `EmployeePayrollDetail`: Komponen lengkap slip gaji (Gaji Pokok, Tunjangan Kinerja, Uang Kehadiran, Lembur, Bonus, Potongan).

#### 📄 [NEW] `src/components/pm/PackageTierBadge.tsx`
- **Tujuan**: Komponen UI khusus untuk menampilkan Tier Paket & Chip Layanan In-Line per Klien (Divisi PM).
- **Detail Perubahan**:
  - Menampilkan badge tier (`Tier A Enterprise`, `Tier B Growth`, `Tier C Essential`, `Custom`).
  - Menampilkan chips layanan aktif secara *in-line* (contoh: *SMS, CC, Production, Design, Ecommerce, Performance*).

#### 📄 [MODIFY] `src/backend/repositories/mockRepository.ts`
- **Tujuan**: Melengkapi data mock proyek dengan informasi Tier Paket & Layanan.
- **Detail Perubahan**:
  - Menambahkan properti `packageTier`, `packageServices`, `contractStartDate`, `contractEndDate`, dan `monthlyRetainerFee` pada seluruh entri `projects`.

#### 📄 [MODIFY] `src/components/pm/PMDashboardView.tsx`
- **Tujuan**: Integrasi Package Tier & Scope Services Badge langsung di PM Dashboard (`/pm/dashboard`).
- **Detail Perubahan**:
  - Menampilkan `PackageTierBadge` pada setiap kartu proyek di bagian *Status Proyek Berjalan*.

#### 📄 [MODIFY] `src/components/pm/ProjectListView.tsx`
- **Tujuan**: Integrasi Package Tier Badge pada Halaman List Manajemen Proyek (`/pm/projects`).
- **Detail Perubahan**:
  - Menampilkan `PackageTierBadge` pada setiap card grid proyek yang dikelola PM.

#### 📄 [MODIFY] `src/components/pm/PMOverview.tsx`
- **Tujuan**: Integrasi Tampilan In-Line Package Tier & Kontrak pada PM Overview.
- **Detail Perubahan**:
  - Menampilkan `PackageTierBadge` pada daftar status proyek PM secara *in-line*.
  - Mengubah tipe eksplisit `(st: any)` menjadi `(st: string)`.

#### 📄 [NEW] `src/lib/services/GoogleCalendarSync.ts`
- **Tujuan**: Service layer OAuth2 2-Way Sync Google Calendar API.
- **Detail Perubahan**:
  - Menyediakan fungsi manajemen koneksi akun Google PM (`connect`, `disconnect`, `toggleAutoSync`).
  - Fungsi `syncEvent` untuk otomatisasi sinkronisasi rapat & deadline ke kalender Google.

#### 📄 [NEW] `src/components/pm/GoogleCalendarSyncWidget.tsx`
- **Tujuan**: Widget kontrol UI interaktif untuk Google Calendar 2-Way Sync.
- **Detail Perubahan**:
  - Indikator status koneksi terhubung (`dewi.pm@bertumbuh.id`).
  - Tombol aksi: Hubungkan Akun, Toggle Auto-Sync ON/OFF, dan Sync Manual Sekarang.

#### 📄 [MODIFY] `src/lib/store/pmStore.ts`
- **Tujuan**: Menambahkan action `addProjectAddOn` pada Zustand PM Store.
- **Detail Perubahan**: Memungkinkan PM menambahkan item add-on baru secara dinamis yang otomatis ter-update ke proyek.

#### 📄 [MODIFY] `src/components/pm/PMAddOn.tsx`
- **Tujuan**: Pembaruan Halaman & Tabel Add-on Klien PM (`/pm/addons`).
- **Detail Perubahan**:
  - Menambahkan Modal Form **"Tambah Add-On Klien Baru"** (KOL Talent, Cetak, Sewa Venue, Media Placement).
  - Kalkulasi profit markup otomatis (Harga Tagih - Biaya Pengadaan).
  - Indikator status penagihan (*Sudah Di-Invoice* vs *Belum Di-Invoice*).

#### 📄 [NEW] `src/components/pm/MeetingSchedulerModal.tsx`
- **Tujuan**: Modal interaktif penjadwalan timeline rapat tim spesifik kategori.
- **Detail Perubahan**:
  - Menyediakan preset kategori rapat: `Meeting Pitching Klien (Team Branding)`, `Strategy, Ideation & Planning (Team Sosmed)`, `Evaluasi Kinerja (Team Performance)`, dan `General Sync`.
  - Integrasi otomatis penambahan agenda ke `calendarStore` dan sinkronisasi 2-way Google Calendar.

#### 📄 [MODIFY] `src/components/pm/PMKalender.tsx`
- **Tujuan**: Integrasi modal `MeetingSchedulerModal` pada Kalender PM (`/pm/calendar`).
- **Detail Perubahan**: Menambahkan header kontrol & tombol *"Buat Jadwal Meeting Tim"*.

#### 📄 [MODIFY] `src/components/pm/ProjectKanbanBoard.tsx`
- **Tujuan**: Perbaikan tombol **"+ Buat Tugas Baru"** di Papan Kanban PM.
- **Detail Perubahan**:
  - Menambahkan Modal Form **"Buat Tugas Baru"** interaktif.
  - Memungkinkan input Judul, Deskripsi, Assignee Pelaksana, Sub-Tim (Design, Video, Sosmed, Web, Copywriting), Prioritas, dan Deadline.
  - Mengkoneksikan submit form langsung ke `addTask` di Zustand `usePMStore` secara dinamis.

#### 📄 [MODIFY] `src/components/pm/PMDashboardView.tsx`
- **Tujuan**: Integrasi widget `GoogleCalendarSyncWidget` & tombol modal `MeetingSchedulerModal` langsung pada halaman utama Dashboard PM (`/pm/dashboard`).
- **Detail Perubahan**:
  - Menampilkan Widget Kontrol 2-Way Sync Google Calendar.
  - Menambahkan tombol *"Jadwalkan Meeting Tim Baru"* untuk membuka modal penjadwalan timeline rapat.

#### 📄 [MODIFY] `src/components/layout/Sidebar.tsx`
- **Tujuan**: Memperbaiki error React 19 Hydration Mismatch (`Hydration failed because the server rendered HTML didn't match the client`).
- **Detail Perubahan**:
  - Menambahkan pengecekan `isMounted` state.
  - Memastikan navigasi menu sidebar yang bergantung pada `primaryRole` dari `localStorage` / Zustand baru dirender setelah komponen ter-mount di client side, mencegah perbedaan markup antara server HTML dan client hydration.

#### 📄 [MODIFY] `src/components/pm/GoogleCalendarSyncWidget.tsx`
- **Tujuan**: Mengubah integrasi Google Calendar menjadi real web link redirection & merapikan styling light mode.
- **Detail Perubahan**:
  - Tombol **"Hubungkan Google Calendar"** & **"Buka Google Calendar ↗"** kini secara otomatis membuka aplikasi Google Calendar web (`https://calendar.google.com/`) pada tab baru.
  - Memperbarui styling background card menjadi putih bersih yang konsisten dengan tema Light Mode ERP.

#### 📄 [MODIFY] `src/components/pm/MeetingSchedulerModal.tsx`
- **Tujuan**: Perbaikan kontras warna (Light Mode) dan penambahan Link Templating Event Google Calendar Asli.
- **Detail Perubahan**:
  - Menghapus class dark mode otomatis yang bentrok (`dark:bg-slate-900`), mengubah tampilan modal menjadi Light Mode konsisten (`bg-white`, `border-gray-200`, `text-gray-900`).
  - Menghasilkan tautan Google Calendar Template URL (`https://calendar.google.com/calendar/render?action=TEMPLATE...`).
  - Membuka tab Google Calendar secara otomatis saat rapat disubmit dan menyediakan tombol **"Buka di GCal ↗"**.

#### 📄 [MODIFY] `src/lib/types.ts`
- **Tujuan**: Penambahan properti `category` dan `discountPct` pada interface `QuotationLineItem`.
- **Detail Perubahan**: Memungkinkan klasifikasi kategori scope penawaran dan kalkulasi persentase diskon per item penawaran.

#### 📄 [MODIFY] `src/components/crm/PenawaranView.tsx`
- **Tujuan**: Implementasi **Quotation Builder Semi-Otomatis (Package Tiers + Custom Scope Items)**.
- **Detail Perubahan**:
  - Menambahkan tombol Preset Package Tier cepat (`+ Tier A Enterprise`, `+ Tier B Growth`, `+ Tier C Essential`).
  - Menambahkan selector **Kategori Scope** per item (`Branding`, `Sosmed/CC`, `Production`, `Design`, `Talent KOL`, `Ads Spend`, `Web Dev`).
  - Menambahkan input **Diskon (%)** per baris item dengan kalkulasi otomatis subtotal bersih, total diskon, PPN 11%, dan grand total penawaran.
  - Memperbarui tabel Live Preview dokumen Quotation penawaran harga.

#### 📄 [MODIFY] `src/components/crm/AddPackageModal.tsx`, `EditPackageModal.tsx`, `AddDealModal.tsx`, `MeetingSchedulerModal.tsx`, `PMAddOn.tsx`, `ProjectKanbanBoard.tsx`
- **Tujuan**: Memperbaiki UX Modal Overlay (menghilangkan background blur terpotong / kotak abu-abu tidak penuh).
- **Detail Perubahan**:
  - Menggunakan **React `createPortal`** agar seluruh modal popup dirender langsung di `document.body` tanpa terperangkap animasi `.fade-in` kontainer induk.
  - Menghapus efek `backdrop-blur` yang mengganggu legibilitas dan menggantinya dengan overlay `bg-black/60` yang bersih, jernih, dan menutup 100% viewport layar secara presisi.

#### 📄 [MODIFY] `src/components/crm/KontrakView.tsx`
- **Tujuan**: Perbaikan **Item 2.2: Isolasi Cetak PDF A4 Legal (Print Layout & Full Width Fix)**.
- **Detail Perubahan**:
  - Mengimplementasikan **CSS Layout Parent Reset** pada kontainer `#next`, `main`, `.p-6`, dan `.grid.grid-cols-1` saat pencetakan dilakukan.
  - Menambahkan utility `print:max-w-none print:w-full print:p-0 print:m-0` pada `.contract-container` dan `.print-legal-document` agar dokumen memenuhi 100% lebar kertas A4 secara sempurna.
  - Mempertahankan dan memulihkan grid dalam dokumen (`.grid-cols-2` dan `.grid-cols-12`) agar area tanda tangan (Pihak I & Pihak II) dan meta data tetap berjajar rapi secara horizontal tanpa mengalami distorsi vertikal.
  - Menambahkan proteksi `break-inside: avoid;` pada setiap `.article-block` dan `.signature-block` agar dokumen tercetak rapi tanpa pemotongan pasal atau tanda tangan yang menggantung.

#### 📄 [MODIFY] `src/lib/store/crmStore.ts` & `src/components/crm/PenawaranView.tsx`
- **Tujuan**: Implementasi **Item 2.3: Semi-Automatic Quotation Selector & Auto Conversion**.
- **Detail Perubahan**:
  - Menambahkan method `convertQuotationToDealAndProject(quotationId)` di `crmStore.ts` untuk mengonversi quotation yang disetujui menjadi Deal tahap `won` dan otomatis menerbitkan Proyek aktif di Project Manager (`pmStore.ts`).
  - Menambahkan toolbar **Semi-Automatic Quotation Selector** di `PenawaranView.tsx` dengan filter tab status (`Draft`, `Terkirim`, `Deal Won / Approved`) dan filter klien.
  - Menambahkan fitur **Side-by-Side Quotation Comparison Modal**: AE dapat memilih 2 atau lebih opsi quotation untuk dibandingkan secara berdampingan (Total Harga, Items, Diskon) sebelum dikonversi.
  - Menambahkan tombol aksi cepat **"⚡ Konversi ke Deal Won & PM"** pada setiap baris quotation dan di halaman pratinjau dokumen.

#### 📄 [MODIFY] `src/components/crm/PitchingView.tsx` *(BUGFIX — Audit Divisi AE)*
- **Tujuan**: Fix bug **nilai deal ter-concatenate** saat input angka di form Tambah Prospek Pitching Baru.
- **Root Cause**: Field `type="number"` dengan default state `25000000` menyebabkan angka baru ter-*append* ke nilai default (menghasilkan nilai seperti `Rp2.500.000.035.000.000`).
- **Fix**: Ubah state ke `string`, field ke `type="text" inputMode="numeric"`, strip non-angka di `onChange`, parse saat submit. Reset ke `''` setelah form ditutup. Tambah preview live `formatCurrency`.

#### 📄 [MODIFY] `src/components/crm/PenawaranView.tsx` *(BUGFIX — Audit Divisi AE)*
- **Tujuan**: Fix orientasi PDF Quotation dari **portrait → landscape**.
- **Fix**: Tambahkan `@page { size: A4 landscape; margin: 12mm 15mm; }` dan perbaiki CSS tabel print agar semua kolom muat dalam satu halaman horizontal.


- **Detail Perubahan**:
  - Menambahkan tombol **"+ Tambah Prospek Pitching Baru"** dan modal (createPortal) untuk menambahkan deal pitching baru langsung dari halaman ini.
  - Menambahkan fitur pemilihan **Modus Meeting**: **Online (G-Meet / Zoom)** vs **Offline / On-Site** dengan auto-fill URL meeting link saat mode Online dipilih.
  - Field **Tim Pendamping (Invitees)** untuk mencatat anggota tim yang hadir dalam presentasi.
  - Tombol **"Simpan & Sync Google Calendar ↗"** yang otomatis membuka Google Calendar Create Event baru dengan detail pitching (judul, catatan, lokasi, tanggal/waktu) yang sudah terisi.
  - Card pitching yang sudah dijadwalkan kini menampilkan **mode meeting** (Video/Online vs MapPin/Offline) dan link clickable untuk meeting Online.
  - Semua modal diubah ke **createPortal** (tanpa backdrop-blur) untuk konsistensi UX.
  - Notifikasi toast sukses setelah menyimpan jadwal / menandai outcome.

---

### 📊 STATUS PROGRESS PENGERJAAN PER DIVISI

#### 📁 1. DIVISI PROJECT MANAGER (PM) — (100% COMPLETED 🎉)
- [x] **Item 1.1 & 1.3**: Detail Kontrak & Package Tier In-Line Per Klien (`PackageTierBadge.tsx`, `PMDashboardView.tsx`, `ProjectListView.tsx`, `PMOverview.tsx`).
- [x] **Item 1.2**: Auto Connect Google Calendar (2-Way Sync via OAuth2 Service & Control Widget) (`GoogleCalendarSync.ts`, `GoogleCalendarSyncWidget.tsx`).
- [x] **Item 1.4**: Modul Project Add-on Client (Talent, Cetak, Venue) & Auto-Sync Invoice (`PMAddOn.tsx`, `pmStore.ts`).
- [x] **Item 1.5**: Penjadwalan Timeline Rapat Spesifik Kategori (`MeetingSchedulerModal.tsx`, `PMKalender.tsx`, `ProjectKanbanBoard.tsx`).

#### 📁 2. DIVISI ACCOUNT EXECUTIVE (AE) — (100% COMPLETED 🎉)
- [x] **Item 2.1**: Quotation Builder Semi-Otomatis (`PenawaranView.tsx`, `types.ts`).
- [x] **Item 2.2**: Generator Template Kontrak Legal (Auto PDF) (`KontrakView.tsx`).
- [x] **Item 2.3**: Semi-Automatic Quotation Selector (`PenawaranView.tsx`, `crmStore.ts`).
- [x] **Item 2.4**: Meeting Scheduling Pitching/Proposal Phase (`PitchingView.tsx`).

#### 📁 3. DIVISI TEAM PELAKSANA — (100% COMPLETED 🎉)
- [x] **Item 3.1**: Overload Workload Tracking & Capacity Guarding (Threshold 40 jam/minggu) (`WorkloadTrackingView.tsx`).
- [x] **Item 3.2**: Tracker Add-on Budget Ads (All Platform) & Direct Billing Sync (`AdsBudgetTrackerView.tsx`).
- [x] **Item 3.3**: Divisional Weekly Report Builder (`WeeklyReportBuilderView.tsx`).

#### 📁 4. DIVISI FINANCE & ACCOUNTING — (100% COMPLETED 🎉)
- [x] **Item 4.1**: Rincian Komponen Slip Gaji Karyawan (`GajiPayroll.tsx`).
- [x] **Item 4.2**: Integrasi Direct HR-to-Finance Payroll Link (`GajiPayroll.tsx`, `financeStore.ts`).
- [x] **Item 4.3**: Invoice PDF Generator (Retainer + Add-on KOL Talent + Ads Spend) (`InvoicePaymentList.tsx`).
- [x] **Item 4.4**: Mode Simulasi Pencatatan Jurnal Keuangan (`TransactionInput.tsx`).
- [x] **Item 4.5**: Dynamic Chart of Accounts (COA Master Management) (`COAManagementView.tsx`).
- [x] **Item 4.6**: Attachment Foto Nota / Bukti Reimbursement (`ReimbursTable.tsx`).
- [x] **Item 4.7**: Modul Buku Besar per Akun (General Ledger) (`GeneralLedgerView.tsx`).
- [x] **Item 4.8**: Recent Journal Entries & Edit/Void Jurnal (`JurnalTable.tsx`).
- [x] **Item 4.9**: Ekspor Laporan Keuangan PDF untuk BOD (`BODFinancialReportView.tsx`).
- [x] **Item 4.10**: Rekap Pendapatan Bulanan per Klien (Link Invoice -> Revenue) (`ClientRevenueReportView.tsx`).
- [x] **Item 4.11**: Laporan Arus Kas 3 Aktivitas (`CashFlowStatementView.tsx`).
- [x] **Item 4.12**: Reporting Multi-Periode (Bulanan vs YTD Jan-Jun) (`MultiPeriodReportView.tsx`).

#### 📁 5. DIVISI HR — (100% COMPLETED 🎉)
- [x] **Item 5.1**: Performance Team & Client Allocation Matrix (`TeamAllocationMatrixView.tsx`).
- [x] **Item 5.2**: Integrasi Cuti dengan Timeline & Guarding Penugasan PM (`LeaveTimelineGuardingView.tsx`).
- [x] **Item 5.3**: HR Performance Timeline & Overdue Task Rate Tracking (`HRPerformanceTrackingView.tsx`).

---

### 📝 Catatan Pengujian & Kualitas Kode
- **Status Kompilasi**: `npx tsc --noEmit` berhasil tanpa ada error (0 errors).

---

## 🔍 LAPORAN AUDIT DIVISI AE (25 Juli 2026)

> Audit menyeluruh semua tombol, flow, modal, dan integrasi data di Divisi Account Executive.

---

### ✅ AUDIT 1 — Tab Quotation Penawaran (Item 2.1 & 2.3)

| # | Test | Status |
|---|---|---|
| 1 | Filter tab "Semua" — semua quotation tampil | ✅ PASS |
| 2 | Filter tab "Draft" — hanya draft tampil | ✅ PASS |
| 3 | Filter tab "Terkirim" — hanya sent tampil | ✅ PASS |
| 4 | Filter tab "Deal Won / Approved" — hanya approved tampil | ✅ PASS |
| 5 | Dropdown filter klien berfungsi memfilter tabel | ✅ PASS |
| 6 | Checkbox selection baris pertama bisa dicentang | ✅ PASS |
| 7 | Checkbox selection baris kedua → tombol "Bandingkan" muncul | ✅ PASS |
| 8 | Modal comparison terbuka TANPA backdrop blur | ✅ PASS |
| 9 | Data comparison tampil side-by-side (OPSI 1 vs OPSI 2) dengan data lengkap | ✅ PASS |
| 10 | Tombol "Pilih & Konversi Tier Ini ↗" di modal → toast sukses muncul | ✅ PASS |
| 11 | Tombol "⚡ Konversi" pada baris tabel → toast + status berubah "Deal Won / Active" | ✅ PASS |
| 12 | Tombol mata 👁 → document preview quotation terbuka | ✅ PASS |
| 13 | Layout document preview tidak terpotong | ✅ PASS |
| 14 | Tombol "Cetak / Export PDF" bisa diklik | ✅ PASS |
| 15 | Tombol delete 🗑 → konfirmasi muncul sebelum hapus | ✅ PASS |
| 16 | Tombol "Buat Quotation Baru" → form baru terbuka | ✅ PASS |
| 17 | Pilih klien dari dropdown di form baru | ✅ PASS |
| 18 | Tambah line item → total auto-kalkulasi | ✅ PASS |

**Hasil: 18/18 PASS ✅**

---

### ✅ AUDIT 2 — Tab Generate Kontrak (Item 2.2)

| # | Test | Status |
|---|---|---|
| 1 | Halaman "Generator Template Kontrak Legal (Auto PDF)" tampil benar | ✅ PASS |
| 2 | Preset "Retainer Bulanan" → auto-fill seluruh field kontrak | ✅ PASS |
| 3 | Preset "Proyek Kampanye" → auto-fill dengan konten berbeda | ✅ PASS |
| 4 | Preset "Perjanjian NDA" → auto-fill dengan konten NDA | ✅ PASS |
| 5 | Dropdown "Pilih Klien" → pihak kedua (nama, jabatan, brand) otomatis terisi | ✅ PASS |
| 6 | Toggle Materai ON/OFF → preview kontrak berubah (stamp muncul/hilang) | ✅ PASS |
| 7 | Preview kontrak tampil di panel kanan, lengkap tidak terpotong | ✅ PASS |
| 8 | Tombol "Unduh & Cetak PDF Kontrak ↗" bisa diklik tanpa error | ✅ PASS |

**Hasil: 8/8 PASS ✅**

---

### ✅ AUDIT 3 — Tab Pitching / Propose & Pitching Client (Item 2.4)

| # | Test | Status |
|---|---|---|
| 1 | Header "Meeting Scheduling Pitching / Proposal Phase" tampil | ✅ PASS |
| 2 | Card pitching yang sudah ada tampil dengan benar (waktu, mode, link) | ✅ PASS |
| 3 | Tombol "+ Tambah Prospek Pitching Baru" → modal terbuka TANPA backdrop blur | ✅ PASS |
| 4 | Submit form prospek baru (nama klien, judul, nilai) → card baru muncul | ✅ PASS |
| 5 | Tombol "Jadwalkan Pitching" → scheduling modal terbuka | ✅ PASS |
| 6 | Toggle "Online (G-Meet / Zoom)" → field URL meeting muncul | ✅ PASS |
| 7 | Toggle "Offline / On-Site" → field lokasi/alamat muncul | ✅ PASS |
| 8 | "Simpan & Sync Google Calendar ↗" → data tersimpan + tab Google Calendar terbuka | ✅ PASS |
| 9 | Card setelah save menampilkan: Waktu, Mode (Video/MapPin), Link clickable | ✅ PASS |
| 10 | Tombol "Ubah Jadwal" → modal terbuka kembali dengan data pre-filled | ✅ PASS |
| 11 | Tombol "✓ Sukses (Won)" → deal pindah ke stage Won (card hilang dari Pitching list) | ✅ PASS |
| 12 | Deal Won otomatis muncul di Kanban Summary & PM Dashboard sebagai proyek baru | ✅ PASS |

**Hasil: 12/12 PASS ✅**

---

### 🐛 BUG DITEMUKAN & STATUS PERBAIKAN

| # | Bug | Severity | File | Status |
|---|---|---|---|---|
| 1 | **PDF Quotation portrait** — kolom tabel terpotong, tampilan tidak proporsional saat dicetak | 🟡 Medium | `PenawaranView.tsx` | ✅ **FIXED** — Ubah ke `@page { size: A4 landscape }` |
| 2 | **Nilai deal ter-concatenate** — `type="number"` dengan default `25000000` menyebabkan angka baru di-append (misal: `Rp2.500.000.035.000.000`) | 🔴 High | `PitchingView.tsx` | ✅ **FIXED** — Ubah ke `type="text" inputMode="numeric"`, state string, parse saat submit |

---

### 📊 RINGKASAN AUDIT DIVISI AE

| Divisi | Total Test | PASS | FAIL |
|---|---|---|---|
| Tab Penawaran (2.1 & 2.3) | 18 | 18 ✅ | 0 |
| Tab Generate Kontrak (2.2) | 8 | 8 ✅ | 0 |
| Tab Pitching (2.4) | 12 | 12 ✅ | 0 |
| **TOTAL** | **38** | **38 ✅** | **0** |

> 🐛 **2 bug ditemukan dari audit** → keduanya sudah diperbaiki.
> 🎯 **Divisi AE: 100% PASS setelah perbaikan.**

---

## 🔍 LAPORAN AUDIT DIVISI TEAM PELAKSANA (25 Juli 2026)

> Audit menyeluruh semua fitur, flow, modal, dan integrasi di Divisi Team Pelaksana.

---

### ✅ AUDIT 1 — Workload Tracking & Capacity Guarding (Item 3.1)

| # | Test | Status |
|---|---|---|
| 1 | Header & indikator threshold 40 jam/minggu tampil jelas | ✅ PASS |
| 2 | Summary Cards (Overload, Peringatan, Kapasitas OK, Rata-rata Utilisasi) berfungsi | ✅ PASS |
| 3 | Banner alert Capacity Guardian otomatis muncul saat ada anggota tim overload (>40h) | ✅ PASS |
| 4 | Filter status (Semua, 🔴 Overload, 🟡 Peringatan, 🟢 Aman) menyaring anggota tim | ✅ PASS |
| 5 | Switcher View Mode (Card View vs Bar Chart View) merender visualisasi bar chart secara dinamis | ✅ PASS |
| 6 | Expand/collapse detail task per anggota tim menampilkan daftar task aktif, sisa jam, dan status | ✅ PASS |

**Hasil: 6/6 PASS ✅**

---

### ✅ AUDIT 2 — Tracker Budget Ads & Direct Billing Sync (Item 3.2)

| # | Test | Status |
|---|---|---|
| 1 | Stat Cards (Total Alokasi, Total Terpakai, Belum Ditagih, Avg. ROAS) ter-kalkulasi presisi | ✅ PASS |
| 2 | Multi-platform support (Meta, Google, TikTok, YouTube, LinkedIn, X) dengan icon dan warna khusus | ✅ PASS |
| 3 | Filter per Proyek, Platform, dan Status Billing berfungsi akurat | ✅ PASS |
| 4 | Modal Tambah Budget Ads terbuka TANPA backdrop blur (menggunakan React Portal) | ✅ PASS |
| 5 | Submit form budget ads baru menambahkan data ke tabel + memicu Toast Notification | ✅ PASS |
| 6 | Tombol "Sync Billing" pada status Pending mengubah status ke Billed & mengisi nilai billing | ✅ PASS |
| 7 | Tombol "Lunas" pada status Billed mengubah status ke Paid secara real-time | ✅ PASS |
| 8 | Progress bar realisasi anggaran & indikator warning over-budget ter-render dengan rapi | ✅ PASS |

**Hasil: 8/8 PASS ✅**

---

### ✅ AUDIT 3 — Divisional Weekly Report Builder (Item 3.3)

| # | Test | Status |
|---|---|---|
| 1 | Form Konfigurasi (Periode Minggu 1-4, Divisi, Date Range, Catatan PM) berfungsi interaktif | ✅ PASS |
| 2 | Dynamic filter per Divisi (Brand, Sosmed/CC, Produksi, Design, Performance) memperbarui live preview | ✅ PASS |
| 3 | Fitur tambah/hapus item "Highlight Minggu Ini" & "Tantangan / Hambatan" secara dinamis | ✅ PASS |
| 4 | Preview laporan menampilkan KPI Summary, Status Proyek, dan Tabel Utilisasi Tim secara profesional | ✅ PASS |
| 5 | Tombol "Cetak / Export PDF" memicu print stylesheet khusus (@page A4 landscape & hiding control elements) | ✅ PASS |

**Hasil: 5/5 PASS ✅**

---

### 📊 RINGKASAN AUDIT DIVISI TEAM PELAKSANA

| Divisi / Sub-Modul | Total Test | PASS | FAIL |
|---|---|---|---|
| Workload Tracking (3.1) | 6 | 6 ✅ | 0 |
| Tracker Budget Ads (3.2) | 8 | 8 ✅ | 0 |
| Weekly Report Builder (3.3) | 5 | 5 ✅ | 0 |
| **TOTAL** | **19** | **19 ✅** | **0** |

> 🎯 **Divisi 3 (Team Pelaksana): 100% PASS (19/19 Test Cases).**

---

## 🔍 LAPORAN AUDIT DIVISI FINANCE & ACCOUNTING (25 Juli 2026)

> Audit menyeluruh 12 fitur utama, flow transaksi, modal slip/invoice, simulasi jurnal, dan perbaikan stylesheet cetak A4 landscape di Divisi Finance & Accounting.

#### 🛠️ Perbaikan Layout & Modal Cetak Buku Besar PDF
- **Problem**: Memanggil `window.print()` langsung dari halaman web membuat browser merender halaman kosong akibat `opacity: 0` pada animasi `.fade-in` dan margin-left sidebar `ml-64` yang menggeser area cetak.
- **Solusi Bulat & Teruji**:
  - Mengubah tombol **"Cetak Buku Besar PDF"** di `GeneralLedgerView.tsx` agar membuka **Modal Pratinjau Cetak PDF** resmi bertanda tangan digital via React Portal (`document.body`).
  - Menambahkan unwrap rules pada `@media print` di `globals.css` agar modal portal mengisi halaman A4 Landscape 100% tanpa menyisakan area kosong.
  - Menghilangkan `animation: none !important; opacity: 1 !important;` pada media print agar tidak ada elemen yang menjadi transparan.

---

### ✅ AUDIT 1 — Penggajian & Integrasi HR (Item 4.1 & 4.2)

| # | Test | Status |
|---|---|---|
| 1 | Tombol `⚡ Direct HR Payroll Sync` dapat mensinkronkan data karyawan & lembur ter-approve dari HR ke Finance Store | ✅ PASS |
| 2 | Modal "Rincian Komponen Slip Gaji" menampilkan Gaji Pokok, Tunjangan, Uang Lembur, & Potongan secara presisi | ✅ PASS |
| 3 | Tombol "Cetak / Export PDF" pada Slip Gaji dapat memicu dialog cetak resmi bertanda tangan digital | ✅ PASS |
| 4 | Tombol "Bayar & Jurnal" mengubah status gaji ke Paid dan otomatis memposting entri jurnal penggajian | ✅ PASS |

---

### ✅ AUDIT 2 — Penagihan & Invoice PDF Generator (Item 4.3)

| # | Test | Status |
|---|---|---|
| 1 | Line item invoice mendukung kategori Retainer Bulanan, Add-on KOL Talent, dan Reimbursement Ads Spend | ✅ PASS |
| 2 | Tombol "Invoice PDF" membuka Modal Invoice PDF Generator cleanly menggunakan React Portal | ✅ PASS |
| 3 | Rekening bank transfer PT Bertumbuh & detail subtotal/PPN ter-render secara profesional | ✅ PASS |
| 4 | Fitur cetak/export PDF invoice tidak terpotong saat diprint | ✅ PASS |

---

### ✅ AUDIT 3 — Jurnal, Simulasi, COA, & General Ledger (Item 4.4, 4.5, 4.7, 4.8)

| # | Test | Status |
|---|---|---|
| 1 | Toggle `🧪 Mode Simulasi Jurnal (Trial Run)` memungkinkan simulasi debet-kredit tanpa merusak data riil | ✅ PASS |
| 2 | Modul Master COA (`COAManagementView.tsx`) mendukung CRUD & pencarian/filtering Kategori Akun | ✅ PASS |
| 3 | Modul Buku Besar per Akun (`GeneralLedgerView.tsx`) menampilkan mutasi Debet/Kredit & Running Balance presisi | ✅ PASS |
| 4 | Fitur `Edit` dan `Void / Reversal` pada Recent Journal Entries membuat storno reversal entry dengan badge status | ✅ PASS |

---

### ✅ AUDIT 4 — Laporan BOD, Revenue Klien, Arus Kas, & Multi-Periode (Item 4.6, 4.9, 4.10, 4.11, 4.12)

| # | Test | Status |
|---|---|---|
| 1 | Tombol "Lihat Nota" pada Reimbursement Table membuka Modal Image Viewer untuk memeriksa foto struk | ✅ PASS |
| 2 | Laporan Keuangan PDF BOD (`BODFinancialReportView.tsx`) menyajikan Gross/Net Margin & Rekomendasi Direksi | ✅ PASS |
| 3 | Rekap Revenue Klien (`ClientRevenueReportView.tsx`) secara otomatis menghitung share omset dari invoice lunas | ✅ PASS |
| 4 | Laporan Arus Kas 3 Aktivitas (`CashFlowStatementView.tsx`) membagi Operasional, Investasi, & Pendanaan | ✅ PASS |
| 5 | Laporan Multi-Periode (`MultiPeriodReportView.tsx`) membandingkan performa bulanan (Mei vs Juni) & YTD Jan-Jun | ✅ PASS |

---

### 📊 RINGKASAN AUDIT DIVISI FINANCE & ACCOUNTING

| Sub-Modul / Item | Total Test | PASS | FAIL |
|---|---|---|---|
| Item 4.1 & 4.2 (Slip Gaji & Sync HR) | 4 | 4 ✅ | 0 |
| Item 4.3 (Invoice PDF Generator) | 4 | 4 ✅ | 0 |
| Item 4.4, 4.5, 4.7, 4.8 (Jurnal, Simulasi, COA, Ledger) | 4 | 4 ✅ | 0 |
| Item 4.6, 4.9 - 4.12 (Reimburs, BOD, Revenue, Arus Kas, Multi-Periode) | 5 | 5 ✅ | 0 |
| **TOTAL** | **17** | **17 ✅** | **0** |

> 🎯 **Divisi 4 (Finance & Accounting): 100% PASS (17/17 Test Cases).**

---

## 📅 Tanggal: 10 Agustus 2026

### 1. Penambahan & Pembaruan File

#### 📄 [NEW] `panduangit.md`
- **Tujuan**: Menyediakan dokumen panduan kerja lengkap pengelolaan Git & GitHub untuk repository ini.
- **Detail Isi**:
  - Panduan inisialisasi Git dari nol dan pendaftaran remote repository.
  - Penjelasan konsep branching (`dev-erlangga`) untuk keamanan pengerjaan fitur baru.
  - Alur kerja harian (Stage, Commit, Push).
  - Tata cara melakukan undo/restore jika kodingan mengalami kesalahan.
  - Tata cara merge cabang fitur kembali ke branch `main`.
  - Cheat sheet ringkas perintah terminal Git.

#### 📄 [MODIFY] Perbaikan 22 Bug Utama Bertumbuh ERP (Phase 1 s/d Phase 4)
- **Files Modified**:
  1. `src/components/views/CEODashboardView.tsx`:
     - Fix **BUG-006 & BUG-007**: Memperbaiki kalkulasi total pengeluaran beban jurnal (akun code starting 5., 6., atau nama Beban/Biaya) dan formula Laba Bersih `totalRevenue - totalExpenses`.
     - Fix **BUG-008**: Memperbaiki match tanggal filter proyek agar proyek aktif selama rentang bulan yang dipilih tetap terhitung di KPI.
  2. `src/components/finance/BalanceSheet.tsx`:
     - Fix **BUG-014**: Menambahkan kalkulasi Laba Tahun Berjalan (Net Profit) dari pendapatan dikurangi beban ke dalam komponen Ekuitas sehingga Neraca Seimbang (`Total Aset = Total Kewajiban + Total Ekuitas`).
  3. `src/components/finance/BODFinancialReportView.tsx`:
     - Fix **BUG-013**: Memperbarui teks rekomendasi strategis BOD menjadi dinamis berdasarkan persentase `netMarginPct` (Kritis/Moderat/Sehat).
  4. `src/components/finance/MultiPeriodReportView.tsx`:
     - Fix **BUG-015**: Menghapus konstanta hardcoded `+ 387624245` pada akumulasi YTD Revenue.
     - Fix **BUG-016**: Memperbaiki format tanda pertumbuhan MoM, warna badge indicator, dan penanda "Naik"/"Turun".
  5. `src/components/finance/VendorTable.tsx`:
     - Fix **BUG-017**: Menambahkan Modal Form Input Vendor Baru & Pengeluaran Fee Luar interaktif.
  6. `src/components/finance/ReimbursTable.tsx`:
     - Fix **BUG-019**: Menambahkan Dokumen Bukti Transaksi Audit Resmi dengan metadata pengunggah, SHA-256 digest, dan stempel verifikasi digital pada lampiran reimbursement.
  7. `src/components/finance/GajiPayroll.tsx`:
     - Fix **BUG-018**: Memperbaiki matching `userId`/`userName` karyawan dan penanganan format nominal Rupiah pada summary tabel payroll tahunan.
  8. `src/components/crm/ClientListView.tsx`:
     - Fix **BUG-020**: Menghubungkan tombol "Lihat Detail" pada kartu klien ke Modal Drawer Detail Klien interaktif.
  9. `src/components/crm/PenawaranView.tsx`:
     - Fix **BUG-021**: Menyinkronkan daftar klien pada dropdown filter penawaran quotation sehingga mencakup seluruh klien unik dari dataset CRM.
  10. `src/components/crm/KontrakView.tsx`:
     - Fix **BUG-022**: Menambahkan validation gate pada handler cetak/unduh PDF kontrak yang memblokir ekspor bila nilai kontrak Rp0 (non-NDA) atau lingkup pekerjaan kosong.
  11. `src/app/login/page.tsx`:
      - Fix **BUG-001**: Menambahkan Modal Pemulihan Kata Sandi.
      - Fix **BUG-002**: Menambahkan Modal Dokumen Legal Syarat & Privasi.
      - Fix **BUG-003**: Menambahkan `aria-label` dinamis pada toggle password.
      - Fix **BUG-004**: Menambahkan banner status Lingkungan Demo Sandbox.
      - Fix **BUG-005**: Memperjelas alur registrasi menjadi "Ajukan Demo Agensi" dengan konfirmasi dialog.
  12. `src/components/layout/Header.tsx`:
      - Fix **BUG-009**: Menambahkan fitur Pencarian Global Interaktif lintas modul (Proyek, Klien, Deals, Invoice) di baris pencarian header.
      - Fix **BUG-024**: Menambahkan atribut aksesibilitas `aria-label` dan `title` pada kontrol tombol & input header.
  13. `src/app/(dashboard)/pm/reports/page.tsx`:
      - Fix **BUG-011**: Memperbaiki handler unduh laporan riwayat agar mengunduh file fisik teks/laporan secara langsung.
  14. `src/components/views/SettingsView.tsx`:
      - Fix **BUG-012 & BUG-023**: Menghubungkan profil nama lengkap dan alamat email di Pengaturan Sistem langsung ke data sesi `useAuth()` yang aktif.
  15. `src/components/crm/DealKanbanBoard.tsx`:
      - Menambahkan Modal Form "Tambah Deal Prospek Baru" interaktif yang terhubung langsung dengan `addDeal` pada `crmStore`.
  16. `src/components/pm/PMOvertime.tsx`:
      - Menambahkan Modal Form "Catat Lembur Tim" interaktif yang terhubung langsung dengan `addOvertime` pada `hrStore`.
  17. `src/lib/store/hrStore.ts`, `AdsBudgetTrackerView.tsx`, `PajakTable.tsx`, `CutiView.tsx`, `PMClientReport.tsx`, `LeaveTimelineGuardingView.tsx`:
      - Menyelaraskan seluruh data seed lembur, cuti, budget ads, perpajakan, dan laporan ke tahun 2026 untuk konsistensi konteks sistem secara menyeluruh.
  18. `bugfixed.md`:
      - Memperbarui rekapitulasi status perbaikan seluruh 24 bug ke status `Fixed` (100% selesai).





