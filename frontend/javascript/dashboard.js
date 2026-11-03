
    document.addEventListener('DOMContentLoaded', () => {

        // =========================================================
        // 0. AUTH GUARD
        // =========================================================

        // LocalStorage hanya digunakan sebagai data sementara profil.
        // Validasi login tetap dilakukan oleh PHP Session di backend.
        let currentUser = null;

        if (typeof getUserSession === 'function') {
            currentUser = getUserSession();
        }

        // =========================================================
        // 1. ELEMENT HTML
        // =========================================================
        const welcomeText = document.getElementById('welcomeText');
        const userInitial = document.getElementById('userInitial');

        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');

        const profileBtn = document.getElementById('profileBtn');
        const profileDropdown = document.getElementById('profileDropdown');
        const logoutBtn = document.getElementById('logoutBtn');

        const reportsContainer = document.getElementById('reportsContainer');
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const emptyState = document.getElementById('emptyState');
        const btnRetry = document.getElementById('btnRetry');

        const searchInput = document.getElementById('searchInput');
        const chips = document.querySelectorAll('.chip');

        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        const pagination = document.getElementById('pagination');

        // =========================================================
        // 2. DATA DAN STATE
        // =========================================================
        const LIMIT = 5;

        let currentPage = 1;
        let currentFilter = 'semua';
        let currentSearch = '';

        let totalPages = 1;
        let allReports = [];

        // =========================================================
        // 3. HELPER FUNCTION
        // =========================================================

        // Menghindari karakter HTML dari data API
        const escapeHTML = (value) => {
            return String(value ?? '').replace(/[&<>"']/g, char => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            })[char]);
        };

        // Format tanggal dari database
        const formatDate = (dateValue) => {
            if (!dateValue) return '-';

            const date = new Date(
                String(dateValue).replace(' ', 'T')
            );

            if (Number.isNaN(date.getTime())) {
                return dateValue;
            }

            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        };

        // Mengubah status database menjadi label tampilan
        const getStatusInfo = (status) => {
            const statusMap = {
                diajukan: {
                    label: 'Diajukan',
                    className: 'status-proses'
                },
                
diproses: {
    label: 'Dalam Perbaikan',
    className: 'status-proses'
},

                selesai: {
                    label: 'Selesai',
                    className: 'status-selesai'
                },
                ditolak: {
                    label: 'Ditolak',
                    className: 'status-ditolak'
                }
            };

            return statusMap[String(status || '').toLowerCase()] || {
                label: status || 'Tidak diketahui',
                className: 'status-proses'
            };
        };

        // Menampilkan dan menyembunyikan state
        const showLoading = () => {
        loadingState?.classList.add('active');
        errorState?.classList.remove('active');
        emptyState?.classList.remove('active');

        if (pagination) {
            pagination.style.display = 'none';
        }

        if (reportsContainer) {
            reportsContainer.style.display = 'none';
        }
    };

        const showError = () => {
        loadingState?.classList.remove('active');
        errorState?.classList.add('active');
        emptyState?.classList.remove('active');

        if (pagination) {
            pagination.style.display = 'none';
        }

        if (reportsContainer) {
            reportsContainer.style.display = 'none';
        }
    };

            const getFotoURL = (fotoPath) => {
            if (!fotoPath) return '';

            // Jika backend sudah mengirim URL lengkap.
            if (/^https?:\/\//i.test(fotoPath)) {
                return fotoPath;
            }

            const projectBaseURL = API_BASE_URL.replace(/\/backend\/api$/, '');

            // Jika path diawali slash, gunakan origin dan path tersebut.
            if (fotoPath.startsWith('/')) {
                return `${window.location.origin}${fotoPath}`;
            }

            // Jika path relatif, gunakan root project.
            return `${projectBaseURL}/${fotoPath.replace(/^\.?\//, '')}`;
        };

        // =========================================================
        // 4. IDENTITAS PENGGUNA
        // =========================================================
        const setUserInfo = (user) => {
            if (!user) return;

            const nama = user.nama || currentUser.nama;

            if (nama && welcomeText) {
                welcomeText.textContent = `Halo, ${nama}!`;
            }

            if (nama && userInitial) {
                userInitial.textContent = nama.charAt(0).toUpperCase();
            }

            // Simpan data pengguna terbaru
            currentUser = {
                ...currentUser,
                ...user
            };

            localStorage.setItem('user', JSON.stringify(currentUser));
        };

        setUserInfo(currentUser);

        // =========================================================
        // 5. SIDEBAR
        // =========================================================
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

        // =========================================================
        // 6. PROFILE DROPDOWN
        // =========================================================
        if (profileBtn && profileDropdown) {
            profileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (
                    !profileDropdown.contains(e.target) &&
                    !profileBtn.contains(e.target)
                ) {
                    profileDropdown.classList.remove('active');
                }
            });
        }

        
        // =========================================================
        // 7. LOGOUT SIDEBAR
        // =========================================================

        // Mengambil elemen modal dari HTML
        const logoutOverlay = document.getElementById('logoutModalOverlay');
        const logoutConfirmState = document.getElementById('logoutConfirmState');
        const logoutLoadingState = document.getElementById('logoutLoadingState');
        const logoutErrorState = document.getElementById('logoutErrorState');
        const logoutSuccessToast = document.getElementById('logoutSuccessToast');

        // Mengambil tombol pada modal
        const cancelLogout = document.getElementById('btnCancelLogout');
        const confirmLogout = document.getElementById('btnConfirmLogout');
        const retryLogout = document.getElementById('btnRetryLogout');

        // Mencegah proses logout dijalankan berkali-kali
        let loggingOut = false;

        // Mengatur tampilan modal berdasarkan kondisi
        function showLogoutState(state) {
            logoutConfirmState.style.display =
                state === 'confirm' ? 'flex' : 'none';

            logoutLoadingState.style.display =
                state === 'loading' ? 'flex' : 'none';

            logoutErrorState.style.display =
                state === 'error' ? 'flex' : 'none';
        }

        
if (logoutBtn && logoutOverlay) {
    logoutBtn.addEventListener('click', (event) => {
        event.preventDefault();

        if (loggingOut) return;

        showLogoutState('confirm');
        logoutOverlay.classList.add('active');
    });
}


        // Menutup modal konfirmasi
        function closeLogoutModal() {
            if (loggingOut) return;

            logoutOverlay.classList.remove('active');
        }

        // Tombol Batal
if (cancelLogout) {
    cancelLogout.addEventListener('click', closeLogoutModal);
}

        // Menjalankan proses Logout
        async function performLogout() {
            if (loggingOut) return;

            
loggingOut = true;

// Tampilkan modal Loading
showLogoutState('loading');

// Catat waktu mulai Loading
const loadingStartTime = Date.now();

try {
    // Mengirim permintaan Logout ke backend
    const result = await apiLogout();

    // Menghitung waktu Loading yang sudah berlalu
    const elapsedTime = Date.now() - loadingStartTime;

    // Pastikan Loading terlihat minimal 1,5 detik
    if (elapsedTime < 1500) {
        await new Promise(resolve => {
            setTimeout(resolve, 1500 - elapsedTime);
        });
    }


                // Memastikan Logout berhasil di server
                if (!result.ok) {
                    throw new Error(result.message || 'Logout gagal');
                }

                // Menghapus data pengguna di frontend
                if (typeof clearUserSession === 'function') {
                    clearUserSession();
                } else {
                    localStorage.removeItem('user');
                }

                
            
            
// Menyembunyikan modal konfirmasi dan loading
showLogoutState('');

// Mengaktifkan overlay gelap
logoutOverlay.classList.add('active');
logoutOverlay.classList.add('logout-success-active');

// Menampilkan popup Logout Berhasil
logoutSuccessToast.style.display = 'flex';

// Setelah 2 detik, arahkan ke halaman Login
setTimeout(() => {
    logoutSuccessToast.style.display = 'none';

    logoutOverlay.classList.remove('active');
    logoutOverlay.classList.remove('logout-success-active');

    window.location.replace('login.html');
}, 2000);






            } catch (error) {
                console.error('Logout error:', error);

                // Menampilkan modal Logout Gagal
                showLogoutState('error');

            } finally {
                loggingOut = false;
            }
        }

        
        // Tombol Ya, Logout
        if (confirmLogout) {
            confirmLogout.addEventListener('click', performLogout);
        }

        // Tombol Coba Lagi
        if (retryLogout) {
            retryLogout.addEventListener('click', performLogout);
        }



        // =========================================================
        // 8. RENDER CARD PENGADUAN
        // =========================================================
        const renderReports = (data) => {
            if (!reportsContainer) return;

            reportsContainer.innerHTML = '';

            if (!data || data.length === 0) {
                reportsContainer.style.display = 'none';
                emptyState?.classList.add('active');
                return;
            }

            emptyState?.classList.remove('active');
            reportsContainer.style.display = 'flex';

            data.forEach(item => {
                const statusInfo = getStatusInfo(item.status);

                const judul = escapeHTML(item.judul);
                const lokasi = escapeHTML(item.lokasi);
                const fasilitas = escapeHTML(item.nama_fasilitas || 'Fasilitas');
                const statusLabel = escapeHTML(statusInfo.label);

                const foto = item.foto
                ? escapeHTML(getFotoURL(item.foto))
                : '';

                const card = document.createElement('div');
                card.className = 'report-card-dash';

                card.innerHTML = `
                    <div class="report-image">
                        ${
                            foto
                                ? `<img src="${foto}" alt="${judul}" onerror="this.style.display='none'">`
                                : ''
                        }
                        <span class="badge-category">${fasilitas}</span>
                    </div>

                    <div class="report-content">
                        <div class="report-content-header">
                            <h4>${judul}</h4>

                            <span class="badge-status ${statusInfo.className}">
                                ${statusLabel}
                            </span>
                        </div>

                        <div class="report-meta">
                            <span>
                                <svg width="9" height="11" viewBox="0 0 9 11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.5 0C2.0194 0 5.29528e-05 1.97351 5.29528e-05 4.3978C-0.0168219 7.93803 4.00501 10.7746 4.17375 10.8956C4.26938 10.9615 4.3875 11 4.5 11C4.6125 11 4.73062 10.967 4.82625 10.8956C4.995 10.7746 9.01682 7.94353 8.99995 4.3978C8.99995 1.97351 6.9806 0 4.5 0ZM4.5 6.5967C3.25689 6.5967 2.25003 5.61269 2.25003 4.3978C2.25003 3.18291 3.25689 2.1989 4.5 2.1989C5.74311 2.1989 6.74997 3.18291 6.74997 4.3978C6.74997 5.61269 5.74311 6.5967 4.5 6.5967Z" fill="#474747"/>
    </svg>

                                ${lokasi}
                            </span>

                            <span>
                                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 9.96875C0 10.5381 0.527902 11 1.17857 11H9.82143C10.4721 11 11 10.5381 11 9.96875V4.125H0V9.96875ZM7.85714 5.75781C7.85714 5.61602 7.98973 5.5 8.15179 5.5H9.13393C9.29598 5.5 9.42857 5.61602 9.42857 5.75781V6.61719C9.42857 6.75898 9.29598 6.875 9.13393 6.875H8.15179C7.98973 6.875 7.85714 6.75898 7.85714 6.61719V5.75781ZM7.85714 8.50781C7.85714 8.36602 7.98973 8.25 8.15179 8.25H9.13393C9.29598 8.25 9.42857 8.36602 9.42857 8.50781V9.36719C9.42857 9.50898 9.29598 9.625 9.13393 9.625H8.15179C7.98973 9.625 7.85714 9.50898 7.85714 9.36719V8.50781ZM4.71429 5.75781C4.71429 5.61602 4.84687 5.5 5.00893 5.5H5.99107C6.15312 5.5 6.28571 5.61602 6.28571 5.75781V6.61719C6.28571 6.75898 6.15312 6.875 5.99107 6.875H5.00893C4.84687 6.875 4.71429 6.75898 4.71429 6.61719V5.75781ZM4.71429 8.50781C4.71429 8.36602 4.84687 8.25 5.00893 8.25H5.99107C6.15312 8.25 6.28571 8.36602 6.28571 8.50781V9.36719C6.28571 9.50898 6.15312 9.625 5.99107 9.625H5.00893C4.84687 9.625 4.71429 9.50898 4.71429 9.36719V8.50781ZM1.57143 5.75781C1.57143 5.61602 1.70402 5.5 1.86607 5.5H2.84821C3.01027 5.5 3.14286 5.61602 3.14286 5.75781V6.61719C3.14286 6.75898 3.01027 6.875 2.84821 6.875H1.86607C1.70402 6.875 1.57143 6.75898 1.57143 6.61719V5.75781ZM1.57143 8.50781C1.57143 8.36602 1.70402 8.25 1.86607 8.25H2.84821C3.01027 8.25 3.14286 8.36602 3.14286 8.50781V9.36719C3.14286 9.50898 3.01027 9.625 2.84821 9.625H1.86607C1.70402 9.625 1.57143 9.50898 1.57143 9.36719V8.50781ZM9.82143 1.375H8.64286V0.34375C8.64286 0.154687 8.46607 0 8.25 0H7.46429C7.24821 0 7.07143 0.154687 7.07143 0.34375V1.375H3.92857V0.34375C3.92857 0.154687 3.75179 0 3.53571 0H2.75C2.53393 0 2.35714 0.154687 2.35714 0.34375V1.375H1.17857C0.527902 1.375 0 1.83691 0 2.40625V3.4375H11V2.40625C11 1.83691 10.4721 1.375 9.82143 1.375Z" fill="#474747"/>
    </svg>

                                ${formatDate(item.created_at)}
                            </span>
                        </div>

                        <div class="report-footer">
                            <div class="report-actions">
                                <span>
                                    <i class="fas fa-thumbs-up"></i>
                                    ${Number(item.upvote_count) || 0}
                                </span>

                                <span>
                                    <i class="fas fa-thumbs-down"></i>
                                    ${Number(item.downvote_count) || 0}
                                </span>

                                <span>
                                    <i class="fas fa-comment"></i>
                                    ${Number(item.comment_count) || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                `;

                reportsContainer.appendChild(card);
            });
        };

        // =========================================================
            // 9. PAGINATION
            // =========================================================

            const renderPagination = (paginationData) => {
                if (!pagination || !paginationData) return;

                currentPage = Number(paginationData.current_page) || 1;
                totalPages = Number(paginationData.total_pages) || 1;

                if (prevPage) {
                    prevPage.disabled = currentPage <= 1;
                }

                if (nextPage) {
                    nextPage.disabled = currentPage >= totalPages;
                }

                // Hapus nomor halaman dan titik-titik yang lama.
                pagination.querySelectorAll('.page-number, .page-dots')
                    .forEach(element => element.remove());

                // Buat nomor halaman secara dinamis.
                const addPageButton = (page) => {
                    const button = document.createElement('button');

                    button.type = 'button';
                    button.className = 'page-btn page-number';
                    button.dataset.page = page;
                    button.textContent = page;
                    button.classList.toggle('active', page === currentPage);

                    if (nextPage) {
                        pagination.insertBefore(button, nextPage);
                    } else {
                        pagination.appendChild(button);
                    }
                };

                const addDots = () => {
                    const dots = document.createElement('span');
                    dots.className = 'page-dots';
                    dots.textContent = '...';

                    if (nextPage) {
                        pagination.insertBefore(dots, nextPage);
                    } else {
                        pagination.appendChild(dots);
                    }
                };

                // Jika halaman maksimal 5, tampilkan semuanya.
                if (totalPages <= 5) {
                    for (let page = 1; page <= totalPages; page++) {
                        addPageButton(page);
                    }
                } else {
                    // Selalu tampilkan halaman pertama.
                    addPageButton(1);

                    let startPage = Math.max(2, currentPage - 1);
                    let endPage = Math.min(totalPages - 1, currentPage + 1);

                    if (currentPage <= 3) {
                        startPage = 2;
                        endPage = 4;
                    }

                    if (currentPage >= totalPages - 2) {
                        startPage = totalPages - 3;
                        endPage = totalPages - 1;
                    }

                    if (startPage > 2) {
                        addDots();
                    }

                    for (let page = startPage; page <= endPage; page++) {
                        addPageButton(page);
                    }

                    if (endPage < totalPages - 1) {
                        addDots();
                    }

                    // Selalu tampilkan halaman terakhir.
                    addPageButton(totalPages);
                }

                // Sembunyikan pagination jika hanya ada satu halaman.
                pagination.style.display = totalPages <= 1 ? 'none' : 'flex';
            };

        // =========================================================
        // 10. AMBIL DATA DARI API
        // =========================================================
        const fetchPengaduanData = async () => {
        // Jalankan hanya jika elemen dashboard tersedia
        if (!reportsContainer) return;

        showLoading();

        // Lanjutkan kode yang sudah ada...

            try {
                if (typeof apiGetDashboard !== 'function') {
                    throw new Error('Fungsi apiGetDashboard tidak ditemukan.');
                }

                const response = await apiGetDashboard({
                    page: currentPage,
                    limit: LIMIT,
                    search: currentSearch,
                    status: currentFilter
                });

                if (!response || !response.ok) {
                    throw new Error(
                        response?.message || 'Gagal mengambil data dashboard.'
                    );
                }

                const dashboardData = response.data;

                if (!dashboardData) {
                    throw new Error('Data dashboard kosong.');
                }

                // Perbarui identitas pengguna dari backend
                if (dashboardData.user) {
                    setUserInfo(dashboardData.user);
                }

                // Ambil data pengaduan
                allReports = Array.isArray(dashboardData.pengaduan)
                    ? dashboardData.pengaduan
                    : [];

                // Render card dan pagination
                renderReports(allReports);
                renderPagination(dashboardData.pagination);

                loadingState?.classList.remove('active');
                errorState?.classList.remove('active');

            } catch (error) {
                console.error('Gagal memuat dashboard:', error);

                loadingState?.classList.remove('active');
                showError();
            }
        };

        // =========================================================
        // 11. FILTER STATUS
        // =========================================================
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');

                currentFilter = chip.dataset.filter || 'semua';
                currentPage = 1;

                fetchPengaduanData();
            });
        });

        // =========================================================
        // 12. PENCARIAN
        // =========================================================
        let searchTimeout;

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearch = e.target.value.trim();
                currentPage = 1;

                clearTimeout(searchTimeout);

                searchTimeout = setTimeout(() => {
                    fetchPengaduanData();
                }, 400);
            });
        }

        // =========================================================
        // 13. NAVIGASI PAGINATION
        // =========================================================
        if (prevPage) {
            prevPage.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    fetchPengaduanData();
                }
            });
        }

        if (nextPage) {
            nextPage.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    fetchPengaduanData();
                }
            });
        }

        if (pagination) {
            pagination.addEventListener('click', (e) => {
                const button = e.target.closest('[data-page], .page-number');

                if (!button || button.disabled) return;

                const page = Number(
                    button.dataset.page || button.textContent.trim()
                );

                if (
                    Number.isInteger(page) &&
                    page >= 1 &&
                    page <= totalPages &&
                    page !== currentPage
                ) {
                    currentPage = page;
                    fetchPengaduanData();
                }
            });
        }

        // =========================================================
        // 14. TOMBOL COBA LAGI
        // =========================================================
        if (btnRetry) {
            btnRetry.addEventListener('click', fetchPengaduanData);
        }

        // =========================================================
        // 15. LOAD DATA PERTAMA KALI
        // =========================================================
        fetchPengaduanData();

    });
