# API Contract

Website Pengaduan Fasilitas Fakultas

Versi: 1.0
Tanggal pembaruan: 9 Oktober 2026
Cakupan: API untuk pengguna (user)
Backend: PHP Native, MySQL, REST-style API
Autentikasi: PHP Session

## 1. Tujuan

Dokumen ini menjadi kesepakatan antara backend dan frontend mengenai
endpoint, format request, format response, autentikasi, serta kode
status HTTP pada API Website Pengaduan Fasilitas Fakultas.

Dokumen ini hanya mencakup API user. API admin berada di luar
cakupan dokumen ini dan akan dibuat terpisah.

## 2. Base URL

URL pengembangan lokal:

http://localhost:8000

Contoh endpoint registrasi berdasarkan file PHP saat ini:

POST http://localhost:8000/api/registrasi.php

Catatan rute: Backend saat ini menggunakan file PHP seperti
api/registrasi.php dan api/login.php. Endpoint lain dalam dokumen
ini merupakan kontrak yang perlu disesuaikan dengan nama file/routing
yang diterapkan. Jangan menganggap endpoint yang belum dibuat sudah
aktif.

## 3. Format Umum

### 3.1 Request JSON

Untuk request yang mengirim data JSON, gunakan header:

Content-Type: application/json
Accept: application/json

Contoh:

{
"email": "user@example.com",
"password": "Rahasia123"
}

Untuk endpoint unggah foto, gunakan multipart/form-data.

### 3.2 Response JSON

Respons berhasil:

{
"status": "success",
"message": "Permintaan berhasil",
"data": {}
}

Respons gagal:

{
"status": "error",
"message": "Permintaan tidak dapat diproses"
}

Field data berisi objek atau daftar data pada respons berhasil.
Respons error tidak wajib menyertakan data.

## 4. Autentikasi dan Session

API menggunakan PHP Session, bukan Bearer Token/JWT.

Setelah login berhasil, server membuat session dan mengirim cookie
session.

Client harus menyimpan serta mengirim kembali cookie tersebut pada
request yang memerlukan autentikasi.

Di Postman, pastikan cookie dari respons login tersimpan dan dikirim
pada request berikutnya.

Endpoint yang memerlukan login harus menolak request tanpa session
yang valid dengan 401 Unauthorized.

Logout mengakhiri session dan menghapus cookie/session yang terkait.

## 5. Aturan Data

### 5.1 Registrasi

Field wajib: nama, email, password, confirm_password.

Email harus memiliki format yang valid dan belum digunakan.

Password minimal 8 karakter serta mengandung huruf besar, huruf
kecil, dan angka.

password harus sama dengan confirm_password.

confirm_password hanya untuk validasi request dan tidak disimpan
ke database.

Role pengguna baru adalah user.

Password disimpan menggunakan hash, bukan teks asli.

### 5.2 Pengaduan

Status awal pengaduan adalah diajukan.

Status pengaduan yang dikenal dalam skema: diajukan, diproses,
selesai, ditolak.

Pengguna hanya boleh mengubah atau menghapus pengaduan miliknya,
sesuai aturan bisnis yang diterapkan backend.

Field dan aturan unggah foto perlu disepakati pada implementasi
endpoint pengaduan.

### 5.3 Vote

Nilai tipe_vote yang diperbolehkan: - upvote - downvote

## 6. Daftar Endpoint User

Daftar ini mencakup kontrak endpoint user. Status implementasi tiap
endpoint tidak otomatis berarti sudah tersedia di backend.

            No. Method        Endpoint kontrak                 Fungsi        Autentikasi

              1 POST          `/api/registrasi`                Membuat akun  Tidak
                                                               user

              2 POST          `/api/login`                     Login user    Tidak

              3 POST          `/api/logout`                    Logout user   Ya

              4 GET           `/api/pengaduan`                 Melihat       Sesuai
                                                               daftar        kebijakan
                                                               pengaduan     aplikasi

              5 POST          `/api/pengaduan`                 Membuat       Ya
                                                               pengaduan

              6 GET           `/api/pengaduan/{id}`            Melihat       Sesuai
                                                               detail        kebijakan
                                                               pengaduan     aplikasi

              7 PUT           `/api/pengaduan/{id}`            Mengubah      Ya
                                                               pengaduan
                                                               milik sendiri

              8 DELETE        `/api/pengaduan/{id}`            Menghapus     Ya
                                                               pengaduan
                                                               milik sendiri

              9 POST          `/api/pengaduan/{id}/vote`       Memberikan    Ya
                                                               atau mengubah
                                                               vote

             10 GET           `/api/pengaduan/{id}/komentar`   Melihat       Sesuai
                                                               komentar      kebijakan
                                                               pengaduan     aplikasi

             11 POST          `/api/pengaduan/{id}/komentar`   Menambahkan   Ya
                                                               komentar

             12 GET           `/api/pengaduan/riwayat`         Melihat       Ya
                                                               riwayat
                                                               pengaduan
                                                               user

             13 GET           `/api/profile`                   Melihat       Ya
                                                               profil user

             14 PUT           `/api/profile`                   Mengubah      Ya
                                                               profil user

             15 POST          `/api/profile/photo`             Mengunggah    Ya
                                                               foto profil

             16 PUT           `/api/profile/password`          Mengubah      Ya
                                                               password

Nama endpoint di tabel mengikuti kontrak logis tanpa ekstensi .php.
Jika implementasi tetap menggunakan file PHP langsung, frontend dan
backend harus menyepakati path aktual, misalnya /api/login.php.
Jangan mencampur kedua format pada integrasi.

## 7. Detail Request dan Response

### 7.1 Registrasi User

Method: POST
Endpoint kontrak: /api/registrasi
Autentikasi: Tidak

Request:

{
"nama": "Andi Saputra",
"email": "andi@example.com",
"password": "Andi12345",
"confirm_password": "Andi12345"
}

Respons berhasil: 201 Created

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

Kemungkinan error: - 400 Bad Request: input wajib kosong, format email
tidak valid, password tidak memenuhi aturan, konfirmasi password tidak
cocok, atau email sudah terdaftar. - 405 Method Not Allowed: method
selain POST. - 500 Internal Server Error: terjadi kesalahan
server/database.

### 7.2 Login User

Method: POST
Endpoint kontrak: /api/login
Autentikasi: Tidak

Request:

{
"email": "andi@example.com",
"password": "Andi12345"
}

Respons berhasil: 200 OK

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

Server membuat session login. Password maupun hash password tidak boleh
dikirim kembali dalam respons.

Kemungkinan error: - 400 Bad Request: email/password kosong atau
format email tidak valid. - 401 Unauthorized: email atau password
salah. - 405 Method Not Allowed: method selain POST. -
500 Internal Server Error: terjadi kesalahan server/database.

### 7.3 Logout User

Method: POST
Endpoint kontrak: /api/logout
Autentikasi: Ya

Mengakhiri session user yang sedang login.

Respons berhasil:

{
"status": "success",
"message": "Logout berhasil",
"data": null
}

### 7.4 Daftar Pengaduan

Method: GET
Endpoint kontrak: /api/pengaduan

Mengambil daftar pengaduan yang dapat dilihat pengguna. Struktur filter,
pagination, dan urutan data ditetapkan saat implementasi.

Contoh bentuk respons:

{
"status": "success",
"message": "Daftar pengaduan berhasil diambil",
"data": [
{
"id_pengaduan": 1,
"judul": "Kursi kelas rusak",
"deskripsi": "Beberapa kursi mengalami kerusakan.",
"status": "diajukan",
"created_at": "2026-10-09 10:00:00"
}
]
}

### 7.5 Membuat Pengaduan

Method: POST
Endpoint kontrak: /api/pengaduan
Autentikasi: Ya

Field inti yang berkaitan dengan skema database:

{
"id_fasilitas": 1,
"judul": "Kursi kelas rusak",
"deskripsi": "Beberapa kursi mengalami kerusakan."
}

Foto, jika diwajibkan oleh aturan implementasi, dikirim sebagai unggahan
file. Status awal otomatis diajukan dan id_user diambil dari
session, bukan dipercaya dari request client.

Respons berhasil yang diharapkan: 201 Created.

### 7.6 Detail Pengaduan

Method: GET
Endpoint kontrak: /api/pengaduan/{id}

Mengambil detail pengaduan berdasarkan ID. Ganti {id} dengan ID
pengaduan sebenarnya.

### 7.7 Mengubah Pengaduan

Method: PUT
Endpoint kontrak: /api/pengaduan/{id}
Autentikasi: Ya

Mengubah data pengaduan milik user yang sedang login. Backend harus
memeriksa kepemilikan pengaduan dan hanya menerima field yang diizinkan.

### 7.8 Menghapus Pengaduan

Method: DELETE
Endpoint kontrak: /api/pengaduan/{id}
Autentikasi: Ya

Menghapus pengaduan sesuai aturan bisnis. Backend harus memeriksa
kepemilikan pengaduan sebelum menghapus.

### 7.9 Vote Pengaduan

Method: POST
Endpoint kontrak: /api/pengaduan/{id}/vote
Autentikasi: Ya

Request:

{
"tipe_vote": "upvote"
}

tipe_vote hanya menerima upvote atau downvote. Aturan apakah vote
dapat diubah atau dibatalkan perlu konsisten antara frontend dan
backend.

### 7.10 Melihat Komentar

Method: GET
Endpoint kontrak: /api/pengaduan/{id}/komentar

Mengambil daftar komentar untuk pengaduan yang ditentukan.

### 7.11 Menambahkan Komentar

Method: POST
Endpoint kontrak: /api/pengaduan/{id}/komentar
Autentikasi: Ya

Contoh request:

{
"isi_komentar": "Semoga segera diperbaiki."
}

Nama field final perlu disamakan dengan kolom dan implementasi tabel
komentar.

### 7.12 Riwayat Pengaduan User

Method: GET
Endpoint kontrak: /api/pengaduan/riwayat
Autentikasi: Ya

Mengambil pengaduan yang dibuat oleh user yang sedang login. Identitas
user diambil dari session.

### 7.13 Melihat Profil

Method: GET
Endpoint kontrak: /api/profile
Autentikasi: Ya

Mengambil profil user yang sedang login. Password tidak boleh disertakan
dalam respons.

### 7.14 Mengubah Profil

Method: PUT
Endpoint kontrak: /api/profile
Autentikasi: Ya

Field profil yang dapat diubah perlu disepakati dengan frontend. Email
harus tetap divalidasi dan aturan keunikan email harus diterapkan jika
email dapat diubah.

### 7.15 Mengunggah Foto Profil

Method: POST
Endpoint kontrak: /api/profile/photo
Autentikasi: Ya

Request menggunakan multipart/form-data. Nama field file yang
digunakan frontend dan backend harus disepakati sebelum integrasi.

Backend perlu memvalidasi jenis dan ukuran file serta tidak mempercayai
nama file dari client.

### 7.16 Mengubah Password

Method: PUT
Endpoint kontrak: /api/profile/password
Autentikasi: Ya

Contoh bentuk request:

{
"password_lama": "Andi12345",
"password_baru": "Andi67890",
"confirm_password": "Andi67890"
}

Backend harus memverifikasi password lama, menerapkan aturan password
baru, mencocokkan konfirmasi password, lalu menyimpan hash password
baru. Nama field final harus disepakati bersama frontend.

## 8. Kode Status HTTP

                                Status Penggunaan

                              `200 OK` Request berhasil

                         `201 Created` Data baru berhasil dibuat

                     `400 Bad Request` Input tidak valid

                    `401 Unauthorized` Belum login atau kredensial
                                       salah

                       `403 Forbidden` Tidak memiliki izin mengakses
                                       resource

                       `404 Not Found` Resource tidak ditemukan

              `405 Method Not Allowed` Method HTTP tidak didukung

                        `409 Conflict` Konflik data, misalnya email
                                       sudah digunakan, jika dipilih
                                       sebagai konvensi

           `500 Internal Server Error` Kesalahan internal server

Status aktual harus konsisten dengan implementasi backend. Untuk menjaga
kompatibilitas, perubahan status atau struktur respons perlu
dikomunikasikan kepada frontend.

## 9. Keamanan

Gunakan prepared statements untuk query database.

Simpan password menggunakan password_hash() dan verifikasi dengan
password_verify().

Jangan mengembalikan password atau hash password dalam response.

Gunakan session untuk autentikasi dan regenerasi session ID setelah
login.

Endpoint privat wajib memeriksa session.

Periksa kepemilikan pengaduan sebelum mengubah atau menghapus data.

Validasi input di backend meskipun frontend sudah melakukan
validasi.

Untuk deployment, gunakan HTTPS.

Jangan commit kredensial database atau rahasia lain ke Git.

## 10. Status Implementasi dan Integrasi

Dokumen ini adalah kontrak untuk menyelaraskan frontend dan backend,
bukan bukti bahwa semua endpoint sudah selesai dibuat.

Pada saat dokumen disusun, registrasi telah direfaktor dan fungsi login
sedang disiapkan untuk pengujian. Endpoint lain harus ditandai selesai
setelah benar-benar diimplementasikan dan diuji.

Sebelum integrasi frontend: 1. Sepakati path final endpoint, termasuk
penggunaan atau penghilangan ekstensi .php. 2. Sepakati nama field
request dan response. 3. Uji autentikasi session dan cookie. 4. Uji kode
status dan format error. 5. Catat hasil uji Postman pada dokumentasi
pengujian terpisah.
