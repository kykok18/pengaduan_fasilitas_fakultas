# Kontrak API

**Proyek:** Website Pengaduan Fasilitas Fakultas  
**Versi:** 1.1  
**Pembaruan:** 15 Oktober 2026  
**Cakupan:** API pengguna (`user`), bukan API admin  
**Backend:** PHP Native + MySQL  
**Autentikasi:** PHP Session  
**Status dokumen:** Kontrak kerja yang membedakan endpoint tersedia dan rencana

## 1. Tujuan dan aturan status

Dokumen ini menjadi acuan bersama backend dan frontend mengenai URL, metode HTTP, request, response, autentikasi, dan validasi.

Status endpoint dalam dokumen ini:
- **Tersedia:** file endpoint ditemukan pada proyek yang diaudit. Ini tidak otomatis berarti semua skenario sudah lulus pengujian.
- **Direncanakan:** belum ditemukan implementasi endpoint pada proyek yang diaudit; jangan dipanggil frontend sebelum backend dibuat dan diuji.

API admin tidak termasuk cakupan dokumen ini.

## 2. Base URL dan URL aktual

Server pengembangan yang digunakan:

```text
http://localhost:8000
```

Frontend saat ini memanggil API melalui `frontend/javascript/api.js` dengan base URL:

```text
/backend/api
```

Karena itu, gunakan URL aktual berikut saat pengembangan lokal:

| Method | URL aktual | Status |
|---|---|---|
| POST | `http://localhost:8000/backend/api/registrasi.php` | Tersedia |
| POST | `http://localhost:8000/backend/api/login.php` | Tersedia |
| POST | `http://localhost:8000/backend/api/logout.php` | Tersedia |
| GET | `http://localhost:8000/backend/api/dashboard.php` | Tersedia |

**Penting:** kontrak ini menggunakan path file PHP yang benar-benar ada, bukan alias logis seperti `/api/registrasi`. Jangan menghapus ekstensi `.php` atau mengganti base URL sampai routing backend dan konfigurasi frontend diubah bersama-sama.

## 3. Format request dan response

### 3.1 JSON

Untuk request yang mengirim JSON, gunakan:

```http
Content-Type: application/json
Accept: application/json
```

Contoh body login:

```json
{
  "email": "user@example.com",
  "password": "Rahasia123"
}
```

### 3.2 Response umum

Bentuk response sukses yang digunakan helper backend:

```json
{
  "status": "success",
  "message": "Permintaan berhasil",
  "data": {}
}
```

Bentuk response error:

```json
{
  "status": "error",
  "message": "Permintaan tidak dapat diproses"
}
```

Nilai `message` menyesuaikan hasil operasi. Response error dapat tidak memiliki field `data`. Frontend sebaiknya memeriksa HTTP status dan `status`, bukan hanya teks pesan.

## 4. Session dan autentikasi

- Autentikasi menggunakan PHP Session, bukan Bearer Token/JWT.
- Setelah login berhasil, server membuat session dan mengirim cookie session.
- Request berikutnya ke endpoint privat harus mengirim kembali cookie session.
- Karena frontend dan backend saat ini berjalan pada origin yang sama, request `fetch` menggunakan `credentials: "same-origin"`.
- Endpoint privat menolak request tanpa session yang valid dengan `401 Unauthorized`.
- Logout mengakhiri session di server. Menghapus data pengguna dari `localStorage` saja tidak cukup untuk melakukan logout.
- Data `localStorage` bukan bukti autentikasi dan tidak boleh digunakan backend sebagai pengganti pemeriksaan session.

## 5. Endpoint yang tersedia

### 5.1 Registrasi

**Method:** `POST`  
**URL:** `/backend/api/registrasi.php`  
**Autentikasi:** Tidak  
**Status:** Tersedia

Request:

```json
{
  "nama": "Andi Saputra",
  "email": "andi@example.com",
  "password": "Andi12345",
  "confirm_password": "Andi12345"
}
```

Aturan:
- `nama`, `email`, `password`, dan `confirm_password` wajib diisi.
- Email harus valid dan belum digunakan.
- Password minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka.
- `password` harus sama dengan `confirm_password`.
- `confirm_password` hanya untuk validasi, tidak disimpan ke database.
- Role akun baru adalah `user`.
- Password harus disimpan sebagai hash dan tidak dikembalikan dalam response.

Response sukses yang disepakati:

```json
{
  "status": "success",
  "message": "Registrasi berhasil",
  "data": {
    "id_user": 1,
    "nama": "Andi Saputra",
    "email": "andi@example.com",
    "role": "user"
  }
}
```

Status yang digunakan: `201 Created` untuk registrasi berhasil; `400 Bad Request` untuk input tidak valid; `405 Method Not Allowed` untuk metode selain POST; `500 Internal Server Error` untuk kegagalan internal. Jika implementasi membedakan email duplikat dengan `409 Conflict`, frontend harus menerima status tersebut juga dan kontrak diperbarui secara konsisten.

### 5.2 Login

**Method:** `POST`  
**URL:** `/backend/api/login.php`  
**Autentikasi:** Tidak  
**Status:** Tersedia

Request:

```json
{
  "email": "andi@example.com",
  "password": "Andi12345"
}
```

Response sukses:

```json
{
  "status": "success",
  "message": "Login berhasil",
  "data": {
    "id_user": 1,
    "nama": "Andi Saputra",
    "email": "andi@example.com",
    "role": "user"
  }
}
```

Server membuat session setelah kredensial valid dan seharusnya meregenerasi session ID setelah login. Password maupun hash password tidak boleh dikirim dalam response.

Status: `200 OK` untuk login berhasil; `400 Bad Request` untuk input tidak valid; `401 Unauthorized` untuk email/password salah; `405 Method Not Allowed` untuk metode selain POST; `500 Internal Server Error` untuk kegagalan internal.

### 5.3 Logout

**Method:** `POST`  
**URL:** `/backend/api/logout.php`  
**Autentikasi:** Session aktif  
**Status:** Tersedia

Logout mengakhiri session dan menghapus cookie session yang terkait.

Response sukses:

```json
{
  "status": "success",
  "message": "Logout berhasil",
  "data": null
}
```

Jika tidak ada session aktif, implementasi saat ini dapat merespons `401 Unauthorized`. Frontend tetap harus menangani kondisi tersebut dan tidak menganggap penghapusan `localStorage` sebagai bukti bahwa session server sudah berakhir.

### 5.4 Dashboard

**Method:** `GET`  
**URL:** `/backend/api/dashboard.php`  
**Autentikasi:** Session aktif  
**Status:** Tersedia

Endpoint ini dilindungi middleware autentikasi. Request tanpa session valid harus menghasilkan `401 Unauthorized`.

**Catatan:** bentuk dan sumber data dashboard harus mengikuti response aktual `DashboardController` dan model dashboard. Jangan menganggap angka statis pada halaman `frontend/index.html` sebagai data database. Sebelum frontend mengonsumsi endpoint ini, dokumentasikan contoh response aktual hasil pengujian.

## 6. Endpoint yang direncanakan, belum tersedia

Endpoint berikut berasal dari kebutuhan fitur yang tercantum pada kontrak sebelumnya. File implementasinya belum ditemukan pada ZIP yang diaudit, sehingga statusnya **direncanakan**, bukan endpoint aktif. Jangan integrasikan ke frontend sampai request/response final ditetapkan dan endpoint diuji.

| Method | Path rencana | Fungsi | Autentikasi |
|---|---|---|---|
| GET | `/backend/api/pengaduan.php` | Daftar pengaduan | Kebijakan visibilitas perlu ditetapkan |
| POST | `/backend/api/pengaduan.php` | Membuat pengaduan | Ya |
| GET | `/backend/api/pengaduan_detail.php?id={id}` | Detail pengaduan | Kebijakan visibilitas perlu ditetapkan |
| PUT | `/backend/api/pengaduan_update.php?id={id}` | Mengubah pengaduan milik sendiri | Ya |
| DELETE | `/backend/api/pengaduan_hapus.php?id={id}` | Menghapus pengaduan milik sendiri | Ya |
| POST | `/backend/api/vote.php` | Memberi/mengubah vote | Ya |
| GET | `/backend/api/komentar.php?id_pengaduan={id}` | Daftar komentar | Kebijakan visibilitas perlu ditetapkan |
| POST | `/backend/api/komentar.php` | Menambah komentar | Ya |
| GET | `/backend/api/riwayat_pengaduan.php` | Riwayat pengaduan user | Ya |
| GET | `/backend/api/profile.php` | Melihat profil user | Ya |
| PUT | `/backend/api/profile.php` | Mengubah profil user | Ya |
| POST | `/backend/api/profile_photo.php` | Mengunggah foto profil | Ya |
| PUT | `/backend/api/profile_password.php` | Mengubah password | Ya |

Path pada tabel ini adalah **usulan penamaan file PHP**, bukan URL yang sudah berjalan. Sebelum mengimplementasikan fitur, backend dan frontend harus menyepakati path final, nama field, format response, kode status, dan aturan akses. Hindari memakai path berbentuk `/pengaduan/{id}` tanpa router yang benar-benar mendukung parameter tersebut.

## 7. Aturan data untuk fitur pengaduan mendatang

Aturan berikut merupakan kebutuhan bisnis yang harus dipertahankan saat endpoint dibuat:

- Status awal pengaduan: `diajukan`.
- Status yang dikenal: `diajukan`, `diproses`, `selesai`, `ditolak`.
- `id_user` harus diambil dari session, bukan dipercaya dari body request.
- Pengguna hanya boleh mengubah atau menghapus pengaduan miliknya, sesuai aturan bisnis final.
- `tipe_vote` hanya menerima `upvote` atau `downvote`.
- Nama field komentar, aturan foto, ukuran/jenis file, serta perilaku perubahan atau pembatalan vote perlu ditetapkan sebelum endpoint diimplementasikan.
- Request unggah file menggunakan `multipart/form-data`, bukan JSON.

## 8. Kode status HTTP

| Status | Penggunaan |
|---|---|
| `200 OK` | Request berhasil, misalnya login atau mengambil data |
| `201 Created` | Data baru berhasil dibuat |
| `400 Bad Request` | Input tidak valid |
| `401 Unauthorized` | Belum login atau kredensial salah |
| `403 Forbidden` | Pengguna tidak berhak melakukan tindakan |
| `404 Not Found` | Resource atau endpoint tidak ditemukan |
| `405 Method Not Allowed` | Metode HTTP tidak didukung |
| `409 Conflict` | Konflik data, misalnya email sudah digunakan, jika dipakai konsisten oleh backend |
| `500 Internal Server Error` | Kesalahan internal server |

Kode status aktual wajib diselaraskan dengan implementasi dan diuji melalui Postman.

## 9. Keamanan

- Gunakan prepared statements untuk query database.
- Gunakan `password_hash()` dan `password_verify()` untuk password.
- Jangan mengembalikan password atau hash password.
- Regenerasi session ID setelah login berhasil.
- Semua endpoint privat harus memeriksa session di backend.
- Periksa kepemilikan resource sebelum mengubah atau menghapusnya.
- Validasi semua input di backend, meskipun frontend juga melakukan validasi.
- Validasi tipe dan ukuran file unggahan; jangan mempercayai nama file dari client.
- Gunakan HTTPS saat deployment.
- Jangan commit `.env` atau kredensial ke Git.

## 10. Checklist status implementasi

| Fitur | Status berdasarkan struktur proyek yang diaudit | Catatan |
|---|---|---|
| Registrasi | Tersedia | Perlu pengujian regresi setelah revisi |
| Login | Tersedia | Perlu pengujian cookie/session |
| Logout | Tersedia | Uji session benar-benar berakhir di server |
| Dashboard | Tersedia | Dokumentasikan response aktual dan integrasikan ke frontend |
| CRUD pengaduan | Direncanakan | Endpoint belum ditemukan |
| Vote | Direncanakan | Endpoint belum ditemukan |
| Komentar | Direncanakan | Endpoint belum ditemukan |
| Riwayat pengaduan | Direncanakan | Endpoint belum ditemukan |
| Profil | Direncanakan | Endpoint belum ditemukan |

Perbarui status menjadi selesai hanya setelah endpoint tersedia dan pengujian request/response berhasil. Simpan bukti uji Postman di dokumentasi pengujian terpisah.
