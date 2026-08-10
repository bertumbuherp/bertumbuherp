# Bertumbuh ERP - Web Application Documentation

## 1. Technology Stack

Aplikasi web **Bertumbuh ERP** dibangun menggunakan arsitektur modern berbasis *Server-Side Rendering* (SSR) dan *Client-Side Interactions* untuk memberikan performa tinggi dan pengalaman pengguna (UX) yang optimal.

### Core Frameworks & Libraries
- **Framework Utama:** [Next.js](https://nextjs.org/) versi `16.2.6` (App Router)
- **UI Library:** [React](https://react.dev/) versi `19.2.4`
- **Bahasa Pemrograman:** [TypeScript](https://www.typescriptlang.org/) versi `^5`

### Styling & UI Components
- **Styling Engine:** [Tailwind CSS](https://tailwindcss.com/) versi `^4`
- **Iconography:** [Lucide React](https://lucide.dev/) versi `^1.17.0`
- **Headless UI Primitives:** [Radix UI](https://www.radix-ui.com/)
  - `@radix-ui/react-dialog`
  - `@radix-ui/react-dropdown-menu`
  - `@radix-ui/react-tabs`
  - `@radix-ui/react-tooltip`
- **Data Visualization:** [Recharts](https://recharts.org/) versi `^3.8.1`
- **Utility CSS:** `clsx`, `tailwind-merge`, `class-variance-authority`

### State Management & Data Flow
- **Autentikasi & Sesi:** `AuthContext` lokal berbasis React Context API.
- **Data Sumber (Sementara):** Data dummy interaktif berbasis in-memory (`src/backend/repositories/mockRepository.ts` dan `src/lib/mock-data.ts`).
- **Komunikasi Antar Komponen:** Menggunakan custom `window.dispatchEvent` untuk notifikasi *real-time* ringan di sisi *client*.

---

## 2. Fitur Utama & Modul (Saat Ini)

- **Sistem Autentikasi Fleksibel:** Pengguna dapat masuk menggunakan berbagai peran (*Owner, Super Admin, PM, Team Member, AE, Finance*) tanpa perlu kata sandi (mode *Development*).
- **Dashboard Multi-Role:** Menampilkan metrik dan menu yang berbeda sesuai dengan hak akses (Otorisasi).
- **Manajemen Proyek & Kolaborasi:**
  - **Kanban Board Interaktif:** Pemindahan kartu secara *drag-and-drop* dengan pembatasan hak akses (*Role-based*).
  - **Gantt Chart Otomatis:** Matriks waktu mingguan yang beradaptasi secara *real-time* jika status di Kanban berubah.
  - **Notifikasi Live:** Sistem bel notifikasi pada Header yang menangkap penugasan (*assigning*) tugas dan perubahan status tugas secara instan.
  - **Laporan Klien Otomatis:** Fitur penyusunan draf laporan proyek (*auto-generated*) yang dapat langsung dikirim ke WhatsApp PIC Klien.

---

## 3. Version Log

### **v0.1.0 - Alpha Release (Current)**
**Tanggal Rilis:** Juni 2026

**Pembaruan Utama:**
- `init`: Inisialisasi proyek Next.js 16 + Tailwind CSS V4.
- `feat`: Pembuatan sistem login (*mock auth*) dengan pembagian sesi berdasarkan Role (Super Admin, Owner, PM, Team Member, AE, Finance).
- `feat`: Implementasi `AuthContext` dan utilitas pengecekan otorisasi global.
- `layout`: Desain tata letak utama dengan *Sidebar* dinamis dan *Header* global (termasuk ikon lonceng notifikasi dan profil).
- `feat(projects)`: Pembuatan halaman Papan Pengerjaan Proyek (Modul *Project Management*).
- `feat(projects)`: Penambahan *Interactive Kanban Board* dengan fitur *Drag-and-Drop*.
- `feat(projects)`: Penambahan modal form Tugas komprehensif (Assignee, Date, Status, Evidence Link).
- `feat(projects)`: Penambahan fitur perumusan *Laporan Progress Klien* otomatis via integrasi URL WhatsApp.
- `feat(projects)`: Pembuatan tab *Gantt Chart* mingguan yang sinkron secara data dengan status *Kanban*.
- `security`: Penambahan penguncian akses pada pengeditan *Kanban* (Hanya pemegang tugas / *assignee* atau PM yang bisa mengedit dan menarik kartu tugas).
- `feat(notifications)`: Implementasi notifikasi penugasan *real-time* berbasis Custom Event API pada *Header*.
- `feat(team)`: Pengerjaan utuh modul operasional Team Member (Formulir Reimbursement ke Finance, sinkronisasi sisa cuti, dan akumulasi jam lembur harian).
- `feat(finance)`: Pengerjaan *Grand Finale* Modul Finance, menyatukan otomatisasi Jurnal Keuangan, Kalkulator Gaji Otomatis (Payroll), Laporan Laba Rugi (P&L) dinamis, dan sinkronisasi Penagihan Invoice.

### Langkah Selanjutnya (Tahap Akhir & Deployment)
- **User Acceptance Testing (UAT):** Pengujian integrasi seluruh modul (CRM -> PM -> Team Member -> HR -> Finance).
- **Backend & Database Migration:** Memigrasikan data lokal *mock* (Zustand) ke production database seperti Supabase atau PostgreSQL.
- **Vercel Deployment:** Meluncurkan aplikasi *production-ready* ke server.
