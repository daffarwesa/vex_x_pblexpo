/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `karya`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `karya` (
  `id_karya` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_pengguna` bigint unsigned NOT NULL,
  `id_kategori` bigint unsigned NOT NULL,
  `id_stan` bigint unsigned NOT NULL,
  `id_pameran` bigint unsigned NOT NULL,
  `judul` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tautan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gambar_poster` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gambar_poster_large` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gambar_poster_medium` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gambar_poster_small` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gambar_sampul` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gambar_sampul_large` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gambar_sampul_medium` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gambar_sampul_small` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_juara` tinyint(1) NOT NULL DEFAULT '0',
  `is_best` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_karya`),
  KEY `karya_id_pengguna_foreign` (`id_pengguna`),
  KEY `karya_id_kategori_foreign` (`id_kategori`),
  KEY `karya_id_stan_foreign` (`id_stan`),
  KEY `karya_id_pameran_foreign` (`id_pameran`),
  CONSTRAINT `karya_id_kategori_foreign` FOREIGN KEY (`id_kategori`) REFERENCES `kategori` (`id_kategori`) ON DELETE CASCADE,
  CONSTRAINT `karya_id_pameran_foreign` FOREIGN KEY (`id_pameran`) REFERENCES `pameran` (`id_pameran`) ON DELETE CASCADE,
  CONSTRAINT `karya_id_pengguna_foreign` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna` (`id`) ON DELETE CASCADE,
  CONSTRAINT `karya_id_stan_foreign` FOREIGN KEY (`id_stan`) REFERENCES `stan` (`id_stan`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `kategori`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kategori` (
  `id_kategori` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode_kategori` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_kategori` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_kategori`),
  UNIQUE KEY `kategori_kode_kategori_unique` (`kode_kategori`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `komentar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `komentar` (
  `id_komentar` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_pengguna` bigint unsigned NOT NULL,
  `id_karya` bigint unsigned NOT NULL,
  `isi_komentar` text COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_komentar`),
  KEY `komentar_id_pengguna_foreign` (`id_pengguna`),
  KEY `komentar_id_karya_foreign` (`id_karya`),
  CONSTRAINT `komentar_id_karya_foreign` FOREIGN KEY (`id_karya`) REFERENCES `karya` (`id_karya`) ON DELETE CASCADE,
  CONSTRAINT `komentar_id_pengguna_foreign` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `model`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `model` (
  `id_model` bigint unsigned NOT NULL AUTO_INCREMENT,
  `jenis` enum('Pameran','Stan') COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_model` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `3d_model` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_model`),
  UNIQUE KEY `model_nama_model_unique` (`nama_model`),
  UNIQUE KEY `model_3d_model_unique` (`3d_model`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `pameran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pameran` (
  `id_pameran` bigint unsigned NOT NULL AUTO_INCREMENT,
  `model_pameran` bigint unsigned NOT NULL,
  `kategori_kode` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `banner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `banner_large` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `banner_medium` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `banner_small` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `judul` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tanggal_mulai_persiapan` date NOT NULL DEFAULT (curdate()),
  `tanggal_akhir_persiapan` date NOT NULL DEFAULT (curdate()),
  `tanggal_buka` date NOT NULL DEFAULT (curdate()),
  PRIMARY KEY (`id_pameran`),
  UNIQUE KEY `pameran_slug_unique` (`slug`),
  KEY `pameran_model_pameran_foreign` (`model_pameran`),
  KEY `pameran_kategori_kode_foreign` (`kategori_kode`),
  CONSTRAINT `pameran_kategori_kode_foreign` FOREIGN KEY (`kategori_kode`) REFERENCES `kategori` (`kode_kategori`) ON DELETE CASCADE,
  CONSTRAINT `pameran_model_pameran_foreign` FOREIGN KEY (`model_pameran`) REFERENCES `model` (`id_model`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `pengguna`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pengguna` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nama` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kategori_kode` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('Admin','Creator','Pengunjung') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pengunjung',
  `status` enum('Aktif','Tidak Aktif') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Aktif',
  `new_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_email_verification_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_email_expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pengguna_email_unique` (`email`),
  KEY `pengguna_kategori_kode_foreign` (`kategori_kode`),
  CONSTRAINT `pengguna_kategori_kode_foreign` FOREIGN KEY (`kategori_kode`) REFERENCES `kategori` (`kode_kategori`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `penilaian`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `penilaian` (
  `id_penilaian` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_pengguna` bigint unsigned NOT NULL,
  `id_karya` bigint unsigned NOT NULL,
  `waktu_penilaian` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_penilaian`),
  KEY `penilaian_id_pengguna_foreign` (`id_pengguna`),
  KEY `penilaian_id_karya_foreign` (`id_karya`),
  CONSTRAINT `penilaian_id_karya_foreign` FOREIGN KEY (`id_karya`) REFERENCES `karya` (`id_karya`) ON DELETE CASCADE,
  CONSTRAINT `penilaian_id_pengguna_foreign` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `sponsor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sponsor` (
  `id_sponsor` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_pameran` bigint unsigned NOT NULL,
  `nama_sponsor` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `poster` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tahun` year DEFAULT NULL,
  `tipe` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_sponsor`),
  KEY `sponsor_id_pameran_foreign` (`id_pameran`),
  CONSTRAINT `sponsor_id_pameran_foreign` FOREIGN KEY (`id_pameran`) REFERENCES `pameran` (`id_pameran`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `stan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stan` (
  `id_stan` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_pameran` bigint unsigned NOT NULL,
  `id_kategori` bigint unsigned NOT NULL,
  `model_stan` bigint unsigned NOT NULL,
  PRIMARY KEY (`id_stan`),
  KEY `stan_id_pameran_foreign` (`id_pameran`),
  KEY `stan_id_kategori_foreign` (`id_kategori`),
  KEY `stan_model_stan_foreign` (`model_stan`),
  CONSTRAINT `stan_id_kategori_foreign` FOREIGN KEY (`id_kategori`) REFERENCES `kategori` (`id_kategori`) ON DELETE CASCADE,
  CONSTRAINT `stan_id_pameran_foreign` FOREIGN KEY (`id_pameran`) REFERENCES `pameran` (`id_pameran`) ON DELETE CASCADE,
  CONSTRAINT `stan_model_stan_foreign` FOREIGN KEY (`model_stan`) REFERENCES `model` (`id_model`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `suka`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suka` (
  `id_suka` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_pengguna` bigint unsigned NOT NULL,
  `id_karya` bigint unsigned NOT NULL,
  PRIMARY KEY (`id_suka`),
  KEY `suka_id_pengguna_foreign` (`id_pengguna`),
  KEY `suka_id_karya_foreign` (`id_karya`),
  CONSTRAINT `suka_id_karya_foreign` FOREIGN KEY (`id_karya`) REFERENCES `karya` (`id_karya`) ON DELETE CASCADE,
  CONSTRAINT `suka_id_pengguna_foreign` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (1,'2026_04_27_150241_create_personal_access_tokens_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (2,'2026_05_04_000002_create_kategori_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (3,'2026_05_04_000003_create_pengguna_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (4,'2026_05_04_000004_create_models_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (5,'2026_05_04_000005_create_pamerans_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (6,'2026_05_04_000006_create_stans_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (7,'2026_05_04_000010_create_karyas_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (8,'2026_05_04_052025_create_sukas_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (9,'2026_05_04_052040_create_penilaians_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (10,'2026_05_04_052050_create_komentars_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (11,'2026_05_22_053303_create_cache_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (12,'2026_07_10_081249_add_banner_sizes_to_pameran_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (13,'2026_07_10_093322_add_image_sizes_to_karya_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (14,'2026_07_11_044111_add_slug_to_pameran_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (15,'2026_08_21_121457_create_sponsor_table',1);
