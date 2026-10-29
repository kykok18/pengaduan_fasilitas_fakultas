document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // 0. AUTH GUARD (Cek Login)
    // =========================================================
    const userSession = localStorage.getItem('user');
    if (!userSession) {
        window.location.replace('login.html');
        return;
    }

    let currentUser = null;
    try {
        currentUser = JSON.parse(userSession);
    } catch (e) {
        localStorage.removeItem('user');
        window.location.replace('login.html');
        return;
    }

    if (!currentUser || !currentUser.nama) {
         window.location.replace('login.html');
         return;
    }

    // --- 1. Set Nama Dinamis ---
    const welcomeText = document.getElementById('welcomeText');
    const userInitial = document.getElementById('userInitial');
    if (welcomeText) welcomeText.textContent = `Halo, ${currentUser.nama}!`;
    if (userInitial) userInitial.textContent = currentUser.nama.charAt(0).toUpperCase();

    // --- 2. Sidebar & Dropdown ---
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    
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

    // =========================================================
    // 4. LOGIKA DATA PENGGUNAAN & RENDER
    // =========================================================
    const reportsContainer = document.getElementById('reportsContainer');
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const emptyState = document.getElementById('emptyState');
    const btnRetry = document.getElementById('btnRetry');

    // Simulasi data (Nanti ganti dengan response.data dari API)
    const dummyData = [
        {
            id: 1,
            judul: "AC Tidak Dingin",
            kategori: "AC",
            lokasi: "Ruang 202, Lantai 2",
            tanggal: "30 September 2026",
            status: "Diproses",
            image: "https://images.unsplash.com/photo-1595113316349-9fa4eb24f884?auto=format&fit=crop&w=400&q=80",
            like: 20, dislike: 1, comment: 5
        },
        {
            id: 2,
            judul: "Jaringan Lambat",
            kategori: "Wi-Fi",
            lokasi: "Ruang 404, Lantai 4",
            tanggal: "2 September 2026",
            status: "Diproses",
            image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80",
            like: 20, dislike: 0, comment: 0
        },
        {
            id: 3,
            judul: "Karpet Bau",
            kategori: "Mushola",
            lokasi: "Lantai 1",
            tanggal: "14 September 2026",
            status: "Dalam Perbaikan",
            image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=400&q=80",
            like: 15, dislike: 1, comment: 7
        },
        {
            id: 4,
            judul: "Pintu Toilet Rusak",
            kategori: "Toilet",
            lokasi: "Lantai 1",
            tanggal: "20 September 2026",
            status: "Dalam Perbaikan",
            image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80",
            like: 10, dislike: 2, comment: 15
        },
        {
            id: 5,
            judul: "Kursi Rusak",
            kategori: "Ruang Kelas",
            lokasi: "Ruang 202, Lantai 2",
            tanggal: "15 September 2026",
            status: "Selesai",
            image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80",
            like: 8, dislike: 1, comment: 6
        }
    ];

    let allReports = []; // Data master

    const renderReports = (data) => {
        reportsContainer.innerHTML = '';
        
        if (data.length === 0) {
            reportsContainer.style.display = 'none';
            emptyState.classList.add('active');
            return;
        }

        emptyState.classList.remove('active');
        reportsContainer.style.display = 'flex';

        data.forEach(item => {
            // Tentukan class status
            let statusClass = 'status-proses';
            if (item.status === 'Dalam Perbaikan') statusClass = 'status-perbaikan';
            if (item.status === 'Selesai') statusClass = 'status-selesai';

            const card = document.createElement('div');
            card.className = 'report-card-dash';
            card.innerHTML = `
                <div class="report-image">
                    <img src="${item.image}" alt="${item.judul}">
                    <span class="badge-category">${item.kategori}</span>
                </div>
                <div class="report-content">
                    <div class="report-content-header">
                        <h4>${item.judul}</h4>
                        <span class="badge-status ${statusClass}">${item.status}</span>
                    </div>
                    <div class="report-meta">
                        <span><i class="fas fa-map-marker-alt" style="color: #0B5E3B;"></i> ${item.lokasi}</span>
                        <span><i class="fas fa-calendar-alt" style="color: #0B5E3B;"></i> ${item.tanggal}</span>
                    </div>
                    <div class="report-footer">
                        <div class="report-actions">
                            <span><i class="fas fa-thumbs-up"></i> ${item.like}</span>
                            <span><i class="fas fa-thumbs-down"></i> ${item.dislike}</span>
                            <span><i class="fas fa-comment"></i> ${item.comment}</span>
                        </div>
                    </div>
                </div>
            `;
            reportsContainer.appendChild(card);
        });
    };

    const fetchPengaduanData = async () => {
        loadingState.classList.add('active');
        errorState.classList.remove('active');
        emptyState.classList.remove('active');
        reportsContainer.style.display = 'none';

        try {
            // Simulasi API (ganti dengan panggilan API asli jika backend siap)
            await new Promise(resolve => setTimeout(resolve, 800)); 
            
            allReports = dummyData; // Ganti dengan data asli dari API

            loadingState.classList.remove('active');
            renderReports(allReports);

        } catch (error) {
            loadingState.classList.remove('active');
            errorState.classList.add('active');
        }
    };

    fetchPengaduanData();

    if (btnRetry) {
        btnRetry.addEventListener('click', fetchPengaduanData);
    }

    // =========================================================
    // 5. FILTER CHIPS & SEARCH
    // =========================================================
    const chips = document.querySelectorAll('.chip');
    const searchInput = document.getElementById('searchInput');

    let currentFilter = 'semua';
    let currentSearch = '';

    const filterAndSearch = () => {
        let filtered = allReports;

        // Filter Status
        if (currentFilter !== 'semua') {
            filtered = filtered.filter(item => item.status.toLowerCase() === currentFilter);
        }

        // Filter Search
        if (currentSearch) {
            filtered = filtered.filter(item => 
                item.judul.toLowerCase().includes(currentSearch) || 
                item.lokasi.toLowerCase().includes(currentSearch)
            );
        }

        renderReports(filtered);
    };

    // Event Listener Filter
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentFilter = chip.getAttribute('data-filter');
            filterAndSearch();
        });
    });

    // Event Listener Search
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value.toLowerCase();
            filterAndSearch();
        });
    }

});