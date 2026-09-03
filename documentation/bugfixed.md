# TABEL PELACAKAN PROGRES PERBAIKAN BUG (BUGFIXED.MD)
## BERTUMBUH AGENCY ERP — ISSUE & BUG TRACKER

Dokumen ini mencatat progres pelacakan dan perbaikan 24 temuan bug (5 Critical, 8 High, 11 Medium/Low) berdasarkan laporan hasil pengujian fungsionalitas dan konsistensi data Bertumbuh ERP.

---

## 📊 RINGKASAN REKAPITULASI PROGRES

| Status Bug | Jumlah | Persentase |
| --- | --- | --- |
| 🔴 **Critical (P0)** | 5 / 5 Fixed | 100% |
| 🟠 **High (P1)** | 8 / 8 Fixed | 100% |
| 🟡 **Medium (P2)** | 8 / 8 Fixed | 100% |
| 🔵 **Low (P3)** | 3 / 3 Fixed | 100% |
| **TOTAL TEMUAN** | **24 / 24 Fixed** | **100%** |

---

## 📋 DAFTAR DETAIL STATUS PERBAIKAN 24 BUG

### 1. Modul Login & Registrasi (BUG-001 s/d BUG-005)

| ID Bug | Nama Modul / Fitur | Severity / Priority | Status | Target File / Lokasi Kode | Detail Masalah & Hasil Perbaikan |
| --- | --- | --- | --- | --- | --- |
| **BUG-001** | Lupa Sandi | Medium / P1 | ✅ **Fixed** | `src/app/login/page.tsx` | Tautan "Lupa sandi?" kini membuka Modal Pemulihan Kata Sandi interaktif dan mengirim konfirmasi ke email user. |
| **BUG-002** | Syarat & Privasi | Medium / P1 | ✅ **Fixed** | `src/app/login/page.tsx` | Tautan Syarat & Ketentuan serta Kebijakan Privasi kini membuka Modal Dokumen Legal interaktif. |
| **BUG-003** | Lihat Sandi | Low / P3 | ✅ **Fixed** | `src/app/login/page.tsx` | Tombol toggle password telah ditambahi `aria-label` dinamis ("Tampilkan/Sembunyikan kata sandi"). |
| **BUG-004** | Demo Access | Medium / P2 | ✅ **Fixed** | `src/app/login/page.tsx` | Ditambahkan banner info status "DEMO ACCESS — Lingkungan Sandbox Aktif". |
| **BUG-005** | Buat Akun | Low-Med / P2 | ✅ **Fixed** | `src/app/login/page.tsx` | Form registrasi diselaraskan menjadi "Ajukan Demo Agensi" lengkap dengan dialog konfirmasi pengajuan. |

---

### 2. Modul Role Owner / CEO Dashboard (BUG-006 s/d BUG-008)

| ID Bug | Nama Modul / Fitur | Severity / Priority | Status | Target File / Lokasi Kode | Detail Masalah & Hasil Perbaikan |
| --- | --- | --- | --- | --- | --- |
| **BUG-006** | KPI Keuangan | Critical / P0 | ✅ **Fixed** | `src/components/views/CEODashboardView.tsx` | Formula laba bersih diset `totalRevenue - totalExpenses` dengan filter akun beban `5.x`, `6.x`, dan `Beban`. |
| **BUG-007** | Laporan P&L | Critical / P0 | ✅ **Fixed** | `src/components/views/CEODashboardView.tsx` | Pengeluaran jurnal kini mengagregasi seluruh jurnal beban aktif yang tidak dibatalkan. |
| **BUG-008** | Filter Proyek | High / P1 | ✅ **Fixed** | `src/backend/repositories/mockRepository.ts`, `CEODashboardView.tsx` | Tanggal seed proyek diselaraskan ke 2026 dan logika filter rentang tanggal proyek disesuaikan. |

---

### 3. Modul Role Project Manager (BUG-010, BUG-011)

| ID Bug | Nama Modul / Fitur | Severity / Priority | Status | Target File / Lokasi Kode | Detail Masalah & Hasil Perbaikan |
| --- | --- | --- | --- | --- | --- |
| **BUG-010** | Tanggal Proyek | High / P1 | ✅ **Fixed** | `src/backend/repositories/mockRepository.ts` | Tanggal deadline Kanban dan tugas seluruhnya diperbarui dari tahun 2024 ke 2026. |
| **BUG-011** | Riwayat Report | Medium / P2 | ✅ **Fixed** | `src/app/(dashboard)/pm/reports/page.tsx` | Unduh laporan riwayat kini mengunduh dokumen fisik laporan teks/PDF secara instan. |

---

### 4. Modul Role Finance & Accounting (BUG-013 s/d BUG-019)

| ID Bug | Nama Modul / Fitur | Severity / Priority | Status | Target File / Lokasi Kode | Detail Masalah & Hasil Perbaikan |
| --- | --- | --- | --- | --- | --- |
| **BUG-013** | Laporan BOD | Critical / P0 | ✅ **Fixed** | `src/components/finance/BODFinancialReportView.tsx` | Narasi otomatis BOD dibuat dinamis sesuai persentase margin bersih (Kritis/Moderat/Sehat). |
| **BUG-014** | Neraca | Critical / P0 | ✅ **Fixed** | `src/components/finance/BalanceSheet.tsx` | Laba Tahun Berjalan otomatis dihitung dari Revenue - Expenses dan diposting ke Ekuitas (Neraca Seimbang). |
| **BUG-015** | Konsistensi Revenue | Critical / P0 | ✅ **Fixed** | `src/components/finance/MultiPeriodReportView.tsx` | Menghapus hardcoded `+ 387624245` pada YTD revenue Multi-Periode sehingga nilai YTD konsisten. |
| **BUG-016** | Pertumbuhan MoM | High / P1 | ✅ **Fixed** | `src/components/finance/MultiPeriodReportView.tsx` | Menyesuaikan indikator pertumbuhan MoM (badge merah/hijau, tanda `+`/`-`, serta teks "Naik"/"Turun"). |
| **BUG-017** | Input Vendor | High / P1 | ✅ **Fixed** | `src/components/finance/VendorTable.tsx` | Tombol "Input Vendor" kini membuka Modal Form Input Vendor & Pengeluaran Luar interaktif. |
| **BUG-018** | Payroll | High / P1 | ✅ **Fixed** | `src/components/finance/GajiPayroll.tsx` | Agregasi summary payroll tahunan disesuaikan matching userId/userName dan format nominal bersih. |
| **BUG-019** | Bukti Reimbursement | Medium / P2 | ✅ **Fixed** | `src/components/finance/ReimbursTable.tsx` | Menambahkan Dokumen Bukti Transaksi Audit Resmi dengan metadata pengunggah, SHA-256 digest, dan stempel verifikasi digital. |

---

### 5. Modul Role Account Executive / CRM (BUG-020 s/d BUG-023)

| ID Bug | Nama Modul / Fitur | Severity / Priority | Status | Target File / Lokasi Kode | Detail Masalah & Hasil Perbaikan |
| --- | --- | --- | --- | --- | --- |
| **BUG-020** | Detail Klien | High / P1 | ✅ **Fixed** | `src/components/crm/ClientListView.tsx` | Tombol "Lihat Detail" kini membuka Modal Detail Klien lengkap dengan daftar kontak & total revenue. |
| **BUG-021** | Filter Quotation | High / P1 | ✅ **Fixed** | `src/components/crm/PenawaranView.tsx` | Opsi dropdown filter klien di Quotation menyinkronkan seluruh daftar klien unik dari master & quotation. |
| **BUG-022** | Unduh Kontrak | High / P1 | ✅ **Fixed** | `src/components/crm/KontrakView.tsx` | Menambahkan Validation Gate yang memblokir cetak kontrak jika nilai Rp0 dan scope kosong. |
| **BUG-023** | Email Pengaturan | Medium / P2 | ✅ **Fixed** | `src/components/views/SettingsView.tsx` | Email di halaman Settings diambil dari `session.email` yang bersih tanpa karakter ilegal. |

---

### 6. Modul Temuan Lintas Role (BUG-009, BUG-012, BUG-024)

| ID Bug | Nama Modul / Fitur | Severity / Priority | Status | Target File / Lokasi Kode | Detail Masalah & Hasil Perbaikan |
| --- | --- | --- | --- | --- | --- |
| **BUG-009** | Pencarian Global | Medium / P2 | ✅ **Fixed** | `src/components/layout/Header.tsx` | Input "Cari..." di Header kini berfungsi sebagai Pencarian Global Lintas Modul (Proyek, Klien, Deals, Invoice). |
| **BUG-012** | Profil & Pengaturan | Medium / P2 | ✅ **Fixed** | `src/components/views/SettingsView.tsx` | Identitas nama dan foto avatar profil dihubungkan langsung ke sesi authentikasi aktif (`useAuth()`). |
| **BUG-024** | Aksesibilitas Kontrol | Low / P3 | ✅ **Fixed** | `Header.tsx`, `page.tsx`, `KontrakView.tsx` | Ditambahkan atribut accessibility (`aria-label`, `title`, cursor-pointer) pada tombol ikon & form. |

---

## 📝 CATATAN PERUBAHAN HARIAN (REVISION LOG)

- **[10 Agustus 2026]**: Inisialisasi `bugfixed.md`.
- **[10 Agustus 2026]**: Menyelesaikan perbaikan seluruh 24 bug utama (5 Critical, 8 High, 8 Medium, 3 Low). Status diperbarui ke `Fixed` (100% Selesai).
