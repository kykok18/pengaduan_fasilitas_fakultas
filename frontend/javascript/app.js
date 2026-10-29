/* ============================================================
   APP.JS — Interaksi Landing Page + Cek Status Login
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

/* ============================================================
   SKELETON LOADING — Muncul hanya saat fetch API
   ============================================================ */
async function loadLandingData() {
    const sections = [
        { skeleton: 'statsSkeleton', content: 'statsContent' },
        { skeleton: 'layananSkeleton', content: 'layananContent' },
        { skeleton: 'kategoriSkeleton', content: 'kategoriContent' },
        { skeleton: 'pengaduanSkeleton', content: 'pengaduanContent' }
    ];

    // Fungsi helper: tampilkan konten, sembunyikan skeleton
    function showContent({ skeleton, content }) {
        const skeletonEl = document.getElementById(skeleton);
        const contentEl = document.getElementById(content);
        if (skeletonEl) skeletonEl.classList.add('skeleton-hidden');
        if (contentEl) contentEl.classList.remove('skeleton-hidden');
    }

    try {

        // Baik sukses maupun gagal — tampilkan konten
        sections.forEach(showContent);

    } catch (error) {
        console.warn('API tidak tersedia:', error);
        // Fallback: tetap tampilkan konten
        sections.forEach(showContent);
    }
}

loadLandingData();

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

    

});