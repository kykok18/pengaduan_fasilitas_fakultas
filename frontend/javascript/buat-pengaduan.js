document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formPengaduan');
    const btnSubmit = document.getElementById('btnSubmit');
    
    // Elemen Input
    const inputJudul = document.getElementById('judul');
    const inputKategori = document.getElementById('kategori');
    const inputLokasi = document.getElementById('lokasi');
    const inputDeskripsi = document.getElementById('deskripsi');
    const inputFile = document.getElementById('file-upload');
    
    // Elemen Error
    const errorJudul = document.getElementById('errorJudul');
    const errorKategori = document.getElementById('errorKategori');
    const errorLokasi = document.getElementById('errorLokasi');
    const errorDeskripsi = document.getElementById('errorDeskripsi');
    const errorFoto = document.getElementById('errorFoto');
    
    // Elemen Upload
    const uploadWrapper = document.getElementById('uploadWrapper');
    const fileNameDisplay = document.getElementById('fileName');

    // Fungsi Cek Form Valid
    const checkFormValidity = () => {
        let isValid = true;

        // Cek Judul
        if (inputJudul.value.trim() === '') {
            errorJudul.classList.add('active');
            inputJudul.classList.add('input-error');
            isValid = false;
        } else {
            errorJudul.classList.remove('active');
            inputJudul.classList.remove('input-error');
        }

        // Cek Kategori
        if (inputKategori.value === '') {
            errorKategori.classList.add('active');
            inputKategori.classList.add('input-error');
            isValid = false;
        } else {
            errorKategori.classList.remove('active');
            inputKategori.classList.remove('input-error');
        }

        // Cek Lokasi
        if (inputLokasi.value.trim() === '') {
            errorLokasi.classList.add('active');
            inputLokasi.classList.add('input-error');
            isValid = false;
        } else {
            errorLokasi.classList.remove('active');
            inputLokasi.classList.remove('input-error');
        }

        // Cek Deskripsi
        if (inputDeskripsi.value.trim() === '') {
            errorDeskripsi.classList.add('active');
            inputDeskripsi.classList.add('input-error');
            isValid = false;
        } else {
            errorDeskripsi.classList.remove('active');
            inputDeskripsi.classList.remove('input-error');
        }

        // Cek File
        if (inputFile.files.length === 0) {
            errorFoto.classList.add('active');
            uploadWrapper.classList.add('input-error');
            isValid = false;
        } else {
            errorFoto.classList.remove('active');
            uploadWrapper.classList.remove('input-error');
        }

        // Toggle Tombol Submit
        if (isValid) {
            btnSubmit.classList.add('active');
            btnSubmit.removeAttribute('disabled');
        } else {
            btnSubmit.classList.remove('active');
            btnSubmit.setAttribute('disabled', 'true');
        }

        return isValid;
    };

    // Event Listener untuk setiap input (setiap kali user mengetik/memilih)
    inputJudul.addEventListener('input', checkFormValidity);
    inputKategori.addEventListener('change', checkFormValidity);
    inputLokasi.addEventListener('input', checkFormValidity);
    inputDeskripsi.addEventListener('input', checkFormValidity);
    
    // Event Listener untuk File Upload (mengubah teks dan validasi)
    inputFile.addEventListener('change', () => {
        if (inputFile.files.length > 0) {
            fileNameDisplay.textContent = inputFile.files[0].name;
        } else {
            fileNameDisplay.textContent = 'Upload Foto, JPG, PNG.';
        }
        checkFormValidity();
    });

    // Event Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Mencegah reload halaman

        if (checkFormValidity()) {
            // Lakukan pengiriman data ke API di sini (menggunakan FormData)
            alert('Pengaduan berhasil dikirim! (Simulasi)');
            // window.location.href = 'dashboard.html'; // Redirect setelah sukses
        }
    });

    // Panggil sekali saat halaman load (untuk set tombol disabled di awal)
    //checkFormValidity();
});