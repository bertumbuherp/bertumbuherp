# Implementation Plan: Transisi Production Ready & Dual-Mode Routing (/dummy vs /login)

Dokumen ini berisi panduan teknis langkah-demi-langkah (*step-by-step*) untuk mentransformasi **Bertumbuh ERP** dari sistem berbasis data mock menjadi **Aplikasi Production-Ready Real** yang terhubung penuh ke **Supabase Backend (Auth & PostgreSQL)**, sekaligus mendukung **Dual-Mode System** (`/dummy` untuk demo instant & `/login` untuk sistem produksi nyata).

---

## 🎯 Ringkasan Arsitektur Dual-Mode System

```
                      ┌─────────────────────────────────────────┐
                      │            BERTUMBUH ERP                │
                      └────────────────────┬────────────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    ▼                                             ▼
       ┌──────────────────────────┐                  ┌──────────────────────────┐
       │   PRODUKSI REAL MODE     │                  │     DEMO / DUMMY MODE    │
       │     (/login & App)       │                  │       (/dummy/*)         │
       ├──────────────────────────┤                  ├──────────────────────────┤
       │ • Supabase Auth (JWT)    │                  │ • Instant Role Selector  │
       │ • Real PostgreSQL DB     │                  │ • Zustand Local Storage  │
       │ • Supabase File Storage  │                  │ • Mock Data Repositories │
       │ • Real Role Access (RBAC)│                  │ • 0 Config Required      │
       └──────────────────────────┘                  └──────────────────────────┘
```

---

## 🛠️ User Review Required

> [!IMPORTANT]
> **Pilihan Mode Sistem**:
> 1. **Versi Dummy (`/dummy`)**: Menggunakan folder rute khusus `src/app/dummy/` dengan tombol pilihan role instan (PM, AE, Pelaksana, Finance, HR, Owner) tanpa perlu login password atau koneksi database.
> 2. **Versi Real Production (`/login`)**: Menggunakan form login autentikasi Supabase Auth (`auth.users`) yang terhubung langsung ke tabel PostgreSQL Supabase melalui Environment Variable (`.env.local`).

> [!NOTE]
> Kedua versi akan **berdampingan secara bersih dalam 1 codebase** sehingga pengujian demo dan penggunaan produksi nyata oleh tim internal dapat dilakukan secara simultan.

---

## 📋 Tahapan Eksekusi Langkah-demi-Langkah (Step-by-Step)

---

### 🟢 PHASE 1: Dual-Mode Routing & Route Folder Structure

Membuat pemisahan folder rute antara sistem **Dummy Demo** (`/dummy`) dan **Real Production** (`/login`).

#### [NEW] [page.tsx](bertumbuherp/src/app/dummy/login/page.tsx)
- Halaman Login Khusus Mode Dummy Demo (`http://localhost:3000/dummy/login` atau `/dummy`).
- Menyediakan tombol akses cepat 1-klik untuk mencoba seluruh role (PM, AE, Team, Finance, HR, Owner).
- Mengatur session state lokal `isDemoMode = true`.

#### [MODIFY] [page.tsx](bertumbuherp/src/app/%28auth%29/login/page.tsx)
- Form Login Resmi Produksi Nyata (`http://localhost:3000/login`).
- Menggunakan input Email & Password dengan validasi Supabase Auth (`supabase.auth.signInWithPassword`).

#### [MODIFY] [Sidebar.tsx](bertumbuherp/src/components/layout/Sidebar.tsx)
- Menampilkan Badge Penanda Mode pada Sidebar:
  - 🟡 **DEMO MODE** saat diakses via rute `/dummy`.
  - 🟢 **PRODUCTION REAL** saat diakses via rute produksi resmi.

---

### 🟢 PHASE 2: Supabase Client Integration & Data Abstraction Layer

Membangun *Data Abstraction Layer* (Provider Pattern) yang otomatis berpindah antara Supabase Real Database dan Zustand/Mock Store sesuai mode aktif.

#### [NEW] [client.ts](bertumbuherp/src/lib/supabase/client.ts)
- Inisialisasi Supabase Client Browser untuk Next.js App Router (`createBrowserClient`).

#### [NEW] [server.ts](bertumbuherp/src/lib/supabase/server.ts)
- Inisialisasi Supabase Server Client untuk Server Components & API Routes (`createServerClient`).

#### [NEW] [.env.local](bertumbuherp/.env.local)
- Konfigurasi Kunci API Supabase Produksi:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://tptuuihcoltlursaelmu.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
  ```

#### [NEW] [dataProvider.ts](bertumbuherp/src/lib/services/dataProvider.ts)
- Service Abstraction Layer yang membungkus query data seluruh 5 divisi:
  - **Jika Mode Dummy**: Mengambil/menyimpan data dari Zustand Local Persist / Mock Repository.
  - **Jika Mode Real**: Mengambil/menyimpan data langsung via Supabase Client ke PostgreSQL tables (`projects`, `invoices`, `journal_entries`, `employee_leaves`, dll).

---

### 🟢 PHASE 3: Real Supabase Auth & Role-Based Access Control (RBAC)

Menghubungkan autentikasi pengguna nyata dan proteksi rute di Next.js Middleware.

#### [NEW] [user_profiles table migration](bertumbuherp/supabase_schema_v1.0.0.sql)
- Tabel profil user di Supabase (`user_profiles`) yang terhubung ke `auth.users`:
  ```sql
  CREATE TABLE public.user_profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role VARCHAR(20) NOT NULL, -- 'pm', 'ae', 'finance', 'hr', 'team', 'owner'
      department TEXT,
      avatar_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

#### [MODIFY] [middleware.ts](bertumbuherp/src/middleware.ts)
- Proteksi Rute Produksi:
  - Mengizinkan akses bebas ke `/dummy/*` (Demo Mode).
  - Memeriksa JWT Token Supabase Session untuk rute `/pm/*`, `/ae/*`, `/finance/*`, `/hr/*`, `/team_member/*`, dan `/owner/*`.
  - Mereturn redirect ke `/login` jika user belum terautentikasi pada rute produksi.

---

### 🟢 PHASE 4: Real Database CRUD Operations per Divisi

Menghubungkan komponen-komponen UI dari 5 Divisi ke Supabase Real Database.

#### 1. Divisi Project Manager (PM)
- **Files**: `PMDashboardView.tsx`, `PMAddOn.tsx`, `MeetingSchedulerModal.tsx`.
- **Integrasi**: Query real data proyek (`projects`), add-ons (`project_add_ons`), dan jadwal meeting (`team_meetings`) dari Supabase PostgreSQL.

#### 2. Divisi Account Executive (AE)
- **Files**: `PenawaranView.tsx`, `KontrakView.tsx`, `PitchingView.tsx`.
- **Integrasi**: Simpan & generate real penawaran harga (`quotations`), kontrak legal (`contracts`), dan jadwal pitching (`pitching_schedules`).

#### 3. Divisi Team Pelaksana
- **Files**: `WorkloadTrackingView.tsx`, `AdsBudgetTrackerView.tsx`, `WeeklyReportBuilderView.tsx`.
- **Integrasi**: Tracking kapasitas beban kerja (`employee_workloads`), real ad spend budget (`ads_budget_records`), dan laporan mingguan (`weekly_divisional_reports`).

#### 4. Divisi Finance & Accounting
- **Files**: `COAManagementView.tsx`, `GeneralLedgerView.tsx`, `TransactionInput.tsx`, `InvoicePaymentList.tsx`, `ReimbursTable.tsx`.
- **Integrasi**: CRUD master COA (`chart_of_accounts`), entri jurnal umum & buku besar (`journal_entries` & `journal_lines`), invoice penagihan (`invoices`), dan upload nota ke **Supabase Storage Bucket** (`receipts`).

#### 5. Divisi HR & People Operations
- **Files**: `TeamAllocationMatrixView.tsx`, `LeaveTimelineGuardingView.tsx`, `HRPerformanceTrackingView.tsx`, `GajiPayroll.tsx`.
- **Integrasi**: Matriks alokasi tim (`client_allocations`), pengajuan cuti (`employee_leaves`), tracking performa overdue (`employee_performance_metrics`), dan penggajian (`payroll_records`).

---

## 🧪 Verification & Testing Plan

### Automated Build Verification
- Jalankan kompilasi TypeScript untuk memastikan 0 type error:
  ```bash
  npx tsc --noEmit
  ```

### Manual Verification Flow

#### 1. Pengujian Mode Dummy (`http://localhost:3000/dummy/login`)
- Akses `/dummy/login`.
- Klik tombol preset role (contoh: *Login sebagai Finance*).
- Pastikan sistem masuk ke dashboard tanpa perlu memasukkan credentials, dan badge **DEMO MODE** tampil di sidebar.
- Uji fitur simulasi jurnal, alokasi tim, dan invoice generator secara lokal.

#### 2. Pengujian Mode Produksi Real (`http://localhost:3000/login`)
- Buat user akun nyata via Supabase Auth Dashboard / Form Sign Up.
- Login menggunakan email & password nyata di `/login`.
- Tambahkan data baru (contoh: Buat Invoice Baru atau Ajukan Cuti Baru).
- Periksa Supabase Dashboard Table Editor untuk memverifikasi data baru tersimpan di tabel PostgreSQL secara real-time.

#### 3. Pengujian File Upload
- Di modul Reimbursement Finance, upload foto nota/kuitansi.
- Pastikan file ter-upload ke Supabase Storage Bucket `receipts` dan URL gambarnya tampil di modal viewer.
