
/*
 * ==================================================
 * RIWAYAT PENGADUAN — US-10B-FE
 * Mahasiswa / Pegawai
 * ==================================================
 *
 * Endpoint:
 * GET /api/riwayat.php
 *
 * Parameter:
 * - page
 * - limit
 * - search
 * - status
 *
 * Struktur respons:
 * data: {
 *   user,
 *   statistik,
 *   pengaduan,
 *   pagination
 * }
 */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ==========================================
    // 1. ELEMENT HALAMAN
    // ==========================================

    const riwayatList =
        document.getElementById("riwayatList");

    const loadingState =
        document.getElementById("riwayatLoading");

    const emptyState =
        document.getElementById("riwayatEmpty");

    const notFoundState =
        document.getElementById("riwayatNotFound");

    const errorState =
        document.getElementById("riwayatError");

    const searchInput =
        document.getElementById("riwayatSearch");

    const filterButtons =
        document.querySelectorAll(".riwayat-chip");

    const pagination =
        document.getElementById("riwayatPagination");

    const prevBtn =
        document.getElementById("riwayatPrev");

    const nextBtn =
        document.getElementById("riwayatNext");

    const retryBtn =
        document.getElementById("riwayatRetry");

    const totalPengaduan =
        document.getElementById("totalPengaduan");

    const totalDiajukan =
        document.getElementById("totalDiajukan");

    const totalPerbaikan =
        document.getElementById("totalPerbaikan");

    const totalSelesai =
        document.getElementById("totalSelesai");

    const totalDitolak =
        document.getElementById("totalDitolak");

    if (!riwayatList || !loadingState) {
        console.error("Elemen halaman riwayat tidak ditemukan.");
        return;
    }

    // ==========================================
    // 2. KONFIGURASI DAN STATE
    // ==========================================

    const LIMIT = 5;
    const MAX_VISIBLE_PAGES = 4;

    let currentPage = 1;
    let totalPages = 0;

    let currentFilter = "";
    let currentSearch = "";

    let searchTimeout = null;
    let requestController = null;
    let requestSequence = 0;

    const statusMap = {
        "diajukan": {
            label: "Diajukan",
            className: "status-proses"
        },
        "dalam perbaikan": {
            label: "Dalam Perbaikan",
            className: "status-perbaikan"
        },
        "selesai": {
            label: "Selesai",
            className: "status-selesai"
        },
        "ditolak": {
            label: "Ditolak",
            className: "status-ditolak"
        }
    };

    // ==========================================
    // 3. KONFIGURASI ENDPOINT
    // ==========================================

    /*
     * API_BASE_URL diambil dari api.js.
     * Diasumsikan mengarah ke folder /api.
     *
     * Contoh:
     * http://localhost/nama-project/api
     *
     * Bila endpoint sudah didefinisikan khusus,
     * gunakan window.RIWAYAT_API_ENDPOINT.
     */

    const getEndpoint = () => {
        if (window.RIWAYAT_API_ENDPOINT) {
            return String(window.RIWAYAT_API_ENDPOINT);
        }

        const base =
            typeof API_BASE_URL !== "undefined"
                ? String(API_BASE_URL)
                : "";

        if (!base) {
            throw new Error(
                "API_BASE_URL belum dikonfigurasi."
            );
        }

        return `${base.replace(/\/+$/, "")}/riwayat.php`;
    };

    // ==========================================
    // 4. HELPER
    // ==========================================

    const escapeHTML = (value) => {
        return String(value ?? "").replace(
            /[&<>"']/g,
            (character) => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            })[character]
        );
    };

    const formatJumlah = (jumlah) => {
        const angka = Number(jumlah);

        if (!Number.isFinite(angka) || angka < 0) {
            return "0";
        }

        return new Intl.NumberFormat("id-ID")
            .format(angka);
    };

    const formatTanggal = (tanggal) => {
        if (!tanggal) return "-";

        const match = String(tanggal).match(
            /^(\d{4})-(\d{2})-(\d{2})/
        );

        if (!match) return String(tanggal);

        const tahun = Number(match[1]);
        const bulan = Number(match[2]);
        const hari = Number(match[3]);

        const date = new Date(
            Date.UTC(tahun, bulan - 1, hari)
        );

        if (
            date.getUTCFullYear() !== tahun ||
            date.getUTCMonth() !== bulan - 1 ||
            date.getUTCDate() !== hari
        ) {
            return String(tanggal);
        }

        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC"
        }).format(date);
    };

    const getStatusInfo = (status) => {
        const normalized = String(status || "")
            .trim()
            .toLowerCase();

        return statusMap[normalized] || {
            label: status || "Tidak diketahui",
            className: "status-proses"
        };
    };

    // ==========================================
    // 5. URL FOTO PENGADUAN
    // ==========================================

    const getFotoURL = (fotoPath) => {
        if (!fotoPath) return "";

        try {
            const path = String(fotoPath).trim();

            let url;

            if (/^https?:\/\//i.test(path)) {
                url = new URL(path);
            } else {
                const endpoint = new URL(
                    getEndpoint(),
                    document.baseURI
                );

                const backendRoot = new URL(
                    "../",
                    endpoint
                );

                url = new URL(
                    path.replace(/^\/+/, ""),
                    backendRoot
                );
            }

            if (
                url.protocol !== "http:" &&
                url.protocol !== "https:"
            ) {
                return "";
            }

            return url.href;

        } catch (error) {
            console.warn(
                "URL foto pengaduan tidak valid:",
                error
            );

            return "";
        }
    };

    // ==========================================
    // 6. TAMPILKAN STATE HALAMAN
    // ==========================================

    const showState = (state) => {
        const states = {
            loading: loadingState,
            empty: emptyState,
            notFound: notFoundState,
            error: errorState,
            success: riwayatList
        };

        Object.entries(states).forEach(
            ([key, element]) => {
                if (element) {
                    element.hidden = key !== state;
                }
            }
        );

        if (pagination) {
            pagination.hidden =
                state !== "success" ||
                totalPages <= 1;
        }
    };

    // ==========================================
    // 7. STATISTIK PENGADUAN
    // ==========================================

    /*
     * Statistik berasal langsung dari backend.
     * Bukan dihitung dari data halaman aktif.
     */

    const setRingkasan = (statistik) => {
        const data = statistik || {};

        const values = [
            [totalPengaduan, data.total_pengaduan],
            [totalDiajukan, data.diajukan],
            [totalPerbaikan, data.dalam_perbaikan],
            [totalSelesai, data.selesai],
            [totalDitolak, data.ditolak]
        ];

        values.forEach(([element, value]) => {
            if (element) {
                element.textContent =
                    value == null
                        ? "0"
                        : formatJumlah(value);
            }
        });
    };

    // ==========================================
    // 8. RENDER CARD RIWAYAT
    // ==========================================

    const renderRiwayat = (data) => {
        riwayatList.replaceChildren();

        const fragment =
            document.createDocumentFragment();

        data.forEach((item) => {
            const statusInfo =
                getStatusInfo(item.status);

            const idPengaduan =
                Number(item.id_pengaduan);

            const validId =
                Number.isSafeInteger(idPengaduan) &&
                idPengaduan > 0;

            const card = document.createElement(
                validId ? "a" : "div"
            );

            card.className =
                "report-card-dash riwayat-card";

            // Navigasi ke US-07
            if (validId) {
                
card.href =
    `detail-pengaduan.html?id_pengaduan=${encodeURIComponent(idPengaduan)}&from=riwayat`;


                card.setAttribute(
                    "aria-label",
                    `Lihat detail pengaduan: ${String(item.judul || "Tanpa judul")}`
                );
            }

            card.innerHTML = `
                <div class="report-image">

                    <img
                        alt="Bukti foto pengaduan"
                        loading="lazy"
                    >

                    <span class="badge-category">
                        ${escapeHTML(
                            item.nama_fasilitas || "Fasilitas"
                        )}
                    </span>

                </div>

                <div class="report-content">

                    <div class="report-content-header">

                        <h4>
                            ${escapeHTML(
                                item.judul || "Tanpa judul"
                            )}
                        </h4>

                        <span class="badge-status ${statusInfo.className}">
                            ${escapeHTML(statusInfo.label)}
                        </span>

                    </div>

                    <div class="report-meta">

                        <span>
                            <i
                                class="fas fa-map-marker-alt"
                                aria-hidden="true">
                            </i>

                            <span class="report-location-text">
                                ${escapeHTML(
                                    item.lokasi || "-"
                                )}
                            </span>
                        </span>

                        <span>
                            <i
                                class="fas fa-calendar-alt"
                                aria-hidden="true">
                            </i>

                            <span class="report-date-text">
                                ${escapeHTML(
                                    formatTanggal(item.created_at)
                                )}
                            </span>
                        </span>

                    </div>

                    <div class="report-footer">

                        <div class="report-actions">

                            <span>
                                <i
                                    class="fas fa-thumbs-up"
                                    aria-hidden="true">
                                </i>
                                ${formatJumlah(item.upvote_count)}
                            </span>

                            <span>
                                <i
                                    class="fas fa-thumbs-down"
                                    aria-hidden="true">
                                </i>
                                ${formatJumlah(item.downvote_count)}
                            </span>

                            <span>
                                <i
                                    class="fas fa-comment"
                                    aria-hidden="true">
                                </i>
                                ${formatJumlah(item.comment_count)}
                            </span>

                        </div>

                    </div>

                </div>
            `;

            // Foto pengaduan dan fallback
            const img = card.querySelector(
                ".report-image img"
            );

            const placeholderURL = new URL(
                "img/foto-placeholder.png",
                document.baseURI
            ).href;

            img.addEventListener("error", () => {
                if (img.src !== placeholderURL) {
                    img.src = placeholderURL;
                }
            });

            img.src =
                getFotoURL(item.foto) ||
                placeholderURL;

            fragment.appendChild(card);
        });

        riwayatList.appendChild(fragment);
    };

    // ==========================================
    // 9. PAGINATION
    // ==========================================

    const renderPagination = () => {
        if (!pagination || !prevBtn || !nextBtn) {
            return;
        }

        pagination
            .querySelectorAll("[data-riwayat-page]")
            .forEach((element) => element.remove());

        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= totalPages;

        if (totalPages <= 1) return;

        const first = Math.max(
            1,
            Math.min(
                currentPage - 1,
                totalPages - MAX_VISIBLE_PAGES + 1
            )
        );

        const last = Math.min(
            totalPages,
            first + MAX_VISIBLE_PAGES - 1
        );

        const addPage = (
            label,
            page = null,
            active = false
        ) => {
            const element = document.createElement(
                page === null ? "span" : "button"
            );

            element.dataset.riwayatPage = "true";
            element.textContent = label;

            if (page === null) {
                element.className = "page-dots";
            } else {
                element.type = "button";

                element.className =
                    `page-btn${active ? " active" : ""}`;

                element.setAttribute(
                    "aria-label",
                    `Halaman ${page}`
                );

                if (active) {
                    element.setAttribute(
                        "aria-current",
                        "page"
                    );
                }

                element.addEventListener(
                    "click",
                    () => goToPage(page)
                );
            }

            pagination.insertBefore(
                element,
                nextBtn
            );
        };

        if (first > 1) {
            addPage("1", 1);

            if (first > 2) {
                addPage("…");
            }
        }

        for (
            let page = first;
            page <= last;
            page++
        ) {
            addPage(
                String(page),
                page,
                page === currentPage
            );
        }

        if (last < totalPages) {
            if (last < totalPages - 1) {
                addPage("…");
            }

            addPage(
                String(totalPages),
                totalPages
            );
        }
    };

    // ==========================================
    // 10. HAPUS DATA TERLINDUNGI
    // ==========================================

    const clearProtectedDisplay = () => {
        riwayatList.replaceChildren();

        totalPages = 0;

        setRingkasan(null);

        showState("loading");
    };

    // ==========================================
    // 11. SESI TIDAK VALID
    // ==========================================

    const redirectToLogin = () => {
        clearProtectedDisplay();

        if (
            typeof clearUserSession === "function"
        ) {
            clearUserSession();
        }

        window.location.replace("login.html");
    };


// ==========================================
// SIDEBAR — SAMA DENGAN DETAIL PENGADUAN
// ==========================================

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

if (menuToggle && sidebar && sidebarOverlay) {

    const closeSidebar = () => {
        sidebar.classList.remove("active");
        sidebarOverlay.classList.remove("active");

        menuToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
    };

    const openSidebar = () => {
        sidebar.classList.add("active");
        sidebarOverlay.classList.add("active");

        menuToggle.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden";
    };

    menuToggle.addEventListener("click", () => {
        if (sidebar.classList.contains("active")) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    sidebarOverlay.addEventListener("click", closeSidebar);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeSidebar();
        }
    });
}

    // ==========================================
    // 12. FETCH RIWAYAT DARI BACKEND
    // ==========================================

    const fetchRiwayat = async () => {
        // Batalkan request sebelumnya
        if (requestController) {
            requestController.abort();
        }

        const controller = new AbortController();

        requestController = controller;

        const sequence = ++requestSequence;

        clearProtectedDisplay();

        try {
            const endpoint = new URL(
                getEndpoint(),
                document.baseURI
            );

            endpoint.searchParams.set(
                "page",
                String(currentPage)
            );

            endpoint.searchParams.set(
                "limit",
                String(LIMIT)
            );

            if (currentSearch) {
                endpoint.searchParams.set(
                    "search",
                    currentSearch
                );
            }

            if (currentFilter) {
                endpoint.searchParams.set(
                    "status",
                    currentFilter
                );
            }

            const response = await fetch(
                endpoint.href,
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                    headers: {
                        "Accept": "application/json"
                    },
                    signal: controller.signal
                }
            );

            if (sequence !== requestSequence) {
                return;
            }

            // Session invalid
            if (
                response.status === 401 ||
                response.status === 403
            ) {
                redirectToLogin();
                return;
            }

            let result;

            try {
                result = await response.json();
            } catch {
                throw new Error(
                    "Server tidak mengembalikan JSON valid."
                );
            }

            if (sequence !== requestSequence) {
                return;
            }

            // Error dari backend
            if (
                !response.ok ||
                result.status === "error" ||
                result.success === false
            ) {
                throw new Error(
                    result.message ||
                    `Gagal mengambil riwayat. HTTP ${response.status}`
                );
            }

            const data = result.data;

            // Validasi struktur respons terbaru
            if (
                !data ||
                !Array.isArray(data.pengaduan) ||
                !data.pagination ||
                !data.statistik
            ) {
                throw new Error(
                    "Struktur respons riwayat tidak sesuai."
                );
            }

            const pages = Number(
                data.pagination.total_pages
            );

            if (
                !Number.isSafeInteger(pages) ||
                pages < 0
            ) {
                throw new Error(
                    "Metadata pagination tidak valid."
                );
            }

            // Halaman melebihi jumlah halaman backend
            if (
                pages > 0 &&
                currentPage > pages
            ) {
                currentPage = pages;
                fetchRiwayat();
                return;
            }

            totalPages = pages;

            // Statistik asli dari backend
            setRingkasan(data.statistik);

            // Riwayat kosong
            if (data.pengaduan.length === 0) {
                const hasQuery = Boolean(
                    currentSearch || currentFilter
                );

                showState(
                    hasQuery ? "notFound" : "empty"
                );

                return;
            }

            // Tampilkan data
            renderRiwayat(data.pengaduan);

            renderPagination();

            showState("success");

        } catch (error) {
            if (
                controller.signal.aborted ||
                sequence !== requestSequence
            ) {
                return;
            }

            console.error(
                "Gagal memuat riwayat pengaduan:",
                error
            );

            const description =
                errorState?.querySelector("p");

            if (description) {
                description.textContent =
                    "Riwayat pengaduan gagal dimuat. " +
                    "Periksa koneksi atau server, " +
                    "kemudian coba kembali.";
            }

            showState("error");

        } finally {
            if (requestController === controller) {
                requestController = null;
            }
        }
    };

    // ==========================================
    // 13. NAVIGASI HALAMAN
    // ==========================================

    function goToPage(page) {
        if (
            !Number.isSafeInteger(page) ||
            page < 1 ||
            page > totalPages ||
            page === currentPage
        ) {
            return;
        }

        currentPage = page;

        fetchRiwayat();
    }

    // ==========================================
    // 14. FILTER STATUS
    // ==========================================

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const selected =
                button.dataset.filter === "semua"
                    ? ""
                    : button.dataset.filter;

            if (selected === currentFilter) {
                return;
            }

            currentFilter = selected;
            currentPage = 1;

            filterButtons.forEach((chip) => {
                const active = chip === button;

                chip.classList.toggle(
                    "active",
                    active
                );

                chip.setAttribute(
                    "aria-pressed",
                    String(active)
                );
            });

            fetchRiwayat();
        });
    });

    // ==========================================
    // 15. PENCARIAN
    // ==========================================

    searchInput?.addEventListener(
        "input",
        () => {
            clearTimeout(searchTimeout);

            const search =
                searchInput.value.trim();

            searchTimeout = setTimeout(() => {
                if (currentSearch === search) {
                    return;
                }

                currentSearch = search;
                currentPage = 1;

                fetchRiwayat();
            }, 400);
        }
    );

    // ==========================================
    // 16. TOMBOL PAGINATION
    // ==========================================

    prevBtn?.addEventListener(
        "click",
        () => goToPage(currentPage - 1)
    );

    nextBtn?.addEventListener(
        "click",
        () => goToPage(currentPage + 1)
    );

    // ==========================================
    // 17. COBA LAGI
    // ==========================================

    retryBtn?.addEventListener(
        "click",
        fetchRiwayat
    );

    // Batalkan request ketika meninggalkan halaman
    window.addEventListener("pagehide", () => {
        requestController?.abort();
    });


// ==========================================
// OFFLINE SUPPORT — US-10B-FE
// ==========================================

window.addEventListener("fitk:offline", () => {

    // Batalkan request API yang sedang berlangsung.
    if (requestController) {
        requestController.abort();
        requestController = null;
    }

    // Cegah response request lama tampil
    // setelah halaman beralih ke offline.
    requestSequence++;

    // Jangan tampilkan data pengaduan lama.
    clearProtectedDisplay();

    // Sesuaikan pesan error dengan kondisi offline.
    const description = errorState?.querySelector("p");

    if (description) {
        description.textContent =
            "Terjadi kesalahan saat memuat riwayat  " +
            "pengaduan. Periksa koneksi internet Anda " +
            "dan coba lagi.";
    }

    // Gunakan state error yang sudah ada.
    showState("error");
});

window.addEventListener("fitk:online", () => {

    // Jangan memuat data secara otomatis.
    // Pengguna tetap menekan tombol Coba Lagi.
    // Ini mempertahankan mekanisme US-10B-FE.

});


    // ==========================================
    // 18. KONDISI AWAL
    // ==========================================

    fetchRiwayat();

});
