# 📘 Panduan Lengkap Penggunaan Git & GitHub

Dokumen ini berisi panduan alur kerja Git dari awal (inisialisasi), cara menghubungkan ke GitHub, membuat cabang (branching), simpan/upload harian, hingga tata cara membatalkan (undo) perubahan jika terjadi kesalahan.

---

## 📌 Daftar Isi
1. [Inisialisasi & Konfigurasi Awal](#1-inisialisasi--konfigurasi-awal)
2. [Menghubungkan ke GitHub Remote](#2-menghubungkan-ke-github-remote)
3. [Konsep Branching (Cabang Fitur)](#3-konsep-branching-cabang-fitur)
4. [Alur Kerja Simpan & Upload Harian](#4-alur-kerja-simpan--upload-harian)
5. [Tata Cara Undo / Membatalkan Perubahan](#5-tata-cara-undo--membatalkan-perubahan)
6. [Menggabungkan Kode (Merge ke `main`)](#6-menggabungkan-kode-merge-ke-main)
7. [Ringkasan Perintah Penting (Cheat Sheet)](#7-ringkasan-perintah-penting-cheat-sheet)

---

## 1. Inisialisasi & Konfigurasi Awal

Jika Anda mulai dari folder baru yang belum pernah menggunakan Git:

```bash
# 1. Inisialisasi folder menjadi repository Git
git init

# 2. Rename cabang default menjadi 'main'
git branch -M main

# 3. Atur identitas nama & email Anda
git config user.name "Nama Lengkap Anda"
git config user.email "email_anda@example.com"
```

---

## 2. Menghubungkan ke GitHub Remote

Untuk menghubungkan repository lokal ke akun GitHub:

```bash
# 1. Simpan semua file lokal terlebih dahulu
git add .
git commit -m "Initial commit - Fresh Project"

# 2. Hubungkan ke URL repository di GitHub
git remote add origin https://github.com/USERNAME/NAMA_REPO.git

# 3. Push cabang utama ke GitHub
git push -u origin main
```

---

## 3. Konsep Branching (Cabang Fitur)

Menggunakan **Branch** memungkinkan Anda mencoba fitur baru secara aman tanpa merusak kode utama di `main`.

### 🌿 Membuat & Pindah ke Branch Baru
```bash
# Membuat cabang baru (misal: dev-erlangga) dan langsung pindah ke sana
git checkout -b dev-erlangga

# Upload cabang baru ke GitHub (Cukup jalankan 1 kali di awal)
git push -u origin dev-erlangga
```

### 🔀 Berpindah Antar Branch
```bash
# Pindah ke branch main
git checkout main

# Pindah kembali ke branch dev-erlangga
git checkout dev-erlangga
```

---

## 4. Alur Kerja Simpan & Upload Harian

Jalankan langkah ini setiap kali Anda selesai menambahkan atau merubah fitur:

```bash
# 1. Cek status file yang diubah
git status

# 2. Tambahkan semua file perubahan ke staging area
git add .

# 3. Simpan perubahan dengan deskripsi ringkas (commit)
git commit -m "fitur: menambahkan modul absensi HR"

# 4. Upload ke cabang Anda di GitHub
git push origin dev-erlangga
```

---

## 5. Tata Cara Undo / Membatalkan Perubahan

Jika terjadi kesalahan kodingan, gunakan cara berikut untuk mengembalikannya:

### 🔴 Skenario A: Membatalkan Perubahan yang Belum Di-commit
Jika Anda sedang koding di VS Code, kodingan terasa rusak/ngacak, dan Anda ingin **mengembalikan semua file persis seperti sebelum di-edit**:

```bash
git restore .
```
> **Di VS Code GUI:** Buka tab *Source Control* (sebelah kiri) -> klik ikon panah memutar **Discard All Changes (`↩`)**.

### 🟡 Skenario B: Membatalkan Commit Terakhir (Belum Di-push)
Jika Anda sudah mengetik `git commit`, tapi ingin membatalkannya tanpa menghapus kodingan Anda:

```bash
git reset --soft HEAD~1
```
*(File perubahan akan kembali menjadi bentuk draft).*

### 🟢 Skenario C: Menghapus Semua Perubahan & Reset ke Commit Terakhir
```bash
git reset --hard HEAD
```
⚠️ **Perhatian:** Perintah ini akan menghapus permanen semua perubahan yang belum di-commit.

---

## 6. Menggabungkan Kode (Merge ke `main`)

Setelah fitur di `dev-erlangga` selesai dites dan siap dipakai secara resmi di production:

```bash
# 1. Pindah ke branch utama
git checkout main

# 2. Ambil pembaruan terbaru dari remote main (jika ada)
git pull origin main

# 3. Gabungkan perubahan dari branch dev-erlangga ke main
git merge dev-erlangga

# 4. Upload hasil penggabungan ke GitHub
git push origin main

# 5. Kembali ke branch kerja Anda
git checkout dev-erlangga
```

---

## 7. Ringkasan Perintah Penting (Cheat Sheet)

| Kebutuhan | Perintah Terminal |
|---|---|
| **Cek Status Perubahan** | `git status` |
| **Buat & Pindah Branch** | `git checkout -b <nama-branch>` |
| **Pindah Branch** | `git checkout <nama-branch>` |
| **Simpan Semua File** | `git add .` |
| **Commit Perubahan** | `git commit -m "pesan commit"` |
| **Upload ke GitHub** | `git push origin <nama-branch>` |
| **Download Terbaru** | `git pull origin <nama-branch>` |
| **Batalkan Editan (Undo)** | `git restore .` |

---
*Dokumen ini dibuat otomatis sebagai panduan standar pengelolaan Git pada repository ini.*
