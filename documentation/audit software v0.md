# AUDIT SISTEM, FUNGSI, DAN TOMBOL
## BERTUMBUH AGENCY ERP — STATUS RILIS v0.1.0-Alpha

Dokumen ini berisi hasil audit menyeluruh terhadap arsitektur peran (Role-Based Access Control), modul fungsional, dan seluruh elemen interaktif (tombol/formulir) yang saat ini terimplementasi di dalam aplikasi **Bertumbuh Agency ERP**.

---

## 1. MATRIKS OTORISASI GLOBAL (RBAC)

Sistem menggunakan kontrol akses berbasis peran (RBAC) yang dikelola di [permissions.ts](file:///c:/Users/Asus/OneDrive/Desktop/bertumbuherp/bertumbuherp/src/lib/permissions.ts). Berikut adalah cakupan akses baca/tulis per peran pada setiap modul/sumber daya (*resource*):

| Modul / Resource | Owner (CEO) | Super Admin | AE (CRM) | PM | HR | Finance | Team Member |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Dashboard** | ALL | ALL | READ | READ | NONE | READ | READ |
| **CRM & Deals** | ALL | ALL | READ/WRITE | NONE | NONE | NONE | NONE |
| **Clients** | ALL | ALL | READ/WRITE | ALL | NONE | READ | NONE |
| **Projects** | ALL | ALL | READ | READ/WRITE | READ | READ | READ |
| **Finance** | ALL | READ/WRITE | NONE | NONE | NONE | ALL | NONE |
| **Accounting** | ALL | READ/WRITE | NONE | NONE | NONE | ALL | NONE |
| **HR Modul** | ALL | ALL | NONE | READ | ALL | READ | NONE |
| **Employees** | ALL | ALL | NONE | READ | ALL | READ | NONE |
| **Overtime** | ALL | ALL | NONE | READ/WRITE/APP | READ/WRITE | READ | READ/WRITE |
| **Cuti (Leaves)** | ALL | ALL | NONE | READ/APP | ALL | READ | READ/WRITE |
| **Reimbursement** | ALL | ALL | NONE | READ/APP | NONE | ALL | READ/WRITE |
| **Calendar** | ALL | ALL | ALL | ALL | ALL | ALL | ALL |
| **Settings** | ALL | READ/WRITE | NONE | NONE | NONE | NONE | READ/WRITE |

*Keterangan:* 
*   **ALL:** Akses penuh (Read, Write, Delete, Approve).
*   **READ/WRITE:** Bisa melihat dan mengedit/membuat, tanpa akses hapus/approve.
*   **READ/APP:** Bisa membaca dan menyetujui (approve/reject).
*   **NONE:** Terkunci sepenuhnya, tidak muncul di sidebar dan dicegah oleh `RouteGuard.tsx`.

---

## 2. AUDIT MODUL & DETAIL TOMBOL BERDASARKAN PERAN

### A. OWNER / DIREKTUR (CEO)
Halaman awal setelah login dialihkan ke `/ceo/dashboard`. Peran ini memiliki hak istimewa untuk mengawasi seluruh aktivitas perusahaan lintas divisi.

#### 1. Dashboard CEO (`/ceo/dashboard`)
*   **Fungsi Utama:** Visualisasi metrik arus kas, konversi deal, kesehatan proyek, dan absensi tim harian secara terpadu.
*   **Tombol & Aksi Interaktif:**
    *   **Tab "Ringkasan Eksekutif":** Menampilkan KPI laba kotor, nilai pipeline CRM, proyek aktif, dan tingkat kehadiran.
    *   **Tombol Tautan "Proses Sekarang" (Reimbursement):** Mengalihkan halaman ke `/ceo/finance` dengan fokus persetujuan.
    *   **Tombol Tautan "Lihat Detail HR" & "Cek Status PM":** Berfungsi untuk mengubah tab aktif di dashboard secara dinamis tanpa berpindah halaman.
    *   **Tombol "Kirim via WhatsApp" (Laporan Progress Proyek):** Membuka tab baru yang mengarah ke API WhatsApp Web dengan pesan laporan otomatis terenkripsi yang ditargetkan ke PIC Klien.
    *   **Tombol "Regenerate" (Laporan Progress):** Memperbarui isi draf teks laporan berdasarkan data kanban proyek secara instan.
    *   **Tab "CRM & Prospek Klien":** Menampilkan grafik donat distribusi prospek (*PieChart* dari *Recharts*).
    *   **Tab "PM & Operasional Proyek":** Menampilkan list progres visual proyek aktif.
    *   **Tab "HR & Kehadiran Tim":** Menampilkan log absen harian dan status rosters karyawan.
    *   **Tab "Arus Kas & Keuangan":** Menampilkan data bar grafik penerimaan dan pengeluaran.

#### 2. Kalender Global (`/ceo/calendar`)
*   **Fungsi Utama:** Kalender CEO terpadu yang memvisualisasikan seluruh deadline proyek, tugas, status deal CRM, agenda cuti karyawan, dan invoice keuangan.
*   **Tombol & Aksi Interaktif:**
    *   **Tombol "Tambah Agenda" (Warna Merah):** Membuka modal form pembuatan rapat/tugas kustom baru.
    *   **Tombol Tanggal Sel (Grid Kalender):** Mengaktifkan modal buat agenda dengan tanggal mulai terisi otomatis sesuai tanggal sel yang di-klik.
    *   **Formulir Input (Modal Buat/Edit):** Input Judul, Deskripsi, Kategori Rapat, Tanggal/Jam Mulai-Selesai, Pilihan Assignee (Dropdown seluruh karyawan), dan palet warna label kustom.
    *   **Tombol "Simpan Agenda / Simpan Perubahan" (Form Modal):** Menulis/memperbarui data secara persisten ke LocalStorage menggunakan `useCalendarStore`.
    *   **Tombol "Edit" & "Hapus" (Detail Modal):** Hanya muncul pada event bertipe kustom. Berfungsi memicu form edit atau menghapus event bersangkutan dari store.
    *   **Tombol "Ingatkan di Google Calendar" (Detail Modal - Warna Hijau):** Membuka tab baru pembuat event Google Calendar yang terisi otomatis (termasuk email penanggung jawab sebagai tamu undangan).
    *   **Checkbox Filter (PM, CRM, HR, Finance, Kustom):** Berfungsi menyaring jenis agenda yang dirender di grid secara *real-time*.
    *   **Tombol Navigasi Waktu ("Prev Month", "Next Month", "Hari Ini"):** Mengubah fokus bulan kalender.

#### 3. Financial CEO (`/ceo/finance`)
*   **Fungsi Utama:** Melakukan approval akhir pengeluaran operasional (reimbursement & payroll gaji bulanan).
*   **Tombol & Aksi Interaktif:**
    *   **Tombol Checklist "Setujui & Bayar" (Reimbursement):** Mengubah status pengajuan reimbursement karyawan dari `pending` ke `paid` di `useFinanceStore`.
    *   **Tombol Silang "Tolak" (Reimbursement):** Mengubah status reimbursement menjadi `rejected`.
    *   **Tombol "Setujui & Bayar" (Payroll):** Menyetujui slip gaji bulanan karyawan, mengubah status gaji dari `pending` menjadi `paid`.
    *   **Tab Filter Invoice ("All", "Paid", "Sent", "Overdue"):** Menyaring daftar piutang invoice klien di bagian bawah halaman.

---

### B. PROJECT MANAGER (PM)
PM diarahkan setelah login ke `/pm/dashboard`. Modul berfokus pada manajemen siklus hidup proyek, tenggat waktu, dan persetujuan cuti tim.

#### 1. PM Dashboard (`/pm/dashboard`)
*   **Fungsi Utama:** Menampilkan ringkasan proyek yang dipimpin, status backlog tugas, data workload tim, dan pengajuan cuti yang memerlukan persetujuan PM.

#### 2. Manajemen Proyek (`/pm/projects` & `/pm/projects/[id]`)
*   **Fungsi Utama:** Papan Kanban interaktif, Gantt Chart mingguan, serta daftar alokasi anggota tim proyek.
*   **Tombol & Aksi Interaktif:**
    *   **Tombol "Tambah Tugas Baru" (Gantt & Kanban):** Membuka form modal pembuatan tugas baru untuk proyek terpilih.
    *   **Form Modal Tugas:** Mengisi judul, start/end date, fase produksi (Pra-produksi, Ongoing, Post-produksi), assignee, status kanban, dan link figma/evidence.
    *   **Fitur Drag-and-Drop (Kanban Board):** Menggeser kartu tugas antar kolom (To Do -> On Going -> Review -> Done). Berfungsi memicu notifikasi real-time ke *Header* jika PM menggeser tugas karyawan.
    *   **Tombol "Kirim Laporan via WhatsApp" & "Regenerate" (Tab Overview):** Membuat/mengirim draf progres proyek ke nomor HP klien.
    *   **Tombol "Hapus Tugas" (Modal Edit Tugas):** Menghapus tugas dari proyek (Khusus PM/Admin).

#### 3. Approval Cuti (`/pm/cuti`)
*   **Fungsi Utama:** Validasi awal pengajuan cuti dari tim member sebelum diajukan ke HR Manager.
*   **Tombol & Aksi Interaktif:**
    *   **Tombol "Approve (Setujui)":** Mengubah status pengajuan cuti karyawan dari `pending` menjadi `approved_pm`.
    *   **Tombol "Tolak":** Mengubah status cuti menjadi `rejected`.

#### 4. Report Klien (`/pm/reports`)
*   **Fungsi Utama:** Manajemen draf laporan bulanan proyek.
*   **Tombol & Aksi Interaktif:**
    *   **Tombol "Tinjau Laporan":** Membuka teks editor draf laporan proyek untuk dikirim via WhatsApp.

---

### C. ACCOUNT EXECUTIVE / CRM (AE)
Diarahkan ke `/crm/dashboard`. Modul ini mengelola pencatatan prospek, penawaran harga, pembuatan paket taktis, dan kontrak klien.

#### 1. CRM Dashboard (`/crm/dashboard`)
*   **Fungsi Utama:** Mengelola pipa penjualan (*Deals Pipeline*) dalam bentuk board Kanban visual berdasarkan tahap deal.
*   **Tombol & Aksi Interaktif:**
    *   **Tombol "Tambah Prospek Baru":** Membuka formulir pengisian deals (Judul deal, nama klien, AE penanggung jawab, taksiran nilai deal, dan probabilitas closing).
    *   **Tab Filter ("Summary", "Listing Prospek", "Strategi Package", "Propose & Pitching", "Penawaran"):** Mengubah submenu tampilan operasional CRM.
    *   **Tombol "Buat Paket Layanan" (Tab Strategi Package):** Membuat template paket penawaran baru.
    *   **Tombol Tautan "Generate Kontrak" (Sidebar & Penawaran):** Mengunduh/membuka file PDF draf kontrak hukum bisnis.
    *   **Drag-and-Drop Board Deal (Kanban CRM):** Menggeser status deal (Lead -> Kualifikasi -> Penawaran -> Pitching -> Negosiasi -> Won -> Lost).
        *   *Efek Khusus:* Jika deal digeser ke kolom **Won**, sistem otomatis menduplikasi deal tersebut dan membuat **Proyek Baru** di `usePMStore` dengan status `planning` dan PM `Belum Ditugaskan`.

#### 2. Manajemen Klien (`/crm/clients`)
*   **Fungsi Utama:** Pencatatan basis data profil klien.
*   **Tombol & Aksi Interaktif:**
    *   **Tombol "Tambah Klien Baru":** Formulir input nama instansi, kategori industri, kontak utama (nama PIC, email, nomor HP), dan AE pendamping.

---

### D. HR MANAGER (HR)
Diarahkan ke `/hr/dashboard`. Modul ini mengelola basis data roster karyawan, payroll gaji bulanan/freelance, absensi harian, lembur, dan izin cuti.

#### 1. HR Dashboard (`/hr/dashboard`)
*   **Fungsi Utama:** Pengawasan kinerja SDM, payroll, dan timesheet.
*   **Tombol & Aksi Interaktif:**
    *   **Tab Menu ("KPI Performa", "Cuti & Absen", "Payroll Gaji Bulanan", "Payroll Fee Freelance", "Absen Lembur", "Slip Gaji"):** Navigasi tabel data operasional HR.
    *   **Tombol "Proses Payroll" (Tab Payroll):** Menghitung gaji bersih otomatis (Gaji pokok + bonus lembur - potongan absen).
    *   **Tombol "Ajukan Karyawan Baru" (Tab KPI):** Mengarah ke formulir rekrutmen internal.

#### 2. Approval Lembur & Cuti (`/hr/overtime` & `/hr/cuti`)
*   **Fungsi Utama:** Eksekusi persetujuan cuti pasca-PM dan klaim jam lembur tim.
*   **Tombol & Aksi Interaktif:**
    *   **Tombol "Approve Cuti" (Status approved_pm):** Mengubah status cuti menjadi `approved_hr` (cuti dinyatakan resmi).
    *   **Tombol "Approve Lembur":** Menyetujui jam lembur karyawan untuk diakumulasikan ke komponen payroll bulan berjalan.

#### 3. Database Karyawan (`/hr/employees`)
*   **Fungsi Utama:** Mengelola status keaktifan dan slip data karyawan.
*   **Tombol & Aksi Interaktif:**
    *   **Tombol "Tambah Karyawan":** Form entri data staff (Nama, email, department, posisi, standard jam kerja, dan gaji pokok).
    *   **Tombol Toggle "Aktif/Nonaktifkan Karyawan":** Menonaktifkan akun agar tidak bisa masuk ke sistem.

---

### E. FINANCE MANAGER (FINANCE)
Diarahkan ke `/finance/dashboard`. Berfokus pada pembukuan akuntansi, penagihan invoice, audit reimbursement tim, pengeluaran vendor, dan kepatuhan pajak.

#### 1. Dashboard Finance & Accounting (`/finance/dashboard` & `/finance/accounting`)
*   **Fungsi Utama:** Jurnal umum, neraca saldo, P&L (Laba/Rugi), dan penagihan piutang invoice.
*   **Tombol & Aksi Interaktif:**
    *   **Tombol "Kirim Tagihan" (Invoice):** Mengirim pengingat tagihan invoice klien.
    *   **Tombol "Tambah Transaksi Jurnal" (Tab Input Transaksi):** Input entri debit/kredit keuangan perusahaan secara manual.
    *   **Tombol "Bayar Reimbursement":** Memproses pembayaran reimbursement tim yang telah disetujui CEO.
    *   **Pilihan Dropdown Akun Keuangan:** Mengatur alokasi akun (Kas, Kas Kecil, Piutang, Biaya Operasional, dll).

---

### F. TEAM MEMBER (CREATIVE & DESIGNERS)
Diarahkan ke `/team_member/dashboard`. Modul didesain sederhana dan fungsional untuk melaporkan progress harian dan hak administratif karyawan.

#### 1. Dashboard & Projects (`/team_member/dashboard` & `/team_member/projects`)
*   **Fungsi Utama:** Akses tugas mandiri, log jam kerja, dan status penyelesaian tugas.
*   **Tombol & Aksi Interaktif:**
    *   **Kolom "evidenceLink" (Form Tugas):** Menginput tautan link (misal Figma/Google Drive) sebagai bukti penyelesaian tugas sebelum ditarik ke kolom *Review* untuk diperiksa PM.
    *   **Log Overtime & Reimbursement:** Tombol "Buat Pengajuan" untuk reimbursement operasional atau jam lembur tambahan.
    *   **Form Pengajuan Cuti (`/team_member/cuti`):** Formulir cuti mandiri (Jenis cuti, tanggal mulai/selesai, alasan).

---

## 3. IDENTIFIKASI GAPS & REKOMENDASI PENGEMBANGAN v1.0

Hasil audit mengidentifikasi beberapa area kritis yang perlu disesuaikan saat migrasi dari v0 (Alpha) ke v1 (Production):

1.  **Sistem Notifikasi Global:** Saat ini menggunakan `window.dispatchEvent` kustom pada browser. Hal ini membatasi notifikasi hanya dapat diterima jika user membuka tab yang sama. Pada v1.0, notifikasi harus dimigrasikan ke database table `notifications` dengan pemicu real-time (misal Supabase Realtime / WebSockets).
2.  **Autentikasi Tanpa Sandi:** Proses login saat ini bersifat mock (`AuthService` menerima semua password `demo123`). Pada v1.0, data harus dienkripsi dengan bcrypt dan dicocokkan dengan password terenkripsi pada database tabel `users`.
3.  **Persistensi Zustand LocalStorage:** Semua store menyimpan data secara lokal di browser user (`bertumbuh-pm-storage`, `bertumbuh-calendar-storage`, dll). Hal ini menyebabkan data yang dibuat oleh satu user tidak terlihat oleh user lain di perangkat berbeda. Migrasi mutlak ke database relasional (PostgreSQL/Supabase) diperlukan agar sistem bekerja secara terpusat (*real-time database sync*).
4.  **Google Calendar API Integration:** Saat ini integrasi Google Calendar menggunakan rujukan tautan *Google Calendar Event Template URL* (buka tab baru). Untuk v1.0 yang sesungguhnya, integrasi disarankan menggunakan Google Calendar OAuth2 API di backend agar sinkronisasi terjadi dua arah (two-way sync) di latar belakang (background worker) tanpa intervensi manual dari user.
