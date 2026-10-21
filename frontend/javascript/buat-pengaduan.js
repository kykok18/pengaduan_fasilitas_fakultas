document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formPengaduan');
    const btnSubmit = document.getElementById('btnSubmit');
    
    // Elemen Input
    const inputJudul = document.getElementById('judul');
    const inputKategori = document.getElementById('kategori');
    const inputLokasi = document.getElementById('lokasi');
    const inputDeskripsi = document.getElementById('deskripsi');
    const inputFile = document.getElementById('file-upload');
    
    // Elemen Error (di bawah input)
    const errorJudul = document.getElementById('errorJudul');
    const errorKategori = document.getElementById('errorKategori');
    const errorLokasi = document.getElementById('errorLokasi');
    const errorDeskripsi = document.getElementById('errorDeskripsi');
    const errorFoto = document.getElementById('errorFoto');
    
    // Elemen Upload
    const uploadWrapper = document.getElementById('uploadWrapper');
    const fileNameDisplay = document.getElementById('fileName');

    // Elemen Notifikasi Atas
    const formNotification = document.getElementById('formNotification');
    const notifIcon = document.getElementById('notifIcon');
    const notifTitle = document.getElementById('notifTitle');
    const notifDesc = document.getElementById('notifDesc');

    const isFormValid = () => {
        return (
            inputJudul.value.trim() !== '' &&
            inputKategori.value !== '' &&
            inputLokasi.value.trim() !== '' &&
            inputDeskripsi.value.trim() !== '' &&
            inputFile.files.length > 0
        );
    };

    const showError = (element, wrapper = null) => {
        element.classList.add('active');
        if (wrapper) {
            wrapper.classList.add('input-error');
        } else {
            element.closest('.form-group').querySelector('.form-control').classList.add('input-error');
        }
    };

    const hideError = (element, wrapper = null) => {
        element.classList.remove('active');
        if (wrapper) {
            wrapper.classList.remove('input-error');
        } else {
            element.closest('.form-group').querySelector('.form-control').classList.remove('input-error');
        }
    };

    // ==========================================
    // FUNGSI TAMPILKAN NOTIFIKASI (MENUMPUK)
    // ==========================================
    const showNotification = (type, title, desc) => {
        const iconSuccess = `<svg width="41" height="41" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.1667 0C9.02917 0 0 9.02917 0 20.1667C0 31.3042 9.02917 40.3333 20.1667 40.3333C31.3042 40.3333 40.3333 31.3042 40.3333 20.1667C40.3333 9.02917 31.3042 0 20.1667 0ZM28.908 16.7567C29.069 16.5727 29.1915 16.3584 29.2684 16.1263C29.3453 15.8943 29.375 15.6492 29.3558 15.4055C29.3366 15.1618 29.2689 14.9244 29.1566 14.7072C29.0442 14.4901 28.8896 14.2976 28.7018 14.1411C28.514 13.9846 28.2968 13.8673 28.063 13.7959C27.8292 13.7246 27.5835 13.7008 27.3403 13.7259C27.0971 13.7509 26.8614 13.8243 26.647 13.9418C26.4327 14.0593 26.2439 14.2185 26.092 14.41L18.2087 23.8682L14.1295 19.7872C13.7837 19.4532 13.3206 19.2684 12.8399 19.2726C12.3592 19.2768 11.8994 19.4696 11.5595 19.8095C11.2196 20.1494 11.0268 20.6092 11.0226 21.0899C11.0184 21.5706 11.2032 22.0337 11.5372 22.3795L17.0372 27.8795C17.2173 28.0595 17.433 28.2001 17.6704 28.2921C17.9079 28.3842 18.1619 28.4257 18.4163 28.4142C18.6707 28.4026 18.92 28.3382 19.1481 28.225C19.3762 28.1118 19.5783 27.9523 19.7413 27.7567L28.908 16.7567Z" fill-rule="evenodd" clip-rule="evenodd" fill="#15A367"/></svg>`;
        
        const iconError = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_647_1525)"><path d="M20 0C21.8359 0 23.6068 0.234375 25.3125 0.703125C27.0182 1.17188 28.6068 1.84896 30.0781 2.73438C31.5495 3.61979 32.8971 4.66146 34.1211 5.85938C35.3451 7.05729 36.3932 8.40495 37.2656 9.90234C38.138 11.3997 38.8086 12.9948 39.2773 14.6875C39.7461 16.3802 39.987 18.151 40 20C40 21.8359 39.7656 23.6068 39.2969 25.3125C38.8281 27.0182 38.151 28.6068 37.2656 30.0781C36.3802 31.5495 35.3385 32.8971 34.1406 34.1211C32.9427 35.3451 31.5951 36.3932 30.0977 37.2656C28.6003 38.138 27.0052 38.8086 25.3125 39.2773C23.6198 39.7461 21.849 39.987 20 40C18.1641 40 16.3932 39.7656 14.6875 39.2969C12.9818 38.8281 11.3932 38.151 9.92188 37.2656C8.45052 36.3802 7.10286 35.3385 5.87891 34.1406C4.65495 32.9427 3.60677 31.5951 2.73438 30.0977C1.86198 28.6003 1.19141 27.0052 0.722656 25.3125C0.253906 23.6198 0.0130208 21.849 0 20C0 18.1641 0.234375 16.3932 0.703125 14.6875C1.17188 12.9818 1.84896 11.3932 2.73438 9.92188C3.61979 8.45052 4.66146 7.10286 5.85938 5.87891C7.05729 4.65495 8.40495 3.60677 9.90234 2.73438C11.3997 1.86198 12.9948 1.19141 14.6875 0.722656C16.3802 0.253906 18.151 0.0130208 20 0ZM22.207 20L28.8867 13.3203L26.6797 11.1133L20 17.793L13.3203 11.1133L11.1133 13.3203L17.793 20L11.1133 26.6797L13.3203 28.8867L20 22.207L26.6797 28.8867L28.8867 26.6797L22.207 20Z" fill="#C41B1B"/></g><defs><clipPath id="clip0_647_1525"><rect width="40" height="40" fill="white"/></clipPath></defs></svg>`;

        notifIcon.innerHTML = type === 'success' ? iconSuccess : iconError;
        notifTitle.textContent = title;
        notifDesc.textContent = desc;
        
        formNotification.className = `form-message ${type}`;
        formNotification.style.display = 'flex';
        
        setTimeout(() => {
            formNotification.classList.add('show');
        }, 1000);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ==========================================
    // LOGIKA SAAT TOMBOL SUBMIT DITEKAN
    // ==========================================
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        formNotification.classList.remove('show');
        setTimeout(() => { formNotification.style.display = 'none'; }, 300);

        if (inputJudul.value.trim() === '') showError(errorJudul);
        if (inputKategori.value === '') showError(errorKategori);
        if (inputLokasi.value.trim() === '') showError(errorLokasi);
        if (inputDeskripsi.value.trim() === '') showError(errorDeskripsi);
        if (inputFile.files.length === 0) showError(errorFoto, uploadWrapper);

        if (!isFormValid()) {
            btnSubmit.classList.add('is-disabled');
            const firstErrorInput = document.querySelector('.form-control.input-error');
            if (firstErrorInput) firstErrorInput.focus();
            return; 
        }

        btnSubmit.classList.remove('is-disabled'); 
        
        // --- MULAI PROSES KE BACKEND ---
        btnSubmit.textContent = 'Mengirim...';
        btnSubmit.disabled = true;

        try {
            const formData = new FormData();
            formData.append('judul', inputJudul.value.trim());
            formData.append('kategori', inputKategori.value);
            formData.append('lokasi', inputLokasi.value.trim());
            formData.append('deskripsi', inputDeskripsi.value.trim());
            formData.append('bukti_foto', inputFile.files[0]);

            // GANTI URL INI DENGAN URL API KAMU
            const response = await fetch('http://localhost/pengaduan_fasilitas_fakultas/backend/api/pengaduan.php', {
                method: 'POST',
                body: formData
            });

            // Cek apakah response mengembalikan JSON
            let result;
            try {
                result = await response.json();
            } catch (err) {
                // Jika backend tidak mereturn JSON (misal error PHP Fatal Error)
                throw new Error("Respon server tidak valid (bukan JSON). Cek tab Network.");
            }

            if (response.ok && (result.status === 'success' || result.success === true)) {
                showNotification('success', 'PENGADUAN BERHASIL DIKIRIM', 'Pengaduan Anda berhasil dikirim. Silakan pantau status pengaduan secara berkala.');
                
                // Reset form setelah berhasil
                form.reset();
                fileNameDisplay.textContent = 'Upload Foto, JPG, PNG.';
                
            } else {
                // Jika server mengembalikan error validasi
                showNotification('error', 'PENGADUAN GAGAL DIKIRIM', result.message || 'Terjadi kesalahan pada sistem. Silakan coba lagi.');
            }

        } catch (error) {
            console.error("Error Fetch:", error);
            // Jika server mati / tidak bisa dihubungi
            showNotification('error', 'PENGADUAN GAGAL DIKIRIM', 'Gagal terhubung ke server. Pastikan XAMPP menyala dan API benar.');
        } finally {
            // Kembalikan tombol ke keadaan semula
            btnSubmit.textContent = 'Kirim Pengaduan';
            btnSubmit.disabled = false;
        }
    });

    // ==========================================
    // LOGIKA SAAT USER MENGETIK / MENGISI FORM
    // ==========================================
    const handleInput = () => {
        formNotification.classList.remove('show');
        setTimeout(() => { formNotification.style.display = 'none'; }, 300);

        if (inputJudul.value.trim() !== '') hideError(errorJudul);
        if (inputKategori.value !== '') hideError(errorKategori);
        if (inputLokasi.value.trim() !== '') hideError(errorLokasi);
        if (inputDeskripsi.value.trim() !== '') hideError(errorDeskripsi);
        if (inputFile.files.length > 0) hideError(errorFoto, uploadWrapper);

        if (isFormValid()) {
            btnSubmit.classList.remove('is-disabled');
        }
    };

    inputJudul.addEventListener('input', handleInput);
    inputKategori.addEventListener('change', handleInput);
    inputLokasi.addEventListener('input', handleInput);
    inputDeskripsi.addEventListener('input', handleInput);
    
    inputFile.addEventListener('change', () => {
        if (inputFile.files.length > 0) {
            fileNameDisplay.textContent = inputFile.files[0].name;
        } else {
            fileNameDisplay.textContent = 'Upload Foto, JPG, PNG.';
        }
        handleInput();
    });
});