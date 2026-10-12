/* ============================================================
   APP.JS — Interaksi Landing Page + Cek Status Login
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // 1. FAQ ACCORDION
    // ============================================================
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            faqItems.forEach(otherItem => {
                if (otherItem !== item) otherItem.classList.remove('active');
            });
            item.classList.toggle('active');
        });
    });

    // ============================================================
    // 2. SIDEBAR TOGGLE
    // ============================================================
    const menuToggle = document.querySelector('.menu-toggle');
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

    // ============================================================
    // 3. ACTIVE MENU SIDEBAR
    // ============================================================
    const sidebarLinks = document.querySelectorAll('.sidebar-nav ul li');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function () {
            sidebarLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // ============================================================
    // 4. SMOOTH SCROLL
    // ============================================================
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const navbar = document.querySelector('.navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;

                window.scrollTo({
                    top: targetPosition - navbarHeight - 10,
                    behavior: 'smooth'
                });

                if (sidebar && sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                    sidebarOverlay.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            }
        });
    });

    // ============================================================
    // 5. CEK STATUS LOGIN → UPDATE NAVBAR
    // ============================================================
    const user = getUserSession();

    if (user) {
        const btnRegistrasi = document.getElementById('btnRegistrasi');
        const btnLogin = document.getElementById('btnLogin');
        const userName = document.getElementById('userName');
        const btnLogout = document.getElementById('btnLogout');

        if (btnRegistrasi) btnRegistrasi.style.display = 'none';
        if (btnLogin) btnLogin.style.display = 'none';

        if (userName) {
            userName.textContent = `Halo, ${user.nama || user.name || 'User'}`;
            userName.style.display = 'inline';
        }

        if (btnLogout) {
            btnLogout.style.display = 'inline-block';
            btnLogout.addEventListener('click', async () => {
                if (!confirm('Yakin ingin keluar?')) return;

                btnLogout.disabled = true;
                btnLogout.textContent = 'Loading...';

                await apiLogout();
                clearUserSession();
                window.location.href = 'login.html';
            });
        }
    }

});