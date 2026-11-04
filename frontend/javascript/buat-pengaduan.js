document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formPengaduan");
  const btnSubmit = document.getElementById("btnSubmit");

  // Elemen Input
  const inputJudul = document.getElementById("judul");
  const inputKategori = document.getElementById("kategori");
  const customSelectWrapper = document.getElementById("customSelectWrapper");
  const selectTrigger = document.getElementById("selectTrigger");
  const selectLabel = document.getElementById("selectLabel");
  const customOptions = document.getElementById("customOptions");
  const inputLokasi = document.getElementById("lokasi");
  const inputDeskripsi = document.getElementById("deskripsi");
  const inputFile = document.getElementById("file-upload");

  // Elemen Error (di bawah input)
  const errorJudul = document.getElementById("errorJudul");
  const errorKategori = document.getElementById("errorKategori");
  const errorLokasi = document.getElementById("errorLokasi");
  const errorDeskripsi = document.getElementById("errorDeskripsi");
  const errorFoto = document.getElementById("errorFoto");

  // Elemen Upload
  const uploadWrapper = document.getElementById("uploadWrapper");
  const fileNameDisplay = document.getElementById("fileName");

  // Elemen Notifikasi Atas
  const formNotification = document.getElementById("formNotification");
  const notifIcon = document.getElementById("notifIcon");
  const notifTitle = document.getElementById("notifTitle");
  const notifDesc = document.getElementById("notifDesc");

  let isSubmitting = false;

  const isFormValid = () => {
    return (
      inputJudul.value.trim() !== "" &&
      inputKategori.value !== "" &&
      inputLokasi.value.trim() !== "" &&
      inputDeskripsi.value.trim() !== "" &&
      inputFile.files.length > 0
    );
  };

  const validateFile = async () => {
  const file = inputFile.files[0];

  
if (!file) {
    setFotoError("Bukti foto wajib diisi.");
    return false;
}


  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  
if (!allowedTypes.includes(file.type)) {
    setFotoError(
        "Format file tidak didukung. Gunakan JPG, PNG, WebP."
    );
    return false;
}



if (file.size === 0 || file.size > 10 * 1024 * 1024) {
    setFotoError(
        file.size === 0
            ? "File foto tidak boleh kosong."
            : "Ukuran file terlalu besar. Maksimal 10 MB."
    );
    return false;
}


  // Periksa apakah file benar-benar gambar dan dimensinya valid
  const image = new Image();
  const imageUrl = URL.createObjectURL(file);

  try {
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = imageUrl;
    });

    const width = image.naturalWidth;
    const height = image.naturalHeight;
    const megapixels = (width * height) / 1_000_000;

    if (
      width > 6000 ||
      height > 6000 ||
      megapixels > 20
    ) {
      
setFotoError(
    "Dimensi foto terlalu besar. Maksimal 6000 x 6000 piksel dan 20 megapiksel."
);


      return false;
    }

  } catch {
    
setFotoError(
    "File yang diunggah bukan gambar yang valid."
);

    return false;

  } finally {
    URL.revokeObjectURL(imageUrl);
  }

  hideError(errorFoto, uploadWrapper);
  return true;
};

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

  
/* ==========================================
   PESAN ERROR KHUSUS BUKTI FOTO
   ========================================== */

const setFotoError = (message) => {
    const errorFotoText = errorFoto.querySelector("span");

    if (errorFotoText) {
        errorFotoText.textContent = message;
    }

    showError(errorFoto, uploadWrapper);
};


  // ==========================================
// FUNGSI NOTIFIKASI
// ==========================================

let notificationTimer;
let notificationHideTimer;

const showNotification = (type, title, desc) => {

  // Hentikan timer notifikasi sebelumnya
  clearTimeout(notificationTimer);
  clearTimeout(notificationHideTimer);

  

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



  const iconError = `
    <svg width="40" height="40" viewBox="0 0 40 40"
      fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 0C31.0457 0 40 8.9543 40 20C40 31.0457 31.0457 40 20 40C8.9543 40 0 31.0457 0 20C0 8.9543 8.9543 0 20 0ZM22.207 20L28.8867 13.3203L26.6797 11.1133L20 17.793L13.3203 11.1133L11.1133 13.3203L17.793 20L11.1133 26.6797L13.3203 28.8867L20 22.207L26.6797 28.8867L28.8867 26.6797L22.207 20Z"
      fill="#C41B1B"/>
    </svg>`;

  const iconOffline = `
    <svg width="48" height="48" viewBox="0 0 48 48"
      fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 17C14.5 5 33.5 5 46 17L42 21C31.7 11.5 16.3 11.5 6 21L2 17ZM10 25C18 17.5 30 17.5 38 25L34 29C28.5 24 19.5 24 14 29L10 25ZM18 33C21.3 30 26.7 30 30 33L24 39L18 33Z"
      fill="#FFB000"/>
    </svg>`;

  // Tentukan ikon berdasarkan tipe notifikasi
  const icons = {
    success: iconSuccess,
    error: iconError,
    offline: iconOffline
  };

  notifIcon.innerHTML = icons[type] || iconError;

  notifTitle.textContent = title;
  notifDesc.textContent = desc;

  // Atur class notifikasi
  formNotification.className = `form-message ${type}`;

  // Tampilkan notifikasi
  formNotification.style.display = "flex";

  requestAnimationFrame(() => {
    formNotification.classList.add("show");
  });

  // Kembali ke bagian atas halaman
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  // Hilangkan notifikasi setelah 5 detik
  notificationTimer = setTimeout(() => {

    formNotification.classList.remove("show");

    notificationHideTimer = setTimeout(() => {
      formNotification.style.display = "none";
    }, 300);

  }, 5000);
};


// Fungsi menyembunyikan notifikasi
const hideNotification = () => {

  clearTimeout(notificationTimer);
  clearTimeout(notificationHideTimer);

  formNotification.classList.remove("show");

  notificationHideTimer = setTimeout(() => {
    formNotification.style.display = "none";
  }, 300);
};

  const loadFasilitas = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/pengaduan.php`, {
      method: "GET",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
      },
    });


    

const result = await response.json();

// Jika belum login atau session sudah berakhir
if (response.status === 401) {
  clearUserSession();
  window.location.replace("login.html");
  return;
}

if (!response.ok || result.status !== "success") {
  throw new Error(result.message || "Gagal memuat fasilitas.");
}

// Sesi telah diverifikasi oleh backend
document.documentElement.classList.add("auth-verified");

    // Kontrak API 1.3: data langsung berupa array
    
const facilityList = result.data?.fasilitas ?? [];


    customOptions.innerHTML = "";
    inputKategori.value = "";
    selectLabel.textContent = "Pilih Fasilitas";
    selectLabel.classList.remove("has-value");

    if (!Array.isArray(facilityList) || facilityList.length === 0) {
      selectLabel.textContent = "Fasilitas tidak tersedia";
      return;
    }

    facilityList.forEach((fasilitas) => {
      const option = document.createElement("div");

      option.className = "custom-option";
      option.dataset.value = fasilitas.id_fasilitas;
      option.textContent = fasilitas.nama_fasilitas;

      customOptions.appendChild(option);
    });

  } catch (error) {
    console.error("Gagal verifikasi sesi:", error);

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

  // ==========================================
  // LOGIKA SAAT TOMBOL SUBMIT DITEKAN
  // ==========================================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    
isSubmitting = true;

hideNotification();


    hideNotification();

    if (inputJudul.value.trim() === "") showError(errorJudul);
    if (inputKategori.value === "") showError(errorKategori);
    if (inputLokasi.value.trim() === "") showError(errorLokasi);
    if (inputDeskripsi.value.trim() === "") showError(errorDeskripsi);
    const fotoValid = await validateFile();

    
if (!isFormValid() || !fotoValid) {
    btnSubmit.classList.add("is-disabled");

    // Kembalikan kondisi tombol karena validasi gagal
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

    // --- MULAI PROSES KE BACKEND ---
    btnSubmit.textContent = "Loading...";
    btnSubmit.disabled = true;
    btnSubmit.classList.add("is-loading");

    try {
      const formData = new FormData();
      formData.append("id_fasilitas", inputKategori.value);
      formData.append("judul", inputJudul.value.trim());
      formData.append("lokasi", inputLokasi.value.trim());
      formData.append("deskripsi", inputDeskripsi.value.trim());

      if (inputFile.files.length > 0) {
        formData.append("foto", inputFile.files[0]);
      }

      const apiUrl = `${API_BASE_URL}/pengaduan.php`;

      const response = await fetch(apiUrl, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      // Cek apakah response mengembalikan JSON
      let result;
      try {
        result = await response.json();
      } catch (error) {
        // Jika backend tidak mereturn JSON (misal error PHP Fatal Error)
        throw new Error(
          "Respon server tidak valid (bukan JSON). Cek tab Network.",
        );
      }

      
if (response.ok && result.status === "success") {
        showNotification(
          "success",
          "PENGADUAN BERHASIL DIKIRIM",
          "Pengaduan Anda berhasil dikirim. Silakan pantau status pengaduan secara berkala.",
        );

        // Reset form setelah berhasil
        form.reset();

        inputKategori.value = "";
        selectLabel.textContent = "Pilih Fasilitas";
        selectLabel.classList.remove("has-value");

        fileNameDisplay.textContent = "Upload Foto, JPG, PNG. Maksimal 10 MB"; 

        hideError(errorJudul);
        hideError(errorKategori);
        hideError(errorLokasi);
        hideError(errorDeskripsi);
        hideError(errorFoto, uploadWrapper);

        btnSubmit.classList.remove("is-disabled");
        customSelectWrapper.classList.remove("open");
      } else if (response.status === 409) {
  showNotification(
    "error",
    "PENGADUAN SEDANG DIPROSES",
    result.message || "Pengaduan Anda sedang diproses. Tunggu hingga selesai."
  );


} else if (response.status === 401) {
  clearUserSession();
  window.location.replace("login.html");
  return;


} else {
  showNotification(
    "error",
    "PENGADUAN GAGAL DIKIRIM",
    result.message || "Terjadi kesalahan pada sistem. Silakan coba lagi."
  );
}

      } catch (error) {
    console.error("Error Fetch:", error);

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
}

    finally {
    isSubmitting = false;

    btnSubmit.textContent = "Kirim Pengaduan";
    btnSubmit.disabled = false;
    btnSubmit.classList.remove("is-loading");
}
  });

  // ==========================================
  // LOGIKA SAAT USER MENGETIK / MENGISI FORM
  // ==========================================
  const handleInput = () => {

    // Hilangkan error jika input sudah diisi
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

    // Validasi foto hanya jika pengguna sudah memilih file
        if (inputFile.files.length > 0) {
      validateFile();
    }

    // Aktifkan kembali tampilan tombol jika semua input terisi
    if (isFormValid()) {
        btnSubmit.classList.remove("is-disabled");
    }
};

  inputJudul.addEventListener("input", handleInput);
  inputKategori.addEventListener("change", handleInput);
  inputLokasi.addEventListener("input", handleInput);
  inputDeskripsi.addEventListener("input", handleInput);

  inputFile.addEventListener("change", () => {
    if (inputFile.files.length > 0) {
      fileNameDisplay.textContent = inputFile.files[0].name;
    } else {
      fileNameDisplay.textContent = "Upload Foto, JPG, PNG.";
    }
    handleInput();
  });

  // ==========================================
// DROPDOWN KATEGORI
// ==========================================

// Buka dan tutup dropdown
selectTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    customSelectWrapper.classList.toggle("open");
});

// Pilih kategori
customOptions.addEventListener("click", (e) => {
    const option = e.target.closest(".custom-option");

    if (!option) return;

    inputKategori.value = option.dataset.value;

    selectLabel.textContent = option.textContent;
    selectLabel.classList.add("has-value");

    customSelectWrapper.classList.remove("open");

    inputKategori.dispatchEvent(
        new Event("change", { bubbles: true })
    );
});

// Tutup dropdown jika klik di luar
document.addEventListener("click", (e) => {
    if (!customSelectWrapper.contains(e.target)) {
        customSelectWrapper.classList.remove("open");
    }
});

  // Muat fasilitas dari database
  loadFasilitas();
});
