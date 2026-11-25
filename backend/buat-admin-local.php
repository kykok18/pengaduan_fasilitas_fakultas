
<?php

/**
 * Seeder akun admin khusus localhost.
 *
 * Jalankan dari PHP CLI, bukan melalui browser.
 * Hapus file setelah akun berhasil dibuat.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Script hanya dapat dijalankan melalui terminal.');
}

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/app/Helpers/password.php';

$email = 'adminpengaduan@uinssc.ac.id';
$nama = 'Admin Pengaduan';

// Minta password melalui terminal agar tidak
// disimpan secara permanen di source code.
echo "Masukkan password admin baru: ";
$password = trim(fgets(STDIN));

if ($password === '') {
    exit("Password tidak boleh kosong.\n");
}

if (strlen($password) > 100) {
    exit("Password maksimal 100 byte.\n");
}

if (preg_match('/[\x00-\x1F\x7F]/', $password)) {
    exit("Password mengandung karakter tidak valid.\n");
}

// Periksa apakah email sudah terdaftar.
$check = $conn->prepare(
    "SELECT id_user FROM users WHERE email = ? LIMIT 1"
);

$check->bind_param('s', $email);
$check->execute();

$existing = $check->get_result()->fetch_assoc();
$check->close();

if ($existing) {
    exit("Akun dengan email tersebut sudah ada.\n");
}

// Hash password menggunakan helper backend.
$passwordHash = hashPassword($password);

// Jangan menyimpan plaintext lebih lama dari perlu.
unset($password);

// Simpan akun admin.
$stmt = $conn->prepare(
    "INSERT INTO users (nama, email, password, role)
     VALUES (?, ?, ?, 'admin')"
);

$stmt->bind_param(
    'sss',
    $nama,
    $email,
    $passwordHash
);

$stmt->execute();
$idAdmin = $conn->insert_id;
$stmt->close();

echo "Akun admin berhasil dibuat.\n";
echo "ID admin: {$idAdmin}\n";
echo "Email: {$email}\n";
echo "Role: admin\n";
