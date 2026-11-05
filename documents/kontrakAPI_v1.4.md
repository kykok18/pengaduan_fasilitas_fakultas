# KONTRAK API

## Sistem Pengaduan Fasilitas Fakultas

### Dokumentasi Sprint 3

**Versi:** 1.4  
**Backend:** PHP Native  
**Database:** MySQL  
**Autentikasi:** PHP Session  
**Format response:** JSON  
**Format upload:** multipart/form-data

---

# 1. Informasi Umum

## 1.1 Base URL

Development:

```text
http://localhost:8000/backend/api
```

Base URL production harus disesuaikan dengan konfigurasi deployment aktual.

## 1.2 Daftar Endpoint

| No  | Method | Endpoint          | Fungsi                     | Auth                    |
| --- | ------ | ----------------- | -------------------------- | ----------------------- |
| 1   | POST   | `/registrasi.php` | Registrasi pengguna        | Tidak                   |
| 2   | POST   | `/login.php`      | Login pengguna             | Tidak                   |
| 3   | POST   | `/logout.php`     | Logout pengguna            | Ya                      |
| 4   | GET    | `/dashboard.php`  | Mengambil data dashboard   | Ya                      |
| 5   | GET    | `/pengaduan.php`  | Mengambil daftar fasilitas | Ya                      |
| 6   | POST   | `/pengaduan.php`  | Membuat pengaduan          | Ya                      |
| 7   | GET    | `/detail_pengaduan.php` | Mengambil detail pengaduan berdasarkan ID | Ya |
| 8   | GET    | `/riwayat.php`    | Riwayat pengaduan pengguna | Belum tersedia di arsip |

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
- Secure masih false pada konfigurasi saat ini.
- Secure perlu diaktifkan pada deployment HTTPS.

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
  "password": "Password123",
  "confirm_password": "Password123"
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
- Password harus mengandung huruf besar, huruf kecil, dan angka.
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
| 400  | Password harus mengandung huruf besar, huruf kecil, dan angka               |
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
  "password": "Password123"
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
| 405  | Method tidak diizinkan   |
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

| Field          | Keterangan          |
| -------------- | ------------------- |
| id_pengaduan   | ID pengaduan        |
| id_user        | ID pengguna pembuat |
| judul          | Judul pengaduan     |
| lokasi         | Lokasi kerusakan    |
| status         | Status pengaduan    |
| foto           | Path foto           |
| created_at     | Waktu pembuatan     |
| nama_fasilitas | Nama fasilitas      |
| upvote_count   | Jumlah upvote       |
| downvote_count | Jumlah downvote     |
| comment_count  | Jumlah komentar     |

Nilai count berasal dari query database.

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

| Atribut        | Nilai                     |
| -------------- | ------------------------- |
| Method         | GET                       |
| Endpoint       | `/detail_pengaduan.php`   |
| Authentication | Wajib                     |

Endpoint ini digunakan untuk mengambil detail pengaduan yang dipilih pengguna dari Dashboard. Data diambil berdasarkan `id_pengaduan` yang dikirim melalui query parameter. Pengguna yang sudah login dapat meminta detail pengaduan sesuai aturan akses backend.

## 7.2 Query Parameters

| Parameter      | Tipe    | Wajib | Keterangan                         |
| -------------- | ------- | ----- | ---------------------------------- |
| `id_pengaduan`  | integer | Ya    | ID pengaduan yang ingin ditampilkan |

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
      "foto": "uploads/pengaduan/contoh.webp",
      "status": "diajukan",
      "created_at": "2026-11-02 11:55:57"
    },
    "penanganan": [],
    "vote": {
      "upvote": 0,
      "downvote": 0
    },
    "komentar": []
  }
}
```

Nilai ID, isi data, path foto, dan waktu pada contoh merupakan ilustrasi. Nilai aktual berasal dari database. Field `id_user` tidak disertakan pada objek `pengaduan`.

### Struktur data detail

| Bagian        | Field utama | Keterangan |
| ------------- | ----------- | ---------- |
| `pengaduan`   | `id_pengaduan`, `judul`, `nama_fasilitas`, `lokasi`, `deskripsi`, `foto`, `status`, `created_at` | Data utama pengaduan dan nama fasilitas |
| `penanganan`  | `id_penanganan`, `status`, `foto`, `keterangan`, `created_at` | Riwayat penanganan admin, diurutkan terbaru lebih dahulu |
| `vote`        | `upvote`, `downvote` | Jumlah upvote dan downvote |
| `komentar`    | `id_komentar`, `nama`, `isi_komentar`, `created_at` | Komentar beserta nama pengguna, diurutkan dari yang paling awal |

## 7.5 Response Error

| HTTP | Message                         | Kondisi |
| ---- | ------------------------------- | ------- |
| 405  | Method tidak diizinkan          | Method selain GET |
| 401  | Silakan login terlebih dahulu   | Session tidak ada atau tidak valid |
| 400  | ID pengaduan tidak valid        | ID tidak berupa integer positif |
| 404  | Pengaduan tidak ditemukan       | Tidak ada pengaduan dengan ID tersebut |
| 500  | Gagal memulai session           | Session gagal dimulai |
| 500  | Gagal mengambil detail pengaduan | Query detail atau data terkait gagal |

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
  "message": "Data fasilitas berhasil diambil",
  "data": []
}
```

Data berisi daftar fasilitas dari database.

## 8.4 Response Error

| HTTP | Message                       |
| ---- | ----------------------------- |
| 405  | Method tidak diizinkan        |
| 401  | Silakan login terlebih dahulu |
| 500  | Gagal memulai session         |

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
- Ukuran foto maksimal 5 MB.
- Format yang diterima JPEG, JPG, PNG, dan WebP.
- File harus merupakan gambar valid.
- MIME file diperiksa.
- Konten gambar diperiksa.
- Dimensi maksimum 6000 x 6000 piksel.
- Maksimum 20 megapiksel.
- Gambar diproses ulang sebelum disimpan.

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
    "foto": "uploads/pengaduan/contoh.jpg",
    "status": "diajukan",
    "created_at": "2026-11-02 11:55:57"
  }
}
```

Nilai ID, nama file, dan waktu di atas merupakan contoh. Nilai aktual berasal dari database.

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
| 413  | Ukuran foto maksimal 5 MB                                                  |
| 400  | Foto gagal diunggah. Silakan coba lagi.                                    |
| 400  | Ukuran foto harus lebih dari 0 dan maksimal 5 MB                           |
| 400  | File foto yang diunggah tidak valid                                        |
| 500  | Server gagal memeriksa tipe foto                                           |
| 400  | Format foto harus JPEG, PNG, atau WebP                                     |
| 400  | File yang diunggah bukan gambar yang valid                                 |
| 400  | Isi file tidak sesuai dengan format foto yang diizinkan                    |
| 400  | Dimensi foto terlalu besar. Maksimal 6000 x 6000 piksel dan 20 megapiksel. |
| 500  | Direktori penyimpanan foto gagal dibuat                                    |
| 500  | Direktori penyimpanan foto tidak dapat ditulisi                            |
| 500  | Gagal menyiapkan nama file foto                                            |
| 400  | Gambar gagal diproses oleh server                                          |
| 500  | Gagal menyiapkan file sementara                                            |
| 500  | Gambar gagal disimpan ulang                                                |
| 500  | Foto gagal disimpan ke server                                              |
| 500  | Gagal memeriksa proses pengaduan. Silakan coba lagi.                       |
| 409  | Pengaduan Anda sedang diproses. Tunggu hingga selesai.                     |
| 500  | Gagal membuat pengaduan                                                    |
| 500  | Pengaduan tersimpan, tetapi gagal mengambil data hasil penyimpanan         |

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

## 11.2 Kebutuhan Fungsional

Riwayat pengaduan seharusnya menampilkan pengaduan milik pengguna yang sedang login.

Berbeda dengan Dashboard, Riwayat tidak boleh menampilkan pengaduan milik pengguna lain.

Endpoint ini perlu didokumentasikan setelah route dan controller tersedia.

---

# 12. Keamanan API

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

---

# 13. Skenario Pengujian API

## 13.1 Registrasi

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

## 13.2 Login

| No  | Skenario                 | Hasil yang Diharapkan |
| --- | ------------------------ | --------------------- |
| 1   | Email dan password valid | Login berhasil        |
| 2   | Password salah           | HTTP 401              |
| 3   | Email tidak terdaftar    | HTTP 401              |
| 4   | Email kosong             | Request ditolak       |
| 5   | Password kosong          | Request ditolak       |

## 13.3 Logout

| No  | Skenario                    | Hasil yang Diharapkan |
| --- | --------------------------- | --------------------- |
| 1   | Logout dengan session aktif | Logout berhasil       |
| 2   | Logout tanpa session        | HTTP 401              |
| 3   | Session tidak valid         | HTTP 401              |

## 13.4 Dashboard

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

## 13.5 Detail Pengaduan

| No | Skenario                                      | Hasil yang Diharapkan |
| -- | --------------------------------------------- | --------------------- |
| 1  | Request dengan ID pengaduan valid dan login   | HTTP 200, detail sesuai ID |
| 2  | Request tanpa login                           | HTTP 401 |
| 3  | ID pengaduan tidak valid                      | HTTP 400 |
| 4  | ID pengaduan tidak ditemukan                  | HTTP 404 |
| 5  | Query detail gagal                            | HTTP 500 |

## 13.6 Daftar Fasilitas

| No  | Skenario                     | Hasil yang Diharapkan        |
| --- | ---------------------------- | ---------------------------- |
| 1   | Request dengan session aktif | Daftar fasilitas ditampilkan |
| 2   | Request tanpa login          | HTTP 401                     |

## 13.7 Membuat Pengaduan

| No  | Skenario                                                                | Hasil yang Diharapkan                                   |
| --- | ----------------------------------------------------------------------- | ------------------------------------------------------- |
| 1   | Data valid dan foto valid                                               | HTTP 201, pengaduan berhasil dibuat                     |
| 2   | Judul kosong                                                            | HTTP 400                                                |
| 3   | Lokasi kosong                                                           | HTTP 400                                                |
| 4   | Deskripsi kosong                                                        | HTTP 400                                                |
| 5   | Foto tidak dikirim                                                      | HTTP 400                                                |
| 6   | Format foto tidak valid                                                 | HTTP 400                                                |
| 7   | Foto melebihi batas ukuran                                              | HTTP 413                                                |
| 8   | ID fasilitas tidak valid                                                | HTTP 400                                                |
| 9   | Request tanpa login                                                     | HTTP 401                                                |
| 10  | Request kedua dari user yang sama ketika request pertama masih diproses | HTTP 409                                                |
| 11  | Request baru dari user yang sama setelah proses sebelumnya selesai      | HTTP 201                                                |
| 12  | Request bersamaan dari user berbeda                                     | Dapat diproses secara bersamaan                         |
| 13  | Terjadi kegagalan saat memeriksa lock                                   | HTTP 500                                                |
| 14  | Request bersamaan ditolak                                               | Tidak ada data pengaduan baru dari request yang ditolak |

---

# 14. Catatan Audit Sprint 3

Dokumentasi ini digunakan sebagai kontrak antara frontend dan backend.

Sebelum kontrak dinyatakan final, lakukan pemeriksaan berikut:

- [ ] Nama endpoint sesuai dengan file API aktual.
- [ ] Method HTTP sesuai implementasi.
- [ ] Nama field request sesuai implementasi.
- [ ] Nama field response sesuai implementasi.
- [ ] HTTP status code sesuai implementasi.
- [ ] Pesan error sesuai implementasi.
- [ ] Semua endpoint privat membutuhkan session.
- [ ] Request upload menggunakan multipart/form-data.
- [ ] Idempotency-Key diuji pada request baru dan retry.
- [ ] Dokumentasi Postman memiliki request dan response aktual.
- [ ] Semua skenario pengujian memiliki bukti hasil.
- [ ] Endpoint yang belum dibuat tidak dinyatakan sebagai endpoint aktif.

**Penting:** Kontrak API harus mencerminkan kode yang benar-benar berjalan. Jika dokumentasi menyatakan suatu response, tetapi backend mengirim response berbeda, maka kontrak tersebut belum sinkron dan perlu diperbaiki.
