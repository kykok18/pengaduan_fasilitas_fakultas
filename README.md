# Pengaduan Fasilitas Fakultas

## Menjalankan dengan PHP lokal / XAMPP

Aplikasi ini dibuat untuk setup PHP native, bukan Docker atau Node runtime. Untuk development lokal, cukup pakai PHP built-in server atau XAMPP + MySQL.

### Persiapan pertama

1. Pasang PHP dan MySQL, atau gunakan XAMPP.
2. Buat database `pengaduan_fasilitas_fakultasDB`, lalu impor file `database/pengaduan_fasilitas_fakultasDB.sql` melalui phpMyAdmin atau MySQL client.
3. Salin `.env.example` menjadi `.env`, lalu sesuaikan `DB_HOST`, `DB_PORT`, `DB_USER`, dan `DB_PASSWORD` sesuai MySQL/XAMPP.

### Menjalankan aplikasi lokal

Dari root proyek, jalankan:

```bash
php -S localhost:8000
```

Lalu buka:

- Frontend: `http://localhost:8000/frontend/login.html`
- Backend API: `http://localhost:8000/backend/api/login.php`

Kalau memakai XAMPP, letakkan folder proyek di `htdocs`, lalu buka `http://localhost/pengaduan_fasilitas_fakultas/frontend/login.html`.

### Catatan

- Jangan membagikan file `.env`; file tersebut berisi kredensial database.
- Tidak memakai Docker dan tidak memakai npm untuk setup lokal.
- Backend menggunakan PHP + MySQL, bukan Node.js.
