-- phpMyAdmin SQL Dump
-- version 5.2.3deb1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Waktu pembuatan: 21 Okt 2026 pada 01.42
-- Versi server: 8.4.11-0ubuntu0.26.04.1
-- Versi PHP: 8.5.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Basis data: `pengaduan_fasilitas_fakultasDB`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `fasilitas`
--

CREATE TABLE `fasilitas` (
  `id_fasilitas` int UNSIGNED NOT NULL,
  `nama_fasilitas` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `fasilitas`
--

INSERT INTO `fasilitas` (`id_fasilitas`, `nama_fasilitas`, `created_at`) VALUES
(1, 'Komputer Lab A', '2026-10-19 12:55:32');

-- --------------------------------------------------------

--
-- Struktur dari tabel `komentar`
--

CREATE TABLE `komentar` (
  `id_komentar` int UNSIGNED NOT NULL,
  `id_pengaduan` int UNSIGNED NOT NULL,
  `id_user` int UNSIGNED NOT NULL,
  `isi_komentar` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `penanganan`
--

CREATE TABLE `penanganan` (
  `id_penanganan` int UNSIGNED NOT NULL,
  `id_pengaduan` int UNSIGNED NOT NULL,
  `status` enum('diproses','selesai','ditolak') COLLATE utf8mb4_unicode_ci NOT NULL,
  `foto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `keterangan` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `pengaduan`
--

CREATE TABLE `pengaduan` (
  `id_pengaduan` int UNSIGNED NOT NULL,
  `id_user` int UNSIGNED NOT NULL,
  `id_fasilitas` int UNSIGNED NOT NULL,
  `judul` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lokasi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `foto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('diajukan','diproses','selesai','ditolak') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'diajukan',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `pengaduan`
--

INSERT INTO `pengaduan` (`id_pengaduan`, `id_user`, `id_fasilitas`, `judul`, `lokasi`, `deskripsi`, `foto`, `status`, `created_at`, `updated_at`) VALUES
(1, 8, 1, 'Pengujian Dashboard', NULL, 'Pengaduan dummy untuk menguji data dashboard pengguna.', NULL, 'diajukan', '2026-10-19 12:56:18', '2026-10-19 12:56:18'),
(2, 10, 1, 'Komputer laboratorium mengalami kerusakan', NULL, 'Komputer di Laboratorium Komputer A tidak dapat dinyalakan saat praktikum.', NULL, 'diajukan', '2026-10-20 10:56:20', '2026-10-20 10:56:20');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id_user` int UNSIGNED NOT NULL,
  `nama` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `foto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('user','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id_user`, `nama`, `email`, `password`, `foto`, `role`, `created_at`) VALUES
(1, 'rizky fadilah', 'testkiki@gmail.com', '$2a$12$ApmDIrVzAJdTc.b/3zBVT.BJzbzeZMazLyy3ssFdls9yE5HwwSk.a', NULL, 'user', '2026-10-12 12:21:45'),
(2, 'Testing User', 'testinguser01@gmail.com', '$2a$12$9CNxLb77lzEBfQNarIqdZOECBCvjHWlAn20spWBRm09A6pJLLJeWO', NULL, 'user', '2026-10-13 03:55:02'),
(3, 'Kiki Testing', 'kiki.testing@example.com', '$2y$12$iGKmNDdWgygpoHJarXtO5eTNUXKYBLAoa3e8zSeOEhxBW/Vewq9vG', NULL, 'user', '2026-10-15 10:37:28'),
(4, 'kiki kokow', 'kikitest@gmail.com', '$2y$12$8j7JP5lcJr0GRojoA.TGNeE2cjK2PR4IQsv1wjirbvOVOy5GLwndK', NULL, 'user', '2026-10-15 10:55:26'),
(5, 'Pengguna Tes', 'tesbaru@example.com', '$2y$12$wp32HHNMiPmzjaZBnvrprO7wU1FeedYGcNFvbV84UbgU7sQg.guQO', NULL, 'user', '2026-10-16 07:55:07'),
(6, 'kiki fadilah', 'kkkk@gmail.com', '$2y$12$0eFr/.TeskNC5EE/0WfvSeHYUuamEZfMwYPgKSAdnq4OJQf7WTZrm', NULL, 'user', '2026-10-16 10:18:35'),
(7, 'kiki', 'kikitestt@gmail.com', '$2y$12$XpEWCGLhxoBXwHoQnMELeep.OModMqoYeahCrXT41PbF0avEIqxKK', NULL, 'user', '2026-10-16 10:34:23'),
(8, 'Budi Pengujian', 'budi.test@example.com', '$2y$12$crsI/Av/tcf8fYixZHdEeO0N1rL7FBe2nDbn8A.R6cW5CKuGz5TXK', NULL, 'user', '2026-10-19 12:47:30'),
(9, 'Andi Pengujian', 'andi.test@example.com', '$2y$12$4LNcqznK49pM.JDJRHizTOLeJ8Y28gcMz7exuzwV6F2B9RX39DLe.', NULL, 'user', '2026-10-19 12:59:18'),
(10, 'Andi Saputra', 'andi@example.com', '$2y$12$lzhmXn./SPRSFo7CrNac4OjSFPZPIcIcw1vQ4iDjxkqfT5irHxhaa', NULL, 'user', '2026-10-20 10:50:27'),
(11, 'rzky fdh', 'rzkyfdh10@gmail.com', '$2y$12$4GRkyl0lLg.wnt1cJh6WOu/RlUUMO8RsELkpfhM9CrKNhBE1a7uje', NULL, 'user', '2026-10-20 11:24:06');

-- --------------------------------------------------------

--
-- Struktur dari tabel `vote`
--

CREATE TABLE `vote` (
  `id_vote` int UNSIGNED NOT NULL,
  `id_pengaduan` int UNSIGNED NOT NULL,
  `id_user` int UNSIGNED NOT NULL,
  `tipe_vote` enum('upvote','downvote') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indeks untuk tabel yang dibuang
--

--
-- Indeks untuk tabel `fasilitas`
--
ALTER TABLE `fasilitas`
  ADD PRIMARY KEY (`id_fasilitas`);

--
-- Indeks untuk tabel `komentar`
--
ALTER TABLE `komentar`
  ADD PRIMARY KEY (`id_komentar`),
  ADD KEY `fk_komentar_pengaduan` (`id_pengaduan`),
  ADD KEY `fk_komentar_user` (`id_user`);

--
-- Indeks untuk tabel `penanganan`
--
ALTER TABLE `penanganan`
  ADD PRIMARY KEY (`id_penanganan`),
  ADD KEY `fk_penanganan_pengaduan` (`id_pengaduan`);

--
-- Indeks untuk tabel `pengaduan`
--
ALTER TABLE `pengaduan`
  ADD PRIMARY KEY (`id_pengaduan`),
  ADD KEY `fk_pengaduan_user` (`id_user`),
  ADD KEY `fk_pengaduan_fasilitas` (`id_fasilitas`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indeks untuk tabel `vote`
--
ALTER TABLE `vote`
  ADD PRIMARY KEY (`id_vote`),
  ADD UNIQUE KEY `uq_vote_user_pengaduan` (`id_pengaduan`,`id_user`),
  ADD KEY `fk_vote_user` (`id_user`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `fasilitas`
--
ALTER TABLE `fasilitas`
  MODIFY `id_fasilitas` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `komentar`
--
ALTER TABLE `komentar`
  MODIFY `id_komentar` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `penanganan`
--
ALTER TABLE `penanganan`
  MODIFY `id_penanganan` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `pengaduan`
--
ALTER TABLE `pengaduan`
  MODIFY `id_pengaduan` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT untuk tabel `vote`
--
ALTER TABLE `vote`
  MODIFY `id_vote` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `komentar`
--
ALTER TABLE `komentar`
  ADD CONSTRAINT `fk_komentar_pengaduan` FOREIGN KEY (`id_pengaduan`) REFERENCES `pengaduan` (`id_pengaduan`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_komentar_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `penanganan`
--
ALTER TABLE `penanganan`
  ADD CONSTRAINT `fk_penanganan_pengaduan` FOREIGN KEY (`id_pengaduan`) REFERENCES `pengaduan` (`id_pengaduan`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `pengaduan`
--
ALTER TABLE `pengaduan`
  ADD CONSTRAINT `fk_pengaduan_fasilitas` FOREIGN KEY (`id_fasilitas`) REFERENCES `fasilitas` (`id_fasilitas`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pengaduan_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `vote`
--
ALTER TABLE `vote`
  ADD CONSTRAINT `fk_vote_pengaduan` FOREIGN KEY (`id_pengaduan`) REFERENCES `pengaduan` (`id_pengaduan`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_vote_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
