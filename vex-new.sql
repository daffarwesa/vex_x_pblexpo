-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 30, 2026 at 10:40 PM
-- Server version: 8.4.3
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `vex-new`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id_admin` bigint UNSIGNED NOT NULL,
  `nama` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `new_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_email_verification_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_email_expires_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id_admin`, `nama`, `email`, `password`, `new_email`, `new_email_verification_token`, `new_email_expires_at`) VALUES
(1, 'Super Admin', 'admin@pbl.com', '$2y$12$RnKV5/03Xyq.sRoxYHv7QOyB.5hKLZz1KBc3g3Bdvhnzw5Iw2l44G', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `karya`
--

CREATE TABLE `karya` (
  `id_karya` bigint UNSIGNED NOT NULL,
  `id_admin` bigint UNSIGNED NOT NULL,
  `id_stan` bigint UNSIGNED NOT NULL,
  `id_pameran` bigint UNSIGNED NOT NULL,
  `id_kategori` bigint UNSIGNED NOT NULL,
  `judul` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tautan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gambar_poster` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `predikat` enum('1','2') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_best` enum('1','2','3','4','5','6','7') COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `karya`
--

INSERT INTO `karya` (`id_karya`, `id_admin`, `id_stan`, `id_pameran`, `id_kategori`, `judul`, `deskripsi`, `tautan`, `gambar_poster`, `predikat`, `is_best`) VALUES
(1, 1, 1, 1, 6, 'Barelang F1', '-', 'https://drive.google.com/file/d/11q4ZqCcfkbBgkGJteeejc5sErN_-GjfB/view?usp=drivesdk', 'https://drive.google.com/file/d/1MBvScHDRBOrbcf1ijuN_pcOLGwWEC30D/view', NULL, NULL),
(2, 1, 2, 1, 6, 'GESTURA', '-', 'https://youtu.be/fIldWDDILpk?si=qAXt_5igoxrx8tOp', 'https://drive.google.com/file/d/10mZ2swjDUhu0aCBpJxEAwrugstiK1Dta/view', NULL, NULL),
(3, 1, 3, 1, 6, 'Security Patrol Robot (mipam)', '-', '', 'https://drive.google.com/file/d/1_nhbZdzSi22kxcW0NZgVWcIvSayhJsfJ/view', NULL, NULL),
(4, 1, 4, 1, 6, 'BarelangFC - An Edge-AI Powered Goal-Line Detector Using Jetson Nano for Enhanced Refereeing in HSL', '-', 'https://drive.google.com/file/d/15lKZAZj2y0ItsgNWt6lIR_i2hZEyc1Z7/view?usp=drivesdk', 'https://drive.google.com/file/d/1UKcRiGMNDdcr9V5x41CGMW6B8PiymjlZ/view', NULL, NULL),
(5, 1, 5, 1, 6, 'BARELANG 63', '-', 'https://drive.google.com/file/d/1Yu5uTptqJD8AQGn4eqpMebh7SgAPTO4I/view?usp=drivesdk', 'https://drive.google.com/file/d/1b0VoQDDdyB9l0euAYTr67Lu8Kz57TfQq/view', NULL, NULL),
(6, 1, 6, 1, 6, 'Chair and Table Transporter', '-', '-', 'https://drive.google.com/file/d/1MlPuxxxgGJLyUiDMV5R7IWeR2nelPx_v/view', NULL, NULL),
(7, 1, 7, 1, 6, 'AGV SUMITOMO', '-', 'https://youtu.be/VRztKMxd8rg?feature=shared', 'https://drive.google.com/file/d/1nPF4FyOv32EFlOef59DviB5LgqmMjA8c/view', NULL, NULL),
(8, 1, 8, 1, 6, 'R2PB (Robot Pemandu Pencarian Buku)', '-', '-', 'https://drive.google.com/file/d/1_ZkZuLgwyOjzM_hQhgd1C3940qS53-pX/view', NULL, NULL),
(9, 1, 9, 1, 7, 'The Inscale', '-', 'https://youtu.be/M-h58r04Yvs?feature=shared', 'https://drive.google.com/file/d/1JSiWeX6pU676Zj8IWNDghhtd20B6FhJH/view', NULL, NULL),
(10, 1, 10, 1, 7, 'Rancang Bangun Timbangan Kadar Lemak Cerdas Berbasis Bioelectrical Impedance Analysis (BIA)', '-', 'https://drive.google.com/file/d/1zRC12TqcrnL0NDVJwn5SmmmrNhD0FJkz/view?usp=drivesdk', 'https://drive.google.com/file/d/19Ohsq_Q6wN5OA_5eMGjI9b56wy-5wHuO/view', NULL, NULL),
(11, 1, 11, 1, 7, 'AERO', '-', 'https://www.youtube.com/watch?v=EvZ7eC4ecbA&list=PL5xtYxcwBBrfAsJjweSaFJ6zftQzXxT7Z&index=1', 'https://drive.google.com/file/d/1viqwTuBfjtH5-V31kiaUojEukJGveXD7/view?usp=drive_link', NULL, NULL),
(12, 1, 12, 1, 7, 'DELIVERY ROBOT', '-', '-', 'https://drive.google.com/file/d/1By8Gcs-Bm_cIvLRZ8VvYV_CINWZ5lP5e/view?usp=drive_link', NULL, NULL),
(13, 1, 13, 1, 7, 'Aeroxy-AI', '-', 'https://youtu.be/dX7AhHAxc5E?si=1AH1YYpRlY2jPhxQ', 'https://drive.google.com/file/d/1PsuSE4z1meWWegK4vZNwfxOEKIG0WThd/view?usp=drive_link', NULL, NULL),
(14, 1, 14, 1, 7, 'Barelang Sky Force', '-', 'https://www.youtube.com/watch?v=CbJKxtnjLL4', 'https://drive.google.com/file/d/1mJoNjWEuOJn0cgwqV_RMoKvDM0f5vApb/view?usp=drive_link', NULL, NULL),
(15, 1, 15, 1, 7, 'WEB-BASED BIOFLOC MONITORING AND PH CONTROL SYSTEM', '-', '-', 'https://drive.google.com/file/d/1QMvoi5mXV0YqCFoCndUg33Bb6feLU0ZA/view?usp=drive_link', NULL, NULL),
(16, 1, 16, 1, 8, 'Real-time AI for Hand-Tracking', '-', 'https://drive.google.com/file/d/1qRmK-AKmOxilaVQ_FVX4yehGOUY5UmsU/view?usp=sharing', 'https://drive.google.com/file/d/1QIrsKgsDmxp3gLKBWykwlY8UtqO9rAh3/view?usp=sharing', NULL, NULL),
(17, 1, 17, 1, 5, 'SISTEM AUTO GATE BERBASIS UHF LONG RANGE READER UNTUK PENINGKATAN EFISIENSI DAN KEAMANAN', '-', 'https://www.youtube.com/watch?v=FrqQsxrBV_0', 'https://drive.google.com/file/d/19m19JKXR_rKpaz2ZfAxplF6YrQ_LQB3s/view?usp=drive_link', NULL, NULL),
(18, 1, 18, 1, 5, 'Mesin Pengaduk Masakan Otomatis', '-', 'https://www.youtube.com/watch?v=VJTVuoLi-0g', 'https://drive.google.com/file/d/1OiGDcwyzwLbOfiIuejHPtvgK07Dk84w4/view?usp=drive_link', NULL, NULL),
(19, 1, 19, 1, 5, 'Control Aktuator Bioflok', '-', 'https://www.youtube.com/watch?v=YcPWrX4l1II', 'https://drive.google.com/file/d/1g3vbUXirMhRGtTOkjndJup5xaNZ0IBzf/view?usp=drive_link', NULL, NULL),
(20, 1, 20, 1, 5, 'Cartesio-M3', '-', 'https://www.youtube.com/watch?v=befUsGvZyHw', 'https://drive.google.com/file/d/1Gesu9RTsF_DSjKLmVJyRu35G4IKcx2MY/view?usp=drive_link', NULL, NULL),
(21, 1, 21, 1, 5, 'BROMO - Building Room ON/OFF Monitoring & Operation', '-', 'https://www.youtube.com/watch?v=_tYTpqZ80QI', 'https://drive.google.com/file/d/1nY3a41ET0S8cabrw99QAXHfMnKggdVeA/view?usp=drive_link', NULL, NULL),
(22, 1, 22, 1, 5, 'Polibatam Library', '-', '-', 'https://drive.google.com/file/d/1Y1a4p7ihuAGIh1H48YJB041-_um6P8v8/view?usp=drive_link', NULL, NULL),
(23, 1, 23, 1, 8, 'Polimdo 1', '-', 'https://www.youtube.com/watch?v=smt8Bc5NqNM', 'https://drive.google.com/file/d/1Mm8KHpC1BbXTSR_IIHAa27g9-xutKBHg/view?usp=sharing', NULL, NULL),
(24, 1, 24, 1, 9, 'Polimdo 2', '-', 'https://www.youtube.com/watch?v=95rmXUDriuE', 'https://drive.google.com/file/d/1gx4n32h5qs1ay9PyXIwWVPEfR_rl-27m/view?usp=sharing', NULL, NULL),
(25, 1, 25, 1, 5, 'SITANI', '-', 'https://www.youtube.com/watch?v=tvvKfJ7JDXk', 'https://drive.google.com/file/d/1wOu_bCwkTnxyee3HO1psacWP1S64NCfu/view?usp=sharing', NULL, NULL),
(26, 1, 26, 1, 12, 'TRM POLIMDO', '-', '-', 'https://drive.google.com/file/d/1bcL7U8I-LvDZcm12hKkTqGwKzwnmg9Sw/view?usp=drive_link', NULL, NULL),
(27, 1, 27, 1, 12, 'Tim EmisiKu', '-', '-', 'https://drive.google.com/file/d/1x6fnRMeVSZ3ZB8o8AdH4eryyv-KmmjR-/view?usp=drive_link', NULL, NULL),
(28, 1, 28, 1, 7, 'Platform Aerial ULV-Fogging dengan Kontrol Droplet Adaptif untuk Aplikasi Biostimulan dan Mikroba Hidup Presisi Kanopi', '-', 'https://drive.google.com/file/d/1TAYuJ3Y4aItX3hl43hS4psYNExEpWS9d/view?usp=sharing', 'https://drive.google.com/file/d/1VL7BntuawTdyFBxeeN3rO7yZhb1LImHu/view?usp=drive_link', NULL, NULL),
(29, 1, 29, 1, 2, 'CodeX', '-', '-', 'https://drive.google.com/file/d/1Zc3_BpAwOH5EANNlvA1jHyOimH2dtWgT/view?usp=sharing', NULL, NULL),
(30, 1, 30, 1, 6, 'ROV Crovodile Team', '-', '-', 'https://drive.google.com/file/d/1HGCUklQzlDPXXpQ354i40KFC7JrdOgVe/view?usp=sharing', NULL, NULL),
(31, 1, 31, 1, 10, 'Selais Narasena Unri', '-', 'https://www.youtube.com/watch?v=dAjl94DcrQ0', 'https://drive.google.com/file/d/1mfNSDJ8YkLWaScja_k_LCG0Hd5urSdM4/view?usp=sharing', NULL, NULL),
(32, 1, 32, 1, 12, 'Selais Thermonav UNRI', '-', '-', 'https://drive.google.com/file/d/1ZX5_R1RVNy0Id4YD-RySlXAzrc3NmzcH/view?usp=drive_link', NULL, NULL),
(33, 1, 33, 1, 10, 'FAMandala UNRI', '-', 'https://www.youtube.com/watch?v=zg4p9-w2oTI', 'https://drive.google.com/file/d/1SUsDRmlUCNtOITWVUKMMCC_0oIBvEx18/view?usp=sharing', NULL, NULL),
(34, 1, 34, 1, 12, 'Melontiok', '-', 'https://www.youtube.com/watch?v=1Lw_qVqlZZI', 'https://drive.google.com/file/d/1UtNgiQ_quZo4bF3EDQ0WPZ16N8dRJiJG/view?usp=drive_link', NULL, NULL),
(35, 1, 35, 1, 7, 'Energy and Environment Challenge', '-', '-', 'https://drive.google.com/file/d/1aE3lPUTKBg5EaJ20q8X7MlBVHaZ5Iv1b/view?usp=sharing', NULL, NULL),
(36, 1, 36, 1, 1, 'IoT GUARDIAN', '-', 'https://www.youtube.com/watch?v=gOBjO4dmSt8', 'https://drive.google.com/file/d/10t1GXD1mArUHdYDL7lA29uDHw9DgeftI/view?usp=sharing', NULL, NULL),
(37, 1, 37, 1, 9, 'Ibnu Sina Batam', '-', '-', 'https://drive.google.com/file/d/1NuACzRMX9ICfzrKL9EUPiIGb32R4-Xzb/view?usp=sharing', NULL, NULL),
(38, 1, 38, 1, 1, 'Intelecta Reformasi Team', '-', 'https://www.youtube.com/watch?v=Snrdw3zcc8g', 'https://drive.google.com/file/d/1Hf02DHtajUA5Pblw6EMEaK6yZ9Jl2Prl/view?usp=sharing', NULL, NULL),
(39, 1, 39, 1, 5, 'Solar Optimizer using MPPT Boost for Maximizing Photovoltaic Output', '-', 'https://drive.google.com/file/d/1RtztbWwqc7HoBCdICIdiZ9mEswLAnUBW/view?usp=sharing', 'https://drive.google.com/file/d/1x2Pg-9RaJJblhfNNhAA8SiQnPmPZBDrq/view?usp=drive_link', NULL, NULL),
(40, 1, 40, 1, 5, 'Mech4Sketch-Cartesian', '-', 'https://www.youtube.com/watch?v=gOLcGxQmS6M', 'https://drive.google.com/file/d/1yfGaL0hKMczO5dguIjxLuapyyXAp7qLU/view?usp=drive_link', NULL, NULL),
(41, 1, 41, 1, 9, 'ECG MEKACU', '-', 'https://drive.google.com/file/d/1URLpj1N5Osx5tXM2pkizelLForJkRcRW/view', 'https://drive.google.com/file/d/1WpR9213njQ3mgv_sAA5MKWmKlzPTXJla/view?usp=drive_link', NULL, NULL),
(42, 1, 42, 1, 9, 'Barelang FC Robocup Team', '-', 'https://drive.google.com/file/d/13VQuQ8zvJEfqjv0yHwUmXjiC42VHcbfH/view?usp=drivesdk', 'https://drive.google.com/file/d/1Fvfgv1Zv_pEuFN9UWfzuatISAdd8JDbe/view?usp=drive_link', NULL, NULL),
(43, 1, 43, 1, 9, 'Calibra Core', '-', '-', 'https://drive.google.com/file/d/182_FdC5Rnwzskda7E47tgu1O0w0TcTa4/view?usp=drive_link', NULL, NULL),
(44, 1, 44, 1, 9, 'Harap Harap CEMAS', '-', 'https://drive.google.com/file/d/11pj_lQxU_VLEG-iAhnPcfMr_pF-MUSjk/view', 'https://drive.google.com/file/d/1cfBArg45cFk9-LrXolcF72_keDxujt3k/view?usp=drive_link', NULL, NULL),
(45, 1, 45, 1, 9, 'THE QUALITY GUARDIANS', '-', '-', 'https://drive.google.com/file/d/1EceTAQG70SyGVnaitLHZCMtrIOMIBtLK/view?usp=drive_link', NULL, NULL),
(46, 1, 46, 1, 9, 'AIRCRAFT', '-', 'https://youtu.be/HtbzU6dKjig?si=Llv1-5OTIAma_Ah1', 'https://drive.google.com/file/d/1TBRD2bLeNsHxPe3w-EGBY4HJ41A05lx8/view?usp=drive_link', NULL, NULL),
(47, 1, 47, 1, 9, 'SIMON SAYS FOOTSTEP MEMORY GAME', '-', '-', 'https://drive.google.com/file/d/1YgSUzLJuHyl7uy1nB02ZqL0zSoQNglvJ/view?usp=drive_link', NULL, NULL),
(48, 1, 48, 1, 9, 'Barelang Hydromodelling team', '-', '-', 'https://drive.google.com/file/d/1GK3gM6D0i89BUxdabaIG5xMkgBRh0CiI/view?usp=drive_link', NULL, NULL),
(49, 1, 49, 1, 1, 'PBL-TRPL409 ', '-', 'https://youtu.be/4mkIFQ3xdlc?si=g9c7GmN_ey1DU0aT', 'https://drive.google.com/file/d/1g4IUcCeiDP9w1nWSJATOjY0Z1Z1ke-cq/view?usp=sharing', NULL, NULL),
(50, 1, 50, 1, 1, 'PBL TRPL-402', '-', '-', 'https://drive.google.com/file/d/15nKB6ORvl4sgj-z9kEQm3RlIPjrDDtpm/view?usp=sharing', NULL, NULL),
(51, 1, 51, 1, 1, 'Sistem Monitoring dan Kontrol Smart Akuakultur Berbasis IoT', '-', '-', 'https://drive.google.com/file/d/1Sum2czATP9LLs2PTEBwCeJpYSDUjGQYX/view?usp=sharing', NULL, NULL),
(52, 1, 52, 1, 1, 'ORCA TRPL-401', '-', 'https://youtu.be/4mkIFQ3xdlc?si=g9c7GmN_ey1DU0aT', 'https://drive.google.com/file/d/1_JySFuz5rbNCaxYRE7ziymZVXlLjMLtq/view?usp=sharing', NULL, NULL),
(53, 1, 53, 1, 1, 'BMITracker', '-', 'https://youtu.be/_e6wZYAjLQk?si=tuyI5L-aSnbfeX4L', 'https://drive.google.com/file/d/1LLgbKrSpUAvC02RO0QjXx1M0ZWkEyePP/view?usp=sharing', NULL, NULL),
(54, 1, 54, 1, 1, 'I-SCAPE (Integrasi Sistem Control Portable Hemat Energi) ', '-', 'https://youtu.be/-M13DSomoM4?si=_ZBge7b2-AWxiRkY', 'https://drive.google.com/file/d/12mHbiEkro8KUkCDbcdpHBDX7LwE9sAru/view?usp=sharing', NULL, NULL),
(55, 1, 55, 1, 1, 'Smart Pressure Calibration Base on IoT', '-', 'https://youtu.be/-M13DSomoM4?si=_ZBge7b2-AWxiRkY', 'https://drive.google.com/file/d/1VUJmckXFys9ysiS6iiXu8KzRZ3seTy33/view?usp=sharing', NULL, NULL),
(56, 1, 56, 1, 1, 'TOSAB (Tongkat Sakti Aseli Batam)', '-', 'https://youtu.be/b34EOAvZoWs?feature=shared', 'https://drive.google.com/file/d/1kCRVJ3FVWpS0invK9Q18_w0WM1O965AQ/view?usp=sharing', NULL, NULL),
(57, 1, 57, 1, 1, 'Aero Sense', '-', 'https://drive.google.com/file/d/1XthT9yeiZfHD7MxBvxc-Tg9qWkc3oS36/view?usp=drivesdk', 'https://drive.google.com/file/d/1QMoPYbOKVkC26hpdIHTB3yNAHTYYyNZz/view?usp=sharing', NULL, NULL),
(58, 1, 58, 1, 11, 'Relawan Pajak Untuk Negeri (Renjani) 2026 - AK4C Malam', '-', '-', '-', NULL, NULL),
(59, 1, 59, 1, 11, 'Relawan Pajak Untuk Negeri (Renjani) 2026 - AK4C Malam', '-', '-', '-', NULL, NULL),
(60, 1, 60, 1, 11, 'BUSINESS DEVELOPMENT SERVICES', '-', '-', '-', NULL, NULL),
(61, 1, 61, 1, 11, 'Perancangan dan Implementasi Sistem Administrasi Perkantoran Berkelanjutan ABT 2D Malam', '-', '-', '-', NULL, NULL),
(62, 1, 62, 1, 11, 'Venture & Scale Up Lab Integrated Venture Development for Market Expansion & Start-Up Creation', '-', '-', '-', NULL, NULL),
(63, 1, 63, 1, 11, 'Venture & Scale Up Lab Integrated Venture Development for Market Expansion & Start-Up Creation', '-', '-', '-', NULL, NULL),
(64, 1, 64, 1, 11, 'Pengembangan Sistem Jabatan Terintegrasi Berbasis Analisis Jabatan untuk Meningkatkan Kinerja Organisasi', '-', '-', '-', NULL, NULL),
(65, 1, 65, 1, 11, 'Venture & Scale-Up Lab', '-', '-', '-', NULL, NULL),
(66, 1, 66, 1, 11, 'Venture & Scale-Up Lab', '-', '-', '-', NULL, NULL),
(67, 1, 67, 1, 11, 'Perancangan Sistem Jabatan berdasarkan Analisis Jabatan', '-', '-', '-', NULL, NULL),
(68, 1, 68, 1, 11, 'Proses Bisnis Freight Forwarding di Batam (CDIO) - Kelas Pagi A', '-', '-', '-', NULL, NULL),
(69, 1, 69, 1, 11, 'Optimalisasi Perencanaan & Pengendalian Logistik - Prodi DB Semester 2 Pagi dan Malam', '-', '-', '-', NULL, NULL),
(70, 1, 70, 1, 11, 'Optimalisasi Perencanaan & Pengendalian Logistik - Prodi DB Semester 2 Pagi dan Malam', '-', '-', '-', NULL, NULL),
(71, 1, 71, 1, 11, 'PBL CDIO - BUSINESS DEVELOPMENT SERVICES - AM 4C MALAM', '-', '-', '-', NULL, NULL),
(72, 1, 72, 1, 11, 'PBL CDIO - BUSINESS DEVELOPMENT SERVICES - AM 4C MALAM', '-', '-', '-', NULL, NULL),
(73, 1, 73, 1, 11, 'PBL CDIO AM6A Pagi Pembuatan Equity Analisis Report', '-', 'https://youtu.be/ueG6sdf1i94?si=JMJxhsKIrvTmGGKQ', '-', NULL, NULL),
(74, 1, 74, 1, 11, 'PBL CDIO AM6A Pagi Pembuatan Equity Analisis Report', '-', 'https://drive.google.com/file/d/1DyG1yf05M9DEm_TZTDy-HtHkRICtz1Id/view?usp=drivesdk', '-', NULL, NULL),
(75, 1, 75, 1, 11, 'Feasibility study Pengembangan Pelabuhan Laut di Kota Batam', '-', '-', '-', NULL, NULL),
(76, 1, 76, 1, 11, 'Proses Bisnis Freight Forwarding di Batam (CDIO) - Kelas Pagi C', '-', '-', '-', NULL, NULL),
(77, 1, 77, 1, 11, 'ABT 4C MALAM-Pengembangan Sistem Jabatan Terintegrasi Berbasis Analisis Jabatan untuk Meningkatkan Kinerja Organisasi', '-', '-', '-', NULL, NULL),
(78, 1, 78, 1, 11, 'ABT 4C MALAM-Pengembangan Sistem Jabatan Terintegrasi Berbasis Analisis Jabatan untuk Meningkatkan Kinerja Organisasi', '-', '-', '-', NULL, NULL),
(79, 1, 79, 1, 11, 'Stock Rising Game', '-', 'https://drive.google.com/file/d/1AX6TtD70N68VrrBXbuZgAX3eWt_n5L3s/view', 'https://drive.google.com/file/d/1jpRQ6SRHgbLF8zJcQ_p72uARyQ-cbu5P/view?usp=drive_link', NULL, NULL),
(80, 1, 80, 1, 11, 'ABT-AT3', '-', 'https://youtu.be/qp29ylUyK6Q?feature=shared', 'https://drive.google.com/file/d/1pHP6997Bphqgt1EZLAq_1PNa1Tw78Qxd/view?usp=drive_link', NULL, NULL),
(81, 1, 81, 1, 11, 'ABT-AT2', '-', '-', 'https://drive.google.com/file/d/1RzS9Bw8YP1VWsawtaiRc4W9crHhw56oI/view?usp=drive_link', NULL, NULL),
(82, 1, 82, 1, 11, 'Kelompok 1 LPI 4B Pagi', '-', '-', 'https://drive.google.com/file/d/1yma4VBFlvu2gYA_FL_sgrysgga8VcidH/view?usp=drive_link', NULL, NULL),
(83, 1, 83, 1, 11, 'Asbistermorn', '-', 'https://drive.google.com/file/d/1MagWet_nUD5Retn2aMMkcPMP4_Ca7FhZ/view?usp=drivesdk', 'https://drive.google.com/file/d/1gylUDk2bu5NEE9iL_yJ2xJFn5j6RT_7P/view?usp=drivesdk', NULL, NULL),
(84, 1, 84, 1, 11, 'NextGen CEO', '-', '-', 'https://drive.google.com/file/d/1SFfBcgv9SDuUIgbtjMm9vJ_ditSg_7gB/view', NULL, NULL),
(85, 1, 85, 1, 11, 'LOGICORE', '-', '-', 'https://drive.google.com/file/d/1O0STMaSv8TOimDQpoLCSQz3Ot40HksZZ/view?usp=drive_link', NULL, NULL),
(86, 1, 86, 1, 11, 'EGITEAM', '-', '-', 'https://drive.google.com/file/d/1xeoV8nJaqWVcIbU0aY5GsNSP7R7Huiw_/view?usp=sharing', NULL, NULL),
(87, 1, 87, 1, 11, 'Green Office - Free The Sea', '-', '-', 'https://drive.google.com/file/d/1RMeOj0yh4pHIy3cD9KCSxW835okKzgZB/view?usp=drive_link', NULL, NULL),
(88, 1, 88, 1, 11, 'Kelompok 5', '-', 'https://drive.google.com/file/d/1dRo2lAQL4hCcbxmGtGNHuk8D-PE-KgY4/view?usp=drivesdk', 'https://drive.google.com/file/d/1ycePLK_rEOasskijQFE9BNeqeROStuhc/view?usp=sharing', NULL, NULL),
(89, 1, 89, 1, 11, 'Venividici', '-', '-', 'https://drive.google.com/file/d/1mpfP0YhWBt5T0k1mLHfpJTHaDHBcZG6u/view?usp=drive_link', NULL, NULL),
(90, 1, 90, 1, 11, 'GRENOVA (Green Innovation)', '-', '-', 'https://drive.google.com/file/d/1DOrmvso1iYD7yq81BLvO1vGEXdrVlTxW/view?usp=drive_link', NULL, NULL),
(91, 1, 91, 1, 11, 'Nexaport', '-', '-', 'https://drive.google.com/file/d/1wTRfaaMbv4C8KuA4nMRxqcaaD6x_XvrF/view?usp=drive_link', NULL, NULL),
(92, 1, 92, 1, 11, 'PENGMAS SERIP 360', '-', '-', 'https://drive.google.com/file/d/1cbxbaqiEJKbkkLUryk1f879vTdeMsn3T/view?usp=drive_link', NULL, NULL),
(93, 1, 93, 1, 11, 'ACCTIVE', '-', '-', 'https://drive.google.com/file/d/1owYWiUbm58ZgaeScbMDRH9ONFESldLeI/view?usp=drive_link', NULL, NULL),
(94, 1, 94, 1, 11, 'BUSINESS DEVELOPMENT SERVICES', '-', '-', 'https://drive.google.com/file/d/1GAv49QjECTO7XrS7Nj37-_hrXvr1_NKz/view?usp=sharing', NULL, NULL),
(95, 1, 95, 1, 11, '6D-M-1', '-', '-', 'https://drive.google.com/file/d/1V6hw6F9kEDiZ47n9WgMe3T6fOGnDfovs/view?usp=sharing', NULL, NULL),
(96, 1, 96, 1, 12, 'METALLOY', '-', 'https://youtu.be/ZGFcLSB4PU0?si=JKDeDq7Af_N3Da4s', 'https://drive.google.com/file/d/1wg5f3YM3x8D94XsiI2wjBPtBd3J39H4Y/view?usp=drive_link', NULL, NULL),
(97, 1, 97, 1, 12, 'Bauxite Mineral', '-', 'https://drive.google.com/file/d/126GU_gFpoyH6vdvP7ZWAlTGaq5Kx_ST4/view?usp=drivesdk', 'https://drive.google.com/file/d/1uoUVEdz2NetitoGNYJWnQtEQMI-GKtWg/view?usp=drive_link', NULL, NULL),
(98, 1, 98, 1, 12, 'Group 8 (Second Semester) Geomatics Technology', '-', '-', 'https://drive.google.com/file/d/12R07xMNIK-I0TGXBqbiWli5JXQ1PMPSx/view?usp=sharing', NULL, NULL),
(99, 1, 99, 1, 12, 'Nyawit King', '-', 'https://youtu.be/LMoLl2aGCmU?si=zcNKvR2Y-Zf7SsAk', 'https://drive.google.com/file/d/1boBDdh76lPVLsDoIEQzB3GnvywzW-Ftp/view?usp=sharing', NULL, NULL),
(100, 1, 100, 1, 12, 'Kelompok 3', '-', '-', 'https://drive.google.com/file/d/12U00DBl34P2kAC2DMDdndglGj3DA_60P/view?usp=drive_link', NULL, NULL),
(101, 1, 101, 1, 12, 'TIM MANG', '-', '-', '-', NULL, NULL),
(102, 1, 102, 1, 12, 'Electromz', '-', '-', '-', NULL, NULL),
(103, 1, 103, 1, 4, 'PBL-RKS404', '-', 'https://drive.google.com/file/d/1iZap9AHU2CG5bVjMwlHdZ8rZwYeAd2Bf/view', 'https://drive.google.com/file/d/1zyxIdDphKKlnwvQdEEKK_M48OUaqaM_K/view?usp=drivesdk', NULL, NULL),
(104, 1, 104, 1, 4, 'PBL RKS 413', '-', 'https://youtu.be/EKSHnLrGW5Q?si=aYHzhZcNtF1XHjb-', 'https://drive.google.com/file/d/1UpJP9lpnibQJlOK258y6jxktmDjvw5tt/view?usp=drivesdk', NULL, NULL),
(105, 1, 105, 1, 4, 'PBL RKS-408', '-', 'https://youtu.be/EKSHnLrGW5Q?si=aYHzhZcNtF1XHjb-', 'https://drive.google.com/file/d/1beGVsWyHypA0ZFhdBVQJrBg_mmkM3kSf/view?usp=drivesdk', NULL, NULL),
(106, 1, 106, 1, 4, 'PBL RKS-410', '-', '-', 'https://drive.google.com/file/d/1tG7MOB1WVXes6ekq6N_2wAa0p_t95Z0U/view?usp=drivesdk', NULL, NULL),
(107, 1, 107, 1, 4, 'PBL-RKS516', '-', 'https://youtu.be/TF2r-DStxZE?si=BTjIGL6SeIgCg2J3', 'https://drive.google.com/file/d/1rBTfiLA72zCinbnnDo-G6if0Q8CierK_/view?usp=drivesdk', NULL, NULL),
(108, 1, 108, 1, 4, 'PBL - RKS 601', '-', 'https://youtu.be/TF2r-DStxZE?si=BTjIGL6SeIgCg2J3', 'https://drive.google.com/file/d/1UaAe6U0DiyLgSelgawyBEsXNADfbSdKq/view?usp=drivesdk', NULL, NULL),
(109, 1, 109, 1, 4, 'RKS 407', '-', 'https://m.youtube.com/watch?v=ik_xI2bQfi0', 'https://drive.google.com/file/d/1hS1aH_yHx2DBhlnNAHOs9foj2zWuWZd5/view?usp=drivesdk', NULL, NULL),
(110, 1, 110, 1, 4, 'PBL-RKS401', '-', 'https://m.youtube.com/watch?v=nbT_DTatgzw&pp=iggCQAE%3D', 'https://drive.google.com/file/d/17vEYOOzuZ_ZJfJtyOTuwdMcMtZ2wRMEG/view?usp=drivesdk', NULL, NULL),
(111, 1, 111, 1, 10, 'Bezalel Geotech', '-', '-', 'https://drive.google.com/file/d/1lJtEjvoKdarbuHlCHmUKl0TalpuU8tvv/view?usp=drive_link', NULL, NULL),
(112, 1, 112, 1, 10, 'BARELANG MARINE ROBOTICS TEAM (BMRT)-VTOL', '-', 'https://drive.google.com/file/d/1x0rVXNsSrGEsxcNSAthub0JYNsvQz0NZ/view', 'https://drive.google.com/file/d/16fojwzfMrdhuKEcagsgVBTZ11-xr1q7o/view?usp=drive_link', NULL, NULL),
(113, 1, 113, 1, 10, 'Barelang FC', '-', 'https://m.youtube.com/watch?v=EV2s8ytlmaI', 'https://drive.google.com/file/d/1u7eIWUU7ixF3NVdhF4qnSV2Zhyj6HxHA/view?usp=drive_link', NULL, NULL),
(114, 1, 114, 1, 10, 'Barelang V', '-', 'https://youtu.be/iZfrg5qFQJ4?si=-39ymULJItYLGGJZ', 'https://drive.google.com/file/d/1vtkkTuBfo3pVaLkb0Uv_n3b42eFyj4nS/view?usp=drive_link', NULL, NULL),
(115, 1, 115, 1, 10, 'Growora', '-', 'https://youtu.be/iZfrg5qFQJ4?si=-39ymULJItYLGGJZ', 'https://drive.google.com/file/d/1jWihXgXJ0K9J2cNGKn1WaV0SxH5H7x1T/view?usp=drive_link', NULL, NULL),
(116, 1, 116, 1, 10, 'PBL Group 18', '-', 'https://youtu.be/yRvVE8hRrAY?si=HiNuWR1_zGg9YzbD', 'https://drive.google.com/file/d/1muCRG-E5EK2_IEAgMdg0u3OGx42LW95-/view?usp=drive_link', NULL, NULL),
(117, 1, 117, 1, 10, 'PBL02GM11', '-', 'https://drive.google.com/file/d/11iisVrMnXKn2zoeKShhOfz_AmbWVfoGf/view?usp=drivesdk', 'https://drive.google.com/file/d/1RRU5n2t_3TvJnMkpKXZ7NBN68HBQc02p/view?usp=drive_link', NULL, NULL),
(118, 1, 118, 1, 10, 'Group 6 PBL02GM11', '-', 'https://youtu.be/a3lnahgmnrQ?si=8s8Urc63ZMx69d6C', 'https://drive.google.com/file/d/1JfRB_dMeM9vNbtHWbrh6bN3QLZQclhoe/view?usp=drive_link', NULL, NULL),
(119, 1, 119, 1, 10, 'One Family', '-', '-', 'https://drive.google.com/file/d/11bQ3qwvSblqCk0ZRmd63qaVZitOStD1b/view?usp=drive_link', NULL, NULL),
(120, 1, 120, 1, 8, 'PROTOTYPE BOWL FEEDER WITH AUTOMATION SYSTEM', '-', 'https://m.youtube.com/watch?v=GHyTAw4zPqs', 'https://drive.google.com/file/d/1fJLi_PnEgYVghCEcQ2ei5aEoYJPQOVgT/view?usp=drive_link', NULL, NULL),
(121, 1, 121, 1, 8, 'SIMON SAYS FOOTSTEP MEMORY GAME ARDUINO', '-', 'https://youtu.be/a3lnahgmnrQ?si=VuxHpeRWOZcDukFW', 'https://drive.google.com/file/d/1FLGM2z6XRK6bRgOiZ8Wccf_gwL0XlnnP/view?usp=sharing', NULL, NULL),
(122, 1, 122, 1, 8, 'Barelang FC FIRA Team', '-', 'https://youtu.be/g3dGVEKKImk?feature=shared', 'https://drive.google.com/file/d/1EtBbVtHrjul9t34y8zWLIyKZKi9BH4wI/view?usp=sharing', NULL, NULL),
(123, 1, 123, 1, 8, 'Low Cost Inteligent Automation (LCIA)', '-', 'https://youtu.be/W8GAt2S9uLU?si=lu9WYhsp8nXQhJOd', 'https://drive.google.com/file/d/1jkjoRiUmvtvxYZfEjmjxC1LxHFIBbn87/view?usp=drive_link', NULL, NULL),
(124, 1, 124, 1, 8, 'Industrial ARM Robot', '-', 'https://youtu.be/Awowy24z7jM', 'https://drive.google.com/file/d/1qOS92iRJbHglbPURDdyfBPMrsg_hQQC_/view?usp=drive_link', NULL, NULL),
(125, 1, 125, 1, 3, 'Metaverse Polibatam', '-', 'https://youtu.be/3uYCjqKmc24?si=JbWWPROS72zknDJ_', 'https://drive.google.com/file/d/1LyVULKNOdkWG9qbvyxlqBMyZ6N0jjgqg/view?usp=drive_link', NULL, NULL),
(126, 1, 126, 1, 3, 'TRM618', '-', 'https://youtu.be/0g62HIQz58Q?si=CBBXTzgJD1kIESbN', 'https://drive.google.com/file/d/1y3KMZGtas4ZheE55CSjlSWRY7CbYvno3/view?usp=drive_link', NULL, NULL),
(127, 1, 127, 1, 3, 'AN 211', '-', 'https://youtu.be/g2_MAdxF4wE?si=q1JTjSafd_KsoYtZ', 'https://drive.google.com/file/d/14vHy4JrzuTpe-gdskFQBTOgMLCZXiW7u/view?usp=drive_link', NULL, NULL),
(128, 1, 128, 1, 3, 'PBLAN 603', '-', 'https://drive.google.com/file/d/1WZ4iXQd37F6eaGQNoxWLQXY2x5DG1shj/view?usp=sharing', 'https://drive.google.com/file/d/1-CJ20h0PjwG_8asTkAa3k1BUaAmtG13_/view?usp=drive_link', NULL, NULL),
(129, 1, 129, 1, 3, 'PBLAN-605', '-', 'https://drive.google.com/file/d/1Il-u2H_aVcvsUwFWdsjRz-mU8Nqo7EWa/view', 'https://drive.google.com/file/d/1V2ONmou2RIoU1Jt5b3kQpuHDb4rqIEGG/view?usp=drive_link', NULL, NULL),
(130, 1, 130, 1, 3, 'HAMINSATU', '-', 'https://drive.google.com/file/d/1zF6LhGvhy2F57whhvdsZw1JCt-eNwzik/view', 'https://drive.google.com/file/d/1-FFdZHHSZ4bzIwMPxGA2VONecSxIZ6Jp/view?usp=drive_link', NULL, NULL),
(131, 1, 131, 1, 3, 'PBLAN-605 Cutscene Gim 3D Find Patria', '-', 'https://youtu.be/muSifmnXTvY?si=dopMDOPTyOZkQMVt', 'https://drive.google.com/file/d/1U7CVp_KmxJyqu9aPF53qa-tF79AMV9Ux/view?usp=drive_link', NULL, NULL),
(132, 1, 132, 1, 3, 'TRM407B1', '-', '-', 'https://drive.google.com/file/d/19i2Xe36YCKve4xUlb6ytr3PyOR0RK_50/view?usp=drive_link', NULL, NULL),
(133, 1, 133, 1, 3, 'ARCA MOTION', '-', '-', 'https://drive.google.com/file/d/1BXrjz0EPYXb5SSczjmz2x-WBQWx5icJi/view?usp=sharing', NULL, NULL),
(134, 1, 134, 1, 2, 'PBL04GM12 Kelompok 3 Survei Batimetri dan Survei Kadastral Untuk Kadaster Kelautan (Marine Cadastre) di Tanjung Riau', '-', 'https://youtube.com/watch?v=q8F9zt9Zrmc&si=4JP_jkjYb6efdaRS', 'https://drive.google.com/file/d/1_cKSuFHa3MabVbDTVXj1PnDe3Kegpbn_/view?usp=drive_link', NULL, NULL),
(135, 1, 135, 1, 8, 'PBLEM25201 LED ARCADE GAME DIAMOND MODULE ASSEMBLY', '-', '-', 'https://drive.google.com/file/d/18AaIwezp7B8O6xgBGnBf9PDvSbZQ55n5/view?usp=drive_link', NULL, NULL),
(136, 1, 136, 1, 8, 'METALUMB', '-', 'https://youtube.com/watch?v=W8GAt2S9uLU&si=wN-fG4bZcvCP6nuJ', 'https://drive.google.com/file/d/1jkjoRiUmvtvxYZfEjmjxC1LxHFIBbn87/view?usp=drive_link', NULL, NULL),
(137, 1, 137, 1, 8, 'DIGITAL WALL CLOCK MODULE ASSEMBLY', '-', 'https://youtu.be/Awowy24z7jM', 'https://drive.google.com/file/d/1qOS92iRJbHglbPURDdyfBPMrsg_hQQC_/view?usp=drive_link', NULL, NULL),
(138, 1, 138, 1, 8, 'MK2025A22P', '-', '-', 'https://drive.google.com/file/d/18AaIwezp7B8O6xgBGnBf9PDvSbZQ55n5/view?usp=drive_link', NULL, NULL),
(139, 1, 139, 1, 8, 'Barelang V-R2', '-', 'https://www.youtube.com/watch?v=9AKcTDI2bzE', 'https://drive.google.com/file/d/1Fv1BXr7Wj0Y1qiEHi3whfyknavuryAIg/view?usp=drive_link', NULL, NULL),
(140, 1, 140, 1, 2, 'GoSheep Team', '-', 'https://youtu.be/tUXXa_WoUM8?si=NFt90ufNMqJcMjbJ', 'https://drive.google.com/file/d/16EOYsZMPvFGUxR7vvjkliADRAxhNPNdG/view?usp=drive_link', NULL, NULL),
(141, 1, 141, 1, 2, 'PBL RE 010 - Kontes Kapal Indonesia', '-', 'https://youtu.be/7IuKOIUdmwA?si=-UMYLqdSKTsUctEw', 'https://drive.google.com/file/d/1pgdTp5JhRlf4WNDzYG71xe0IlAw4hfO1/view?usp=drive_link', NULL, NULL),
(142, 1, 142, 1, 2, 'DevFlow', '-', '-', 'https://drive.google.com/file/d/1v5SPvAvBoKjIDXNsI_vVlZ3V3K9-YUTG/view?usp=drive_link', NULL, NULL),
(143, 1, 143, 1, 2, 'PBL04GM15', '-', '-', 'https://drive.google.com/file/d/11RK8olgXJtvi3kYQdmMcaSb5LZim6TO-/view?usp=drive_link', NULL, NULL),
(144, 1, 144, 1, 2, 'PBL04GM12 - Bathymetric Survey And Cadastral Survey For Marine Cadastre In Tanjung Riau', '-', 'https://drive.google.com/file/d/1huUx5mZWX35O2O41WTYw6TGJBWi2qN_q/view', 'https://drive.google.com/file/d/1zkMUIv6FvOJ8fZLMH49d3abpw1G75geU/view?usp=drive_link', NULL, NULL),
(145, 1, 145, 1, 2, 'PBL04GM13 - Updating the Geoportal Database and the Internal Database in the Housing Sector', '-', 'https://www.youtube.com/watch?v=TNMuGHdHteI', 'https://drive.google.com/file/d/1ao_yNQIKqNgNsn0QnVWBoF5jaMrE43Kn/view?usp=drive_link', NULL, NULL),
(146, 1, 146, 1, 2, 'Farsight', '-', 'https://www.youtube.com/watch?v=lm5dglthkCk', 'https://drive.google.com/file/d/1wHoQNiskBV5PX702D_cgDcAea91sVHjg/view?usp=drive_link', NULL, NULL),
(147, 1, 147, 1, 2, 'IF-4PA-02', '-', 'https://youtu.be/-kBuqZqk54o?si=YTf5wIg-atsddb-0', 'https://drive.google.com/file/d/17jdvnDm2Pivt1Z2KyOVpYX2a5jbWxjb2/view?usp=drive_link', NULL, NULL),
(148, 1, 148, 1, 2, 'Pocket Lite', '-', 'https://youtu.be/ayf2ps4K-RI?si=tMKgGOFdnTGHPeu5', 'https://drive.google.com/file/d/1W-iUqxHIv248ohX9A6DnILP69sdBxL87/view?usp=drive_link', NULL, NULL),
(149, 1, 149, 1, 2, 'Meka22', '-', '-', 'https://drive.google.com/file/d/1rlrEsH-2zrwgJncZGMihiJIw9sSe0MTW/view?usp=drive_link', NULL, NULL),
(150, 1, 150, 1, 2, 'PBL04GM12_Survei Batimetri dan Survei Kadastral Untuk Kadaster Kelautan (Marine Cadastre)_KELOMPOK2', '-', '-', 'https://drive.google.com/file/d/1ixv_RmSMqiGft1ipE0Ty_MMBr66QFd8o/view?usp=drive_link', NULL, NULL),
(151, 1, 151, 1, 8, 'PBL ELECTROMETALLURGY', '-', 'https://drive.google.com/file/d/1vQ9AyiNbfbnx6def1eSrEOVqQRtBcI2f/view?usp=sharing', 'https://drive.google.com/file/d/1IxYKG19QNl7tO1PFfHXSDnDxDkuZ7jSa/view?usp=drive_link', NULL, NULL),
(152, 1, 152, 1, 1, 'MYCONIK', '-', 'https://youtu.be/KPZqXLawTyI?si=kQtvfi17jJuhsoFN', 'https://drive.google.com/file/d/1zxn1DQFcTYi73abDhHQiH-Qg9Qs8bQ8z/view?usp=sharing', NULL, NULL),
(153, 1, 153, 1, 1, 'Ibu Doain Tim Kami Menang', '-', '-', 'https://drive.google.com/file/d/1Yq7Fu71CmI4Y0nciG9zPfxtBeZEtgOEr/view?usp=sharing', NULL, NULL),
(154, 1, 154, 1, 10, 'kelompok pbl 17', '-', '-', 'https://drive.google.com/file/d/1gH485LhKMIYujtLMAnFcTZ-9dvkwAYnW/view?usp=drive_link', NULL, NULL),
(155, 1, 155, 1, 10, 'Barelang Marine Robotics Team - Autonomous Underwater Vehicle', '-', 'https://www.youtube.com/watch?v=dIKp2bO3Tq4&feature=youtu.be', 'https://drive.google.com/file/d/1gH485LhKMIYujtLMAnFcTZ-9dvkwAYnW/view?usp=drive_link', NULL, NULL),
(156, 1, 156, 1, 10, 'PBL Group 19', '-', 'https://m.youtube.com/watch?v=ZwNos3rrc-Q&pp=iggCQAE%3D', 'https://drive.google.com/file/d/1fP8mTmWH7Mg_285-o1dKc0BhhN-yDSAV/view?usp=drivesdk', NULL, NULL),
(157, 1, 157, 1, 10, 'Navtech Polibatam Team', '-', 'https://youtu.be/XLvT_9Ca94Q?si=g7_spn27ZDfcNJ_6', 'https://drive.google.com/file/d/1IfzJVjFiuRRoW-rRvKrdpifywjib63VP/view?usp=drive_link', NULL, NULL),
(158, 1, 158, 1, 10, 'BARELANG 63', '-', 'https://drive.google.com/file/d/1L14Hgero8u1N8eyHlUVXC2udfJ0e5oCn/view?usp=sharing', 'https://drive.google.com/file/d/1x4U9b_DEGcNsqMTQfsD5ExmUDw6u7U6Q/view?usp=drive_link', NULL, NULL),
(159, 1, 159, 1, 10, 'IRONIC', '-', 'https://youtu.be/ym1dZiIj_uc?si=bCgv9Js56L3QJurB', 'https://drive.google.com/file/d/1LpgN3wNvjHt3jxNCabNHNwzDIp2pi30y/view?usp=drive_link', NULL, NULL),
(160, 1, 160, 1, 10, 'PISN Kampung Seni Batam V2', '-', '-', 'https://drive.google.com/file/d/1jKf52CxgSb7GpB80nBhwHHD637R9yq-F/view?usp=sharing', NULL, NULL),
(161, 1, 161, 1, 10, 'PBL02GM10_Kelompok 3', '-', '-', '-', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `kategori`
--

CREATE TABLE `kategori` (
  `id_kategori` bigint UNSIGNED NOT NULL,
  `kode_kategori` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_kategori` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kategori`
--

INSERT INTO `kategori` (`id_kategori`, `kode_kategori`, `nama_kategori`) VALUES
(1, 'IOT', 'Internet of Things (IoT)'),
(2, 'WEB', 'Aplikasi Berbasis Web dan Mobile'),
(3, 'ANV', 'Animasi dan Videografi'),
(4, 'JCS', 'Jaringan dan Cybersecurity'),
(5, 'OTO', 'Sistem Otomasi'),
(6, 'RAI', 'Robotics and Artificial Intelligence'),
(7, 'TTG', 'Teknologi Tepat Guna'),
(8, 'PRF', 'Proses Fabrikasi / Manufacturing'),
(9, 'PDF', 'Produk Fabrikasi / Manufacturing'),
(10, 'KDS', 'Konsep Desain'),
(11, 'LJU', 'Layanan dan Jasa Usaha'),
(12, 'KTI', 'Karya Tulis Ilmiah');

-- --------------------------------------------------------

--
-- Table structure for table `kunjungan`
--

CREATE TABLE `kunjungan` (
  `id` bigint UNSIGNED NOT NULL,
  `id_pameran` bigint UNSIGNED NOT NULL,
  `visited_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2026_04_27_150241_create_personal_access_tokens_table', 1),
(2, '2026_05_22_053303_create_cache_table', 1),
(3, '2026_08_27_034520_create_admin_table', 1),
(4, '2026_08_27_034553_create_pameran_table', 1),
(5, '2026_08_27_034554_create_stan_table', 1),
(6, '2026_08_27_035256_create_kategori_table', 1),
(7, '2026_08_27_035605_create_karya_table', 1),
(8, '2026_08_27_035745_create_kunjungan_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `pameran`
--

CREATE TABLE `pameran` (
  `id_pameran` bigint UNSIGNED NOT NULL,
  `banner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `judul` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tanggal_mulai_persiapan` date NOT NULL DEFAULT (curdate()),
  `tanggal_akhir_persiapan` date NOT NULL DEFAULT (curdate()),
  `tanggal_buka` date NOT NULL DEFAULT (curdate())
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pameran`
--

INSERT INTO `pameran` (`id_pameran`, `banner`, `judul`, `slug`, `deskripsi`, `tanggal_mulai_persiapan`, `tanggal_akhir_persiapan`, `tanggal_buka`) VALUES
(1, 'pameran/Tlt6NX6fxOhtxHxofw0UwQVBsZdRat4BsQduQkAe.png', 'PBL EXPO 2026', 'pbl-expo-2026-sxllu', 'PBL EXPO 2026', '2026-08-21', '2026-08-29', '2026-08-30');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\Admin', 1, 'token', '2a93f8acf14ada1f4ac9f3db774423fe4a65c2ccf9f25e2794bfa8a7ac31a1ee', '[\"admin\"]', '2026-08-30 22:39:53', NULL, '2026-08-30 22:34:26', '2026-08-30 22:39:53');

-- --------------------------------------------------------

--
-- Table structure for table `stan`
--

CREATE TABLE `stan` (
  `id_stan` bigint UNSIGNED NOT NULL,
  `id_pameran` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stan`
--

INSERT INTO `stan` (`id_stan`, `id_pameran`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(5, 1),
(6, 1),
(7, 1),
(8, 1),
(9, 1),
(10, 1),
(11, 1),
(12, 1),
(13, 1),
(14, 1),
(15, 1),
(16, 1),
(17, 1),
(18, 1),
(19, 1),
(20, 1),
(21, 1),
(22, 1),
(23, 1),
(24, 1),
(25, 1),
(26, 1),
(27, 1),
(28, 1),
(29, 1),
(30, 1),
(31, 1),
(32, 1),
(33, 1),
(34, 1),
(35, 1),
(36, 1),
(37, 1),
(38, 1),
(39, 1),
(40, 1),
(41, 1),
(42, 1),
(43, 1),
(44, 1),
(45, 1),
(46, 1),
(47, 1),
(48, 1),
(49, 1),
(50, 1),
(51, 1),
(52, 1),
(53, 1),
(54, 1),
(55, 1),
(56, 1),
(57, 1),
(58, 1),
(59, 1),
(60, 1),
(61, 1),
(62, 1),
(63, 1),
(64, 1),
(65, 1),
(66, 1),
(67, 1),
(68, 1),
(69, 1),
(70, 1),
(71, 1),
(72, 1),
(73, 1),
(74, 1),
(75, 1),
(76, 1),
(77, 1),
(78, 1),
(79, 1),
(80, 1),
(81, 1),
(82, 1),
(83, 1),
(84, 1),
(85, 1),
(86, 1),
(87, 1),
(88, 1),
(89, 1),
(90, 1),
(91, 1),
(92, 1),
(93, 1),
(94, 1),
(95, 1),
(96, 1),
(97, 1),
(98, 1),
(99, 1),
(100, 1),
(101, 1),
(102, 1),
(103, 1),
(104, 1),
(105, 1),
(106, 1),
(107, 1),
(108, 1),
(109, 1),
(110, 1),
(111, 1),
(112, 1),
(113, 1),
(114, 1),
(115, 1),
(116, 1),
(117, 1),
(118, 1),
(119, 1),
(120, 1),
(121, 1),
(122, 1),
(123, 1),
(124, 1),
(125, 1),
(126, 1),
(127, 1),
(128, 1),
(129, 1),
(130, 1),
(131, 1),
(132, 1),
(133, 1),
(134, 1),
(135, 1),
(136, 1),
(137, 1),
(138, 1),
(139, 1),
(140, 1),
(141, 1),
(142, 1),
(143, 1),
(144, 1),
(145, 1),
(146, 1),
(147, 1),
(148, 1),
(149, 1),
(150, 1),
(151, 1),
(152, 1),
(153, 1),
(154, 1),
(155, 1),
(156, 1),
(157, 1),
(158, 1),
(159, 1),
(160, 1),
(161, 1),
(162, 1),
(163, 1),
(164, 1),
(165, 1),
(166, 1),
(167, 1),
(168, 1),
(169, 1),
(170, 1),
(171, 1),
(172, 1),
(173, 1),
(174, 1),
(175, 1),
(176, 1),
(177, 1),
(178, 1),
(179, 1),
(180, 1),
(181, 1),
(182, 1),
(183, 1),
(184, 1),
(185, 1),
(186, 1),
(187, 1),
(188, 1),
(189, 1),
(190, 1),
(191, 1),
(192, 1),
(193, 1),
(194, 1),
(195, 1),
(196, 1),
(197, 1),
(198, 1),
(199, 1),
(200, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id_admin`),
  ADD UNIQUE KEY `admin_email_unique` (`email`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `karya`
--
ALTER TABLE `karya`
  ADD PRIMARY KEY (`id_karya`),
  ADD KEY `karya_id_admin_foreign` (`id_admin`),
  ADD KEY `karya_id_stan_foreign` (`id_stan`),
  ADD KEY `karya_id_pameran_foreign` (`id_pameran`),
  ADD KEY `karya_id_kategori_foreign` (`id_kategori`);

--
-- Indexes for table `kategori`
--
ALTER TABLE `kategori`
  ADD PRIMARY KEY (`id_kategori`),
  ADD UNIQUE KEY `kategori_kode_kategori_unique` (`kode_kategori`);

--
-- Indexes for table `kunjungan`
--
ALTER TABLE `kunjungan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_kunjungan_pameran_waktu` (`id_pameran`,`visited_at`),
  ADD KEY `idx_kunjungan_waktu` (`visited_at`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pameran`
--
ALTER TABLE `pameran`
  ADD PRIMARY KEY (`id_pameran`),
  ADD UNIQUE KEY `pameran_slug_unique` (`slug`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `stan`
--
ALTER TABLE `stan`
  ADD PRIMARY KEY (`id_stan`),
  ADD KEY `stan_id_pameran_foreign` (`id_pameran`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id_admin` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `karya`
--
ALTER TABLE `karya`
  MODIFY `id_karya` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=162;

--
-- AUTO_INCREMENT for table `kategori`
--
ALTER TABLE `kategori`
  MODIFY `id_kategori` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `kunjungan`
--
ALTER TABLE `kunjungan`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `pameran`
--
ALTER TABLE `pameran`
  MODIFY `id_pameran` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `stan`
--
ALTER TABLE `stan`
  MODIFY `id_stan` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=201;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `karya`
--
ALTER TABLE `karya`
  ADD CONSTRAINT `karya_id_admin_foreign` FOREIGN KEY (`id_admin`) REFERENCES `admin` (`id_admin`) ON DELETE CASCADE,
  ADD CONSTRAINT `karya_id_kategori_foreign` FOREIGN KEY (`id_kategori`) REFERENCES `kategori` (`id_kategori`) ON DELETE CASCADE,
  ADD CONSTRAINT `karya_id_pameran_foreign` FOREIGN KEY (`id_pameran`) REFERENCES `pameran` (`id_pameran`) ON DELETE CASCADE,
  ADD CONSTRAINT `karya_id_stan_foreign` FOREIGN KEY (`id_stan`) REFERENCES `stan` (`id_stan`) ON DELETE CASCADE;

--
-- Constraints for table `kunjungan`
--
ALTER TABLE `kunjungan`
  ADD CONSTRAINT `kunjungan_id_pameran_foreign` FOREIGN KEY (`id_pameran`) REFERENCES `pameran` (`id_pameran`) ON DELETE CASCADE;

--
-- Constraints for table `stan`
--
ALTER TABLE `stan`
  ADD CONSTRAINT `stan_id_pameran_foreign` FOREIGN KEY (`id_pameran`) REFERENCES `pameran` (`id_pameran`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
