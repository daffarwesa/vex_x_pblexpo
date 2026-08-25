<div align="center">

<br/>

<!-- Animated Title via SVG -->
<img src="https://readme-typing-svg.herokuapp.com?font=Cabinet+Grotesk&weight=900&size=72&duration=3000&pause=1000&color=A78BFA&center=true&vCenter=true&width=600&height=100&lines=V-EX" alt="V-EX" />

<img src="https://readme-typing-svg.herokuapp.com?font=Satoshi&weight=600&size=22&duration=2000&pause=800&color=38BDF8&center=true&vCenter=true&width=600&height=50&lines=Virtual+Exhibition+Platform;Interactive+3D+Experience;PBL+Showcase+%E2%80%94+Polibatam+TRPL" alt="Subtitle" />

<br/><br/>

<!-- Badges -->
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel_13-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-V--EX-7C3AED?style=flat-square&logo=github)](https://github.com/Graaphr/V-EX)
![License](https://img.shields.io/badge/License-Educational-34D399?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-A78BFA?style=flat-square)

<br/>

---

</div>

## 🌌 Tentang V-EX

> **V-EX** adalah platform pameran virtual berbasis web yang dirancang untuk menampilkan proyek PBL mahasiswa dalam lingkungan pameran **3D yang imersif dan interaktif** — karena normal exhibitions were too boring, humans decided to render them in 3D. 😹

Platform ini memungkinkan pengunjung untuk:

- 🏛️ **Explore 3D exhibition halls** yang dirender real-time
- 🖼️ **View project showcases** dengan detail lengkap
- ❤️ **Like & comment** pada proyek favorit
- 🔎 **Search & filter** berdasarkan tahun, kategori, dan semester
- 🌍 **Akses dari mana saja** — no physical presence required

> Bukan PDF kesepian yang terjebak di Google Drive. 🥀

---

## ✨ Fitur Utama

<div align="center">

| Fitur | Deskripsi |
|-------|-----------|
| 🎨 **3D Exhibition** | Walk around virtual booths, real-time rendering via Three.js |
| 🖼️ **Project Showcase** | Poster, cover image, demo video, deskripsi, team info |
| ❤️ **Community Interaction** | Like, comment, vote proyek terbaik |
| 🔎 **Smart Search** | Filter by year, kategori, semester, title |
| 👤 **Role Management** | Admin, Creator, Pengunjung |
| 🔒 **Secure Auth** | Role-based access control via Laravel |

</div>

---

## 🧩 Tech Stack

<div align="center">

| Teknologi | Layer | Kegunaan |
|-----------|-------|----------|
| ⚛️ **React.js** | Frontend | UI Component Library |
| ▲ **Next.js 15** | Frontend | SSR/SSG Framework |
| 💅 **TailwindCSS** | Frontend | Utility-First Styling |
| 🎲 **Three.js** | Frontend | 3D Exhibition Rendering |
| 🐘 **Laravel 13** | Backend | RESTful API Framework |
| 🗄️ **MySQL** | Database | Relational Database |
| 🐙 **GitHub** | DevOps | Version Control |

</div>

---

## 🛠️ Panduan Instalasi

### 📦 1. Clone Repository

```bash
git clone https://github.com/Graaphr/V-EX.git pbl-vex
cd pbl-vex
```

---

### 🎨 2. Frontend Setup

```bash
cd front-vex
npm install       # Install ~400 packages 💀 Modern JS ecosystem moment
npm run dev       # http://localhost:5173 atau http://localhost:3000
```

> **Install 400 packages demi satu tombol.** Welcome to JavaScript. 💀

---

### ⚙️ 3. Backend Setup

```bash
cd ../back-vex
composer install
```

**Configure environment:**
```bash
# Linux / Git Bash
cp .env.example .env

# Windows CMD
copy .env.example .env
```

**Generate app key:**
```bash
php artisan key:generate
```

---

### 🗄️ 4. Database Configuration

Buka `.env` dan update konfigurasi:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vex_db
DB_USERNAME=root
DB_PASSWORD=
```

---

### 🚀 5. Migrate & Serve

```bash
php artisan migrate
php artisan serve    # http://127.0.0.1:8000
```

---

## 📁 Project Structure

```
pbl-vex/
│
├── front-vex/              # 🎨 Frontend React / Next.js
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Next.js pages & routing
│   │   ├── three/          # Three.js 3D scenes & environments
│   │   └── styles/         # TailwindCSS configuration
│   └── package.json
│
├── back-vex/               # ⚙️ Laravel Backend
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── Middleware/
│   ├── database/migrations/
│   ├── routes/
│   └── .env.example
│
└── README.md
```

---

## 🎮 User Roles

<div align="center">

| Role | Akses |
|------|-------|
| 👑 **Admin** | Manage exhibition, users, dan semua konten platform |
| 📤 **Creator** | Upload, manage proyek, dan memilih karya terbaik |
| 👁️ **Pengunjung** | View, like, comment, dan vote proyek |

</div>

---

## ⚠️ Common Errors

<details>
<summary>💥 Composer Error — <code>vendor/autoload.php</code> missing</summary>

```bash
composer install
```

**Possible causes:**
- Composer belum ter-install
- Instalasi gagal di tengah jalan
- PHP extension yang dibutuhkan tidak ada

> Laravel initiation ritual. Everyone suffers at least once. 😭

</details>

<details>
<summary>🗄️ Database Error — <code>SQLSTATE[42S02]</code></summary>

```bash
# Buat database vex_db dulu di MySQL
# Kemudian:
php artisan migrate
```

**Checklist:**
- [ ] Database `vex_db` sudah dibuat
- [ ] `.env` sudah dikonfigurasi dengan benar
- [ ] MySQL service sedang berjalan

</details>

<details>
<summary>📦 NPM Error — packages kolaps emosional</summary>

```bash
npm install --force
# atau
npm audit fix
```

> JavaScript packages collapse emotionally every 3 business days. 💔

</details>

---

## 🎨 UI/UX Goals

V-EX fokus pada:

- ✅ **Clean modern interface** — minimalist dashboard design
- ✅ **Interactive 3D experience** — immersive exploration
- ✅ **Smooth animations** — buttery transitions
- ✅ **User-friendly navigation** — no learning curve
- ✅ **Mobile-friendly** — responsive di semua device

---

## 🌍 Tujuan Proyek

V-EX dibuat untuk menjadi **digital exhibition ecosystem** bagi mahasiswa Polibatam — membantu:

- 🎓 **Mahasiswa** mempresentasikan proyek secara profesional
- 🌐 **Pengunjung** mengeksplorasi proyek secara interaktif  
- 🏛️ **Institusi** memodernisasi pameran akademik
- 👥 **Tim PBL** mendapat lebih banyak eksposur

---

## 👥 Tim Pengembang

<div align="center">

Dikembangkan oleh tim **TRPL — Politeknik Negeri Batam**

| Nama |
|------|
| Muhammad Daffa' Choir |
| Terra Faqih Satria Madjid |
| Fajri Nur Prasetyo |
| Afif Hamzah Siregar |
| Hani Arta Gultom |
| Devika Humayra |

</div>

---

## 📜 Lisensi

Proyek ini dikembangkan untuk keperluan **edukasi dan Project Based Learning (PBL)**.

---

<div align="center">

<br/>

<img src="https://readme-typing-svg.herokuapp.com?font=Cabinet+Grotesk&weight=800&size=20&duration=3000&pause=1000&color=A78BFA&center=true&vCenter=true&width=600&height=50&lines=V-EX+is+more+than+just+a+website.;It+transforms+project+showcases...;...into+immersive+digital+experiences.+%F0%9F%9A%80" alt="Final note" />

<br/>

**Politeknik Negeri Batam · Technology Software Engineering · 2026**

</div>
