
document.addEventListener("DOMContentLoaded", () => {

  // =========================================================
  // 1. ELEMEN FORM
  // =========================================================

  // Menghubungkan JavaScript dengan elemen form pada HTML.
  const form = document.getElementById("formPengaduan");
  const btnSubmit = document.getElementById("btnSubmit");

  // Elemen input pengaduan.
  const inputJudul = document.getElementById("judul");
  const inputKategori = document.getElementById("kategori");
  const customSelectWrapper = document.getElementById("customSelectWrapper");
  const selectTrigger = document.getElementById("selectTrigger");
  const selectLabel = document.getElementById("selectLabel");
  const customOptions = document.getElementById("customOptions");
  const inputLokasi = document.getElementById("lokasi");
  const inputDeskripsi = document.getElementById("deskripsi");

const aturPosisiDeskripsi = () => {
    // Mulai dari posisi tengah.
    inputDeskripsi.style.paddingTop = "18px";
    inputDeskripsi.style.paddingBottom = "18px";

    // Jika teks sudah tidak muat, beri ruang untuk dua baris.
    if (inputDeskripsi.scrollHeight > inputDeskripsi.clientHeight) {
        inputDeskripsi.style.paddingTop = "9px";
        inputDeskripsi.style.paddingBottom = "9px";
    }
};

inputDeskripsi.addEventListener("input", aturPosisiDeskripsi);

  const inputFile = document.getElementById("file-upload");

  // Elemen pesan validasi di bawah input.
  const errorJudul = document.getElementById("errorJudul");
  const errorKategori = document.getElementById("errorKategori");
  const errorLokasi = document.getElementById("errorLokasi");
  const errorDeskripsi = document.getElementById("errorDeskripsi");
  const errorFoto = document.getElementById("errorFoto");

  // Elemen untuk menampilkan nama file yang dipilih.
  const uploadWrapper = document.getElementById("uploadWrapper");
  const fileNameDisplay = document.getElementById("fileName");

  // Elemen notifikasi hasil pengiriman.
  const formNotification = document.getElementById("formNotification");
  const notifIcon = document.getElementById("notifIcon");
  const notifTitle = document.getElementById("notifTitle");
  const notifDesc = document.getElementById("notifDesc");

  // Menandai apakah proses pengiriman sedang berlangsung.
  let isSubmitting = false;


  // =========================================================
  // 2. VALIDASI FORM DAN FOTO
  // =========================================================

  // Memastikan semua kolom wajib sudah diisi.
  const isFormValid = () => {
    return (
      inputJudul.value.trim() !== "" &&
      inputKategori.value !== "" &&
      inputLokasi.value.trim() !== "" &&
      inputDeskripsi.value.trim() !== "" &&
      inputFile.files.length > 0
    );
  };

  // Validasi jenis dan ukuran foto.
  const validateFile = async () => {
    const file = inputFile.files[0];

    if (!file) {
      setFotoError("Bukti foto wajib diisi.");
      return false;
    }

    // Format foto yang diperbolehkan.
    const allowedFormats = {
      jpg: ["image/jpeg"],
      jpeg: ["image/jpeg"],
      png: ["image/png"],
      webp: ["image/webp"],
      heic: ["image/heic", "image/heif"],
      heif: ["image/heif", "image/heic"]
    };

    const extension = file.name
      .split(".")
      .pop()
      .toLowerCase();

    // MIME kosong diperbolehkan untuk format HEIC/HEIF
    // karena sebagian browser tidak mengenalinya.
    const mimeValid =
      allowedFormats[extension]?.includes(file.type) ||
      (
        ["heic", "heif"].includes(extension) &&
        file.type === ""
      );

    if (!mimeValid) {
      setFotoError(
        "Format foto tidak didukung. Gunakan JPG, PNG, WebP, atau HEIC."
      );
      return false;
    }

    // Ukuran foto maksimal 10 MB.
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      setFotoError(
        file.size === 0
          ? "File foto tidak boleh kosong."
          : "Ukuran foto terlalu besar. Maksimal 10 MB."
      );
      return false;
    }

    // Foto memenuhi ketentuan.
    hideError(errorFoto, uploadWrapper);
    return true;
  };


  // =========================================================
  // 3. TAMPILAN PESAN VALIDASI
  // =========================================================

  // Menampilkan pesan kesalahan dan border merah pada input.
  const showError = (element, wrapper = null) => {
    element.classList.add("active");

    if (wrapper) {
      wrapper.classList.add("input-error");
    } else {
      element
        .closest(".form-group")
        .querySelector(".form-control")
        .classList.add("input-error");
    }
  };


  // Menghilangkan pesan error ketika input sudah diperbaiki.
  const hideError = (element, wrapper = null) => {  
    element.classList.remove("active");

    if (wrapper) {
      wrapper.classList.remove("input-error");
    } else {
      element
        .closest(".form-group")
        .querySelector(".form-control")
        .classList.remove("input-error");
    }
  };


  // Mengubah teks error foto tanpa menghapus ikon SVG-nya.
  const setFotoError = (message) => {
    const errorFotoText = errorFoto.querySelector("span");

    if (errorFotoText) {
      errorFotoText.textContent = message;
    }

    showError(errorFoto, uploadWrapper);
  };


  // =========================================================
  // 4. NOTIFIKASI HASIL PENGIRIMAN
  // =========================================================

  // Timer digunakan agar notifikasi otomatis menghilang
  // setelah ditampilkan selama beberapa detik.
  let notificationTimer;
  let notificationHideTimer;

  const showNotification = (type, title, desc) => {

    // Menghentikan timer sebelumnya agar notifikasi
    // yang baru tidak terganggu oleh timer lama.
    clearTimeout(notificationTimer);
    clearTimeout(notificationHideTimer);

    // Ikon notifikasi ketika pengaduan berhasil dikirim.
    const iconSuccess = `
      <svg width="41" height="41"
           viewBox="0 0 41 41"
           xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="20.5"
          cy="20.5"
          r="20"
          fill="#15A367"
        />
        <path
          d="M17.2 27.8L10.5 21.1L13.3 18.3L17.2 22.2L27.7 11.7L30.5 14.5Z"
          fill="#FFFFFF"
          style="fill: #FFFFFF !important;"
        />
      </svg>`;

    // Ikon notifikasi ketika pengiriman gagal.
    const iconError = `
      <svg width="40" height="40" viewBox="0 0 40 40"
           fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0C31.0457 0 40 8.9543 40 20C40 31.0457 31.0457 40 20 40C8.9543 40 0 31.0457 0 20C0 8.9543 8.9543 0 20 0ZM22.207 20L28.8867 13.3203L26.6797 11.1133L20 17.793L13.3203 11.1133L11.1133 13.3203L17.793 20L11.1133 26.6797L13.3203 28.8867L20 22.207L26.6797 28.8867L28.8867 26.6797L22.207 20Z"
          fill="#C41B1B"/>
      </svg>`;

    // Ikon notifikasi ketika koneksi internet terputus.
    const iconOffline = `
      <svg width="48" height="48" viewBox="0 0 48 48"
           fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 17C14.5 5 33.5 5 46 17L42 21C31.7 11.5 16.3 11.5 6 21L2 17ZM10 25C18 17.5 30 17.5 38 25L34 29C28.5 24 19.5 24 14 29L10 25ZM18 33C21.3 30 26.7 30 30 33L24 39L18 33Z"
          fill="#FFB000"/>
      </svg>`;

    // Memilih ikon berdasarkan jenis notifikasi.
    const icons = {
      success: iconSuccess,
      error: iconError,
      offline: iconOffline
    };

    notifIcon.innerHTML = icons[type] || iconError;

    notifTitle.textContent = title;
    notifDesc.textContent = desc;

    // Menyesuaikan warna notifikasi melalui class CSS.
    formNotification.className = `form-message ${type}`;

    formNotification.style.display = "flex";

    // Mengaktifkan animasi munculnya notifikasi.
    requestAnimationFrame(() => {
      formNotification.classList.add("show");
    });

    // Menggulir halaman ke atas agar notifikasi terlihat.
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    // Notifikasi hilang setelah 5 detik,
    // dengan waktu transisi tambahan 300 milidetik.
    notificationTimer = setTimeout(() => {
      formNotification.classList.remove("show");

      notificationHideTimer = setTimeout(() => {
        formNotification.style.display = "none";
      }, 300);

    }, 5000);
  };


  // Menyembunyikan notifikasi yang sedang ditampilkan.
  const hideNotification = () => {
    clearTimeout(notificationTimer);
    clearTimeout(notificationHideTimer);

    formNotification.classList.remove("show");

    notificationHideTimer = setTimeout(() => {
      formNotification.style.display = "none";
    }, 300);
  };



  // =========================================================
  // NOTIFIKASI KETIKA KONEKSI INTERNET TERPUTUS
  // =========================================================

  const tampilkanNotifikasiOffline = () => {
    showNotification(
      "offline",
      "KONEKSI INTERNET TERPUTUS",
      "Periksa koneksi internet Anda. Silakan coba lagi."
    );
  };

  // Ketika koneksi terputus saat halaman masih terbuka.
  window.addEventListener(
    "offline",
    tampilkanNotifikasiOffline
  );

  // Ketika halaman dibuka ulang dalam keadaan offline.
  if (!navigator.onLine) {
    tampilkanNotifikasiOffline();
  }


  // =========================================================
  // 5. MENGAMBIL DATA FASILITAS DARI BACKEND
  // =========================================================

  // Menggunakan GET untuk mengambil pilihan fasilitas.
  // Respons backend juga digunakan untuk memeriksa
  // apakah session login pengguna masih valid.
  const loadFasilitas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/pengaduan.php`, {
        method: "GET",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
      });

      // Mengubah respons JSON menjadi objek JavaScript.
      const result = await response.json();

      // Jika backend mengembalikan 401,
      // pengguna diarahkan kembali ke halaman Login.
      if (response.status === 401) {
        clearUserSession();
        window.location.replace("login.html");
        return;
      }

      // Jika request gagal atau status aplikasi bukan success,
      // proses dialihkan ke catch.
      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Gagal memuat fasilitas.");
      }

      // Menampilkan halaman hanya setelah pemeriksaan
      // melalui endpoint backend berhasil.
      document.documentElement.classList.add("auth-verified");

      // Mengambil daftar fasilitas dari respons API.
      const facilityList = result.data?.fasilitas ?? [];

      customOptions.innerHTML = "";
      inputKategori.value = "";
      selectLabel.textContent = "Pilih Fasilitas";
      selectLabel.classList.remove("has-value");

      // Menampilkan informasi jika daftar fasilitas kosong.
      if (!Array.isArray(facilityList) || facilityList.length === 0) {
        selectLabel.textContent = "Fasilitas tidak tersedia";
        return;
      }

      // Membuat pilihan dropdown berdasarkan fasilitas
      // yang dikirim dari database melalui backend.
      facilityList.forEach((fasilitas) => {
        const option = document.createElement("div");

        option.className = "custom-option";
        option.dataset.value = fasilitas.id_fasilitas;
        option.textContent = fasilitas.nama_fasilitas;

        customOptions.appendChild(option);
      });

    } catch (error) {
      // Jika pemeriksaan gagal, form tidak digunakan
      // dan diganti dengan informasi kegagalan verifikasi.
      console.error("Gagal verifikasi sesi:", error);


      // Jika gagal karena offline, jangan hapus halaman.
      if (!navigator.onLine) {
        document.documentElement.classList.add("auth-verified");

        inputKategori.value = "";
        selectLabel.textContent = "Tidak tersedia saat offline";
        customOptions.replaceChildren();

        btnSubmit.disabled = true;

        tampilkanNotifikasiOffline();
        return;
      }


      document.body.innerHTML = `
        <main style="
          padding: 40px 20px;
          text-align: center;
          font-family: Poppins, sans-serif;
        ">
          <h3>Halaman belum dapat dibuka</h3>
          <p>Gagal memverifikasi sesi login.</p>
          <a href="login.html">Kembali ke Login</a>
        </main>
      `;

      document.documentElement.classList.add("auth-verified");
    }
  };


  // =========================================================
  // 6. PROSES PENGIRIMAN PENGADUAN
  // =========================================================

  // Event submit dijalankan ketika tombol Kirim ditekan.
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Mencegah pengiriman ulang selama request berlangsung.
    if (isSubmitting) {
      return;
    }

    isSubmitting = true;

    hideNotification();

    hideNotification();

    // Memeriksa setiap kolom wajib dan menampilkan error
    // pada input yang belum diisi.
    if (inputJudul.value.trim() === "") showError(errorJudul);
    if (inputKategori.value === "") showError(errorKategori);
    if (inputLokasi.value.trim() === "") showError(errorLokasi);
    if (inputDeskripsi.value.trim() === "") showError(errorDeskripsi);

    // Menunggu hasil validasi file sebelum mengirim request.
    const fotoValid = await validateFile();

    // Jika ada input atau foto tidak valid,
    // proses dihentikan sebelum menghubungi backend.
    if (!isFormValid() || !fotoValid) {
      btnSubmit.classList.add("is-disabled");

      isSubmitting = false;
      btnSubmit.textContent = "Kirim Pengaduan";
      btnSubmit.disabled = false;

      const firstErrorInput = document.querySelector(
        ".form-control.input-error"
      );

      if (firstErrorInput) {
        firstErrorInput.focus();
      }

      return;
    }

    btnSubmit.classList.remove("is-disabled");

    // Menampilkan Loading dan menonaktifkan tombol
    // selama data sedang dikirim ke backend.
    btnSubmit.textContent = "Loading...";
    btnSubmit.disabled = true;
    btnSubmit.classList.add("is-loading");

    try {

      // FormData digunakan untuk mengirim data teks
      // sekaligus berkas foto dalam satu request.
      const formData = new FormData();

      formData.append("id_fasilitas", inputKategori.value);
      formData.append("judul", inputJudul.value.trim());
      formData.append("lokasi", inputLokasi.value.trim());
      formData.append("deskripsi", inputDeskripsi.value.trim());

      if (inputFile.files.length > 0) {
        formData.append("foto", inputFile.files[0]);
      }

      // Menentukan endpoint pengiriman pengaduan.
      const apiUrl = `${API_BASE_URL}/pengaduan.php`;

      // Menggunakan POST untuk mengirim FormData.
      // Browser mengatur Content-Type multipart/form-data
      // beserta boundary secara otomatis.
      const response = await fetch(apiUrl, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      // Mengolah respons backend dalam format JSON.
      // Jika backend mengembalikan HTML/error PHP,
      // tampilkan pesan respons server tidak valid.
      let result;

      try {
        result = await response.json();
      } catch (error) {
        throw new Error(
          "Respon server tidak valid (bukan JSON). Cek tab Network.",
        );
      }

      // Jika backend mengonfirmasi berhasil,
      // tampilkan notifikasi dan kosongkan form.
      if (response.ok && result.status === "success") {
        showNotification(
          "success",
          "PENGADUAN BERHASIL DIKIRIM",
          "Pengaduan Anda berhasil dikirim. Silakan pantau status pengaduan secara berkala.",
        );

        form.reset();

        inputKategori.value = "";
        selectLabel.textContent = "Pilih Fasilitas";
        selectLabel.classList.remove("has-value");

        fileNameDisplay.textContent =
    "JPEG/JPG, PNG, WebP, HEIC/HEIF. Maks 10MB";

        hideError(errorJudul);
        hideError(errorKategori);
        hideError(errorLokasi);
        hideError(errorDeskripsi);
        hideError(errorFoto, uploadWrapper);

        btnSubmit.classList.remove("is-disabled");
        customSelectWrapper.classList.remove("open");

      // HTTP 409 menunjukkan konflik, misalnya pengaduan
      // sedang diproses sesuai aturan dari backend.
      } else if (response.status === 409) {
        showNotification(
          "error",
          "PENGADUAN SEDANG DIPROSES",
          result.message || "Pengaduan Anda sedang diproses. Tunggu hingga selesai."
        );

      // Jika PHP Session tidak valid,
      // bersihkan data pengguna lokal dan kembali ke Login.
      } else if (response.status === 401) {
        clearUserSession();
        window.location.replace("login.html");
        return;

      // Menangani kegagalan lain yang dikirim backend.
      } else {
        showNotification(
          "error",
          "PENGADUAN GAGAL DIKIRIM",
          result.message || "Terjadi kesalahan pada sistem. Silakan coba lagi."
        );
      }

    } catch (error) {
      console.error("Error Fetch:", error);

      // Menampilkan notifikasi sesuai kondisi koneksi browser.
      if (!navigator.onLine) {
        showNotification(
          "offline",
          "KONEKSI INTERNET TERPUTUS",
          "Periksa koneksi internet Anda. Silakan coba lagi."
        );

      } else {
        showNotification(
          "error",
          "PENGADUAN GAGAL DIKIRIM",
          error.message || "Terjadi kesalahan pada sistem. Silakan coba lagi."
        );
      }

    } finally {
      // Mengembalikan kondisi tombol setelah proses selesai,
      // baik berhasil maupun gagal.
      isSubmitting = false;

      btnSubmit.textContent = "Kirim Pengaduan";
      btnSubmit.disabled = false;
      btnSubmit.classList.remove("is-loading");
    }
  });


  // =========================================================
  // 7. VALIDASI SAAT PENGGUNA MENGETIK
  // =========================================================

  // Menghapus error secara langsung ketika pengguna
  // memperbaiki input yang sebelumnya kosong.
  const handleInput = () => {

    if (inputJudul.value.trim() !== "") {
      hideError(errorJudul);
    }

    if (inputKategori.value !== "") {
      hideError(errorKategori);
    }

    if (inputLokasi.value.trim() !== "") {
      hideError(errorLokasi);
    }

    if (inputDeskripsi.value.trim() !== "") {
      hideError(errorDeskripsi);
    }

    // Menghapus tampilan disabled apabila kolom sudah terisi.
    if (isFormValid()) {
      btnSubmit.classList.remove("is-disabled");
    }
  };

  // Memantau perubahan pada masing-masing input form.
  inputJudul.addEventListener("input", handleInput);
  inputKategori.addEventListener("change", handleInput);
  inputLokasi.addEventListener("input", handleInput);
  inputDeskripsi.addEventListener("input", handleInput);

  // Menampilkan nama foto setelah pengguna memilih file.

inputFile.addEventListener("change", async () => {
    if (inputFile.files.length > 0) {
        fileNameDisplay.textContent = inputFile.files[0].name;
    } else {
        fileNameDisplay.textContent =
            "JPEG/JPG, PNG, WebP, HEIC/HEIF. Maks 10MB";
    }

    // Validasi foto hanya saat pengguna memilih file.
    await validateFile();

    // Perbarui kondisi tampilan tombol.
    handleInput();
});



  // =========================================================
  // 8. DROPDOWN PILIHAN FASILITAS
  // =========================================================

  // Membuka atau menutup dropdown ketika diklik.
  selectTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    customSelectWrapper.classList.toggle("open");
  });

  // Menyimpan fasilitas yang dipilih pengguna.
  // Nilai ID digunakan untuk request ke backend,
  // sedangkan nama fasilitas ditampilkan pada halaman.
  customOptions.addEventListener("click", (e) => {
    const option = e.target.closest(".custom-option");

    if (!option) return;

    inputKategori.value = option.dataset.value;

    selectLabel.textContent = option.textContent;
    selectLabel.classList.add("has-value");

    customSelectWrapper.classList.remove("open");

    // Memberi tahu form bahwa pilihan fasilitas berubah
    // agar proses validasi ikut diperbarui.
    inputKategori.dispatchEvent(
      new Event("change", { bubbles: true })
    );
  });

  // Menutup dropdown jika pengguna mengklik area di luarnya.
  document.addEventListener("click", (e) => {
    if (!customSelectWrapper.contains(e.target)) {
      customSelectWrapper.classList.remove("open");
    }
  });


  // =========================================================
  // 9. INISIALISASI HALAMAN
  // =========================================================

  // Mengambil daftar fasilitas dari backend
  // ketika halaman Buat Pengaduan pertama kali dibuka.
  loadFasilitas();

});
