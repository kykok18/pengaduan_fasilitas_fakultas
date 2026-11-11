
document.addEventListener("DOMContentLoaded", () => {
  

  // =========================================================
  // 1. MENGAMBIL ELEMEN HTML
  // =========================================================

  const stateBox = document.getElementById("detailState");
  const stateIcon = document.getElementById("detailStateIcon");
  const stateTitle = document.getElementById("detailStateTitle");
  const stateDesc = document.getElementById("detailStateDesc");
  const retryBtn = document.getElementById("detailRetryBtn");

  const detailContent = document.getElementById("detailContent");
  const commentsCard = document.getElementById("detailCommentsCard");
  const detailCard = document.querySelector(".detail-card");

  const detailImage = document.getElementById("detailImage");
  const imageFallback = document.getElementById("detailImageFallback");

  const detailCategory = document.getElementById("detailCategory");
  const detailStatus = document.getElementById("detailStatus");
  const detailTitle = document.getElementById("detailTitle");
  const detailLocation = document.getElementById("detailLocation");
  const detailDate = document.getElementById("detailDate");
  const detailDescription = document.getElementById("detailDescription");

  const detailLikes = document.getElementById("detailLikes");
  const detailDislikes = document.getElementById("detailDislikes");
  
  // ==========================================
// ELEMEN TOMBOL UPVOTE DAN DOWNVOTE
// ==========================================

// Mengambil dua tombol voting dari HTML.
const voteButtons = document.querySelectorAll(
    ".detail-vote-btn"
);

// Menandakan apakah request voting sedang berjalan.
let isVoting = false;

// Menyimpan pilihan vote aktif dari backend.
let activeVote = null;

// Mengatur tombol selama proses voting.


const setVoteLoading = (loading) => {
    isVoting = loading;

    voteButtons.forEach((button) => {
        button.disabled = loading;
        button.setAttribute("aria-busy", String(loading));
    });
};



// Menandai pilihan suara pengguna.
const setActiveVote = (voteType) => {
    activeVote = voteType;

    voteButtons.forEach((button) => {
        const isActive = button.dataset.vote === voteType;

        button.classList.toggle("active", isActive);
        button.setAttribute(
            "aria-pressed",
            String(isActive)
        );
    });
};

  const commentsList = document.getElementById("detailCommentsList");
  const commentsTitle = document.getElementById("detailCommentsTitle");

  const avatarLetter = document.getElementById("detailAvatarLetter");

  
// ==========================================
// NOTIFIKASI SUARA GAGAL DIKIRIM
// ==========================================

const voteErrorAlert = document.getElementById("voteErrorAlert");
let voteErrorTimeout = null;

// Menampilkan notifikasi saat pengiriman suara gagal.
const showVoteError = () => {
    if (!voteErrorAlert) return;

    // Batalkan timer lama jika notifikasi muncul lagi.
    clearTimeout(voteErrorTimeout);

    voteErrorAlert.hidden = false;

    // Hilangkan notifikasi setelah 4 detik.
    voteErrorTimeout = setTimeout(() => {
        voteErrorAlert.hidden = true;
    }, 4000);
};


 // ==========================================
 // SIDEBAR DETAIL PENGADUAN
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

     menuToggle.addEventListener("click", () => {
         sidebar.classList.add("active");
         sidebarOverlay.classList.add("active");

         menuToggle.setAttribute("aria-expanded", "true");
         document.body.style.overflow = "hidden";
     });

     sidebarOverlay.addEventListener("click", closeSidebar);

     document.addEventListener("keydown", (event) => {
         if (event.key === "Escape") {
             closeSidebar();
         }
     });
 }


  // =========================================================
  // 2. KONFIGURASI API
  // =========================================================

  // Endpoint asli dari backend.
  const DETAIL_ENDPOINT = "detail_pengaduan.php";

  // Nama parameter yang digunakan backend.
  const DETAIL_ID_PARAM = "id_pengaduan";

  // Mengambil ID pengaduan dari URL.
  // Contoh: detail-pengaduan.html?id_pengaduan=12
  const params = new URLSearchParams(window.location.search);
  const idPengaduan = params.get(DETAIL_ID_PARAM);

  // Untuk membatalkan request sebelumnya.
  let activeController = null;

  // =========================================================
  // 3. INFORMASI PENGGUNA
  // =========================================================

  // Nama pengguna hanya digunakan untuk tampilan navbar.
  // Validasi autentikasi tetap dilakukan oleh backend.
  try {
    if (typeof getUserSession === "function") {
      const user = getUserSession();

      if (user && user.nama) {
        avatarLetter.textContent = user.nama
          .trim()
          .charAt(0)
          .toUpperCase();
      }
    }
  } catch (error) {
    console.error("Gagal membaca data pengguna:", error);
  }

  // =========================================================
  // 4. MENGOSONGKAN DATA DETAIL SEBELUM REQUEST
  // =========================================================

  const clearDetail = () => {

    detailContent.hidden = true;
    commentsCard.hidden = true;

    detailImage.hidden = true;
    detailImage.onload = null;
    detailImage.onerror = null;
    detailImage.removeAttribute("src");

    imageFallback.hidden = true;

    detailCategory.textContent = "";
    detailStatus.textContent = "";
    detailStatus.removeAttribute("data-status");

    detailTitle.textContent = "";
    detailLocation.textContent = "";
    detailDate.textContent = "";
    detailDescription.textContent = "";

    detailLikes.textContent = "0";
    detailDislikes.textContent = "0";

    commentsList.replaceChildren();
    commentsTitle.textContent = "Komentar(0)";
  };

  // =========================================================
  // 5. TAMPILAN LOADING DAN ERROR
  // =========================================================

  const showState = (type, title, description) => {

    clearDetail();
    // Aktifkan layout loading/error sesuai Figma
detailCard.classList.add("is-state");

// Tampilkan card putih kedua tanpa isi komentar
commentsCard.classList.add("is-state-placeholder");
commentsCard.hidden = false;

    stateBox.hidden = false;

    stateTitle.textContent = title;
    stateDesc.textContent = description;

    stateIcon.className = "detail-state-icon";
    stateIcon.replaceChildren();

    retryBtn.hidden = true;

    if (type === "loading") {
      const spinner = document.createElement("div");
      spinner.className = "detail-spinner";

      stateIcon.appendChild(spinner);
    }

    if (type === "error") {
      stateIcon.classList.add("is-error");
      retryBtn.hidden = false;
    }

    if (type === "not-found") {
      stateIcon.classList.add("is-not-found");
    }

    if (type === "forbidden") {
      stateIcon.classList.add("is-forbidden");
    }
  };

  const showLoading = () => {
    showState(
      "loading",
      "Loading...",
      "Mohon tunggu sebentar, detail pengaduan sedang dimuat."
    );
  };

  const showError = (message) => {
    showState(
      "error",
      "Gagal Memuat Pengaduan",
      message ||
        "Terjadi kesalahan saat memuat<br>detail pengaduan. Periksa koneksi internet Anda<br>dan coba lagi."
    );
  };

  const showNotFound = () => {
    showState(
      "not-found",
      "Pengaduan Tidak Ditemukan",
      "Pengaduan tidak tersedia atau tautan yang Anda buka tidak valid."
    );
  };

  const showForbidden = () => {
    showState(
      "forbidden",
      "Akses Ditolak",
      "Anda tidak memiliki izin untuk melihat pengaduan ini."
    );
  };

  // =========================================================
  // 6. FORMAT TANGGAL
  // =========================================================

  // Mengubah tanggal database menjadi format Indonesia.
  const formatTanggal = (value) => {

    if (!value) return "-";

    // MySQL sering mengirim tanggal dengan pemisah spasi.
    const normalized = String(value).replace(" ", "T");
    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  };

  // =========================================================
  // 7. MENAMPILKAN FOTO PENGADUAN
  // =========================================================

  const renderFoto = (fotoUrl) => {

    detailImage.hidden = true;
    imageFallback.hidden = false;

    if (!fotoUrl || typeof fotoUrl !== "string") {
    detailImage.src = "https://via.placeholder.com/600x335";
    detailImage.hidden = false;
    imageFallback.hidden = true;
    return;
}

    try {
      const url = new URL(fotoUrl);

      // Hanya mengizinkan URL gambar HTTP/HTTPS.
      if (!["http:", "https:"].includes(url.protocol)) {
        return;
      }

      detailImage.onload = () => {
        detailImage.hidden = false;
        imageFallback.hidden = true;
      };

      detailImage.onerror = () => {
    detailImage.onerror = null; // Mencegah error berulang
    detailImage.src = "https://via.placeholder.com/600x335";
    detailImage.hidden = false;
    imageFallback.hidden = true;
};

      detailImage.src = url.href;

    } catch (error) {
      console.error("URL foto tidak valid:", error);
    }
  };

  // =========================================================
  // 8. MENAMPILKAN KOMENTAR DARI BACKEND
  // =========================================================

  const renderKomentar = (komentar) => {

    commentsList.replaceChildren();

    const daftarKomentar = Array.isArray(komentar)
      ? komentar
      : [];

    commentsTitle.textContent =
    `Komentar(${formatJumlah(daftarKomentar.length)})`;

    daftarKomentar.forEach((item) => {

      const card = document.createElement("div");
      card.className = "detail-comment-item";

      const header = document.createElement("div");
      header.className = "detail-comment-header";

      const author = document.createElement("strong");
      author.className = "detail-comment-author";

      // Nama field sesuai Model Pengaduan.php.
      author.textContent = item.nama || "Pengguna";

      const date = document.createElement("span");
      date.className = "detail-comment-date";

      date.textContent = formatTanggal(item.created_at);

      const description = document.createElement("p");
      description.className = "detail-comment-text";

      // Isi komentar sesuai respons backend.
      description.textContent = item.isi_komentar || "";

      header.appendChild(author);
      header.appendChild(date);

      card.appendChild(header);
      card.appendChild(description);

      commentsList.appendChild(card);
    });
  };

  // =========================================================
  // 9. MENAMPILKAN INFORMASI DETAIL
  // =========================================================

  const renderDetail = (data) => {

    // Backend membagi hasil menjadi beberapa objek.
    const pengaduan = data.pengaduan;
    const vote = data.vote || {};
    const komentar = data.komentar || [];

    // Kembalikan layout normal setelah detail berhasil dimuat
detailCard.classList.remove("is-state");
commentsCard.classList.remove("is-state-placeholder");

    // Sembunyikan Loading.
    stateBox.hidden = true;

    // Tampilkan informasi detail.
    detailContent.hidden = false;
    commentsCard.hidden = false;

    // Kategori berasal dari tabel fasilitas.
    detailCategory.textContent =
      pengaduan.nama_fasilitas || "-";

    // Status berasal dari tabel pengaduan.
    const status = String(pengaduan.status || "-").trim();

detailStatus.textContent =
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

detailStatus.dataset.status = status.toLowerCase();

    // Data utama pengaduan.
    detailTitle.textContent = pengaduan.judul || "-";
    detailLocation.textContent = pengaduan.lokasi || "-";

    detailDate.textContent =
      formatTanggal(pengaduan.created_at);

    // textContent mencegah teks pengguna
    // diperlakukan sebagai kode HTML.
    detailDescription.textContent =
      pengaduan.deskripsi || "-";

detailLikes.textContent = formatJumlah(vote.upvote ?? 0);
detailDislikes.textContent = formatJumlah(vote.downvote ?? 0);

      // Tampilkan suara aktif berdasarkan data backend.
setActiveVote(vote.pilihan_user ?? null);


// Cek apakah halaman sedang memakai data dummy preview.
const isDummyPreview =
    ["localhost", "127.0.0.1"].includes(window.location.hostname) &&
    new URLSearchParams(window.location.search).get("preview") === "1";

// Tombol hanya aktif untuk detail asli dari backend.
setVoteLoading(false);

if (isDummyPreview) {
    voteButtons.forEach((button) => {
        button.disabled = true;
    });
}


    // Foto bukti pengaduan.
    renderFoto(pengaduan.foto);

    // Daftar komentar.
    renderKomentar(komentar);
  };

  // =========================================================
  // 10. MENGAMBIL DATA DETAIL DARI API
  // =========================================================

  const loadDetail = async () => {

    // Memastikan ID pengaduan berupa angka positif.
    if (
      !idPengaduan ||
      !/^[1-9]\d*$/.test(idPengaduan)
    ) {
      showNotFound();
      return;
    }

    // Membatalkan request lama jika masih berjalan.
    if (activeController) {
      activeController.abort();
    }

    const controller = new AbortController();
    activeController = controller;

    showLoading();

    try {

      // Menyusun parameter sesuai kontrak backend.
      const query = new URLSearchParams({
        [DETAIL_ID_PARAM]: idPengaduan
      });

      const apiUrl =
        `${API_BASE_URL}/${DETAIL_ENDPOINT}?${query.toString()}`;

      // Meminta data detail menggunakan GET.
      const response = await fetch(apiUrl, {
        method: "GET",
        credentials: "same-origin",
        headers: {
          Accept: "application/json"
        },
        signal: controller.signal
      });

      // Abaikan respons jika request sudah dibatalkan.
      if (controller !== activeController) {
        return;
      }

      // HTTP 401: sesi login tidak valid.
      if (response.status === 401) {
        clearUserSession();
        window.location.replace("login.html");
        return;
      }

      // HTTP 404: pengaduan tidak ditemukan.
      if (response.status === 404) {
        showNotFound();
        return;
      }

      // HTTP 403: akses tidak diizinkan.
      if (response.status === 403) {
        showForbidden();
        return;
      }

      // HTTP 400: ID tidak valid.
      if (response.status === 400) {
        showNotFound();
        return;
      }

      // HTTP 500 atau kesalahan HTTP lainnya.
      if (!response.ok) {
        throw new Error(
          `Gagal mengambil detail pengaduan (HTTP ${response.status}).`
        );
      }

      // Mengubah respons JSON menjadi objek JavaScript.
      let result;

      try {
        result = await response.json();
      } catch {
        throw new Error(
          "Respons server tidak valid (bukan JSON)."
        );
      }

      // Memeriksa status aplikasi dari backend.
      if (result.status !== "success") {
        throw new Error(
          result.message ||
          "Gagal memuat detail pengaduan."
        );
      }

      // Struktur hasil dari getDetailPengaduan().
      const data = result.data;

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

      // Memastikan detail benar-benar milik ID yang diminta.
      if (
        String(data.pengaduan.id_pengaduan) !==
        String(idPengaduan)
      ) {
        throw new Error(
          "ID pengaduan pada respons tidak sesuai."
        );
      }

      // Tampilkan data dari backend.
      renderDetail(data);

    } catch (error) {

      if (error.name === "AbortError") {
        return;
      }

      if (controller !== activeController) {
        return;
      }

      console.error("Gagal memuat detail pengaduan:", error);

      if (!navigator.onLine) {
        showError(
          "Terjadi kesalahan saat memuat detail pengaduan. Periksa koneksi internet Anda dan coba lagi."
        );
      } else {
        showError(error.message);
      }

    } finally {

      if (controller === activeController) {
        activeController = null;
      }

    }
  };

  
// =========================================================
// INTEGRASI UPVOTE / DOWNVOTE
// =========================================================

const kirimVote = async (tipeVote) => {

    // Mencegah request berulang.
    if (isVoting) return;

    // Hanya menerima tipe vote yang valid.
    if (!["upvote", "downvote"].includes(tipeVote)) return;

    if (!idPengaduan || !/^[1-9]\d*$/.test(idPengaduan)) {
        return;
    }

    setVoteLoading(true);

    try {
        // Backend menerima form-urlencoded, bukan JSON.
        const body = new URLSearchParams({
            id_pengaduan: idPengaduan,
            tipe_vote: tipeVote
        });

        const response = await fetch(
            `${API_BASE_URL}/vote.php`,
            {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json"
                },
                body: body.toString()
            }
        );

        // Sesi pengguna sudah tidak valid.
        if (response.status === 401) {
            clearUserSession();
            window.location.replace("login.html");
            return;
        }

        const result = await response.json();

        if (
            !response.ok ||
            result.status !== "success" ||
            !result.data?.vote ||
            String(result.data.id_pengaduan) !== String(idPengaduan)
        ) {
            throw new Error(
                result.message || "Gagal mengirim suara."
            );
        }

        
const vote = result.data.vote;


const jumlahUpvote = vote.upvote;
const jumlahDownvote = vote.downvote;

if (
    !Number.isSafeInteger(jumlahUpvote) ||
    !Number.isSafeInteger(jumlahDownvote) ||
    jumlahUpvote < 0 ||
    jumlahDownvote < 0 ||
    !Object.prototype.hasOwnProperty.call(vote, "pilihan_user") ||
    !(
        vote.pilihan_user === null ||
        ["upvote", "downvote"].includes(vote.pilihan_user)
    )
) {
    throw new Error("Data voting dari backend tidak valid.");
}


// Perbarui tampilan hanya setelah respons tervalidasi.
detailLikes.textContent = formatJumlah(jumlahUpvote);
detailDislikes.textContent = formatJumlah(jumlahDownvote);

// Tandai pilihan suara berdasarkan respons backend.
setActiveVote(vote.pilihan_user);


    } catch (error) {
        console.error("Gagal mengirim vote:", error);

        // Tidak menambah atau mengurangi angka secara manual.
        showVoteError();

        // Jika server mungkin sudah menyimpan vote tetapi
        // respons gagal, sinkronkan kembali melalui Detail API.
        // Jangan lakukan pengiriman vote ulang otomatis.
    } finally {
        setVoteLoading(false);
    }
};

// Event klik tombol Upvote dan Downvote.
voteButtons.forEach((button) => {
    button.addEventListener("click", () => {
        kirimVote(button.dataset.vote);
    });
});


  // =========================================================
  // 11. TOMBOL COBA LAGI
  // =========================================================

  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
        loadDetail();
    });
}

  // =========================================================
  // 12. FORM KOMENTAR
  // =========================================================

  // Tampilan komentar sudah tersedia.
  // Pengiriman komentar belum diaktifkan karena
  // endpoint POST komentar belum dikonfirmasi.

  const commentForm = document.getElementById(
    "detailCommentForm"
  );

  commentForm.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  // =========================================================
  // 13. MEMUAT DATA SAAT HALAMAN DIBUKA
  // =========================================================

  
    // ==========================================
    // PREVIEW DETAIL PENGADUAN (KHUSUS LOCALHOST)
    // ==========================================

    const isPreview =
        ["localhost", "127.0.0.1"].includes(window.location.hostname) &&
        new URLSearchParams(window.location.search).get("preview") === "1";

    if (isPreview) {
        // Data contoh untuk menguji tampilan Figma.
        // Tidak dikirim dan tidak disimpan ke database.
        renderDetail({
            pengaduan: {
                id_pengaduan: 1,
                judul: "AC Tidak Dingin",
                nama_fasilitas: "AC",
                lokasi: "Ruang 202, Lantai 2",
                deskripsi:
                    "AC tidak dingin, saat perkuliahan ruangan kurang nyaman terasa pengap, terutama pada siang hari. Mohon segera dicek dan diperbaiki.",
                foto: new URL("img/foto-ac.jpeg", window.location.href).href,
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
                    isi_komentar: "Saat perkuliahan ruangan sangat panas",
                    created_at: "2026-09-05 10:00:00"
                }
            ],

            penanganan: []
        });

    } else {
        // Mode normal tetap menggunakan API backend.
        loadDetail();
    }


  // Memuat ulang detail saat halaman dikembalikan
  // dari Back/Forward Cache browser.
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      loadDetail();
    }
  });

  // Membatalkan request saat meninggalkan halaman.
  window.addEventListener("pagehide", () => {
    if (activeController) {
      activeController.abort();
      activeController = null;
    }
  });

});
