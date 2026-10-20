/* ============================================================
   DASHBOARD.JS — Interaksi Halaman Dashboard
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    // --- Sidebar Toggle ---
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

    // --- Dropdown Profil ---
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

    // --- Logout ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Apakah Anda yakin ingin logout?')) {
                if (typeof clearUserSession === 'function') {
                    clearUserSession();
                }
                window.location.href = 'login.html';
            }
        });
    }

    // --- Set Nama User ---
    const welcomeTitle = document.querySelector('.welcome-section h1');
    if (welcomeTitle && typeof getUserSession === 'function') {
        const user = getUserSession();
        if (user && user.nama) {
            welcomeTitle.textContent = `Halo, ${user.nama}!`;
        }
    }

});