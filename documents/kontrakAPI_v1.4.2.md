# KONTRAK API

## Sistem Pengaduan Fasilitas Fakultas

### Dokumentasi Sprint 3

**Versi:** 1.5.0  
**Backend:** PHP Native  
**Database:** MySQL  
**Autentikasi:** PHP Session  
**Format response:** JSON  
**Format upload:** multipart/form-data

**Deskripsi:** Dokumen ini adalah kontrak antara frontend dan backend Sistem Pengaduan Fasilitas Fakultas. Isinya mendefinisikan endpoint API, format request dan response, aturan validasi, kode status HTTP, pesan error, mekanisme autentikasi session, serta skenario pengujian. Endpoint yang tercakup: registrasi, login, logout, dashboard, detail pengaduan, daftar fasilitas, pembuatan pengaduan, vote (upvote/downvote), dan komentar. Endpoint riwayat pengaduan belum tersedia dan tidak dinyatakan aktif.

---

# 1. Informasi Umum

## 1.1 Base URL

Development:

```text
http://localhost:8000/backend/api
```

Base URL production harus disesuaikan dengan konfigurasi deployment aktual.

## 1.2 Daftar Endpoint

| No  | Method | Endpoint                | Fungsi                                                 | Auth                    | Bab |
| --- | ------ | ----------------------- | ------------------------------------------------------ | ----------------------- | --- |
| 1   | POST   | `/registrasi.php`       | Registrasi pengguna                                    | Tidak                   | 3   |
| 2   | POST   | `/login.php`            | Login pengguna                                         | Tidak                   | 4   |
| 3   | POST   | `/logout.php`           | Logout pengguna                                        | Ya                      | 5   |
| 4   | GET    | `/dashboard.php`        | Mengambil data dashboard                               | Ya                      | 6   |
| 5   | GET    | `/pengaduan.php`        | Mengambil daftar fasilitas                             | Ya                      | 8   |
| 6   | POST   | `/pengaduan.php`        | Membuat pengaduan                                      | Ya                      | 9   |
| 7   | GET    | `/detail_pengaduan.php` | Mengambil detail pengaduan berdasarkan ID              | Ya                      | 7   |
| 8   | POST   | `/vote.php`             | Menambahkan, mengubah, atau membatalkan vote pengaduan | Ya                      | 11  |
| 9   | GET    | `/komentar.php`         | Mengambil daftar komentar berdasarkan pengaduan        | Ya                      | 12  |
| 10  | POST   | `/komentar.php`         | Menyimpan komentar baru pada pengaduan                 | Ya                      | 12  |
| 11  | GET    | `/riwayat.php`          | Riwayat pengaduan pengguna                             | Belum tersedia di arsip | 13  |

Kolom **Bab** menunjukkan bab yang menjelaskan endpoint tersebut. Endpoint no. 11 belum tersedia dan tidak dinyatakan sebagai endpoint aktif.

---

# 2. Standar Request dan Response

## 2.1 Format Response Sukses

Response sukses menggunakan helper `successResponse()`.

```json
{
  "status": "success",
  "message": "Pesan",
  "data": {}
}
```

Properti:

| Field   | Tipe              | Keterangan          |
| ------- | ----------------- | ------------------- |
| status  | string            | Status response     |
| message | string            | Pesan hasil request |
| data    | object/array/null | Data response       |

## 2.2 Format Response Error

Response error menggunakan helper `errorResponse()`.

```json
{
  "status": "error",
  "message": "Pesan error"
}
```

Response error tidak menyertakan properti `data`.

## 2.3 HTTP Status Code

| Status | Keterangan                                 |
| ------ | ------------------------------------------ |
| 200    | Request berhasil                           |
| 201    | Data berhasil dibuat                       |
| 400    | Request tidak valid                        |
| 401    | Pengguna belum login atau kredensial salah |
| 404    | Resource tidak ditemukan                   |
| 405    | Method tidak diizinkan                     |
| 409    | Konflik data                               |
| 413    | Ukuran request terlalu besar               |
| 500    | Kesalahan internal server                  |

HTTP status aktual mengikuti implementasi endpoint.

## 2.4 Autentikasi Session

Endpoint privat menggunakan session PHP.

Setelah login berhasil, server mengirimkan cookie session. Client harus menyimpan cookie tersebut dan mengirimkannya pada request privat.

Contoh:

```http
Cookie: PHPSESSID=<session_id>
```

Konfigurasi session pada backend:

- Strict mode aktif.
- Cookies only.
- HttpOnly aktif.
- SameSite menggunakan Lax.
- Flag Secure aktif hanya jika variabel lingkungan `APP_ENV` bernilai `production`. Pada development (HTTP localhost) flag Secure nonaktif.
- Deployment HTTPS harus menetapkan `APP_ENV=production` agar cookie hanya dikirim melalui HTTPS.

---

# 3. API Registrasi

## 3.1 Informasi Endpoint

| Atribut        | Nilai             |
| -------------- | ----------------- |
| Method         | POST              |
| Endpoint       | `/registrasi.php` |
| Authentication | Tidak diperlukan  |
| Content-Type   | application/json  |

## 3.2 Request Body

```json
{
  "nama": "Tester Postman",
  "email": "tester@example.com",
  "password": "Password123!",
  "confirm_password": "Password123!"
}
```

## 3.3 Parameter Request

| Field            | Tipe   | Wajib | Keterangan          |
| ---------------- | ------ | ----- | ------------------- |
| nama             | string | Ya    | Nama pengguna       |
| email            | string | Ya    | Email pengguna      |
| password         | string | Ya    | Password akun       |
| confirm_password | string | Ya    | Konfirmasi password |

## 3.4 Validasi

- Nama wajib diisi.
- Nama maksimal 100 karakter.
- Nama menerima huruf, spasi, titik, apostrof, dan tanda hubung.
- Email wajib diisi.
- Email maksimal 254 karakter.
- Email harus memiliki format valid.
- Password minimal 8 karakter.
- Password maksimal 128 karakter.
- Password harus mengandung huruf besar, huruf kecil, angka, dan simbol (karakter selain huruf dan angka ASCII).
- Konfirmasi password harus sama dengan password.

## 3.5 Response Berhasil

HTTP Status: `201 Created`

```json
{
  "status": "success",
  "message": "Registrasi berhasil",
  "data": {
    "id_user": 31,
    "nama": "Tester Postman",
    "email": "tester@example.com",
    "role": "user"
  }
}
```

Nilai `id_user` merupakan contoh. Nilai aktual berasal dari database.

## 3.6 Response Error

| HTTP | Message                                                                     |
| ---- | --------------------------------------------------------------------------- |
| 405  | Method not allowed                                                          |
| 400  | Format JSON tidak valid                                                     |
| 400  | Data request tidak valid                                                    |
| 400  | Nama, email, password, dan konfirmasi password harus diisi                  |
| 400  | Nama hanya boleh mengandung huruf, spasi, titik, apostrof, dan tanda hubung |
| 400  | Nama maksimal 100 karakter                                                  |
| 400  | Email maksimal 254 karakter                                                 |
| 400  | Format email tidak valid                                                    |
| 400  | Password minimal 8 karakter                                                 |
| 400  | Password maksimal 128 karakter                                              |
| 400  | Konfirmasi password tidak sesuai                                            |
| 400  | Password harus mengandung huruf besar, huruf kecil, angka, dan simbol       |
| 409  | Email sudah terdaftar                                                       |
| 500  | Terjadi kesalahan pada server                                               |
| 500  | Registrasi gagal                                                            |

## 3.7 Contoh Response Error

```json
{
  "status": "error",
  "message": "Email sudah terdaftar"
}
```

---

# 4. API Login

## 4.1 Informasi Endpoint

| Atribut        | Nilai            |
| -------------- | ---------------- |
| Method         | POST             |
| Endpoint       | `/login.php`     |
| Authentication | Tidak diperlukan |
| Content-Type   | application/json |

## 4.2 Request Body

```json
{
  "email": "tester@example.com",
  "password": "Password123!"
}
```

## 4.3 Parameter Request

| Field    | Tipe   | Wajib | Keterangan    |
| -------- | ------ | ----- | ------------- |
| email    | string | Ya    | Email akun    |
| password | string | Ya    | Password akun |

## 4.4 Response Berhasil

HTTP Status: `200 OK`

```json
{
  "status": "success",
  "message": "Login berhasil",
  "data": {
    "id_user": 31,
    "nama": "Tester Postman",
    "email": "tester@example.com",
    "role": "user"
  }
}
```

Login berhasil membuat session pengguna.

Server mengirimkan cookie session melalui header `Set-Cookie`.

Contoh:

```http
Set-Cookie: PHPSESSID=<session_id>; HttpOnly; SameSite=Lax
```

Client harus menyimpan cookie untuk request berikutnya.

## 4.5 Response Error

| HTTP | Message                        |
| ---- | ------------------------------ |
| 405  | Method not allowed             |
| 400  | Format JSON tidak valid        |
| 400  | Data request tidak valid       |
| 400  | Email dan password harus diisi |
| 400  | Format email tidak valid       |
| 401  | Email atau password salah      |
| 500  | Terjadi kesalahan pada server  |
| 500  | Gagal memulai session          |
| 500  | Gagal memperbarui session      |

## 4.6 Contoh Response Login Gagal

```json
{
  "status": "error",
  "message": "Email atau password salah"
}
```

---

# 5. API Logout

## 5.1 Informasi Endpoint

| Atribut        | Nilai                 |
| -------------- | --------------------- |
| Method         | POST                  |
| Endpoint       | `/logout.php`         |
| Authentication | Wajib                 |
| Content-Type   | Tidak memerlukan body |

## 5.2 Request

```http
POST /logout.php
Cookie: PHPSESSID=<session_id>
```

## 5.3 Response Berhasil

HTTP Status: `200 OK`

```json
{
  "status": "success",
  "message": "Logout berhasil",
  "data": null
}
```

Logout mengakhiri session pengguna dan menghapus cookie session.

## 5.4 Response Error

| HTTP | Message                  |
| ---- | ------------------------ |
| 405  | Method not allowed       |
| 401  | Pengguna belum login     |
| 500  | Gagal memulai session    |
| 500  | Gagal mengakhiri session |

## 5.5 Contoh Response Logout Tanpa Session

```json
{
  "status": "error",
  "message": "Pengguna belum login"
}
```

---

# 6. API Dashboard

## 6.1 Informasi Endpoint

| Atribut        | Nilai            |
| -------------- | ---------------- |
| Method         | GET              |
| Endpoint       | `/dashboard.php` |
| Authentication | Wajib            |

Dashboard menampilkan pengaduan terbaru dari seluruh pengguna.

Dashboard bukan halaman riwayat pribadi.

## 6.2 Query Parameters

| Parameter | Tipe    | Default | Keterangan                  |
| --------- | ------- | ------- | --------------------------- |
| page      | integer | 1       | Nomor halaman               |
| limit     | integer | 5       | Jumlah data per halaman     |
| search    | string  | Kosong  | Pencarian judul atau lokasi |
| status    | string  | Kosong  | Filter status pengaduan     |

Ketentuan pagination:

- Page kurang dari 1 atau tidak valid akan menggunakan nilai default.
- Limit kurang dari 1 atau tidak valid akan menggunakan nilai default.
- Limit maksimum adalah 100.
- Search dilakukan pada judul atau lokasi.

Status valid:

```text
diajukan
diproses
selesai
ditolak
```

## 6.3 Contoh Request

```http
GET /dashboard.php?page=1&limit=5
Cookie: PHPSESSID=<session_id>
```

Contoh pencarian:

```http
GET /dashboard.php?page=1&limit=5&search=Lab
Cookie: PHPSESSID=<session_id>
```

Contoh filter:

```http
GET /dashboard.php?page=1&limit=5&status=diajukan
Cookie: PHPSESSID=<session_id>
```

## 6.4 Response Berhasil

HTTP Status: `200 OK`

```json
{
  "status": "success",
  "message": "Data dashboard berhasil diambil",
  "data": {
    "user": {
      "id_user": 31,
      "nama": "Tester Postman",
      "email": "tester@example.com",
      "role": "user"
    },
    "pengaduan": [],
    "pagination": {
      "current_page": 1,
      "per_page": 5,
      "total_data": 0,
      "total_pages": 0
    }
  }
}
```

Struktur data pengaduan mengikuti hasil query dashboard.

Field yang tersedia dapat mencakup:

| Field          | Keterangan                                       |
| -------------- | ------------------------------------------------ |
| id_pengaduan   | ID pengaduan                                     |
| id_user        | ID pengguna pembuat                              |
| judul          | Judul pengaduan                                  |
| lokasi         | Lokasi kerusakan                                 |
| status         | Status pengaduan                                 |
| foto           | URL foto (data lama: path relatif `uploads/...`) |
| created_at     | Waktu pembuatan                                  |
| nama_fasilitas | Nama fasilitas                                   |
| upvote_count   | Jumlah upvote                                    |
| downvote_count | Jumlah downvote                                  |
| comment_count  | Jumlah komentar                                  |

Nilai count berasal dari query database.

Nilai `upvote_count` dan `downvote_count` mencerminkan vote yang dikelola oleh endpoint Vote (Bab 11). Hubungan lengkap dengan Detail Pengaduan dijelaskan pada subbab 11.14.

## 6.5 Response Error

| HTTP | Message                        |
| ---- | ------------------------------ |
| 405  | Method tidak diizinkan         |
| 401  | Silakan login terlebih dahulu  |
| 500  | Gagal memulai session          |
| 404  | Pengguna tidak ditemukan       |
| 500  | Gagal mengambil data pengguna  |
| 400  | Status pengaduan tidak valid   |
| 500  | Gagal mengambil data pengaduan |

## 6.6 Contoh Error Status Tidak Valid

```json
{
  "status": "error",
  "message": "Status pengaduan tidak valid"
}
```

---

# 7. API Detail Pengaduan

## 7.1 Informasi Endpoint

| Atribut        | Nilai                   |
| -------------- | ----------------------- |
| Method         | GET                     |
| Endpoint       | `/detail_pengaduan.php` |
| Authentication | Wajib                   |

Endpoint ini digunakan untuk mengambil detail pengaduan yang dipilih pengguna dari Dashboard. Data diambil berdasarkan `id_pengaduan` yang dikirim melalui query parameter. Pengguna yang sudah login dapat meminta detail pengaduan sesuai aturan akses backend.

## 7.2 Query Parameters

| Parameter      | Tipe    | Wajib | Keterangan                          |
| -------------- | ------- | ----- | ----------------------------------- |
| `id_pengaduan` | integer | Ya    | ID pengaduan yang ingin ditampilkan |

ID harus berupa integer positif.

## 7.3 Contoh Request

```http
GET /detail_pengaduan.php?id_pengaduan=8
Cookie: PHPSESSID=<session_id>
```

Contoh tersebut meminta detail pengaduan dengan ID `8`. Backend menggunakan parameter tersebut untuk mengambil data yang sesuai dari database.

## 7.4 Response Berhasil

HTTP Status: `200 OK`

```json
{
  "status": "success",
  "message": "Detail pengaduan berhasil diambil",
  "data": {
    "pengaduan": {
      "id_pengaduan": 8,
      "judul": "Komputer Lab A Tidak Menyala",
      "nama_fasilitas": "Komputer Lab A",
      "lokasi": "Lab Komputer A",
      "deskripsi": "Komputer tidak dapat dinyalakan ketika digunakan.",
      "foto": "https://res.cloudinary.com/<cloud_name>/image/upload/<path>/contoh.webp",
      "status": "diajukan",
      "created_at": "2026-11-02 11:55:57"
    },
    "penanganan": [],
    "vote": {
      "upvote": 0,
      "downvote": 0,
      "pilihan_user": null
    },
    "komentar": []
  }
}
```

Nilai ID, isi data, URL foto, dan waktu pada contoh merupakan ilustrasi. Pengaduan baru menyimpan `foto` sebagai URL https Cloudinary, sedangkan pengaduan lama dapat berisi path relatif seperti `uploads/pengaduan/<nama_file>.png`. Client harus menangani kedua bentuk tersebut. Nilai aktual berasal dari database. Field `id_user` tidak disertakan pada objek `pengaduan`.

Objek `vote` berisi jumlah upvote dan downvote yang dikelola oleh endpoint Vote (Bab 11), serta `pilihan_user`, yaitu vote aktif milik pengguna yang sedang login pada pengaduan tersebut. Hubungan lengkap dijelaskan pada subbab 11.14.

| Field vote     | Tipe             | Keterangan                                                                                            |
| -------------- | ---------------- | ----------------------------------------------------------------------------------------------------- |
| `upvote`       | integer          | Jumlah upvote seluruh pengguna                                                                        |
| `downvote`     | integer          | Jumlah downvote seluruh pengguna                                                                      |
| `pilihan_user` | string atau null | `upvote` atau `downvote` jika pengguna yang login memiliki vote aktif, `null` jika belum memberi vote |

`pilihan_user` ditentukan dari `id_user` pada session. Client tidak mengirim `id_user`. Frontend memakai nilai ini untuk menandai tombol yang aktif saat halaman detail dimuat, sehingga pengguna mengetahui jenis vote yang sudah diberikan sebelum menekan tombol vote.

### Struktur data detail

| Bagian       | Field utama                                                                                      | Keterangan                                                                |
| ------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `pengaduan`  | `id_pengaduan`, `judul`, `nama_fasilitas`, `lokasi`, `deskripsi`, `foto`, `status`, `created_at` | Data utama pengaduan dan nama fasilitas                                   |
| `penanganan` | `id_penanganan`, `status`, `foto`, `keterangan`, `created_at`                                    | Riwayat penanganan admin, diurutkan terbaru lebih dahulu                  |
| `vote`       | `upvote`, `downvote`, `pilihan_user`                                                             | Jumlah vote dan pilihan vote pengguna yang login (`null` jika belum vote) |
| `komentar`   | `id_komentar`, `nama`, `isi_komentar`, `created_at`                                              | Komentar beserta nama pengguna, diurutkan dari yang paling awal           |

## 7.5 Response Error

| HTTP | Message                          | Kondisi                                |
| ---- | -------------------------------- | -------------------------------------- |
| 405  | Method tidak diizinkan           | Method selain GET                      |
| 401  | Silakan login terlebih dahulu    | Session tidak ada atau tidak valid     |
| 400  | ID pengaduan tidak valid         | ID tidak berupa integer positif        |
| 404  | Pengaduan tidak ditemukan        | Tidak ada pengaduan dengan ID tersebut |
| 500  | Gagal memulai session            | Session gagal dimulai                  |
| 500  | Gagal mengambil detail pengaduan | Query detail atau data terkait gagal   |

Contoh response error:

```json
{
  "status": "error",
  "message": "Pengaduan tidak ditemukan"
}
```

Response error tidak menyertakan properti `data`, sesuai standar response API.

---

# 8. API Daftar Fasilitas

## 8.1 Informasi Endpoint

| Atribut        | Nilai            |
| -------------- | ---------------- |
| Method         | GET              |
| Endpoint       | `/pengaduan.php` |
| Authentication | Wajib            |

Endpoint digunakan untuk mengambil daftar fasilitas yang dapat dipilih ketika membuat pengaduan.

## 8.2 Request

```http
GET /pengaduan.php
Cookie: PHPSESSID=<session_id>
```

## 8.3 Response Berhasil

Response sukses menggunakan format helper `successResponse()`.

```json
{
  "status": "success",
  "message": "Daftar fasilitas berhasil diambil",
  "data": {
    "fasilitas": [
      {
        "id_fasilitas": 1,
        "nama_fasilitas": "Komputer Lab A"
      }
    ]
  }
}
```

Data berisi objek `fasilitas`, yaitu array daftar fasilitas dari database. Setiap item memiliki `id_fasilitas` dan `nama_fasilitas`. Nilai pada contoh merupakan ilustrasi.

## 8.4 Response Error

| HTTP | Message                          |
| ---- | -------------------------------- |
| 405  | Method tidak diizinkan           |
| 401  | Silakan login terlebih dahulu    |
| 500  | Gagal memulai session            |
| 500  | Gagal mengambil daftar fasilitas |

---

# 9. API Membuat Pengaduan

## 9.1 Informasi Endpoint

| Atribut        | Nilai               |
| -------------- | ------------------- |
| Method         | POST                |
| Endpoint       | `/pengaduan.php`    |
| Authentication | Wajib               |
| Content-Type   | multipart/form-data |

Endpoint digunakan untuk membuat pengaduan fasilitas kampus.

Pengguna wajib login sebelum mengirimkan pengaduan. Backend memvalidasi data, memeriksa fasilitas, memproses foto, dan menyimpan pengaduan ke database.

## 9.2 Request Headers

```http
Cookie: PHPSESSID=<session_id>
Content-Type: multipart/form-data
```

Client harus menyertakan cookie session yang diperoleh setelah login.

Endpoint ini tidak menggunakan header `Idempotency-Key`.

Backend menggunakan mekanisme concurrent request lock berbasis `id_user` untuk mencegah beberapa proses pengaduan dari pengguna yang sama berjalan secara bersamaan.

## 9.3 Request Body

Format request:

```text
multipart/form-data
```

| Field        | Tipe    | Wajib | Keterangan                 |
| ------------ | ------- | ----- | -------------------------- |
| id_fasilitas | integer | Ya    | ID fasilitas yang diadukan |
| judul        | string  | Ya    | Judul pengaduan            |
| lokasi       | string  | Ya    | Lokasi kerusakan           |
| deskripsi    | string  | Ya    | Deskripsi pengaduan        |
| foto         | file    | Ya    | Foto bukti pengaduan       |

Field kompatibilitas lama:

- `kategori` dapat digunakan sebagai fallback ID atau nama fasilitas.
- `id_fasilitas_legacy` dapat digunakan sebagai fallback ID fasilitas.
- Integrasi baru sebaiknya menggunakan `id_fasilitas`.

## 9.4 Contoh Form Data

```text
id_fasilitas: 1
judul: Komputer Lab A Tidak Menyala
lokasi: Lab Komputer A
deskripsi: Komputer tidak dapat dinyalakan ketika digunakan.
foto: komputer.jpg
```

## 9.5 Validasi

### Validasi pengguna

- Pengguna wajib login.
- Session harus valid.
- ID pengguna harus berupa integer positif.

### Validasi fasilitas

- ID fasilitas harus valid.
- Fasilitas harus tersedia di database.

### Validasi judul

- Judul wajib diisi.
- Judul harus berupa teks.
- Judul maksimal 150 karakter.

### Validasi lokasi

- Lokasi wajib diisi.
- Lokasi harus berupa teks.
- Lokasi maksimal 255 karakter.

### Validasi deskripsi

- Deskripsi wajib diisi.
- Deskripsi harus berupa teks.
- Deskripsi maksimal 5000 karakter.

### Validasi foto

- Foto wajib diunggah.
- Ukuran foto maksimal 10 MB.
- Batas upload PHP (`upload_max_filesize` dan `post_max_size`) harus sama atau lebih besar dari batas aplikasi. Konfigurasi Docker proyek memakai 10M dan 12M.
- Format yang diterima JPEG, JPG, PNG, dan WebP.
- File harus merupakan gambar valid.
- MIME file diperiksa.
- Konten gambar diperiksa.
- Dimensi maksimum 6000 x 6000 piksel. Batas ini berlaku terpisah pada lebar dan tinggi.
- Maksimum 20 megapiksel (lebar x tinggi).
- Orientasi foto (portrait atau landscape) tidak dibatasi. Foto portrait diterima selama ukuran file, format, dan dimensinya memenuhi batas di atas. Contoh: 1200 x 1600 diterima; 1 x 6001 ditolak (tinggi melebihi 6000); 4001 x 5001 ditolak (20,009 megapiksel).
- Tidak ada batas dimensi minimum.
- Gambar diproses ulang sebelum disimpan.
- Foto disimpan di Cloudinary dan `foto` pada response berisi URL https.
- Server lokal yang dijalankan dengan `php -S` memakai konfigurasi PHP bawaan (pada Ubuntu: `post_max_size` 8M dan `upload_max_filesize` 5M), bukan konfigurasi Docker. Akibatnya foto di atas 5 MB ditolak dengan HTTP 413, dan request di atas 8 MB menghasilkan HTTP 400 `Data kosong. Gunakan multipart/form-data dan sertakan foto.` sehingga skenario 15.7 nomor 7 tidak menghasilkan pesan `maksimal 10 MB`. Atur `upload_max_filesize=10M` dan `post_max_size=12M` pada server lokal, misalnya melalui `/etc/php/<versi>/cli/conf.d/99-uploads.ini` atau opsi `php -d upload_max_filesize=10M -d post_max_size=12M -S localhost:8000`.

## 9.6 Response Berhasil

HTTP Status: `201 Created`

```json
{
  "status": "success",
  "message": "Pengaduan berhasil dibuat",
  "data": {
    "id_pengaduan": 24,
    "id_user": 28,
    "id_fasilitas": 1,
    "judul": "Komputer Lab A Tidak Menyala",
    "lokasi": "Lab Komputer A",
    "deskripsi": "Komputer tidak dapat dinyalakan ketika digunakan.",
    "foto": "https://res.cloudinary.com/<cloud_name>/image/upload/<path>/contoh.jpg",
    "status": "diajukan",
    "created_at": "2026-11-02 11:55:57"
  }
}
```

Nilai ID, URL foto, dan waktu di atas merupakan contoh. Nilai aktual berasal dari database.

Foto disimpan di Cloudinary. Field `foto` berisi URL https dari Cloudinary, bukan path lokal.

## 9.7 Response Error

| HTTP | Message                                                                    |
| ---- | -------------------------------------------------------------------------- |
| 405  | Method tidak diizinkan                                                     |
| 401  | Silakan login terlebih dahulu                                              |
| 400  | Data kosong. Gunakan multipart/form-data dan sertakan foto.                |
| 400  | ID fasilitas tidak valid                                                   |
| 500  | Gagal memeriksa data fasilitas                                             |
| 404  | Fasilitas tidak ditemukan                                                  |
| 400  | Judul/Lokasi/Deskripsi harus berupa teks                                   |
| 400  | Judul pengaduan wajib diisi                                                |
| 400  | Judul pengaduan maksimal 150 karakter                                      |
| 400  | Lokasi wajib diisi                                                         |
| 400  | Lokasi maksimal 255 karakter                                               |
| 400  | Deskripsi pengaduan wajib diisi                                            |
| 400  | Deskripsi maksimal 5000 karakter                                           |
| 400  | Foto bukti pengaduan wajib diunggah                                        |
| 400  | Data unggahan foto tidak valid                                             |
| 413  | Ukuran foto maksimal 10 MB                                                 |
| 400  | Foto gagal diunggah. Silakan coba lagi.                                    |
| 400  | Ukuran foto harus lebih dari 0 dan maksimal 10 MB                          |
| 400  | File foto yang diunggah tidak valid                                        |
| 500  | Server gagal memeriksa tipe foto                                           |
| 400  | Format foto harus JPEG, PNG, atau WebP                                     |
| 400  | File yang diunggah bukan gambar yang valid                                 |
| 400  | Isi file tidak sesuai dengan format foto yang diizinkan                    |
| 400  | Dimensi foto terlalu besar. Maksimal 6000 x 6000 piksel dan 20 megapiksel. |
| 400  | Gambar gagal diproses oleh server                                          |
| 500  | Gagal menyiapkan file sementara                                            |
| 500  | Gambar gagal disimpan ulang                                                |
| 500  | Foto gagal disimpan ke server penyimpanan                                  |
| 500  | Gagal memeriksa proses pengaduan. Silakan coba lagi.                       |
| 409  | Pengaduan Anda sedang diproses. Tunggu hingga selesai.                     |
| 500  | Gagal membuat pengaduan                                                    |
| 500  | Pengaduan tersimpan, tetapi gagal mengambil data hasil penyimpanan         |

Catatan:

- Kesalahan upload yang melebihi `upload_max_filesize` dibalas HTTP 413 (`Ukuran foto maksimal 10 MB`). Foto yang melebihi 10 MB tetapi lolos batas PHP dibalas HTTP 400 (`Ukuran foto harus lebih dari 0 dan maksimal 10 MB`).
- Jika total request melebihi `post_max_size`, PHP tidak mengisi `$_POST` dan `$_FILES`, sehingga backend membalas HTTP 400 `Data kosong. Gunakan multipart/form-data dan sertakan foto.`
- Pesan terkait direktori penyimpanan lokal pada versi sebelumnya sudah tidak dipakai karena foto disimpan di Cloudinary.

## 9.8 Contoh Response Error: Request Bersamaan

HTTP Status: `409 Conflict`

```json
{
  "status": "error",
  "message": "Pengaduan Anda sedang diproses. Tunggu hingga selesai."
}
```

Response tersebut diberikan ketika pengguna mengirimkan request pengaduan baru saat proses pengaduan sebelumnya dari pengguna yang sama masih berlangsung.

Request yang ditolak tidak membuat data pengaduan baru.

## 9.9 Contoh Response Error: Format Foto

HTTP Status: `400 Bad Request`

```json
{
  "status": "error",
  "message": "Format foto harus JPEG, PNG, atau WebP"
}
```

---

# 10. Mekanisme Pencegahan Request Pengaduan Bersamaan

## 10.1 Tujuan

Mencegah beberapa proses pengaduan dari pengguna yang sama berjalan secara bersamaan.

Mekanisme ini digunakan untuk menangani kondisi seperti:

- Pengguna menekan tombol submit beberapa kali dengan cepat.
- Client mengirimkan beberapa request pengaduan secara bersamaan.
- Request pertama masih diproses ketika request kedua dikirimkan.
- Pengguna mengirimkan request baru sebelum proses sebelumnya selesai.

Mekanisme ini bukan deduplikasi permanen berdasarkan isi pengaduan.

## 10.2 Cara Kerja

Backend menggunakan MySQL advisory lock melalui fungsi `GET_LOCK()` dan `RELEASE_LOCK()`.

Lock dibuat berdasarkan `id_user`.

Alur proses:

1. Backend memvalidasi session pengguna.
2. Backend mengambil `id_user` dari session.
3. Backend melepaskan PHP session lock agar request lain dapat mencapai pengecekan lock database.
4. Backend mencoba mengambil advisory lock berdasarkan `id_user`.
5. Jika lock berhasil diperoleh, request melanjutkan proses validasi, upload foto, dan penyimpanan pengaduan.
6. Jika lock sedang dipegang request lain dari pengguna yang sama, backend mengembalikan HTTP `409 Conflict`.
7. Setelah request selesai, backend melepaskan lock.

## 10.3 Perilaku Lock

| Kondisi                                                       | Perilaku                        |
| ------------------------------------------------------------- | ------------------------------- |
| Tidak ada proses pengaduan aktif dari pengguna                | Request dapat diproses          |
| Request pertama berhasil memperoleh lock                      | Proses pengaduan dilanjutkan    |
| Request kedua dari pengguna yang sama masuk ketika lock aktif | Request ditolak dengan HTTP 409 |
| Request baru dikirim setelah proses sebelumnya selesai        | Request dapat diproses kembali  |
| Request dari pengguna berbeda                                 | Dapat diproses secara bersamaan |
| Terjadi kegagalan saat memeriksa lock                         | Backend mengembalikan HTTP 500  |

## 10.4 Batasan Mekanisme

Mekanisme concurrent request lock memiliki batasan berikut:

- Lock hanya berlaku selama proses request berlangsung.
- Lock dibuat berdasarkan ID pengguna, bukan berdasarkan isi pengaduan.
- Request baru setelah proses sebelumnya selesai tetap dianggap sebagai pengaduan baru.
- Pengguna tetap dapat membuat pengaduan dengan judul, lokasi, deskripsi, atau foto yang sama setelah proses sebelumnya selesai.
- Mekanisme ini tidak menjamin pencegahan retry setelah request pertama selesai tetapi response tidak diterima client.
- Mekanisme ini tidak menggunakan `Idempotency-Key`.
- Mekanisme ini tidak menggunakan fingerprint payload untuk mendeteksi kesamaan isi pengaduan.

Dengan demikian, fitur ini berfokus pada pencegahan proses pengaduan yang berjalan secara bersamaan, bukan deduplikasi permanen.

---

# 11. API Vote

## 11.1 Informasi Endpoint

| Atribut        | Nilai                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------- |
| Method         | POST                                                                                      |
| Endpoint       | `/vote.php`                                                                               |
| Authentication | Wajib (PHP Session)                                                                       |
| Content-Type   | `application/x-www-form-urlencoded` atau `multipart/form-data` (bukan `application/json`) |

Endpoint digunakan untuk memberikan upvote atau downvote pada pengaduan. Satu endpoint menangani tiga aksi, yaitu menambahkan, mengubah, dan membatalkan vote, berdasarkan mekanisme toggle pada subbab 11.6.

Urutan pemeriksaan pada backend: method, autentikasi session, validasi `id_pengaduan`, validasi `tipe_vote`, lalu proses vote.

## 11.2 Authentication

Endpoint wajib menggunakan session PHP yang diperoleh setelah login (lihat subbab 2.4 dan Bab 4).

Identitas pengguna diperoleh dari session. Client tidak boleh menentukan `id_user` melalui request, dan field `id_user` yang dikirim client tidak dibaca oleh backend.

## 11.3 Request Headers

```http
Cookie: PHPSESSID=<session_id>
Content-Type: application/x-www-form-urlencoded
```

## 11.4 Request Body

Request dikirim sebagai form data. Backend membaca nilai dari `$_POST`.

Contoh request upvote:

```http
POST /vote.php
Cookie: PHPSESSID=<session_id>
Content-Type: application/x-www-form-urlencoded

id_pengaduan=33&tipe_vote=upvote
```

Contoh request downvote:

```http
POST /vote.php
Cookie: PHPSESSID=<session_id>
Content-Type: application/x-www-form-urlencoded

id_pengaduan=33&tipe_vote=downvote
```

Nilai `33` pada contoh merupakan ilustrasi. Gunakan ID pengaduan yang ada di database.

**Penting:** body `application/json` tidak dibaca oleh endpoint ini. Jika client mengirim `{"id_pengaduan": 33, "tipe_vote": "upvote"}` sebagai JSON, `$_POST` kosong sehingga backend membalas HTTP 400 dengan pesan `ID pengaduan tidak valid`. Ini berbeda dari endpoint Registrasi dan Login yang memakai JSON. Lihat subbab 11.15.

## 11.5 Parameter Request

| Field        | Tipe    | Wajib | Keterangan                                                                                       |
| ------------ | ------- | ----- | ------------------------------------------------------------------------------------------------ |
| id_pengaduan | integer | Ya    | ID pengaduan yang akan diberikan suara. Harus integer, minimal 1                                 |
| tipe_vote    | string  | Ya    | Hanya `upvote` atau `downvote` (huruf kecil). Spasi di awal atau akhir dihapus sebelum diperiksa |

Field `id_user` tidak diterima dari client. Tipe vote `remove` tidak tersedia. Pembatalan vote dilakukan dengan mekanisme toggle.

## 11.6 Aturan Bisnis Toggle Vote

| Kondisi                                                     | Aksi                            | Nilai aksi | Message                   |
| ----------------------------------------------------------- | ------------------------------- | ---------- | ------------------------- |
| Pengguna belum memiliki vote pada pengaduan tersebut        | Menambahkan vote                | `added`    | Vote berhasil disimpan    |
| Pengguna mengirim jenis vote yang sama dengan vote aktifnya | Membatalkan vote sebelumnya     | `removed`  | Vote berhasil dibatalkan  |
| Pengguna mengirim jenis vote berbeda dari vote aktifnya     | Mengubah vote sebelumnya        | `changed`  | Vote berhasil diubah      |
| Pengaduan tidak ditemukan                                   | Request ditolak dengan HTTP 404 | -          | Pengaduan tidak ditemukan |

Ketentuan:

- Satu pengguna hanya memiliki satu vote aktif pada satu pengaduan.
- Vote yang sama jika dikirim kembali akan membatalkan vote sebelumnya.
- Vote berbeda akan menggantikan vote sebelumnya.
- Sistem hanya menerima `upvote` dan `downvote`.
- Tidak ada tipe vote `remove`.
- Jumlah upvote dan downvote harus sesuai dengan data database.

## 11.7 Response Berhasil

HTTP Status: `200 OK` untuk ketiga aksi. Response mengikuti format standar pada subbab 2.1.

Struktur `data`:

| Field             | Tipe             | Keterangan                                                                          |
| ----------------- | ---------------- | ----------------------------------------------------------------------------------- |
| id_pengaduan      | integer          | ID pengaduan yang divote                                                            |
| aksi              | string           | `added`, `changed`, atau `removed`                                                  |
| vote              | object           | Jumlah vote terbaru dan pilihan pengguna                                            |
| vote.upvote       | integer          | Jumlah upvote pengaduan                                                             |
| vote.downvote     | integer          | Jumlah downvote pengaduan                                                           |
| vote.pilihan_user | string atau null | `upvote` atau `downvote` jika pengguna masih memiliki vote aktif, `null` jika tidak |

### Vote ditambahkan (`added`)

```json
{
  "status": "success",
  "message": "Vote berhasil disimpan",
  "data": {
    "id_pengaduan": 33,
    "aksi": "added",
    "vote": {
      "upvote": 1,
      "downvote": 0,
      "pilihan_user": "upvote"
    }
  }
}
```

### Vote diubah (`changed`)

Contoh: pengguna mengubah upvote menjadi downvote.

```json
{
  "status": "success",
  "message": "Vote berhasil diubah",
  "data": {
    "id_pengaduan": 33,
    "aksi": "changed",
    "vote": {
      "upvote": 0,
      "downvote": 1,
      "pilihan_user": "downvote"
    }
  }
}
```

### Vote dibatalkan (`removed`)

```json
{
  "status": "success",
  "message": "Vote berhasil dibatalkan",
  "data": {
    "id_pengaduan": 33,
    "aksi": "removed",
    "vote": {
      "upvote": 0,
      "downvote": 0,
      "pilihan_user": null
    }
  }
}
```

Nilai pada contoh merupakan ilustrasi. Jumlah vote berasal dari database dan mencakup vote seluruh pengguna pada pengaduan tersebut. Jumlah diambil setelah transaksi vote selesai, melalui query terpisah.

## 11.8 Response Error

Response error mengikuti format standar pada subbab 2.2 dan tidak menyertakan properti `data`.

```json
{
  "status": "error",
  "message": "Jenis vote tidak valid"
}
```

| HTTP | Message                           | Kondisi                                                                    |
| ---- | --------------------------------- | -------------------------------------------------------------------------- |
| 405  | Method tidak diizinkan            | Method selain POST. Header `Allow: POST` dikirim                           |
| 500  | Gagal memulai session             | Session gagal dimulai                                                      |
| 401  | Silakan login terlebih dahulu     | Session tidak ada atau tidak valid                                         |
| 400  | ID pengaduan tidak valid          | `id_pengaduan` kosong, tidak dikirim, bukan integer, atau kurang dari 1    |
| 400  | Jenis vote tidak valid            | `tipe_vote` tidak dikirim, bukan teks, atau selain `upvote` dan `downvote` |
| 404  | Pengaduan tidak ditemukan         | Tidak ada pengaduan dengan ID tersebut                                     |
| 500  | Gagal memproses vote              | Transaksi vote gagal dan di-rollback                                       |
| 500  | Gagal mengambil data vote terbaru | Vote sudah tersimpan, tetapi pengambilan jumlah vote terbaru gagal         |

Pada error `Gagal mengambil data vote terbaru`, perubahan vote sudah tersimpan di database. Client sebaiknya memuat ulang data vote melalui Detail Pengaduan (Bab 7) atau Dashboard (Bab 6).

## 11.9 HTTP Status Code

| HTTP | Keterangan pada endpoint Vote                               |
| ---- | ----------------------------------------------------------- |
| 200  | Vote berhasil diproses (`added`, `changed`, atau `removed`) |
| 400  | `id_pengaduan` atau `tipe_vote` tidak valid                 |
| 401  | Pengguna belum login                                        |
| 404  | Pengaduan tidak ditemukan                                   |
| 405  | Method tidak diizinkan                                      |
| 500  | Kesalahan internal server                                   |

Daftar status code umum ada pada subbab 2.3.

## 11.10 Validasi Request

- Method harus POST. Pemeriksaan method dilakukan sebelum autentikasi, sehingga method selain POST menghasilkan HTTP 405 meskipun pengguna belum login.
- Pengguna wajib login.
- `id_pengaduan` harus integer minimal 1. Nilai kosong, teks, nol, negatif, atau desimal menghasilkan HTTP 400.
- `tipe_vote` harus teks dan bernilai `upvote` atau `downvote` setelah spasi awal dan akhir dihapus. Perbandingan bersifat case-sensitive. Nilai lain, termasuk `remove`, menghasilkan HTTP 400.
- Pengaduan dengan `id_pengaduan` tersebut harus ada. Jika tidak ada, HTTP 404.
- Data dibaca dari form data. Body JSON tidak dibaca (lihat subbab 11.4).

## 11.11 Keamanan Session

- Endpoint hanya dapat diakses oleh pengguna yang memiliki session valid.
- Identitas pengguna diambil dari `$_SESSION['id_user']`, bukan dari request.
- Client tidak boleh mengirim atau menentukan `id_user`.
- Konfigurasi cookie session mengikuti subbab 2.4.
- Setelah logout, session lama tidak dapat dipakai untuk vote (lihat skenario 12 dan 13 pada subbab 15.8).

## 11.12 Konsistensi Database

- Satu pengguna hanya memiliki satu vote aktif pada satu pengaduan. Backend memeriksa vote lama pengguna di dalam transaksi sebelum menambah, mengubah, atau menghapus.
- Skema database memiliki constraint unik `uq_vote_user_pengaduan` pada (`id_pengaduan`, `id_user`) sebagai pengaman tambahan di level database. Kolom `tipe_vote` bertipe `enum('upvote','downvote')`. Vote ikut terhapus jika pengaduan dihapus (`ON DELETE CASCADE`).
- Perubahan vote (`changed`) memperbarui jenis vote yang sudah ada, sehingga tidak terbentuk dua vote aktif dari pengguna yang sama.
- Pembatalan vote (`removed`) menghapus vote aktif pengguna pada pengaduan tersebut.
- Jumlah upvote dan downvote pada Dashboard dan Detail Pengaduan harus sesuai dengan data vote di database.
- Proses vote menggunakan transaksi database. Jika terjadi kegagalan, transaksi di-rollback dan backend membalas HTTP 500.

## 11.13 Penanganan Request Bersamaan

Proses vote berjalan dalam satu transaksi database dengan dua penguncian baris (`SELECT ... FOR UPDATE`): baris pengaduan, lalu baris vote milik pengguna pada pengaduan tersebut. Request vote pada pengaduan yang sama berjalan bergantian, termasuk ketika pengguna mengklik bersamaan.

- Tidak ada status khusus seperti HTTP 409 untuk request vote yang bersamaan. Setiap request diproses secara berurutan dan hasilnya mengikuti aturan toggle pada subbab 11.6.
- Mekanisme ini berbeda dari advisory lock berbasis `id_user` pada Bab 10, yang berlaku untuk pembuatan pengaduan.
- Jumlah vote pada response diambil setelah transaksi selesai melalui query terpisah. Pada request yang sangat berdekatan, nilai tersebut mencerminkan kondisi database saat query dijalankan.

## 11.14 Hubungan dengan Dashboard dan Detail Pengaduan

| Endpoint                    | Field vote                                                         | Keterangan                                                                             |
| --------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `POST /vote.php`            | `data.vote.upvote`, `data.vote.downvote`, `data.vote.pilihan_user` | Mengubah data vote (menulis) dan mengembalikan jumlah terbaru beserta pilihan pengguna |
| `GET /dashboard.php`        | `upvote_count`, `downvote_count`, `comment_count`                  | Jumlah vote per pengaduan pada daftar dashboard (membaca)                              |
| `GET /detail_pengaduan.php` | `vote.upvote`, `vote.downvote`, `vote.pilihan_user`                | Jumlah vote dan pilihan vote pengguna pada detail satu pengaduan (membaca)             |

- Vote ditulis hanya melalui `/vote.php`. Dashboard dan Detail Pengaduan bersifat read-only terhadap data vote.
- Perbedaan nama field (`upvote_count` dan `downvote_count` pada Dashboard, `upvote` dan `downvote` pada Detail Pengaduan dan response Vote) dipertahankan sesuai implementasi dan tidak diseragamkan.
- Setelah vote berhasil, nilai pada Dashboard dan Detail Pengaduan harus mengikuti data database terbaru.
- `pilihan_user` tersedia pada response Vote (Bab 11) dan Detail Pengaduan (subbab 7.4). Dashboard (subbab 6.4) tidak memuat `pilihan_user`; Dashboard hanya menampilkan jumlah vote.
- Alur frontend yang disarankan: saat halaman detail dimuat, tandai tombol sesuai `data.vote.pilihan_user` dari `GET /detail_pengaduan.php`. Setelah pengguna menekan tombol, perbarui angka dan tombol aktif dari `data.vote` pada response `POST /vote.php`.

## 11.15 Catatan Keputusan dan Konfirmasi

| No  | Item                         | Keterangan                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Format request Vote          | Kontrak mengikuti implementasi backend dan Postman: `application/x-www-form-urlencoded` (atau `multipart/form-data`), bukan JSON. Frontend belum terhubung ke endpoint ini (tombol vote pada `detail-pengaduan.js` masih dinonaktifkan). Saat integrasi, client harus mengirim `URLSearchParams` atau `FormData`, bukan `JSON.stringify`. Jika tim memilih mengubah backend agar membaca JSON, perbarui subbab 11.1, 11.3, 11.4, 11.10, 15.8, dan seluruh request Vote di Postman                                                                                                            |
| 2   | Constraint unik tabel `vote` | **Terkonfirmasi.** Skema `database/pengaduan_fasilitas_fakultasDB.sql` memuat `UNIQUE KEY uq_vote_user_pengaduan (id_pengaduan, id_user)`, foreign key ke `pengaduan` (`ON DELETE CASCADE`) dan ke `users` (`ON DELETE RESTRICT`)                                                                                                                                                                                                                                                                                                                                                            |
| 3   | Hasil pengujian aktual       | Seluruh 15 request pada folder **07 Vote** memiliki contoh response tersimpan (6 November 2026 untuk request Vote). Pesan, status, dan struktur `data` pada contoh tersebut cocok dengan subbab 11.7 dan 11.8. Contoh **V07** (Detail Pengaduan) menunjukkan `vote` = 1 upvote, 2 downvote, `pilihan_user` = `downvote`, sama dengan response V06. Test `DTL-01` (10 dari 10) dan `DTL-05` lulus setelah penambahan `pilihan_user` Perbandingan jumlah vote terhadap isi tabel `vote`, Detail Pengaduan, dan Dashboard belum terdokumentasi sebagai bukti tersendiri                         |
| 4   | Prasyarat data uji Postman   | Variabel environment `fixture_vote_id` bernilai kosong pada file environment dan **tidak diisi oleh script**. Isi manual dengan ID pengaduan uji yang ada di database sebelum menjalankan folder 07 Vote. Pengaduan uji sebaiknya sudah memiliki vote dari pengguna lain (contoh response Postman memakai kondisi awal 1 upvote dan 1 downvote). Variabel `fixture_upvote` dan `fixture_downvote` (dipakai `DTL-03`) harus sama dengan jumlah vote di database. Jika vote akun uji dari folder 07 Vote belum dibersihkan, jumlah downvote bertambah satu dan `DTL-03` gagal dengan selisih 1 |
| 5   | Penamaan request Postman     | Nama request pada folder 07 Vote tidak seragam (`01.`, `V01.` sampai `V06.`, `07.` sampai `11.`, `LOG-01`, `LGN-01`) dan nomor pada nama tidak sama dengan nomor langkah. Kontrak memakai nama persis seperti di Postman (subbab 15.8). Penyeragaman nama bersifat opsional; jika dilakukan, perbarui subbab 15.8                                                                                                                                                                                                                                                                            |
| 6   | `pilihan_user` pada Detail   | **Diputuskan (opsi A).** `GET /detail_pengaduan.php` mengembalikan `vote.pilihan_user`. Alasan: pengguna yang membuka detail pengaduan perlu tahu apakah ia sudah vote dan jenis vote-nya sebelum menekan tombol. Test Postman `DTL-01`, `DTL-05`, dan `V07` disesuaikan                                                                                                                                                                                                                                                                                                                     |

---

# 12. API Komentar

Endpoint komentar digunakan untuk mengambil daftar komentar suatu pengaduan dan menyimpan komentar baru dari mahasiswa atau pegawai yang sudah login. Komentar ditampilkan pada halaman Detail Pengaduan, dan jumlahnya ditampilkan pada Dashboard.

## 12.1 Informasi Endpoint

| Item            | Nilai                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------- |
| Endpoint        | `/komentar.php`                                                                             |
| Method          | `GET` (daftar komentar) dan `POST` (simpan komentar)                                        |
| Authentication  | Wajib login (PHP Session)                                                                   |
| Format request  | `GET`: query string. `POST`: `application/x-www-form-urlencoded` atau `multipart/form-data` |
| Format response | JSON                                                                                        |

Method selain `GET` dan `POST` ditolak dengan HTTP 405 dan header `Allow: GET, POST`. Endpoint untuk mengubah atau menghapus komentar tidak tersedia karena belum termasuk cakupan fitur.

## 12.2 Authentication

- Kedua method memerlukan session PHP yang valid. Cookie `PHPSESSID` dikirim otomatis oleh browser (`credentials: "same-origin"`).
- Tanpa session, backend membalas HTTP 401 `Silakan login terlebih dahulu`. Pada `POST`, komentar tidak disimpan.
- Identitas penulis diambil dari session. Client tidak mengirim `id_user`, dan field `id_user` yang tetap dikirim client diabaikan.

## 12.3 Request

### Mengambil daftar komentar

```http
GET /komentar.php?id_pengaduan=33
Cookie: PHPSESSID=<session_id>
```

### Menyimpan komentar

```http
POST /komentar.php
Content-Type: application/x-www-form-urlencoded
Cookie: PHPSESSID=<session_id>
```

Body (x-www-form-urlencoded):

```text
id_pengaduan=33
isi_komentar=Ruangan ini memang sering panas saat siang hari
```

Pada JavaScript, kirim body dengan `URLSearchParams` atau `FormData`, bukan `JSON.stringify`:

```javascript
const body = new URLSearchParams({
  id_pengaduan: String(idPengaduan),
  isi_komentar: teksKomentar,
});

const response = await fetch("/backend/api/komentar.php", {
  method: "POST",
  credentials: "same-origin",
  body,
});
```

## 12.4 Parameter Request

| Parameter      | Method | Lokasi       | Tipe    | Wajib | Aturan                                                                       |
| -------------- | ------ | ------------ | ------- | ----- | ---------------------------------------------------------------------------- |
| `id_pengaduan` | GET    | query string | integer | Ya    | Bilangan bulat minimal 1                                                     |
| `id_pengaduan` | POST   | body         | integer | Ya    | Bilangan bulat minimal 1                                                     |
| `isi_komentar` | POST   | body         | string  | Ya    | Tidak kosong setelah spasi di awal dan akhir dibuang, maksimal 1000 karakter |

Aturan isi komentar:

- Spasi, tab, dan baris kosong di awal dan akhir dibuang sebelum divalidasi dan disimpan.
- Komentar yang kosong atau hanya berisi spasi ditolak.
- Panjang dihitung dalam karakter (bukan byte), sehingga emoji dan huruf non-Latin dihitung sebagai karakter.
- Isi komentar disimpan apa adanya (tanpa menghapus tag HTML). Frontend wajib menampilkannya sebagai teks, misalnya dengan `textContent`, bukan `innerHTML`.

## 12.5 Aturan Bisnis

- Satu pengguna boleh mengirim lebih dari satu komentar pada pengaduan yang sama.
- Komentar tidak dapat diubah atau dihapus melalui API.
- Daftar komentar diurutkan dari yang paling lama ke yang paling baru (`created_at` naik, lalu `id_komentar` naik). Urutan ini sama dengan `data.komentar` pada Detail Pengaduan.
- Daftar komentar tidak dipaginasi; seluruh komentar pengaduan dikembalikan.
- Jumlah komentar selalu dihitung dari tabel `komentar` di database.
- Komentar ikut terhapus jika pengaduannya dihapus (`ON DELETE CASCADE`).

## 12.6 Response Berhasil

### Daftar komentar: HTTP 200

```json
{
  "status": "success",
  "message": "Daftar komentar berhasil diambil",
  "data": {
    "id_pengaduan": 33,
    "total_komentar": 2,
    "komentar": [
      {
        "id_komentar": 10,
        "nama": "Salsa",
        "isi_komentar": "Saat perkuliahan ruangan sangat panas",
        "created_at": "2026-11-08 10:00:00"
      },
      {
        "id_komentar": 11,
        "nama": "Budi",
        "isi_komentar": "Sudah seminggu AC tidak dingin",
        "created_at": "2026-11-08 11:30:00"
      }
    ]
  }
}
```

Jika pengaduan ada tetapi belum memiliki komentar, backend tetap membalas HTTP 200 dengan hasil kosong:

```json
{
  "status": "success",
  "message": "Daftar komentar berhasil diambil",
  "data": {
    "id_pengaduan": 33,
    "total_komentar": 0,
    "komentar": []
  }
}
```

### Simpan komentar: HTTP 201

```json
{
  "status": "success",
  "message": "Komentar berhasil disimpan",
  "data": {
    "id_pengaduan": 33,
    "komentar": {
      "id_komentar": 12,
      "nama": "Salsa",
      "isi_komentar": "Ruangan ini memang sering panas saat siang hari",
      "created_at": "2026-11-10 14:05:00"
    },
    "total_komentar": 3
  }
}
```

| Field            | Tipe    | Keterangan                                                             |
| ---------------- | ------- | ---------------------------------------------------------------------- |
| `id_pengaduan`   | integer | ID pengaduan yang dikomentari                                          |
| `total_komentar` | integer | Jumlah komentar pengaduan setelah penyimpanan (dihitung dari database) |
| `komentar`       | object  | Komentar yang baru tersimpan                                           |
| `id_komentar`    | integer | ID komentar                                                            |
| `nama`           | string  | Nama penulis, dari akun yang login                                     |
| `isi_komentar`   | string  | Isi komentar setelah spasi di awal dan akhir dibuang                   |
| `created_at`     | string  | Waktu komentar dibuat, format `YYYY-MM-DD HH:MM:SS`                    |

`id_user` penulis tidak dikembalikan. Struktur satu komentar sama dengan item `data.komentar` pada Detail Pengaduan (subbab 7.4), sehingga frontend dapat memakai fungsi tampilan yang sama. Data hanya dikembalikan setelah komentar benar-benar tersimpan.

## 12.7 Response Error

```json
{
  "status": "error",
  "message": "Komentar wajib diisi"
}
```

| HTTP | Pesan                             | Kondisi                                                                                          |
| ---- | --------------------------------- | ------------------------------------------------------------------------------------------------ |
| 400  | `ID pengaduan tidak valid`        | `id_pengaduan` kosong, bukan bilangan bulat, nol, atau negatif (GET dan POST)                    |
| 400  | `Komentar wajib diisi`            | `isi_komentar` tidak dikirim, kosong, atau hanya berisi spasi                                    |
| 400  | `Komentar tidak valid`            | `isi_komentar` bukan teks (misalnya dikirim sebagai array) atau berisi karakter yang tidak valid |
| 400  | `Komentar maksimal 1000 karakter` | Isi komentar lebih dari 1000 karakter                                                            |
| 401  | `Silakan login terlebih dahulu`   | Tidak ada session yang valid                                                                     |
| 404  | `Pengaduan tidak ditemukan`       | Pengaduan dengan ID tersebut tidak ada (GET dan POST)                                            |
| 405  | `Method tidak diizinkan`          | Method selain GET dan POST; header `Allow: GET, POST`                                            |
| 500  | `Gagal memulai session`           | Session gagal dimulai                                                                            |
| 500  | `Gagal mengambil daftar komentar` | Query daftar komentar atau pemeriksaan pengaduan gagal (GET)                                     |
| 500  | `Gagal menyimpan komentar`        | Pemeriksaan pengaduan atau penyimpanan gagal (POST)                                              |
| 500  | `Gagal mengambil data komentar`   | Komentar tersimpan tetapi gagal dibaca kembali (POST)                                            |
| 500  | `Gagal mengambil jumlah komentar` | Komentar tersimpan tetapi gagal menghitung total (POST)                                          |

Semua response error tidak memiliki field `data`. Pada kegagalan 400, 401, 404, dan 405, tidak ada komentar yang tersimpan. Pada dua kegagalan 500 terakhir, komentar sudah tersimpan; frontend sebaiknya memuat ulang daftar komentar.

## 12.8 Urutan Validasi pada POST

1. Method dan session (405, 401).
2. `id_pengaduan` (400).
3. `isi_komentar`: ada, bertipe teks, tidak kosong, maksimal 1000 karakter (400).
4. Pengaduan tersedia (404).
5. Penyimpanan (500 jika gagal).

Jika `id_pengaduan` valid tetapi tidak ada di database dan komentar juga tidak valid, response adalah 400 (validasi input didahulukan dari pemeriksaan database).

## 12.9 Hubungan dengan Dashboard dan Detail Pengaduan

| Endpoint                    | Field                                  | Fungsi                                                         |
| --------------------------- | -------------------------------------- | -------------------------------------------------------------- |
| `GET /dashboard.php`        | `comment_count` (per pengaduan)        | Jumlah komentar setiap pengaduan pada daftar dashboard         |
| `GET /detail_pengaduan.php` | `data.komentar`                        | Daftar komentar pada halaman detail                            |
| `GET /komentar.php`         | `data.komentar`, `data.total_komentar` | Memuat ulang daftar komentar tanpa memuat ulang seluruh detail |
| `POST /komentar.php`        | `data.komentar`, `data.total_komentar` | Menyimpan komentar dan mengembalikan data terbaru              |

Ketiga sumber membaca tabel `komentar` yang sama, sehingga jumlah dan isinya konsisten. Alur frontend yang disarankan: saat halaman detail dimuat, tampilkan `data.komentar` dari Detail Pengaduan. Setelah pengguna mengirim komentar, tambahkan `data.komentar` dari response `POST /komentar.php` ke daftar dan perbarui jumlah dari `data.total_komentar`. Dashboard mengambil jumlah terbaru saat dimuat.

## 12.10 Catatan Keputusan dan Konfirmasi

| No  | Item                        | Keterangan                                                                                                                                                                           |
| --- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Format request POST         | Mengikuti endpoint Vote dan Pengaduan: form data (`$_POST`), bukan JSON. Frontend harus memakai `URLSearchParams` atau `FormData`                                                    |
| 2   | Batas panjang komentar      | 1000 karakter. Kolom `isi_komentar` bertipe `text`, sehingga batas ini ditetapkan di backend. Perlu dikonfirmasi dengan tim dan FE (misalnya agar `maxlength` pada kolom input sama) |
| 3   | Daftar komentar wajib login | `GET /komentar.php` mengikuti `GET /detail_pengaduan.php` yang juga wajib login. Jika komentar akan dibuka untuk publik, ini harus diubah di backend dan kontrak                     |
| 4   | Status code simpan komentar | HTTP 201 (resource baru dibuat), sama seperti pembuatan pengaduan                                                                                                                    |
| 5   | Endpoint daftar komentar    | Detail Pengaduan sudah memuat komentar. Endpoint `GET /komentar.php` disediakan untuk memuat ulang daftar komentar saja, sesuai kebutuhan card                                       |

---

# 13. API Riwayat Pengaduan

## 13.1 Status Endpoint

| Atribut  | Nilai                      |
| -------- | -------------------------- |
| Method   | GET                        |
| Endpoint | `/riwayat.php`             |
| Fungsi   | Riwayat pengaduan pengguna |
| Status   | Belum tersedia di arsip    |

Endpoint ini belum dinyatakan sebagai endpoint aktif.

## 13.2 Kebutuhan Fungsional

Riwayat pengaduan seharusnya menampilkan pengaduan milik pengguna yang sedang login.

Berbeda dengan Dashboard, Riwayat tidak boleh menampilkan pengaduan milik pengguna lain.

Endpoint ini perlu didokumentasikan setelah route dan controller tersedia.

---

# 14. Keamanan API

Ketentuan keamanan:

1. Endpoint privat menggunakan session authentication.
2. Session menggunakan cookie.
3. Cookie session menggunakan HttpOnly.
4. Cookie session menggunakan SameSite=Lax.
5. Session menggunakan strict mode.
6. Password tidak dikembalikan pada response.
7. Validasi dilakukan pada sisi backend.
8. File upload dibatasi berdasarkan ukuran dan format.
9. File gambar diperiksa sebelum disimpan.
10. Error response tidak boleh membocorkan informasi sensitif.
11. Riwayat pengaduan harus dibatasi berdasarkan user session.
12. Query database menggunakan prepared statements.
13. Identitas pengguna pada endpoint Vote diambil dari session dan bukan dari request client.
14. Endpoint Vote hanya menerima `upvote` dan `downvote` sebagai jenis vote.
15. Proses vote menggunakan transaksi database dan penguncian data pengaduan untuk menjaga konsistensi.
16. `vote.pilihan_user` pada Detail Pengaduan dihitung dari `id_user` session dan tidak menampilkan vote pengguna lain.
17. Identitas penulis komentar diambil dari session. Field `id_user` dari request client diabaikan dan `id_user` tidak dikembalikan pada response komentar.
18. Isi komentar disimpan apa adanya dan tidak dibersihkan dari HTML di backend; frontend harus menampilkannya sebagai teks.

---

# 15. Skenario Pengujian API

## 15.1 Registrasi

| No  | Skenario                          | Hasil yang Diharapkan |
| --- | --------------------------------- | --------------------- |
| 1   | Registrasi data valid             | Registrasi berhasil   |
| 2   | Nama kosong                       | Request ditolak       |
| 3   | Email kosong                      | Request ditolak       |
| 4   | Format email tidak valid          | Request ditolak       |
| 5   | Password kurang dari 8 karakter   | Request ditolak       |
| 6   | Password tidak memenuhi ketentuan | Request ditolak       |
| 7   | Konfirmasi password berbeda       | Request ditolak       |
| 8   | Email sudah terdaftar             | HTTP 409              |

## 15.2 Login

| No  | Skenario                 | Hasil yang Diharapkan |
| --- | ------------------------ | --------------------- |
| 1   | Email dan password valid | Login berhasil        |
| 2   | Password salah           | HTTP 401              |
| 3   | Email tidak terdaftar    | HTTP 401              |
| 4   | Email kosong             | Request ditolak       |
| 5   | Password kosong          | Request ditolak       |

## 15.3 Logout

| No  | Skenario                    | Hasil yang Diharapkan |
| --- | --------------------------- | --------------------- |
| 1   | Logout dengan session aktif | Logout berhasil       |
| 2   | Logout tanpa session        | HTTP 401              |
| 3   | Session tidak valid         | HTTP 401              |

## 15.4 Dashboard

| No  | Skenario                       | Hasil yang Diharapkan           |
| --- | ------------------------------ | ------------------------------- |
| 1   | Mengambil dashboard default    | Data berhasil ditampilkan       |
| 2   | Mengambil halaman kedua        | Data halaman kedua ditampilkan  |
| 3   | Mengambil halaman di luar data | Response mengikuti implementasi |
| 4   | Search berdasarkan judul       | Data sesuai pencarian           |
| 5   | Search berdasarkan lokasi      | Data sesuai pencarian           |
| 6   | Filter status valid            | Data sesuai status              |
| 7   | Filter status tidak valid      | HTTP 400                        |
| 8   | Request tanpa login            | HTTP 401                        |

## 15.5 Detail Pengaduan

| No  | Skenario                                    | Hasil yang Diharapkan                                                                            |
| --- | ------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1   | Request dengan ID pengaduan valid dan login | HTTP 200, detail sesuai ID                                                                       |
| 2   | Request tanpa login                         | HTTP 401                                                                                         |
| 3   | ID pengaduan tidak valid                    | HTTP 400                                                                                         |
| 4   | ID pengaduan tidak ditemukan                | HTTP 404                                                                                         |
| 5   | Query detail gagal                          | HTTP 500                                                                                         |
| 6   | Pengaduan yang belum di-vote pengguna       | HTTP 200, `vote.pilihan_user` = `null`                                                           |
| 7   | Pengaduan yang sudah di-vote pengguna       | HTTP 200, `vote.pilihan_user` = `upvote` atau `downvote` sesuai vote aktif (lihat V07 pada 15.8) |
| 8   | Struktur `vote`                             | Berisi tepat `upvote`, `downvote`, `pilihan_user`                                                |

## 15.6 Daftar Fasilitas

| No  | Skenario                     | Hasil yang Diharapkan        |
| --- | ---------------------------- | ---------------------------- |
| 1   | Request dengan session aktif | Daftar fasilitas ditampilkan |
| 2   | Request tanpa login          | HTTP 401                     |

## 15.7 Membuat Pengaduan

| No  | Skenario                                                                                    | Hasil yang Diharapkan                                                                  |
| --- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1   | Data valid dan foto valid                                                                   | HTTP 201, pengaduan berhasil dibuat                                                    |
| 2   | Judul kosong                                                                                | HTTP 400                                                                               |
| 3   | Lokasi kosong                                                                               | HTTP 400                                                                               |
| 4   | Deskripsi kosong                                                                            | HTTP 400                                                                               |
| 5   | Foto tidak dikirim                                                                          | HTTP 400                                                                               |
| 6   | Format foto tidak valid                                                                     | HTTP 400                                                                               |
| 7   | Foto melebihi batas ukuran (10 MB)                                                          | HTTP 413 atau HTTP 400                                                                 |
| 8   | ID fasilitas tidak valid                                                                    | HTTP 400                                                                               |
| 8a  | Foto portrait dalam batas ukuran (contoh 1200 x 1600)                                       | HTTP 201, foto diterima                                                                |
| 8b  | Foto dimensi melebihi batas (lebar atau tinggi di atas 6000, contoh 6001 x 1 atau 1 x 6001) | HTTP 400, `Dimensi foto terlalu besar. Maksimal 6000 x 6000 piksel dan 20 megapiksel.` |
| 8c  | Foto portrait melebihi 20 megapiksel dengan kedua sisi di bawah 6000 (contoh 4001 x 5001)   | HTTP 400, pesan sama dengan 8b                                                         |
| 9   | Request tanpa login                                                                         | HTTP 401                                                                               |
| 10  | Request kedua dari user yang sama ketika request pertama masih diproses                     | HTTP 409                                                                               |
| 11  | Request baru dari user yang sama setelah proses sebelumnya selesai                          | HTTP 201                                                                               |
| 12  | Request bersamaan dari user berbeda                                                         | Dapat diproses secara bersamaan                                                        |
| 13  | Terjadi kegagalan saat memeriksa lock                                                       | HTTP 500                                                                               |
| 14  | Request bersamaan ditolak                                                                   | Tidak ada data pengaduan baru dari request yang ditolak                                |

## 15.8 Vote

Pengujian dilakukan dengan Postman pada collection Sprint 3, folder **07 Vote**, menggunakan satu session (cookie jar) yang sama dari langkah 1 sampai 12. Request ke `/vote.php` memakai body **x-www-form-urlencoded** (bukan raw JSON). Folder dijalankan berurutan (Collection Runner).

### Prasyarat

- Backend dan database berjalan, `base_url` mengarah ke `http://localhost:8000/backend/api`.
- Akun uji tersedia. Variabel `active_email` dan `active_password` diisi otomatis oleh collection dari `login_email` / `login_password` pada environment, atau dari akun hasil request registrasi `REG-01`.
- Variabel environment `fixture_vote_id` **harus diisi manual** dengan ID pengaduan uji yang ada di database (lihat subbab 11.15 nomor 4). Pada dokumen ini ID tersebut disebut `<fixture_vote_id>`.
- Pengaduan uji tidak boleh sudah memiliki vote dari akun uji. Jika ada sisa vote dari pengujian sebelumnya, hasil langkah 2 sampai 8 berbeda (lihat Pembersihan data vote).

### Daftar langkah

Nomor pada nama request Postman (`07.` sampai `11.`) **bukan** nomor langkah. Nomor langkah mengikuti urutan eksekusi di folder.

| No  | Nama request di Postman                          | Method | Endpoint                | Hasil yang diharapkan            |
| --- | ------------------------------------------------ | ------ | ----------------------- | -------------------------------- |
| 1   | `01. Login User Vote`                            | POST   | `/login.php`            | Login berhasil                   |
| 2   | `V01. Upvote pertama`                            | POST   | `/vote.php`             | Vote ditambahkan (`added`)       |
| 3   | `V02. Upvote kedua, menghapus vote`              | POST   | `/vote.php`             | Vote dibatalkan (`removed`)      |
| 4   | `V03. Downvote pertama`                          | POST   | `/vote.php`             | Vote ditambahkan (`added`)       |
| 5   | `V04. Downvote kedua, menghapus vote`            | POST   | `/vote.php`             | Vote dibatalkan (`removed`)      |
| 6   | `V05. Upvote pertama lagi`                       | POST   | `/vote.php`             | Vote ditambahkan (`added`)       |
| 7   | `V06. Ganti upvote menjadi downvote`             | POST   | `/vote.php`             | Vote diubah (`changed`)          |
| 8   | `V07. Detail pengaduan menampilkan pilihan vote` | GET    | `/detail_pengaduan.php` | `vote.pilihan_user` = `downvote` |
| 9   | `07. ID Pengaduan Tidak Valid`                   | POST   | `/vote.php`             | HTTP 400                         |
| 10  | `08. Pengaduan Tidak Ditemukan`                  | POST   | `/vote.php`             | HTTP 404                         |
| 11  | `09. Tipe Vote Tidak Valid`                      | POST   | `/vote.php`             | HTTP 400                         |
| 12  | `LOG-01 - Logout berhasil`                       | POST   | `/logout.php`           | Logout berhasil                  |
| 13  | `10. Vote Tanpa Login`                           | POST   | `/vote.php`             | HTTP 401                         |
| 14  | `11. Method Tidak Diizinkan`                     | GET    | `/vote.php`             | HTTP 405                         |
| 15  | `LGN-01 - Login berhasil`                        | POST   | `/login.php`            | Login berhasil                   |

Ketentuan urutan:

- Logout (langkah 12) dilakukan sebelum pengujian Vote Tanpa Login (langkah 13). Logout menghapus cookie session dari cookie jar Postman sehingga langkah 13 terkirim tanpa session.
- Pengujian GET (langkah 14) dilakukan setelah pengujian tanpa login (langkah 13).
- Login kembali (langkah 15) dilakukan setelah pengujian GET. Langkah 15 memakai request `LGN-01` yang sama dengan folder 02 Login.
- Langkah 2 sampai 8 saling bergantung karena hasil tiap langkah bergantung pada vote aktif dari langkah sebelumnya. Langkah tidak boleh dilewati atau diacak. Langkah 8 hanya membaca data dan harus dijalankan tepat setelah langkah 7.
- Pembersihan data vote dilakukan setelah seluruh skenario selesai, melalui database secara manual. Tidak ada endpoint reset, dan query SQL tidak dijalankan melalui Postman.
- Setelah langkah 2 sampai 7, bandingkan `data.vote.upvote` dan `data.vote.downvote` pada response dengan jumlah vote di database, lalu bandingkan juga dengan Detail Pengaduan atau Dashboard.

### Hasil yang diharapkan per langkah

Jumlah vote pada response mencakup vote seluruh pengguna. Notasi `u0` dan `d0` menyatakan jumlah upvote dan downvote awal pada pengaduan uji (sebelum akun uji memberi vote). Contoh response Postman memakai `u0 = 1` dan `d0 = 1`.

| No  | HTTP | Message                           | `aksi`    | `pilihan_user` | `upvote` | `downvote` | Catatan                                       |
| --- | ---- | --------------------------------- | --------- | -------------- | -------- | ---------- | --------------------------------------------- |
| 1   | 200  | Login berhasil                    | -         | -              | -        | -          | Cookie session dikirim                        |
| 2   | 200  | Vote berhasil disimpan            | `added`   | `upvote`       | u0 + 1   | d0         |                                               |
| 3   | 200  | Vote berhasil dibatalkan          | `removed` | `null`         | u0       | d0         |                                               |
| 4   | 200  | Vote berhasil disimpan            | `added`   | `downvote`     | u0       | d0 + 1     |                                               |
| 5   | 200  | Vote berhasil dibatalkan          | `removed` | `null`         | u0       | d0         |                                               |
| 6   | 200  | Vote berhasil disimpan            | `added`   | `upvote`       | u0 + 1   | d0         |                                               |
| 7   | 200  | Vote berhasil diubah              | `changed` | `downvote`     | u0       | d0 + 1     |                                               |
| 8   | 200  | Detail pengaduan berhasil diambil | -         | `downvote`     | u0       | d0 + 1     | Dibaca dari `data.vote` pada Detail Pengaduan |
| 9   | 400  | ID pengaduan tidak valid          | -         | -              | -        | -          | Tidak ada `data`                              |
| 10  | 404  | Pengaduan tidak ditemukan         | -         | -              | -        | -          | Tidak ada `data`                              |
| 11  | 400  | Jenis vote tidak valid            | -         | -              | -        | -          | Tidak ada `data`                              |
| 12  | 200  | Logout berhasil                   | -         | -              | -        | -          | `data` = `null`, cookie dihapus               |
| 13  | 401  | Silakan login terlebih dahulu     | -         | -              | -        | -          | Tidak ada `data`                              |
| 14  | 405  | Method tidak diizinkan            | -         | -              | -        | -          | Header `Allow: POST`                          |
| 15  | 200  | Login berhasil                    | -         | -              | -        | -          | Cookie session baru dikirim                   |

Langkah 9 sampai 11 tidak mengubah data vote. Langkah 14 mengirim GET sehingga ditolak pada pemeriksaan method sebelum autentikasi.

### Contoh request per skenario

Pada contoh berikut `<fixture_vote_id>` diambil dari variabel environment `fixture_vote_id`. Cookie session dikelola otomatis oleh cookie jar Postman.

**Langkah 1 dan 15. Login**

```http
POST /login.php
Content-Type: application/json
```

```json
{
  "email": "{{active_email}}",
  "password": "{{active_password}}"
}
```

**Langkah 2, 3, dan 6. Upvote (`V01`, `V02`, `V05`)**

```http
POST /vote.php
Content-Type: application/x-www-form-urlencoded
Cookie: PHPSESSID=<session_id>
```

Body (x-www-form-urlencoded):

```text
id_pengaduan=<fixture_vote_id>
tipe_vote=upvote
```

**Langkah 4 dan 5. Downvote (`V03`, `V04`)**

```text
id_pengaduan=<fixture_vote_id>
tipe_vote=downvote
```

Header sama dengan langkah 2.

**Langkah 7. Ganti upvote menjadi downvote (`V06`)**

```text
id_pengaduan=<fixture_vote_id>
tipe_vote=downvote
```

Body sama dengan langkah 4 dan 5. Aksi menjadi `changed` karena vote aktif sebelumnya (langkah 6) adalah upvote.

**Langkah 8. Detail pengaduan menampilkan pilihan vote (`V07`)**

```http
GET /detail_pengaduan.php?id_pengaduan=<fixture_vote_id>
Cookie: PHPSESSID=<session_id>
```

Tidak memerlukan body. Bagian `data.vote` pada response:

```json
{
  "upvote": 1,
  "downvote": 2,
  "pilihan_user": "downvote"
}
```

Nilai `pilihan_user` harus sama dengan vote aktif setelah langkah 7. Angka pada contoh mengasumsikan `u0 = 1` dan `d0 = 1`.

**Langkah 9. ID Pengaduan Tidak Valid (`07`)**

```text
id_pengaduan=abc
tipe_vote=upvote
```

**Langkah 10. Pengaduan Tidak Ditemukan (`08`)**

```text
id_pengaduan=99999
tipe_vote=upvote
```

ID `99999` diasumsikan tidak ada di database uji. Jika ID tersebut ada, ganti dengan ID lain yang tidak ada.

**Langkah 11. Tipe Vote Tidak Valid (`09`)**

```text
id_pengaduan=<fixture_vote_id>
tipe_vote=up
```

Nilai `up` bukan `upvote` atau `downvote`, sehingga ditolak. Nilai `remove` juga ditolak (subbab 11.5).

**Langkah 12. Logout (`LOG-01`)**

```http
POST /logout.php
Cookie: PHPSESSID=<session_id>
```

Tidak memerlukan body.

**Langkah 13. Vote Tanpa Login (`10`)**

```http
POST /vote.php
Content-Type: application/x-www-form-urlencoded
```

Body (x-www-form-urlencoded):

```text
id_pengaduan=<fixture_vote_id>
tipe_vote=upvote
```

Request dikirim tanpa cookie session karena cookie dihapus pada langkah 12.

**Langkah 14. Method Tidak Diizinkan (`11`)**

```http
GET /vote.php
```

Request Postman menyertakan body form yang sama seperti langkah 13, tetapi body tidak berpengaruh karena method ditolak lebih dahulu. Tidak memerlukan session.

### Pembersihan data vote

Setelah langkah 7, vote akun uji pada pengaduan uji masih aktif sebagai downvote. Karena menjalankan seluruh collection mendaftarkan akun uji baru pada setiap run (email `uji.<angka>@example.com`), setiap run meninggalkan satu vote baru dari akun yang berbeda. Hapus vote tersebut secara manual melalui database (misalnya phpMyAdmin atau MySQL client), bukan melalui Postman. Periksa dahulu baris yang akan dihapus, lalu hapus (sesuaikan ID pengaduan dengan `fixture_vote_id`):

```sql
SELECT v.id_vote, v.id_user, u.email, v.tipe_vote
FROM vote v JOIN users u ON u.id_user = v.id_user
WHERE v.id_pengaduan = <fixture_vote_id> AND u.email LIKE 'uji.%@example.com';

DELETE v FROM vote v JOIN users u ON u.id_user = v.id_user
WHERE v.id_pengaduan = <fixture_vote_id> AND u.email LIKE 'uji.%@example.com';
```

Jika `login_email` pada environment diisi dengan akun tetap, hapus vote akun tersebut saja dengan `DELETE FROM vote WHERE id_pengaduan = <fixture_vote_id> AND id_user = <id_user_penguji>;`.

Jika tidak dibersihkan, menjalankan ulang folder dengan akun yang sama menghasilkan `changed` pada langkah 2 (vote aktif sebelumnya adalah downvote), sehingga pengujian gagal. Test `DTL-03` di folder 05 juga gagal karena jumlah downvote di database lebih besar dari `fixture_downvote`.

## 15.9 Komentar

Pengujian dilakukan dengan Postman pada folder **08 Komentar**, setelah folder 04 Pengaduan pada Collection Runner penuh. Folder ini memakai pengaduan baru dari `created_pengaduan_id` (dibuat oleh `PGD-03`) sehingga tidak mengubah jumlah komentar pada pengaduan fixture (`fixture_komentar_id`) yang dibandingkan oleh test Detail Pengaduan. Komentar tidak dapat dihapus melalui API, jadi setiap run menambah komentar pada pengaduan uji. Jumlah komentar pada test dihitung relatif terhadap jumlah awal (`komentar_total_awal`, disimpan oleh `KMT-02`), sehingga folder dapat dijalankan ulang tanpa pembersihan. Hasil kosong (`[]`) hanya terjadi pada pengaduan yang belum pernah dikomentari, yaitu pada run penuh setelah folder 04.

| No  | Skenario                                             | Hasil yang diharapkan                                                                                                                      |
| --- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Login                                                | HTTP 200                                                                                                                                   |
| 2   | Daftar komentar pengaduan uji (jumlah awal disimpan) | HTTP 200, `total_komentar` sama dengan jumlah elemen; pengaduan yang belum pernah dikomentari menghasilkan 0 dan `[]`                      |
| 3   | Simpan komentar valid                                | HTTP 201, `komentar` berisi `id_komentar`, `nama`, `isi_komentar`, `created_at`, `total_komentar` = jumlah awal + 1, tanpa field `id_user` |
| 4   | Daftar komentar setelah menyimpan                    | HTTP 200, `total_komentar` = jumlah awal + 1, elemen terakhir (komentar terbaru) sama dengan yang disimpan                                 |
| 5   | Detail Pengaduan memuat komentar yang sama           | HTTP 200, `data.komentar` memuat `id_komentar` yang sama dan jumlahnya = jumlah awal + 1                                                   |
| 6   | Simpan komentar dengan `id_user` palsu pada body     | HTTP 201, `nama` penulis tetap nama akun login, `total_komentar` = jumlah awal + 2                                                         |
| 7   | Komentar kosong                                      | HTTP 400, `Komentar wajib diisi`                                                                                                           |
| 8   | Komentar hanya berisi spasi                          | HTTP 400, `Komentar wajib diisi`                                                                                                           |
| 9   | Komentar lebih dari 1000 karakter                    | HTTP 400, `Komentar maksimal 1000 karakter`                                                                                                |
| 10  | Field `isi_komentar` tidak dikirim                   | HTTP 400, `Komentar wajib diisi`                                                                                                           |
| 11  | ID pengaduan tidak valid (POST)                      | HTTP 400, `ID pengaduan tidak valid`                                                                                                       |
| 12  | Pengaduan tidak ditemukan (POST)                     | HTTP 404, `Pengaduan tidak ditemukan`                                                                                                      |
| 13  | ID pengaduan tidak valid (GET)                       | HTTP 400, `ID pengaduan tidak valid`                                                                                                       |
| 14  | Pengaduan tidak ditemukan (GET)                      | HTTP 404, `Pengaduan tidak ditemukan`                                                                                                      |
| 15  | Komentar yang ditolak tidak tersimpan                | HTTP 200, `total_komentar` tetap jumlah awal + 2                                                                                           |
| 16  | Logout                                               | HTTP 200                                                                                                                                   |
| 17  | Simpan komentar tanpa login                          | HTTP 401, `Silakan login terlebih dahulu`                                                                                                  |
| 18  | Daftar komentar tanpa login                          | HTTP 401, `Silakan login terlebih dahulu`                                                                                                  |
| 19  | Method tidak diizinkan (PUT)                         | HTTP 405, header `Allow: GET, POST`                                                                                                        |
| 20  | Login kembali                                        | HTTP 200                                                                                                                                   |
| 21  | Komentar dari request tanpa login tidak tersimpan    | HTTP 200, `total_komentar` tetap jumlah awal + 2                                                                                           |

Skenario kegagalan database (HTTP 500) tidak dapat dipicu melalui Postman dan hanya diverifikasi dari kode.

---

# 16. Catatan Audit Sprint 3

Dokumentasi ini digunakan sebagai kontrak antara frontend dan backend.

Sebelum kontrak dinyatakan final, lakukan pemeriksaan berikut.

## 16.1 Checklist Audit Umum

- [ ] Nama endpoint sesuai dengan file API aktual.
- [ ] Method HTTP sesuai implementasi.
- [ ] Nama field request sesuai implementasi.
- [ ] Nama field response sesuai implementasi.
- [ ] HTTP status code sesuai implementasi.
- [ ] Pesan error sesuai implementasi.
- [ ] Semua endpoint privat membutuhkan session.
- [ ] Request upload menggunakan multipart/form-data.
- [ ] Idempotency-Key diuji pada request baru dan retry. (Tidak berlaku untuk endpoint Pengaduan: lihat subbab 9.2 dan 10.4 yang menyatakan `Idempotency-Key` tidak digunakan.)
- [ ] Dokumentasi Postman memiliki request dan response aktual.
- [ ] Semua skenario pengujian memiliki bukti hasil.
- [ ] Endpoint yang belum dibuat tidak dinyatakan sebagai endpoint aktif.

## 16.2 Checklist Audit Fitur Vote

Status `[x]` berarti terbukti dari kode backend, skema database, atau contoh response Postman pada arsip proyek. Status `[ ]` berarti belum ada bukti atau perlu keputusan tim.

- [x] Endpoint Vote tersedia (`backend/api/vote.php`).
- [x] Method POST diterapkan (selain POST: HTTP 405, header `Allow: POST`).
- [x] PHP Session diperiksa (`AuthMiddleware`).
- [x] Identitas pengguna berasal dari session.
- [x] ID pengaduan divalidasi.
- [x] Jenis vote divalidasi.
- [x] Hanya `upvote` dan `downvote` yang diterima.
- [x] Satu pengguna hanya memiliki satu vote aktif per pengaduan (transaksi dan constraint unik `uq_vote_user_pengaduan`).
- [x] Toggle vote berjalan (contoh response V01 dan V02).
- [x] Perubahan vote berjalan (contoh response V06).
- [x] Pembatalan vote berjalan (contoh response V02 dan V04).
- [x] Jumlah vote sesuai database (response V06 dan V07 sama; `DTL-03` lulus terhadap `fixture_upvote` dan `fixture_downvote` setelah pembersihan).
- [x] Penanganan pengaduan tidak ditemukan (contoh response request `08`).
- [x] Penanganan request tanpa login (contoh response request `10`).
- [x] Penanganan method tidak diizinkan (contoh response request `11`).
- [x] Penanganan kesalahan server (ada di kode; belum diuji lewat Postman).
- [x] Detail Pengaduan memuat `vote.pilihan_user` dari session (kode backend, v1.4.3).
- [x] `vote.pilihan_user` pada Detail Pengaduan terbukti lewat Postman (`DTL-01` 10 dari 10, `DTL-05` lulus, contoh response V07 tersimpan).
- [x] Pengujian Postman disiapkan (subbab 15.8, folder 07 Vote).
- [ ] Dokumentasi kontrak API diserahkan kepada frontend.
- [ ] Frontend dihubungkan ke endpoint Vote dengan format form data (subbab 11.15 nomor 1).
- [x] Constraint unik (`id_pengaduan`, `id_user`) pada tabel `vote` dikonfirmasi terhadap skema database.
- [x] Folder 07 Vote dijalankan penuh (15 langkah) dengan hasil lulus (Collection Runner: tidak ada test gagal pada folder 07).
- [x] Vote akun uji dibersihkan dan `DTL-03` lulus (jumlah vote di database sama dengan `fixture_upvote` dan `fixture_downvote`).

## 16.3 Checklist Audit Fitur Komentar

Status `[x]` berarti terbukti dari kode backend atau skema database. Status `[ ]` berarti menunggu bukti pengujian atau keputusan tim.

- [x] Struktur penyimpanan komentar tersedia (tabel `komentar` dengan relasi ke `pengaduan` dan `users`).
- [x] Endpoint daftar komentar tersedia (`GET /komentar.php`).
- [x] Endpoint simpan komentar tersedia (`POST /komentar.php`).
- [x] Method selain GET dan POST ditolak (HTTP 405, header `Allow: GET, POST`).
- [x] PHP Session diperiksa (`AuthMiddleware`) pada kedua method.
- [x] Identitas penulis berasal dari session.
- [x] ID pengaduan divalidasi dan ketersediaan pengaduan diperiksa.
- [x] Isi komentar divalidasi (tidak kosong, bukan hanya spasi, maksimal 1000 karakter).
- [x] Komentar valid disimpan ke database dengan prepared statement.
- [x] Response menyertakan komentar yang tersimpan dan `total_komentar` dari database.
- [x] Jumlah komentar pada Dashboard (`comment_count`) dihitung dari tabel `komentar`.
- [x] Penanganan sesi tidak valid, pengaduan tidak ditemukan, input tidak valid, dan kegagalan database ada di kode.
- [x] Endpoint edit dan hapus komentar tidak dibuat.
- [ ] Folder 08 Komentar dijalankan penuh (21 langkah) dengan hasil lulus, dibuktikan hasil Collection Runner.
- [ ] Contoh response tersimpan di Postman untuk setiap request komentar.
- [ ] Batas 1000 karakter dikonfirmasi dengan tim dan FE.
- [ ] Dokumentasi kontrak API diserahkan kepada frontend.
- [ ] Frontend dihubungkan ke endpoint komentar (form komentar pada `detail-pengaduan.js` masih dinonaktifkan).

**Penting:** Kontrak API harus mencerminkan kode yang benar-benar berjalan. Jika dokumentasi menyatakan suatu response, tetapi backend mengirim response berbeda, maka kontrak tersebut belum sinkron dan perlu diperbaiki.
