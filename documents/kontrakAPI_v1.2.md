# Kontrak API

## Website Pengaduan Fasilitas Fakultas

Informasi Nilai

---

Versi 1.2
Status Acuan final untuk kontrak request/response
Backend PHP Native + MySQL
Autentikasi PHP Session
Cakupan API pengguna (`user`), bukan API admin
Pembaruan 19 Oktober 2026

> **Aturan utama:** dokumen ini menjadi acuan bersama backend dan
> frontend. Endpoint berstatus **Tersedia** sudah ditemukan pada proyek,
> tetapi tetap harus diuji. Endpoint berstatus **Kontrak final,
> implementasi pending** sudah disepakati bentuknya, tetapi belum boleh
> dianggap aktif sebelum kode dibuat dan diuji.

---

## 1. Base URL

Base URL bergantung pada lingkungan lokal:

Lingkungan Base URL

---

Ubuntu, PHP built-in server `http://localhost:8000`
Windows, XAMPP `http://localhost/pengaduan_fasilitas_fakultas`

Path endpoint selalu ditambahkan ke Base URL. Contoh registrasi:

- Ubuntu: `http://localhost:8000/backend/api/registrasi.php`
- Windows XAMPP:
  `http://localhost/pengaduan_fasilitas_fakultas/backend/api/registrasi.php`

Jangan menghapus ekstensi `.php` atau mengganti path tanpa mengubah
kontrak ini dan implementasi frontend/backend secara bersamaan.

---

## 2. Aturan umum

### 2.1 Request JSON

Untuk endpoint JSON, gunakan header:

```http
Content-Type: application/json
Accept: application/json
```

Request unggah file menggunakan `multipart/form-data`; jangan menetapkan
header `Content-Type` secara manual pada `fetch`, agar browser membuat
boundary multipart.

### 2.2 Format response

Response sukses:

```json
{
  "status": "success",
  "message": "Permintaan berhasil",
  "data": {}
}
```

Response error:

```json
{
  "status": "error",
  "message": "Permintaan tidak dapat diproses"
}
```

- `message` berisi pesan yang sesuai dengan hasil operasi.
- `data` wajib ada pada response sukses; isinya objek, array, atau
  `null` sesuai endpoint.
- Response error boleh tidak memiliki `data`.
- Frontend harus memeriksa HTTP status dan nilai `status`, bukan hanya
  teks pesan.
- Semua endpoint API harus mengembalikan JSON, termasuk saat terjadi
  error. Jangan mengirim halaman HTML error sebagai response API.

### 2.3 Kode status HTTP

---

Kode Makna/penggunaan

---

`200 OK` Operasi berhasil, misalnya login,
logout, atau membaca data

`201 Created` Resource baru berhasil dibuat

`400 Bad Request` Input atau file tidak valid

`401 Unauthorized` Session tidak valid atau kredensial
salah

`403 Forbidden` Pengguna tidak berhak melakukan
tindakan

`404 Not Found` Endpoint atau resource tidak
ditemukan

`405 Method Not Allowed` Metode HTTP tidak didukung

`409 Conflict` Konflik data, misalnya email sudah
digunakan

`413 Content Too Large` File melampaui batas ukuran

`415 Unsupported Media Type` Jenis file tidak didukung

`500 Internal Server Error` Kesalahan internal server

---

---

## 3. Session dan autentikasi

- Autentikasi menggunakan PHP Session, bukan Bearer Token/JWT.
- Setelah login berhasil, server membuat session dan mengirim cookie
  session.
- Request ke endpoint privat harus mengirim cookie session menggunakan
  `credentials: "same-origin"` selama frontend dan backend berada pada
  origin yang sama.
- Endpoint privat harus mengembalikan `401 Unauthorized` jika session
  tidak valid.
- `id_user` untuk tindakan pengguna harus diambil dari session server,
  bukan dipercaya dari body, query string, atau `localStorage`.
- `localStorage` bukan bukti autentikasi. Logout harus mengakhiri
  session server.
- Setelah login berhasil, session ID harus diregenerasi.

---

## 4. Endpoint yang tersedia

Status pada bagian ini mengacu pada audit struktur proyek sebelumnya.
Tetap lakukan pengujian regresi setelah perubahan kode.

### 4.1 Registrasi

Properti Ketentuan

---

Method `POST`
Path `/backend/api/registrasi.php`
Autentikasi Tidak
Status Tersedia

Request JSON:

```json
{
  "nama": "Andi Saputra",
  "email": "andi@example.com",
  "password": "Andi12345",
  "confirm_password": "Andi12345"
}
```

Aturan: - Semua field wajib diisi. - Email harus valid dan belum
digunakan. - Password minimal 8 karakter dan mengandung huruf besar,
huruf kecil, serta angka. - `password` harus sama dengan
`confirm_password`. - `confirm_password` hanya untuk validasi dan tidak
disimpan ke database. - Role akun baru adalah `user`. - Password
disimpan dengan `password_hash()` dan tidak pernah dikirim kembali.

Response `201 Created`:

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

Status yang diharapkan: `201`, `400`, `405`, `409` (email duplikat),
atau `500`.

### 4.2 Login

Properti Ketentuan

---

Method `POST`
Path `/backend/api/login.php`
Autentikasi Tidak
Status Tersedia

Request JSON:

```json
{
  "email": "andi@example.com",
  "password": "Andi12345"
}
```

Response `200 OK`:

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

Status: `200`, `400`, `401`, `405`, atau `500`. Password dan hash
password tidak boleh ada dalam response.

### 4.3 Logout

Properti Ketentuan

---

Method `POST`
Path `/backend/api/logout.php`
Autentikasi Session aktif
Status Tersedia

Logout mengakhiri session di server dan menghapus cookie session yang
terkait.

Response `200 OK`:

```json
{
  "status": "success",
  "message": "Logout berhasil",
  "data": null
}
```

Jika session tidak aktif, implementasi dapat mengembalikan `401`.
Frontend tetap harus menghapus tampilan/data pengguna lokal setelah
menangani respons logout, tetapi penghapusan `localStorage` sendiri
tidak mengakhiri session server.

### 4.4 Dashboard

Properti Ketentuan

---

Method `GET`
Path `/backend/api/dashboard.php`
Autentikasi Session aktif
Status Tersedia

Request tidak membutuhkan body. Session tidak valid harus menghasilkan
`401 Unauthorized`.

#### Response sukses

HTTP Status: `200 OK`

```json
{
  "status": "success",
  "message": "Data dashboard berhasil diambil",
  "data": {
    "user": {
      "id_user": 8,
      "nama": "Budi Pengujian",
      "email": "budi.test@example.com",
      "role": "user"
    },
    "pengaduan": [
      {
        "id_pengaduan": 1,
        "judul": "Pengujian Dashboard",
        "status": "diajukan",
        "created_at": "2026-10-19 19:56:18"
      }
    ]
  }
}
```

Keterangan:

- `data.user` berisi informasi pengguna yang sedang login.
- `data.pengaduan` berisi daftar pengaduan milik pengguna tersebut.
- Daftar pengaduan diurutkan berdasarkan `created_at` terbaru.
- Data pengaduan dibatasi berdasarkan `id_user` dari session.

#### Response ketika belum memiliki pengaduan

HTTP Status: `200 OK`

Jika pengguna belum memiliki pengaduan, API tetap mengembalikan
status sukses dengan `pengaduan` berupa array kosong.

```json
{
  "status": "success",
  "message": "Data dashboard berhasil diambil",
  "data": {
    "user": {
      "id_user": 9,
      "nama": "Andi Pengujian",
      "email": "andi.test@example.com",
      "role": "user"
    },
    "pengaduan": []
  }
}
```

#### Response ketika session tidak valid

HTTP Status: `401 Unauthorized`

```json
{
  "status": "error",
  "message": "Silakan login terlebih dahulu"
}
```

#### Response ketika pengambilan data gagal

HTTP Status: `500 Internal Server Error`

Contoh jika query pengaduan gagal:

```json
{
  "status": "error",
  "message": "Gagal mengambil data pengaduan"
}
```

Catatan:
Data pengguna dan pengaduan di atas merupakan contoh dari pengujian.
Data aktual mengikuti isi database. Kegagalan query harus dibedakan
dari query berhasil yang menghasilkan array kosong.

---

## 5. Kontrak final fitur pengaduan

Fitur pembuatan pengaduan dan unggah bukti foto disatukan dalam satu
endpoint agar alur pembuatan laporan lebih sederhana.

### 5.1 Membuat pengaduan dengan atau tanpa foto

Properti Ketentuan

---

Method `POST`
Path `/backend/api/pengaduan.php`
Content-Type `application/json` atau `multipart/form-data`
Autentikasi Session aktif
Status saat ini Implementasi tersedia

Request JSON (tanpa foto):

```json
{
  "id_fasilitas": 1,
  "judul": "Proyektor ruang kelas rusak",
  "lokasi": "Gedung FITK, Lantai 2",
  "deskripsi": "Proyektor tidak menyala saat digunakan."
}
```

Request `multipart/form-data` (opsional foto bukti):

```text
id_fasilitas=1
judul=Proyektor ruang kelas rusak
lokasi=Gedung FITK, Lantai 2
deskripsi=Proyektor tidak menyala saat digunakan.
foto=@gambar.jpg
```

Aturan: - Session harus valid. - `id_user` diambil dari session;
frontend tidak mengirim `id_user`. - `id_fasilitas` wajib berupa ID
fasilitas yang ada. - `judul` wajib diisi, maksimum 150 karakter. -
`lokasi` wajib diisi. - `deskripsi` wajib diisi. - Foto bukti bersifat
opsional pada endpoint ini. - Jika `foto` dikirim, server memeriksa
ukuran dan tipe file dari isi file, bukan hanya ekstensi. - Valid tipe:
JPEG, PNG, atau WebP. - Maksimum ukuran 5 MB. - Server membuat nama file
sendiri; tidak menggunakan nama client. - Path relatif file disimpan
pada kolom `pengaduan.foto`.

Response `201 Created`:

```json
{
  "status": "success",
  "message": "Pengaduan berhasil dibuat",
  "data": {
    "id_pengaduan": 12,
    "id_user": 8,
    "id_fasilitas": 1,
    "judul": "Proyektor ruang kelas rusak",
    "lokasi": "Gedung FITK, Lantai 2",
    "deskripsi": "Proyektor tidak menyala saat digunakan.",
    "foto": "uploads/pengaduan/pengaduan_12_1697812345_abcd1234.png",
    "status": "diajukan",
    "created_at": "2026-10-19 12:00:00"
  }
}
```

`foto` boleh bernilai `null` bila tidak ada file bukti yang dikirim.

Status: `201`, `400` untuk input tidak valid, `401` untuk session
invalid, `404` jika fasilitas tidak ditemukan, `405`, `413` untuk file
terlalu besar, `415` untuk tipe tidak didukung, atau `500`.

Catatan tambahan:

- Frontend wajib mengirim `id_fasilitas` sebagai angka integer, bukan nama kategori.
- Endpoint ini menerima JSON untuk pengaduan biasa dan `FormData` saat foto disertakan.
- Tidak ada endpoint terpisah untuk upload foto; foto diproses di endpoint pengaduan yang sama.

### 5.2 Contoh frontend pengajuan dengan foto

```javascript
const formData = new FormData();
formData.append("id_fasilitas", 1);
formData.append("judul", "Proyektor rusak");
formData.append("lokasi", "Gedung FITK");
formData.append("deskripsi", "Proyektor tidak menyala saat kelas.");
formData.append("foto", fileFoto);

const response = await fetch(`${API_BASE_URL}/pengaduan.php`, {
  method: "POST",
  credentials: "same-origin",
  headers: {
    Accept: "application/json",
  },
  body: formData,
});
```

Untuk request tanpa foto, cukup gunakan JSON seperti contoh di atas dan
jangan kirim field `foto`.

---

## 6. Skema database terkait pengaduan

Kontrak fitur pengaduan menggunakan tabel yang sudah ada:

### `pengaduan`

- `id_pengaduan`: primary key, auto increment.
- `id_user`: pemilik/pembuat pengaduan.
- `id_fasilitas`: fasilitas yang dilaporkan.
- `judul`: maksimum 150 karakter.
- `deskripsi`: teks pengaduan.
- `foto`: path file, boleh `NULL` sebelum bukti diunggah.
- `status`: `diajukan`, `diproses`, `selesai`, atau `ditolak`; default
  `diajukan`.
- `created_at`, `updated_at`: timestamp.

Tidak perlu menambah tabel baru untuk US-06 dan US-07 berdasarkan skema
saat ini.

---

## 7. Endpoint yang direncanakan untuk fitur lain

Endpoint berikut belum menjadi bagian dari implementasi yang telah
dikonfirmasi. Jangan digunakan oleh frontend sebelum kontrak detail
disepakati dan endpoint dibuat serta diuji.

---

Method Path rencana Fungsi

---

`GET` `/backend/api/pengaduan.php` Daftar fasilitas yang tersedia
untuk form pengaduan

`GET` `/backend/api/pengaduan_detail.php?id={id}` Detail pengaduan

`PUT` `/backend/api/pengaduan_update.php?id={id}` Mengubah pengaduan
milik sendiri

`DELETE` `/backend/api/pengaduan_hapus.php?id={id}` Menghapus pengaduan
milik sendiri

`POST` `/backend/api/vote.php` Memberi/mengubah vote

`GET` `/backend/api/komentar.php?id_pengaduan={id}` Daftar komentar

`POST` `/backend/api/komentar.php` Menambah komentar

`GET` `/backend/api/riwayat_pengaduan.php` Riwayat pengaduan user

`GET` `/backend/api/profile.php` Melihat profil user

`PUT` `/backend/api/profile.php` Mengubah profil user

`POST` `/backend/api/profile_photo.php` Mengunggah foto profil

`PUT` `/backend/api/profile_password.php` Mengubah password

---

API admin tidak termasuk cakupan kontrak ini.

---

## 8. Aturan keamanan wajib

- Gunakan prepared statements untuk query database.
- Gunakan `password_hash()` dan `password_verify()`.
- Jangan mengirim password atau hash password ke client.
- Regenerasi session ID setelah login berhasil.
- Periksa session di semua endpoint privat.
- Ambil `id_user` dari session untuk semua tindakan atas nama
  pengguna.
- Periksa kepemilikan pengaduan sebelum unggah, ubah, atau hapus.
- Validasi input di backend meskipun frontend juga memvalidasi.
- Validasi tipe dan ukuran file dari konten file; jangan percaya nama
  file client.
- Simpan `.env` dan kredensial di luar Git.
- Semua response endpoint harus JSON dan tidak boleh membocorkan
  detail error internal ke client.
- Gunakan HTTPS saat deployment.

---

## 9. Checklist implementasi dan pengujian

---

Fitur Status awal Syarat untuk ditandai
selesai

---

Registrasi Tersedia Uji sukses, input tidak
valid, email duplikat

Login Tersedia Uji sukses, kredensial
salah, cookie/session

Logout Tersedia Uji session benar-benar
berakhir

Dashboard Tersedia Uji session dan
dokumentasikan response
aktual

US-06 membuat pengaduan Tersedia Uji sukses, validasi,
fasilitas tidak ada,
tanpa session

US-07 unggah bukti Implementasi pending Uji file valid, tipe
salah, ukuran berlebih,
pengaduan tidak ada,
bukan pemilik

Endpoint fitur lain Belum dikonfirmasi Tetapkan kontrak
masing-masing sebelum
implementasi

---

**Kontrak ini menetapkan bentuk endpoint dan perilaku yang harus
dibuat.** Status implementasi baru boleh diubah menjadi selesai setelah
kode tersedia dan pengujian request/response berhasil, misalnya melalui
Postman. Simpan bukti uji secara terpisah.
