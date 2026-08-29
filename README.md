<div align="center">

<br/>

<!-- Animated Title via SVG -->
<img src="https://readme-typing-svg.herokuapp.com?font=Cabinet+Grotesk&weight=900&size=72&duration=3000&pause=1000&color=A78BFA&center=true&vCenter=true&width=600&height=100&lines=V-EX+" alt="V-EX+" />

<img src="https://readme-typing-svg.herokuapp.com?font=Satoshi&weight=600&size=22&duration=2000&pause=800&color=38BDF8&center=true&vCenter=true&width=600&height=50&lines=Virtual+Exhibition+Platform;Interactive+3D+Experience;PBL+Showcase+%E2%80%94+Polibatam+TRPL" alt="Subtitle" />

<br/><br/>

<!-- Badges -->
![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel_13-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![PHP](https://img.shields.io/badge/PHP_8.3-777BB4?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

<br/>

[![License](https://img.shields.io/badge/License-Educational-34D399?style=flat-square)](#-lisensi)
![Status](https://img.shields.io/badge/Status-Active-A78BFA?style=flat-square)

<br/>

---

</div>

## 🌌 Tentang V-EX+

> **V-EX+** adalah platform pameran virtual 3D modern berbasis web yang dirancang untuk menampilkan proyek Project-Based Learning (PBL) mahasiswa dalam lingkungan pameran **3D yang imersif, interaktif, dan real-time**.

Platform ini memungkinkan pengunjung untuk:

- 🏛️ **Eksplorasi 3D Exhibition Hall** secara first-person & third-person menggunakan WebGL (Three.js / React Three Fiber)
- 👥 **Multiplayer Presence** melihat pergerakan dan nama pengunjung lain di dalam room pameran via Redis
- 🖼️ **Showcase Karya & Virtual Booth** lengkap dengan banner, poster digital, deskripsi, video demo YouTube, dan link project
- 🏆 **Penilaian & Kurasi Karya** (Juara 1, Juara 2, dan Best of Work)
- 📊 **Statistik & Analitik Kunjungan** real-time dengan grafik range (jam, hari, minggu, bulan)
- 🔒 **Sistem Autentikasi Admin yang Aman** menggunakan Laravel Sanctum, validasi OTP CSPRNG, dan perlindungan Anti-Brute Force

---

## ✨ Fitur Utama

<div align="center">

| Fitur | Deskripsi |
|---|---|
| 🎮 **3D Virtual Hall & Booths** | Eksplorasi 3D Hall, interaksi booth (Tekan E / Klik), avatar 3D GLB, dan audio BGM/Footsteps |
| 👥 **Realtime Multiplayer Sync** | Tracking posisi dan rotasi player secara realtime dengan backend Redis |
| 🖼️ **Katalog & Detail Karya** | Viewer poster resolusi tinggi, streaming video YouTube, dan Google Drive proxy aman |
| 🏅 **Sistem Kurasi & Peringkat** | Penetapan predikat juara dan badge penghargaan per pameran |
| 📈 **Dashboard & Statistik Admin** | Visualisasi data traffic kunjungan menggunakan Recharts dengan filter tanggal dinamis |
| 🛡️ **Hardened AppSec** | Rate limiting, CORS terisolasi, proteksi SSRF, HSTS, CSP, dan mitigasi Path Traversal |

</div>

---

## 🧩 Tech Stack

<div align="center">

| Layer | Teknologi | Versi | Kegunaan |
|---|---|---|---|
| **Frontend** | Next.js (App Router) | `16.2+` | Full-stack React Framework (SSR/SSG) |
| **Frontend** | React | `19.2` | Core UI Component Library |
| **Frontend** | TypeScript | `5.x` | Type Safety & Developer Experience |
| **Frontend** | Tailwind CSS | `v4.x` | Modern Utility-First CSS Styling |
| **3D Engine** | Three.js / R3F / Drei | `0.183+` | 3D Canvas Rendering & Physics Controller |
| **Backend** | Laravel | `13.x` | Core RESTful API & Sanctum Authentication |
| **Runtime** | PHP | `8.3+` | Server-Side Language Engine |
| **Database** | MySQL | `8.x` | Relational Storage (Pameran, Karya, Admin, Kunjungan) |
| **Cache/Sync** | Redis (ioredis / phpredis) | `7.x` | Real-time Player Presence & OTP Storage |

</div>

---

## 📁 Struktur Repositori

```
VEX-EXPO/
├── front-vex/                  # 🎨 Next.js 16 Frontend
│   ├── app/                    # App Router (Pameran, Admin, Play 3D, Auth)
│   │   ├── (auth)/             # Login, Verifikasi OTP, Ganti Password
│   │   ├── (dashboard)/admin/  # Dashboard Manajemen Pameran, Karya, Statistik
│   │   ├── (play)/exhibition/  # 3D WebGL Canvas & Game Viewport
│   │   └── api-internal/       # Server-side Next.js Routes (Player Sync, Local Uploads)
│   ├── components/             # Reusable UI & 3D Three.js Components
│   ├── context/                # AuthContext (Sanctum Session & State Management)
│   ├── lib/                    # Axios API Client & Redis Connection Manager
│   └── public/                 # Static Assets, 3D GLB Models, Icons, Data
│
├── back-vex/                   # ⚙️ Laravel 13 Backend API
│   ├── app/Http/Controllers/   # API Controllers (Admin, Karya, Pameran, GameAsset, Statistik)
│   ├── app/Models/             # Eloquent Models (Admin, Pameran, Karya, Stan, Kunjungan)
│   ├── app/Services/           # OtpService (CSPRNG), Steganography, Mail
│   ├── config/                 # App, CORS, Sanctum, Database Configurations
│   ├── database/migrations/    # Database Schema Migrations & Seeders
│   └── routes/api.php          # Protected & Public REST API Endpoints + Rate Limiters
│
├── DEPLOYMENT_GUIDE.md         # 🚀 Panduan Lengkap Deployment Production (Nginx, PM2, SSL)
└── README.md
```

---

## 🛠️ Panduan Memulai Cepat (Local Development)

### 📋 Prasyarat
- **Node.js**: `v20.x` atau lebih baru
- **PHP**: `v8.3` atau lebih baru + Composer
- **MySQL Server** (melalui Laragon / XAMPP / Native)
- **Redis Server** (Port 6379, opsional untuk fitur multiplayer)

---

### 1️⃣ Setup Backend (Laravel)

```bash
cd back-vex

# 1. Pasang dependensi PHP
composer install

# 2. Salin environment file
cp .env.example .env

# 3. Generate Encryption Key
php artisan key:generate

# 4. Buat symbolic link storage untuk file publik
php artisan storage:link

# 5. Jalankan migrasi database
php artisan migrate

# 6. Jalankan local development server (Port 8000)
php artisan serve
```

> **Catatan:** Pastikan konfigurasi database di `back-vex/.env` (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`) sesuai dengan MySQL Anda.

---

### 2️⃣ Setup Frontend (Next.js)

Buka terminal baru:

```bash
cd front-vex

# 1. Pasang dependensi Node.js
npm install

# 2. Salin environment file
cp .env.example .env.local

# 3. Jalankan Next.js development server (Port 3000)
npm run dev
```

Buka browser di **`http://localhost:3000`** 🎉

---

## 👥 Tim Pengembang

<div align="center">

Dikembangkan dengan dedikasi oleh tim **TRPL — Politeknik Negeri Batam**:

| Nama | Role / Kontribusi |
|---|---|
| **Muhammad Daffa' Choir** | Project Lead & Full-Stack Engineer |
| **Terra Faqih Satria Madjid** | 3D Experience & Frontend Engineer |
| **Fajri Nur Prasetyo** | Backend & Database Architect |
| **Afif Hamzah Siregar** | UI/UX Designer & Frontend |
| **Hani Arta Gultom** | Quality Assurance & Technical Documentation |
| **Devika Humayra** | Asset Designer & Content Curator |

</div>

---

## 📜 Lisensi

Proyek ini dikembangkan untuk keperluan **edukasi, riset, dan Project-Based Learning (PBL) Politeknik Negeri Batam**.

<div align="center">

<br/>

**Politeknik Negeri Batam · Teknologi Rekayasa Perangkat Lunak · 2026**

</div>
