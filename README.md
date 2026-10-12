# Pengaduan Fasilitas Fakultas

## Menjalankan tanpa XAMPP atau Laragon

Aplikasi ini memakai Node.js untuk menyajikan website dan API. MySQL tetap dibutuhkan sebagai layanan database terpisah.

### Persiapan pertama

1. Pasang Node.js dan MySQL Server pada komputer yang akan menjadi server.
2. Buat database `pengaduan_fasilitas_fakultasDB`, lalu impor file `database/pengaduan_fasilitas_fakultasDB.sql` melalui klien MySQL.
3. Salin `.env.example` menjadi `.env`, lalu sesuaikan `DB_HOST`, `DB_PORT`, `DB_USER`, dan `DB_PASSWORD` dengan akun MySQL.
4. Dari folder proyek, jalankan `npm install`.

### Menjalankan aplikasi

Jalankan `npm start`, lalu buka `http://localhost:8000` pada komputer server. Server mendengarkan pada seluruh antarmuka jaringan, sehingga pengguna lain di jaringan yang sama dapat membuka `http://IP-komputer-server:8000`.

Pastikan firewall komputer server mengizinkan koneksi ke port `8000`. Database sebaiknya hanya menerima koneksi dari komputer aplikasi kecuali memang perlu diakses dari perangkat lain.

### Catatan

- Jangan membagikan file `.env`; file tersebut berisi kredensial database.
- Aplikasi ini menyediakan endpoint login dan registrasi. Endpoint PHP lama masih ada di folder `backend`, tetapi server Node tidak menjalankan PHP.
- Menjalankan `server.js` tidak memasang atau menyalakan MySQL. MySQL Server harus sudah dipasang dan aktif.
