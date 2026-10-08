/* ============================================================
   APP.JS — Interaksi Landing Page Pengaduan Fasilitas FITK
   Berisi:
   1. FAQ Accordion
   2. Sidebar Toggle (buka/tutup)
   3. Active Menu Sidebar
   4. Smooth Scroll dengan Offset
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ============================================== */
    /* 1. FAQ ACCORDION                               */
    /*    Membuka/menutup jawaban FAQ saat diklik.    */
    /*    Hanya 1 FAQ yang boleh terbuka sekaligus.   */
    /* ============================================== */
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            // Tutup semua FAQ lain
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle FAQ yang diklik
            item.classList.toggle('active');
        });
    });


    /* ============================================== */
    /* 2. SIDEBAR TOGGLE                              */
    /*    Buka sidebar saat hamburger diklik,         */
    /*    dan tutup saat overlay di-klik.             */
    /* ============================================== */
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (menuToggle && sidebar && sidebarOverlay) {
        // Buka sidebar
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Cegah scroll body
        });

        // Tutup sidebar saat overlay diklik
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = 'auto'; // Kembalikan scroll body
        });
    }


    /* ============================================== */
    /* 3. ACTIVE MENU DI SIDEBAR                      */
    /*    Saat menu diklik, pindahkan class 'active'  */
    /*    ke menu yang baru diklik.                   */
    /* ============================================== */
    const sidebarLinks = document.querySelectorAll('.sidebar-nav ul li');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function () {
            // 1. Hapus class 'active' dari SEMUA menu
            sidebarLinks.forEach(item => item.classList.remove('active'));

            // 2. Tambahkan class 'active' ke menu yang baru saja diklik
            this.classList.add('active');
        });
    });


    /* ============================================== */
    /* 4. SMOOTH SCROLL DENGAN OFFSET                 */
    /*    Scroll halus ke section tujuan, dengan      */
    /*    offset setinggi navbar + 10px.              */
    /*    Setelah scroll, sidebar otomatis tertutup.  */
    /* ============================================== */
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            // Lewati kalau href hanya "#" atau kosong
            if (targetId === '#' || targetId === '') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();

                // 1. Hitung tinggi navbar
                const navbar = document.querySelector('.navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 0;

                // 2. Hitung posisi target dari atas halaman
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;

                // 3. Scroll ke posisi target dikurangi tinggi navbar + sedikit buffer
                window.scrollTo({
                    top: targetPosition - navbarHeight - 10,
                    behavior: 'smooth'
                });

                // 4. Tutup sidebar kalau sedang terbuka
                if (sidebar && sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                    sidebarOverlay.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            }
        });
    });

});