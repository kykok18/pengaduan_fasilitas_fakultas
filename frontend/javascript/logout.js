    // =========================================================
    // 1. SINKRONISASI LOGOUT ANTAR TAB
    // =========================================================

    window.addEventListener('storage', (event) => {
        if (event.key === 'logout-event' && event.newValue) {
            localStorage.removeItem('user');
            window.location.replace('login.html');
        }
    });

    
document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // 2. ELEMEN LOGOUT
    // =========================================================

    const logoutBtn = document.getElementById('logoutBtn');
    const logoutOverlay = document.getElementById('logoutModalOverlay');

    const logoutConfirmState = document.getElementById('logoutConfirmState');
    const logoutLoadingState = document.getElementById('logoutLoadingState');
    const logoutErrorState = document.getElementById('logoutErrorState');
    const logoutSuccessToast = document.getElementById('logoutSuccessToast');

    const cancelLogout = document.getElementById('btnCancelLogout');
    const confirmLogout = document.getElementById('btnConfirmLogout');
    const retryLogout = document.getElementById('btnRetryLogout');

    if (!logoutBtn || !logoutOverlay) return;

    let loggingOut = false;

    // =========================================================
    // 3. MENGATUR TAMPILAN MODAL
    // =========================================================

    function showLogoutState(state) {
        logoutConfirmState.style.display =
            state === 'confirm' ? 'flex' : 'none';

        logoutLoadingState.style.display =
            state === 'loading' ? 'flex' : 'none';

        logoutErrorState.style.display =
            state === 'error' ? 'flex' : 'none';
    }

    // =========================================================
    // 4. MEMBUKA DAN MENUTUP MODAL
    // =========================================================

    logoutBtn.addEventListener('click', (event) => {
        event.preventDefault();

        if (loggingOut) return;

        showLogoutState('confirm');
        logoutOverlay.classList.add('active');
    });

    function closeLogoutModal() {
        if (loggingOut) return;
        logoutOverlay.classList.remove('active');
    }

    if (cancelLogout) {
        cancelLogout.addEventListener('click', closeLogoutModal);
    }

    logoutOverlay.addEventListener('click', (event) => {
        if (event.target !== logoutOverlay) return;

        if (
            loggingOut ||
            logoutOverlay.classList.contains('logout-success-active')
        ) {
            return;
        }

        const isConfirmVisible =
            logoutConfirmState?.style.display === 'flex';

        const isErrorVisible =
            logoutErrorState?.style.display === 'flex';

        if (isConfirmVisible || isErrorVisible) {
            closeLogoutModal();
        }
    });

    // =========================================================
    // 5. PROSES LOGOUT
    // =========================================================

    async function performLogout() {
        if (loggingOut) return;

        loggingOut = true;
        showLogoutState('loading');

        const loadingStartTime = Date.now();

        try {
            const result = await apiLogout();

            const elapsedTime = Date.now() - loadingStartTime;

            if (elapsedTime < 1500) {
                await new Promise(resolve => {
                    setTimeout(resolve, 1500 - elapsedTime);
                });
            }

            if (!result.ok) {
                throw new Error(result.message || 'Logout gagal');
            }

            // Hapus data pengguna di browser
            if (typeof clearUserSession === 'function') {
                clearUserSession();
            } else {
                localStorage.removeItem('user');
            }

            // Kirim sinyal logout ke tab lain
            localStorage.setItem(
                'logout-event',
                `${Date.now()}-${Math.random()}`
            );

            sessionStorage.removeItem('dashboardReturnPage');

            showLogoutState('');

            logoutOverlay.classList.add('active');
            logoutOverlay.classList.add('logout-success-active');

            if (logoutSuccessToast) {
                logoutSuccessToast.style.display = 'flex';
            }

            setTimeout(() => {
                if (logoutSuccessToast) {
                    logoutSuccessToast.style.display = 'none';
                }

                window.location.replace('login.html');
            }, 2000);

        } catch (error) {
            console.error('Logout error:', error);
            showLogoutState('error');

        } finally {
            loggingOut = false;
        }
    }

    // =========================================================
    // 6. EVENT TOMBOL
    // =========================================================

    if (confirmLogout) {
        confirmLogout.addEventListener('click', performLogout);
    }

    if (retryLogout) {
        retryLogout.addEventListener('click', performLogout);
    }

});
