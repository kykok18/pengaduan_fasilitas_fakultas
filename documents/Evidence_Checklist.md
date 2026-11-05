# Evidence Checklist

Belum ada evidence. Semua screenshot harus diambil sendiri dari run nyata di Postman. Tandai `[x]` setelah file ada di `Evidence/`.

Aturan: tanpa password, nilai cookie/PHPSESSID, atau isi `.env` pada gambar. Format nama: `ID_deskripsi-singkat.png`.

| Selesai | Nama file | Test case | Harus terlihat |
|---|---|---|---|
| [ ] | `REG-01_registrasi-berhasil.png` | REG-01 | Request, status 201, body tanpa password, tab Test Results |
| [ ] | `LGN-01_login-berhasil.png` | LGN-01 | Status 200, body login, test hijau. Sembunyikan tab Cookies |
| [ ] | `LGN-02_password-salah.png` | LGN-02 | Status 401 dan pesan |
| [ ] | `LGN-09_akses-dashboard-dengan-session.png` | LGN-09 | 200 dari dashboard tanpa kirim kredensial; test 'Session sama' hijau |
| [ ] | `LGN-10_akses-dashboard-setelah-login-gagal.png` | LGN-10 | 401 |
| [ ] | `LGN-11_session-lama-setelah-logout.png` | LGN-11a, LGN-11 | Dua screenshot: 200 sebelum logout, 401 sesudahnya. Sembunyikan header Cookie |
| [ ] | `DSH-01_dashboard-berhasil.png` | DSH-01 | 200, user, pengaduan, pagination |
| [ ] | `DSH-12_status-tidak-valid.png` | DSH-12 | 400 |
| [ ] | `PGD-03_pengaduan-berhasil.png` | PGD-03 | Tab Body (form-data) dan respons 201 |
| [ ] | `PGD-08_validasi-judul-kosong.png` | PGD-08 | 400 'Judul pengaduan wajib diisi' |
| [ ] | `PGD-12_foto-melebihi-batas.png` | PGD-12 | 413 atau 400 dengan pesan 10 MB |
| [ ] | `DTL-01_detail-valid.png` | DTL-01 | 200 dan struktur data |
| [ ] | `DTL-02_detail-penanganan.png + DTL-02_db.png` | DTL-02 | Respons dan hasil SELECT penanganan (setelah fixture) |
| [ ] | `DTL-03_detail-vote.png + DTL-03_db.png` | DTL-03 | Respons dan SELECT vote |
| [ ] | `DTL-04_detail-komentar.png + DTL-04_db.png` | DTL-04 | Respons dan SELECT komentar |
| [ ] | `DTL-05_detail-tanpa-relasi.png` | DTL-05..07 | Array kosong dan vote 0 |
| [ ] | `DTL-08_detail-tidak-ditemukan.png` | DTL-08 | 404 |
| [ ] | `DTL-09_id-tidak-diberikan.png` | DTL-09 | 400 (cukup satu mewakili DTL-09..14, atau ambil dari ringkasan Runner) |
| [ ] | `DTL-15_tanpa-login.png` | DTL-15 | 401 |
| [ ] | `DTL-16_method-tidak-didukung.png` | DTL-16 | 405 dan header Allow |
| [ ] | `DTL-20_sql-sebelum.png` | DTL-20 | Hasil query 'Snapshot' di bawah SEBELUM DTL-20a |
| [ ] | `DTL-20_sql-sesudah.png` | DTL-20 | Query yang sama SESUDAH DTL-20b; updated_at dan jumlah relasi tidak berubah |
| [ ] | `DTL-20_hasil-postman.png` | DTL-20 | Test Results DTL-20a dan DTL-20b hijau |
| [ ] | `LOG-01_logout-berhasil.png` | LOG-01 | 200 dan Set-Cookie ... deleted (sembunyikan nilai lain) |
| [ ] | `RUN_collection-runner-ringkasan.png` | Semua | Ringkasan Collection Runner: jumlah pass/fail dan daftar request |

## Query SQL bantu untuk DTL-20 (ganti `<ID>` dengan id pada DTL-20a)

```sql
SELECT p.id_pengaduan, p.status, p.updated_at,
  (SELECT COUNT(*) FROM penanganan WHERE id_pengaduan = p.id_pengaduan) AS n_penanganan,
  (SELECT COUNT(*) FROM vote       WHERE id_pengaduan = p.id_pengaduan) AS n_vote,
  (SELECT COUNT(*) FROM komentar   WHERE id_pengaduan = p.id_pengaduan) AS n_komentar
FROM pengaduan p WHERE p.id_pengaduan = <ID>;
```

Id yang dipakai tampil di Postman Console atau variable `detail_id_valid`.
