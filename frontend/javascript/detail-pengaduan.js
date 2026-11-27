
/*
 * Detail Pengaduan — file utama
 * Voting dan komentar berada di file terpisah.
 */

// Tunggu sampai HTML siap supaya pencarian elemen (ID/class) tidak gagal.
document.addEventListener("DOMContentLoaded", () => {

    // ==================================================
    // 1. MENGAMBIL ELEMEN HTML
    // ==================================================

    const stateBox = document.getElementById("detailState"); // wadah tampilan loading/error
    const stateIcon = document.getElementById("detailStateIcon"); // ikon untuk loading/error
    const stateTitle = document.getElementById("detailStateTitle"); // judul pesan kondisi halaman
    const stateDesc = document.getElementById("detailStateDesc"); // deskripsi pesan kondisi halaman
    const retryBtn = document.getElementById("detailRetryBtn"); // tombol Coba Lagi

    const detailContent = document.getElementById("detailContent"); // isi detail pengaduan
    const commentsCard = document.getElementById("detailCommentsCard"); // kartu/area komentar
    const detailCard = document.querySelector(".detail-card"); // kartu utama pengaduan

    const detailImage = document.getElementById("detailImage"); // elemen gambar pengaduan
    const imageFallback = document.getElementById("detailImageFallback"); // pengganti jika gambar tidak ada

    const detailCategory = document.getElementById("detailCategory"); // label kategori fasilitas
    const detailStatus = document.getElementById("detailStatus"); // label status pengaduan
    const detailTitle = document.getElementById("detailTitle"); // judul pengaduan
    const detailLocation = document.getElementById("detailLocation"); // lokasi fasilitas
    const detailDate = document.getElementById("detailDate"); // tanggal pengaduan
    const detailDescription = document.getElementById("detailDescription"); // deskripsi masalah

    const detailLikes = document.getElementById("detailLikes"); // angka upvote
    const detailDislikes = document.getElementById("detailDislikes"); // angka downvote

    const commentsList = document.getElementById("detailCommentsList"); // tempat daftar komentar
    const commentsTitle = document.getElementById("detailCommentsTitle"); // judul dan jumlah komentar
    const avatarLetter = document.getElementById("detailAvatarLetter"); // huruf avatar akun


    // ==================================================
    // 2. SIDEBAR
    // ==================================================

    const menuToggle = document.getElementById("menuToggle"); // tombol hamburger
    const sidebar = document.getElementById("sidebar"); // menu samping
    const sidebarOverlay = document.getElementById("sidebarOverlay"); // lapisan gelap saat menu terbuka

    // Jalankan fungsi sidebar hanya jika ketiga elemennya memang ada.
    if (menuToggle && sidebar && sidebarOverlay) {

        // Fungsi ini menutup menu samping.
        const closeSidebar = () => {
            sidebar.classList.remove("active");
            sidebarOverlay.classList.remove("active");

            menuToggle.setAttribute("aria-expanded", "false");
            document.body.style.overflow = "";
        };

        // Saat hamburger diklik, tampilkan sidebar dan overlay.
        menuToggle.addEventListener("click", () => {
            sidebar.classList.add("active");
            sidebarOverlay.classList.add("active");

            menuToggle.setAttribute("aria-expanded", "true");
            document.body.style.overflow = "hidden";
        });

        // Klik area gelap di luar sidebar untuk menutup menu.
        sidebarOverlay.addEventListener("click", closeSidebar);

        // Tutup juga sidebar saat tombol Escape ditekan.
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeSidebar();
            }
        });
    }


    // ==================================================
    // 3. KONFIGURASI API & NAVIGASI
    // ==================================================

    const DETAIL_ENDPOINT = "detail_pengaduan.php"; // endpoint PHP yang menyediakan data detail
    const DETAIL_ID_PARAM = "id_pengaduan"; // nama parameter ID yang dikirim ke backend

    const params = new URLSearchParams(window.location.search); // membaca parameter URL

    const idPengaduan = params.get("id_pengaduan"); // ID pengaduan yang sedang dibuka
    const fromRiwayat = params.get("from") === "riwayat"; // apakah halaman dibuka dari Riwayat

    const detailBackLink = document.getElementById("detailBackLink"); // tautan tombol Kembali
    const detailBackText = document.getElementById("detailBackText"); // teks tombol Kembali

    if (detailBackLink && detailBackText) {

        // Tombol Kembali menyesuaikan dari mana pengguna datang.
        if (fromRiwayat) {
            detailBackLink.href = "riwayat-pengaduan.html";
            detailBackText.textContent =
                "Kembali ke Riwayat Pengaduan";
        } else {
            detailBackLink.href = "dashboard.html";
            detailBackText.textContent = "Kembali ke Dashboard";
        }
    }

    // Jika dari Riwayat gunakan riwayat.php, jika dari Dashboard gunakan detail_pengaduan.php.
    const activeDetailEndpoint = fromRiwayat
        ? "riwayat.php"
        : DETAIL_ENDPOINT;

    let activeController = null; // menyimpan request aktif agar bisa dibatalkan


    // ==================================================
    // 4. INFORMASI PENGGUNA
    // ==================================================

    try {

        // Pastikan fungsi pembaca sesi tersedia dari api.js sebelum digunakan.
        if (typeof getUserSession === "function") {
            const user = getUserSession(); // membaca informasi sesi pengguna

            if (user && user.nama) {

                // Buat avatar huruf dari karakter pertama nama pengguna.
                avatarLetter.textContent = user.nama
                    .trim()
                    .charAt(0)
                    .toUpperCase();
            }
        }
    } catch (error) {
        console.error("Gagal membaca data pengguna:", error); // catat error untuk developer di Console
    }


    // ==================================================
    // 5. MENGOSONGKAN DATA DETAIL
    // ==================================================

    // Kosongkan data lama supaya tidak tercampur dengan pengaduan baru.
    const clearDetail = () => {
        detailContent.hidden = true; // sembunyikan detail lama
        commentsCard.hidden = true; // sembunyikan komentar lama

        detailImage.hidden = true; // sementara sembunyikan foto
        detailImage.onload = null; // hapus penanganan foto berhasil sebelumnya
        detailImage.onerror = null; // hapus penanganan foto gagal sebelumnya
        detailImage.removeAttribute("src"); // hapus alamat foto lama

        imageFallback.hidden = true; // sembunyikan gambar pengganti

        detailCategory.textContent = ""; // kosongkan kategori
        detailStatus.textContent = ""; // kosongkan status
        detailStatus.removeAttribute("data-status"); // hapus atribut warna status sebelumnya

        detailTitle.textContent = ""; // kosongkan judul
        detailLocation.textContent = ""; // kosongkan lokasi
        detailDate.textContent = ""; // kosongkan tanggal
        detailDescription.textContent = ""; // kosongkan deskripsi

        detailLikes.textContent = "0"; // reset angka upvote di layar
        detailDislikes.textContent = "0"; // reset angka downvote di layar

        commentsList.replaceChildren(); // hapus komentar yang sudah tampil
        commentsTitle.textContent = "Komentar(0)"; // reset jumlah komentar
    };


    // ==================================================
    // 6. TAMPILAN LOADING / ERROR
    // ==================================================

    // Atur tampilan ketika halaman sedang loading atau gagal.
    const showState = (type, title, description) => {
        clearDetail();

        detailCard.classList.add("is-state"); // aktifkan gaya tampilan loading/error
        commentsCard.classList.add("is-state-placeholder"); // tampilkan card komentar sebagai placeholder
        commentsCard.hidden = false; // tampilkan card komentar

        stateBox.hidden = false; // tampilkan pesan kondisi halaman

        stateTitle.textContent = title; // isi judul pesan
        stateDesc.textContent = description; // isi deskripsi pesan

        stateIcon.className = "detail-state-icon"; // reset class ikon
        stateIcon.replaceChildren(); // kosongkan ikon sebelumnya

        retryBtn.hidden = true; // awalannya sembunyikan tombol Coba Lagi

        // Saat memuat, tambahkan ikon spinner.
        if (type === "loading") {
            const spinner = document.createElement("div");
            spinner.className = "detail-spinner"; // CSS akan membuat animasi putar

            stateIcon.appendChild(spinner); // pasang animasi loading ke halaman
        }

        // Jika terjadi error umum, tampilkan ikon merah dan tombol Coba Lagi.
        if (type === "error") {
            stateIcon.classList.add("is-error"); // gunakan gaya ikon error
            retryBtn.hidden = false; // tampilkan tombol Coba Lagi

            // Kode SVG di bawah hanya menggambar ikon; bukan request API.
            stateIcon.innerHTML = `
                <svg
                    width="91"
                    height="94"
                    viewBox="0 0 91 94"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <mask id="stroke0_3523_2976" fill="white">
                        <path d="M91 47C91 72.9574 70.629 94 45.5 94C20.371 94 0 72.9574 0 47C0 21.0426 20.371 0 45.5 0C70.629 0 91 21.0426 91 47Z"/>
                    </mask>

                    <ellipse
                        cx="45.5"
                        cy="47"
                        rx="45.5"
                        ry="47"
                        stroke-width="2"
                        stroke="#D02316"
                        mask="url(#stroke0_3523_2976)"
                    />

                    <path
                        d="M73.5 47C73.5 62.464 60.964 75 45.5 75C30.036 75 17.5 62.464 17.5 47C17.5 31.536 30.036 19 45.5 19C60.964 19 73.5 31.536 73.5 47Z"
                        stroke-width="2"
                        stroke="#D02316"
                    />

                    <path
                        d="M45.5 33V49.8M45.5 59.6V61"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke="#D02316"
                    />
                </svg>
            `;
        }

        if (type === "not-found") {
            stateIcon.classList.add("is-not-found"); // gunakan gaya data tidak ditemukan
        }

        if (type === "forbidden") {
            stateIcon.classList.add("is-forbidden"); // gunakan gaya akses ditolak
        }
    };

    // Pesan yang ditampilkan selama menunggu data.
    const showLoading = () => {
        showState(
            "loading",
            "Loading...",
            "Mohon tunggu sebentar, detail pengaduan sedang dimuat."
        );
    };

    // Pesan gagal memuat dari pesan server atau pesan standar.
    const showError = (message) => {
        showState(
            "error",
            "Gagal Memuat Pengaduan",
            message ||
                "Terjadi kesalahan saat memuat<br>detail pengaduan. Periksa koneksi internet Anda<br>dan coba lagi."
        );
    };

    // Pesan untuk ID pengaduan yang tidak ada.
    const showNotFound = () => {
        showState(
            "not-found",
            "Pengaduan Tidak Ditemukan",
            "Pengaduan yang Anda akses tidak ditemukan atau sudah tidak tersedia dalam sistem."
        );

        // Kode SVG di bawah hanya menggambar ikon; bukan request API.
        stateIcon.innerHTML = `
            <svg
                width="91"
                height="94"
                viewBox="0 0 91 94"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <mask id="stroke0_3235_4218" fill="white">
                    <path d="M91 47C91 72.9574 70.629 94 45.5 94C20.371 94 0 72.9574 0 47C0 21.0426 20.371 0 45.5 0C70.629 0 91 21.0426 91 47Z"/>
                </mask>

                <ellipse
                    cx="45.5"
                    cy="47"
                    rx="45.5"
                    ry="47"
                    stroke-width="2"
                    stroke="#0B5E3B"
                    mask="url(#stroke0_3235_4218)"
                />

                <path
                    d="M62.6311 60.6089L52.3106 51.4654C54.3734 49.2824 55.5016 46.5253 55.4969 43.6785C55.4969 36.9619 49.3276 31.5 41.7485 31.5C34.1693 31.5 28 36.9619 28 43.6785C28 50.3951 34.1693 55.857 41.7485 55.857C44.9631 55.8589 48.076 54.8593 50.5425 53.0331L60.8647 62.1766C61.0998 62.3837 61.4179 62.5 61.7496 62.5C62.0812 62.5 62.3993 62.3837 62.6345 62.1766C62.8685 61.969 63 61.6876 63 61.3942C63 61.1008 62.8685 60.8194 62.6345 60.6118L62.6311 60.6089ZM41.7485 53.6428C38.7665 53.6388 35.9079 52.5878 33.7993 50.72C31.6907 48.8522 30.5041 46.32 30.4997 43.6785C30.5041 41.037 31.6907 38.5049 33.7993 36.637C35.9079 34.7692 38.7665 33.7182 41.7485 33.7143C44.7305 33.7182 47.5891 34.7692 49.6977 36.637C51.8063 38.5049 52.9928 41.037 52.9972 43.6785C52.9928 46.32 51.8063 48.8522 49.6977 50.72C47.5891 52.5878 44.7305 53.6388 41.7485 53.6428Z"
                    fill="#0B5E3B"
                />
            </svg>
        `;
    };

    // Pesan ketika backend menolak izin akses.
    const showForbidden = () => {
        showState(
            "forbidden",
            "Akses Ditolak",
            "Anda tidak memiliki izin untuk melihat pengaduan ini."
        );
    };


    // ==================================================
    // 7. FORMAT JUMLAH DAN TANGGAL
    // ==================================================

    // Ringkas angka besar: misalnya 1500 menjadi 1.5K.
    const formatJumlah = (jumlah) => {
        const angka = Number(jumlah) || 0; // ubah nilai menjadi angka

        if (angka >= 10000) {
            return `${Math.floor(angka / 1000)}K`;
        }

        if (angka >= 1000) {
            return `${Math.floor(angka / 100) / 10}K`;
        }

        return String(angka);
    };

    // Ubah tanggal agar terbaca dengan format Indonesia.
    const formatTanggal = (value) => {
        if (!value) return "-"; // jika tanggal kosong, tampilkan tanda -

        const normalized = String(value).replace(" ", "T"); // sesuaikan format tanggal dari backend
        const date = new Date(normalized); // ubah teks menjadi objek tanggal

        if (Number.isNaN(date.getTime())) {
            return String(value); // jika tanggal tidak valid, tampilkan aslinya
        }

        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(date);
    };


    // ==================================================
    // 8. HUBUNGKAN MODUL VOTING DAN KOMENTAR
    // ==================================================

    // Hubungkan file utama ke modul upvote/downvote.
    const voting = window.FITKDetailVote.create({
        detailLikes,
        detailDislikes,
        formatJumlah,
        idPengaduan,
        loadDetail: () => loadDetail()
    });

    // Hubungkan file utama ke modul komentar.
    const komentarModul = window.FITKDetailKomentar.create({
        commentsList,
        commentsTitle,
        commentsCard,
        formatJumlah,
        formatTanggal: (tanggal) => formatTanggal(tanggal),
        idPengaduan
    });

    const renderKomentar = komentarModul.renderKomentar; // ambil fungsi untuk menampilkan daftar komentar


    
    // ==================================================
    // 9. MENAMPILKAN FOTO PENGADUAN
    // ==================================================

    // Menampilkan foto pengaduan dari folder uploads.
    const renderFoto = (fotoUrl) => {

        // Menghapus pengaturan foto sebelumnya.
        detailImage.onload = null;
        detailImage.onerror = null;
        detailImage.removeAttribute("src");

        // Sembunyikan foto dan tampilkan fallback sementara.
        detailImage.hidden = true;
        imageFallback.hidden = false;

        // Jika backend tidak memberikan foto, hentikan proses.
        if (!fotoUrl || typeof fotoUrl !== "string") {
            return;
        }

        try {
            // Mengambil alamat folder utama proyek dari API_BASE_URL.
            // Contoh:
            // http://localhost/pengaduan_fasilitas_fakultas/
            const projectRoot = new URL(
                API_BASE_URL.replace(/\/backend\/api\/?$/, "/")
            );

            // Membentuk URL foto berdasarkan folder utama proyek.
            let url = new URL(fotoUrl, projectRoot);

            // Lokasi lama yang salah:
            // backend/uploads/pengaduan/
            const wrongPath = new URL(
                "backend/uploads/",
                projectRoot
            ).pathname;

            // Lokasi yang benar:
            // uploads/pengaduan/
            const correctPath = new URL(
                "uploads/",
                projectRoot
            ).pathname;

            // Jika backend mengirim URL dengan folder backend/uploads,
            // arahkan ke uploads yang berada di folder utama proyek.
            if (
                url.origin === projectRoot.origin &&
                url.pathname.startsWith(wrongPath)
            ) {
                url.pathname =
                    correctPath +
                    url.pathname.slice(wrongPath.length);
            }

            // Hanya izinkan URL HTTP atau HTTPS.
            if (!["http:", "https:"].includes(url.protocol)) {
                return;
            }

            // Jika foto berhasil dimuat, tampilkan gambar.
            detailImage.onload = () => {
                detailImage.hidden = false;
                imageFallback.hidden = true;
            };

            // Jika foto gagal dimuat, tampilkan fallback.
            detailImage.onerror = () => {
                detailImage.hidden = true;
                imageFallback.hidden = false;
            };

            // Memasukkan alamat gambar ke elemen HTML.
            detailImage.src = url.href;

        } catch (error) {
            console.error("URL foto tidak valid:", error);
        }
    };



    // ==================================================
    // 10. MENAMPILKAN DETAIL PENGADUAN
    // ==================================================

    // Fungsi ini MENGISI TAMPILAN dari data yang sudah diterima.
    const renderDetail = (data) => {
        const pengaduan = data.pengaduan; // data utama pengaduan dari backend
        const vote = data.vote || {}; // data upvote/downvote; default objek kosong
        const komentar = data.komentar || []; // daftar komentar; default array kosong

        detailCard.classList.remove("is-state"); // keluar dari mode loading/error
        commentsCard.classList.remove("is-state-placeholder"); // keluar dari mode placeholder

        stateBox.hidden = true; // sembunyikan pesan loading/error
        detailContent.hidden = false; // tampilkan data detail
        commentsCard.hidden = false; // tampilkan card komentar

        detailCategory.textContent =
            pengaduan.nama_fasilitas || "-";

        
        const status = String(pengaduan.status || "-").trim();

        // Menampilkan status dengan huruf kapital yang sesuai.
        detailStatus.textContent =
            status.toLowerCase() === "dalam perbaikan"
                ? "Dalam Perbaikan"
                : status.charAt(0).toUpperCase() +
                status.slice(1).toLowerCase();

        // Tetap menggunakan status asli untuk warna badge CSS.
        detailStatus.dataset.status = status.toLowerCase();


        detailTitle.textContent = pengaduan.judul || "-"; // tampilkan judul
        detailLocation.textContent = pengaduan.lokasi || "-"; // tampilkan lokasi

        detailDate.textContent = formatTanggal(
            pengaduan.created_at
        );

        detailDescription.textContent =
            pengaduan.deskripsi || "-";

        // Voting ditampilkan melalui modul vote
        const paramsPreview =
            new URLSearchParams(window.location.search);

        // Mode preview hanya berlaku di localhost dengan ?preview=1.
        const isDummyPreview =
            ["localhost", "127.0.0.1"].includes(
                window.location.hostname
            ) &&
            paramsPreview.get("preview") === "1";

        voting.renderFromBackend(vote, isDummyPreview); // kirim data ke modul upvote/downvote

        // Foto tetap menggunakan fungsi utama
        renderFoto(pengaduan.foto); // tampilkan foto pengaduan

        // Komentar ditampilkan melalui modul komentar
        renderKomentar(komentar); // tampilkan komentar

        const commentInput =
            document.getElementById("detailCommentInput");

        const commentSubmit =
            document.getElementById("detailCommentSubmit");

        if (commentInput && commentSubmit) {
            commentInput.disabled = false; // aktifkan kolom komentar
            commentSubmit.disabled = false; // aktifkan tombol kirim komentar
        }
    };


    // ==================================================
    // 11. MENGAMBIL DETAIL DARI BACKEND
    // ==================================================

    // Fungsi ini MENGAMBIL DATA dari backend, bukan menampilkan saja.
    const loadDetail = async () => {

        // Pastikan ID pengaduan ada dan merupakan bilangan bulat positif.
        if (
            !idPengaduan ||
            !/^[1-9]\d*$/.test(idPengaduan)
        ) {
            showNotFound();
            return;
        }

        // Jika request lama masih berjalan, hentikan agar tidak bentrok.
        if (activeController) {
            activeController.abort(); // batalkan request sebelumnya
        }

        const controller = new AbortController(); // buat pengontrol request baru
        activeController = controller; // tandai request ini sebagai yang aktif

        showLoading(); // tampilkan Loading sebelum GET

        try {

            // Masukkan ID pengaduan sebagai parameter URL untuk API.
            const query = new URLSearchParams({
                [DETAIL_ID_PARAM]: idPengaduan
            });

            // Gabungkan alamat API, endpoint PHP, dan ID pengaduan.
            const apiUrl =
                `${API_BASE_URL.replace(/\/+$/, "")}/${activeDetailEndpoint}?${query.toString()}`;

            // GET: meminta data, tidak mengirim vote/komentar.
            const response = await fetch(apiUrl, {
                method: "GET",
                credentials: "include",
                headers: {
                    Accept: "application/json"
                },
                signal: controller.signal
            });

            // Abaikan respons lama yang sudah tidak aktif.
            if (controller !== activeController) {
                return;
            }

            // 401: pengguna perlu login ulang.
            if (response.status === 401) {
                clearUserSession(); // hapus sesi lokal ketika tidak terautentikasi
                window.location.replace("login.html"); // arahkan pengguna ke login
                return;
            }

            // 404: pengaduan tidak ditemukan.
            if (response.status === 404) {
                showNotFound();
                return;
            }

            // 403: pengguna tidak diizinkan melihat pengaduan.
            if (response.status === 403) {
                showForbidden();
                return;
            }

            // 400: parameter request tidak diterima; tampilkan not found seperti kode asli.
            if (response.status === 400) {
                showNotFound();
                return;
            }

            // Tangani respons HTTP yang gagal.
            if (!response.ok) {
                throw new Error(
                    `Gagal mengambil detail pengaduan (HTTP ${response.status}).`
                );
            }

            // Variabel untuk menampung isi JSON dari API.
            let result;

            try {
                result = await response.json(); // ubah JSON dari backend menjadi objek JavaScript
            } catch {
                throw new Error(
                    "Respons server tidak valid (bukan JSON)."
                );
            }

            // Periksa apakah backend mengembalikan status sukses.
            if (result.status !== "success") {
                throw new Error(
                    result.message || "Gagal memuat detail pengaduan."
                );
            }

            const data = result.data; // ambil isi data dari respons

            // Pastikan struktur data pengaduan benar.
            if (
                !data ||
                !data.pengaduan ||
                typeof data.pengaduan !== "object" ||
                Array.isArray(data.pengaduan)
            ) {
                throw new Error(
                    "Struktur data detail dari backend tidak sesuai."
                );
            }

            // Pastikan ID pada respons sama dengan ID yang diminta.
            if (
                String(data.pengaduan.id_pengaduan) !==
                String(idPengaduan)
            ) {
                throw new Error(
                    "ID pengaduan pada respons tidak sesuai."
                );
            }

            renderDetail(data); // tampilkan data setelah lolos validasi

        } catch (error) {

            // Pembatalan request bukan error yang perlu ditampilkan.
            if (error.name === "AbortError") {
                return;
            }

            // Abaikan kesalahan dari request yang bukan terbaru.
            if (controller !== activeController) {
                return;
            }

            console.error(
                "Gagal memuat detail pengaduan:",
                error
            );

            // Jika browser mendeteksi offline, tampilkan pesan koneksi.
            if (!navigator.onLine) {
                showError(
                    "Terjadi kesalahan saat memuat detail pengaduan. Periksa koneksi internet Anda dan coba lagi."
                );
            } else {
                showError(error.message);
            }

        } finally {

            // Bersihkan penanda request setelah selesai.
            if (controller === activeController) {
                activeController = null; // kosongkan penanda request aktif
            }
        }
    };


    // ==================================================
    // 12. TOMBOL COBA LAGI
    // ==================================================

    // Hubungkan tombol Coba Lagi ke fungsi pengambilan data.
    if (retryBtn) {
        retryBtn.addEventListener("click", () => {
            loadDetail(); // minta detail terbaru dari backend
        });
    }


    // ==================================================
    // 13. PREVIEW LOCALHOST / LOAD DETAIL
    // ==================================================

    // Cek apakah halaman sedang preview khusus localhost.
    const isPreview =
        ["localhost", "127.0.0.1"].includes(
            window.location.hostname
        ) &&
        new URLSearchParams(window.location.search)
            .get("preview") === "1";

    // Gunakan data contoh untuk mengecek tampilan tanpa API.
    if (isPreview) {

        // Berikut data dummy: judul AC, jumlah vote, dan komentar contoh.
        renderDetail({
            pengaduan: {
                id_pengaduan: 1,
                judul: "AC Tidak Dingin",
                nama_fasilitas: "AC",
                lokasi: "Ruang 202, Lantai 2",
                deskripsi:
                    "AC tidak dingin, saat perkuliahan ruangan kurang nyaman terasa pengap, terutama pada siang hari. Mohon segera dicek dan diperbaiki.",
                foto: new URL(
                    "img/foto-ac.jpeg",
                    window.location.href
                ).href,
                status: "Diajukan",
                created_at: "2026-09-03 10:00:00"
            },
            vote: {
                upvote: 10,
                downvote: 1
            },
            komentar: [
                {
                    nama: "Salsa",
                    isi_komentar:
                        "Saat perkuliahan ruangan sangat panas",
                    created_at: "2026-09-05 10:00:00"
                }
            ],
            penanganan: []
        });

    } else {
        loadDetail(); // minta detail terbaru dari backend
    }


    // ==================================================
    // 14. NAVIGASI BROWSER
    // ==================================================

    // Jika halaman dipulihkan dari back-forward cache, muat data terbaru.
    window.addEventListener("pageshow", (event) => {
        if (event.persisted) {
            loadDetail(); // minta detail terbaru dari backend
        }
    });

    // Saat keluar dari halaman, hentikan request yang belum selesai.
    window.addEventListener("pagehide", () => {

        // Jika request lama masih berjalan, hentikan agar tidak bentrok.
        if (activeController) {
            activeController.abort(); // batalkan request sebelumnya
            activeController = null; // kosongkan penanda request aktif
        }
    });
});
