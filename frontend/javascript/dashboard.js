/* ============================================================
   DASHBOARD.JS — Interaksi Halaman Dashboard & Semua Pengaduan
   ============================================================ */



    document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // 0. AUTH GUARD (Cek Login)
    // =========================================================
    const userSession = localStorage.getItem('user');
    
    // Jika tidak ada session user, tendang ke halaman login
    if (!userSession) {
        window.location.replace('login.html');
        return; // Hentikan eksekusi kode di bawahnya
    }

    // Parse data user
    let currentUser = null;
    try {
        currentUser = JSON.parse(userSession);
    } catch (e) {
        console.error("Format session tidak valid", e);
        localStorage.removeItem('user');
        window.location.replace('login.html');
        return;
    }

    // (Opsional) Jika data user ada tapi tidak punya nama, anggap tidak valid
    if (!currentUser || !currentUser.nama) {
         window.location.replace('login.html');
         return;
    }

    // --- 1. Sidebar Toggle ---
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (menuToggle && sidebar && sidebarOverlay) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }

    // --- 2. Dropdown Profil ---
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!profileDropdown.contains(e.target) && e.target !== profileBtn) {
                profileDropdown.classList.remove('active');
            }
        });
    }

    // --- 3. Logout ---
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Apakah Anda yakin ingin logout?')) {
                if (typeof clearUserSession === 'function') clearUserSession();
                window.location.href = 'login.html';
            }
        });
    }

    // --- 4. Set Nama User Dinamis ---
    const welcomeTitle = document.querySelector('.welcome-section h1');
    if (welcomeTitle) {
        // Ambil data user dari localStorage
        const userString = localStorage.getItem('user');
        
        if (userString) {
            try {
                const user = JSON.parse(userString);
                // Jika user punya nama, ganti teksnya
                if (user && user.nama) {
                    welcomeTitle.textContent = `Halo, ${user.nama}!`;
                }
            } catch (e) {
                console.error("Gagal membaca session user", e);
            }
        } else {
            // (Opsional) Jika tidak ada session, tendang kembali ke login
            // window.location.href = 'login.html';
            welcomeTitle.textContent = "Halo, Pengguna!";
        }
    }

    // --- 5. LOGIKA AMBIL DATA (SIMULASI KOSONG) ---
    // --- Ambil Elemen State ---
    const reportsContainer = document.getElementById('reportsContainer');
    const errorState = document.getElementById('errorState');
    const emptyState = document.getElementById('emptyState');
    const loadingState = document.getElementById('loadingState'); // Tambahan baru
    const btnRetry = document.getElementById('btnRetry');

        // --- 6. Fetch Data Dashboard ---
    const fetchDashboardData = async () => {
        if (typeof apiGetDashboard === 'function') {
            try {
                const response = await apiGetDashboard();
                
                if (response.ok && response.data) {
                    // Jika backend mengirim data statistik, tampilkan di sini
                    // Contoh: document.getElementById('stat-total').textContent = response.data.total_pengaduan;
                    console.log("Data Dashboard berhasil dimuat:", response.data);
                    
                    // (Di sini kamu bisa me-render list pengaduan asli dari backend)
                }
            } catch (error) {
                console.error("Gagal mengambil data dashboard", error);
            }
        }
    };

    // Panggil fungsi jika kita sedang di halaman dashboard
    if (document.querySelector('.dashboard-main')) {
        fetchDashboardData();
    }

    const fetchPengaduanData = async () => {
        // 1. Tampilkan Loading, Sembunyikan yang lain
        if (loadingState) loadingState.classList.add('active');
        if (errorState) errorState.classList.remove('active');
        if (emptyState) emptyState.classList.remove('active');
        if (reportsContainer) reportsContainer.style.display = 'none';

        try {
            // Simulasi delay jaringan (misal 1.5 detik) agar loading terlihat
            await new Promise(resolve => setTimeout(resolve, 1500));

            // ========================================================
            // SIMULASI API (Karena data di database masih kosong)
            // ========================================================
            const data = []; 

            // 2. Sembunyikan Loading setelah data didapat
            if (loadingState) loadingState.classList.remove('active');

            // 3. Cek Hasil Data
            if (data.length === 0) {
                if (emptyState) emptyState.classList.add('active');
            } else {
                if (reportsContainer) reportsContainer.style.display = 'flex';
                // (Logika render data)
            }

        } catch (error) {
            console.error("Error:", error);
            
            // Jika gagal, matikan loading, tampilkan error
            if (loadingState) loadingState.classList.remove('active');
            if (errorState) errorState.classList.add('active');
        }
    };

    // Jalankan fungsi saat halaman dimuat
    fetchPengaduanData();

    // Tombol Coba Lagi jika terjadi error
    if (btnRetry) {
        btnRetry.addEventListener('click', fetchPengaduanData);
    }

    // --- 6. Filter Chips (Khusus Halaman Semua Pengaduan) ---
    const chips = document.querySelectorAll('.chip');
    const cards = document.querySelectorAll('.report-card-dash');

    if (chips.length > 0) {
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');

                const filterValue = chip.innerText.trim().toLowerCase();

                cards.forEach(card => {
                    const statusBadge = card.querySelector('.badge-status');
                    if (!statusBadge) return;

                    const statusText = statusBadge.innerText.trim().toLowerCase();

                    if (filterValue === 'semua' || statusText === filterValue) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
    

});