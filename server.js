require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const port = Number(process.env.PORT || 8000);
const frontendPath = path.join(__dirname, 'frontend');

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pengaduan_fasilitas_fakultasDB',
    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4'
});

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));

function sendError(res, status, message) {
    return res.status(status).json({ status: 'error', message });
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.post('/backend/api/registrasi.php', async (req, res) => {
    const data = req.body;
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return sendError(res, 400, 'Data request tidak valid');
    }

    const nama = typeof data.nama === 'string' ? data.nama.trim() : '';
    const email = typeof data.email === 'string' ? data.email.trim() : '';
    const password = typeof data.password === 'string' ? data.password : '';
    const confirmation = typeof data.confirm_password === 'string' ? data.confirm_password : '';

    if (!nama || !email || !password || !confirmation) {
        return sendError(res, 400, 'Nama, email, password, dan konfirmasi password harus diisi');
    }
    if (password !== confirmation) return sendError(res, 400, 'password tidak sama');
    if (password.length < 8) return sendError(res, 400, 'Password minimal 8 karakter');
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        return sendError(res, 400, 'Password harus mengandung huruf besar, huruf kecil, dan angka');
    }
    if (!validateEmail(email)) return sendError(res, 400, 'Format email tidak valid');

    try {
        const [existing] = await pool.execute('SELECT id_user FROM users WHERE email = ? LIMIT 1', [email]);
        if (existing.length) return sendError(res, 400, 'Email sudah terdaftar');

        const hash = await bcrypt.hash(password, 12);
        const [result] = await pool.execute(
            'INSERT INTO users (nama, email, password) VALUES (?, ?, ?)',
            [nama, email, hash]
        );
        return res.status(201).json({
            status: 'success',
            message: 'Registrasi berhasil',
            data: { id_user: result.insertId, nama, email, role: 'user' }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return sendError(res, 400, 'Email sudah terdaftar');
        console.error('Registrasi gagal:', error.message);
        return sendError(res, 500, 'Registrasi gagal. Periksa koneksi database.');
    }
});

app.post('/backend/api/login.php', async (req, res) => {
    const data = req.body;
    const email = typeof data?.email === 'string' ? data.email.trim() : '';
    const password = typeof data?.password === 'string' ? data.password : '';
    if (!email || !password) return sendError(res, 400, 'Email dan password harus diisi');
    if (!validateEmail(email)) return sendError(res, 400, 'Format email tidak valid');

    try {
        const [users] = await pool.execute(
            'SELECT id_user, nama, email, password, role FROM users WHERE email = ? LIMIT 1',
            [email]
        );
        const user = users[0];
        // PHP password_hash produces $2y$ hashes; bcryptjs expects the equivalent $2b$ prefix.
        const compatibleHash = user?.password?.replace(/^\$2y\$/, '$2b$');
        if (!user || !await bcrypt.compare(password, compatibleHash || '')) {
            return sendError(res, 401, 'Email atau password salah');
        }
        return res.json({
            status: 'success',
            message: 'Login berhasil',
            data: { id_user: user.id_user, nama: user.nama, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('Login gagal:', error.message);
        return sendError(res, 500, 'Terjadi kesalahan pada server');
    }
});

app.use(express.static(frontendPath));
app.get('/', (_req, res) => res.sendFile(path.join(frontendPath, 'index.html')));
app.use((error, _req, res, _next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return sendError(res, 400, 'Format JSON tidak valid');
    }
    console.error(error);
    return sendError(res, 500, 'Terjadi kesalahan pada server');
});

async function start() {
    try {
        await pool.query('SELECT 1');
        app.listen(port, '0.0.0.0', () => {
            console.log(`Website tersedia di http://localhost:${port}`);
            console.log('Perangkat lain di jaringan yang sama dapat membuka http://<IP-komputer-ini>:' + port);
        });
    } catch (error) {
        console.error(`Tidak dapat terhubung ke MySQL (${error.message}). Pastikan MySQL aktif dan konfigurasi .env benar.`);
        process.exit(1);
    }
}

start();
