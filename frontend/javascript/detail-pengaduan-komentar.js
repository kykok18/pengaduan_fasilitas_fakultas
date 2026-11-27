
/**
 * =====================================================
 * FITK SIBER AHSAN
 * DETAIL PENGADUAN — KOMENTAR
 * =====================================================
 *
 * File ini mengatur fitur komentar pada halaman
 * Detail Pengaduan.
 *
 * Fitur yang ditangani:
 * - Menampilkan daftar komentar.
 * - Mengurutkan komentar berdasarkan tanggal.
 * - Menampilkan kondisi ketika komentar kosong.
 * - Memvalidasi isi komentar sebelum dikirim.
 * - Mengirim komentar ke backend menggunakan API.
 * - Memperbarui daftar komentar setelah berhasil.
 * - Menampilkan notifikasi berhasil atau gagal.
 */


// Membuat objek global agar modul komentar dapat digunakan
// oleh file utama detail-pengaduan.js.
window.FITKDetailKomentar = {

    // Fungsi create() menyiapkan seluruh fitur komentar.
    // Data di bawah diterima dari detail-pengaduan.js.
    create({
        commentsList,   // Elemen HTML untuk menampilkan daftar komentar.
        commentsTitle,  // Elemen HTML untuk judul dan jumlah komentar.
        commentsCard,   // Elemen HTML untuk wadah komentar.
        formatJumlah,   // Fungsi untuk memformat jumlah komentar.
        formatTanggal,  // Fungsi untuk mengubah format tanggal.
        idPengaduan     // ID pengaduan yang sedang dibuka.
    }) {


        // ==================================================
        // 1. VARIABEL UNTUK MENGELOLA KOMENTAR
        // ==================================================

        let komentarSaatIni = [];
        // Menyimpan daftar komentar yang sedang ditampilkan.

        let isSendingComment = false;
        // Menandakan apakah komentar sedang dikirim.
        // false = tidak sedang mengirim.
        // true  = proses pengiriman sedang berlangsung.

        let commentErrorTimeout = null;
        // Menyimpan timer untuk notifikasi komentar gagal.

        let commentSuccessTimeout = null;
        // Menyimpan timer untuk notifikasi komentar berhasil.


        // ==================================================
        // 2. NOTIFIKASI KOMENTAR GAGAL
        // ==================================================

        // Fungsi ini menampilkan notifikasi ketika
        // komentar gagal dikirim ke backend.
        const showCommentError = () => {

            // Mencari elemen notifikasi gagal berdasarkan ID.
            let alert = document.getElementById("commentErrorAlert");

            // Jika elemen belum tersedia di HTML,
            // JavaScript akan membuat elemen baru.
            if (!alert) {

                alert = document.createElement("div");
                // Membuat elemen div untuk notifikasi.

                alert.id = "commentErrorAlert";
                // Memberikan ID agar elemen mudah ditemukan.

                alert.className = "vote-error-alert";
                // Menggunakan class CSS notifikasi error yang sudah ada.

                alert.setAttribute("role", "alert");
                // Memberikan informasi bahwa ini adalah pesan peringatan
                // untuk kebutuhan aksesibilitas.

                alert.hidden = true;
                // Menyembunyikan notifikasi saat pertama dibuat.

                // Menentukan isi HTML untuk notifikasi gagal.
                // SVG digunakan untuk membuat ikon silang merah.
                alert.innerHTML = `
                    <div class="vote-error-icon">
                        <svg width="40" height="40"
                             viewBox="0 0 40 40"
                             xmlns="http://www.w3.org/2000/svg"
                             aria-hidden="true">
                            <circle cx="20" cy="20" r="20"
                                    fill="#C41B1B"/>
                            <path d="M13 13L27 27M27 13L13 27"
                                  stroke="#FFFFFF"
                                  stroke-width="4"
                                  stroke-linecap="round"/>
                        </svg>
                    </div>

                    <div class="vote-error-content">
                        <strong>KOMENTAR GAGAL DIKIRIM</strong>
                        <p>
                            Terjadi kesalahan saat mengirim komentar.
                            Silakan coba lagi
                        </p>
                    </div>
                `;

                document.body.appendChild(alert);
                // Menambahkan notifikasi ke dalam halaman HTML.
            }

            clearTimeout(commentErrorTimeout);
            // Menghentikan timer sebelumnya jika masih berjalan.

            alert.hidden = false;
            // Menampilkan notifikasi gagal.

            commentErrorTimeout = setTimeout(() => {

                alert.hidden = true;
                // Menyembunyikan notifikasi secara otomatis.

            }, 4000);
            // 4000 milidetik = 4 detik.
        };


        // ==================================================
        // 3. NOTIFIKASI KOMENTAR BERHASIL
        // ==================================================

        // Fungsi ini menampilkan notifikasi ketika
        // komentar berhasil dikirim ke backend.
        const showCommentSuccess = () => {

            // Mencari elemen notifikasi berhasil.
            let alert = document.getElementById("commentSuccessAlert");

            // Jika elemen belum dibuat, buat elemen baru.
            if (!alert) {

                alert = document.createElement("div");
                // Membuat wadah notifikasi.

                alert.id = "commentSuccessAlert";
                // Memberikan ID khusus notifikasi berhasil.

                alert.className =
                    "vote-error-alert comment-success-alert";
                // Menggunakan class dasar notifikasi
                // dan class tambahan untuk warna berhasil.

                alert.setAttribute("role", "status");
                // Menandakan notifikasi berisi informasi status.

                alert.setAttribute("aria-live", "polite");
                // Membantu pembaca layar mengetahui perubahan status
                // tanpa langsung mengganggu pembacaan lainnya.

                alert.hidden = true;
                // Menyembunyikan notifikasi sebelum ditampilkan.

                // Menentukan tampilan notifikasi berhasil.
                // SVG di bawah menggambar ikon centang hijau.
                alert.innerHTML = `
                    <div class="vote-error-icon">
                        <svg
                            width="41"
                            height="41"
                            viewBox="0 0 41 41"
                            xmlns="http://www.w3.org/2000/svg"
                            style="display: block; filter: none; box-shadow: none;"
                        >
                            <circle
                                cx="20.5"
                                cy="20.5"
                                r="20"
                                fill="#15A367"
                                stroke="none"
                            />

                            <path
                                d="M11.5 20.5L17 26L29 14"
                                fill="none"
                                stroke="#FFFFFF"
                                stroke-width="4"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                style="
                                    fill: none !important;
                                    stroke: #FFFFFF !important;
                                    filter: none !important;
                                "
                            />
                        </svg>
                    </div>

                    <div class="vote-error-content">
                        <strong>KOMENTAR BERHASIL DIKIRIM</strong>
                        <p>Komentar Anda berhasil ditambahkan.</p>
                    </div>
                `;

                document.body.appendChild(alert);
                // Menambahkan notifikasi berhasil ke halaman.
            }

            clearTimeout(commentSuccessTimeout);
            // Menghentikan timer lama jika notifikasi muncul lagi.

            alert.hidden = false;
            // Menampilkan notifikasi berhasil.

            commentSuccessTimeout = setTimeout(() => {

                alert.hidden = true;
                // Menyembunyikan notifikasi setelah 4 detik.

            }, 4000);
        };


        // ==================================================
        // 4. MENAMPILKAN DAFTAR KOMENTAR
        // ==================================================

        // Fungsi renderKomentar() menerima daftar komentar
        const renderKomentar = (komentar) => {

            commentsList.replaceChildren();
            // Menghapus seluruh komentar yang sebelumnya tampil.
            // Tujuannya agar daftar tidak muncul dua kali.


            // Fungsi untuk mengubah tanggal komentar
            // menjadi angka waktu yang bisa dibandingkan.
            const parseWaktuKomentar = (tanggal) => {

                const waktu = new Date(
                    String(tanggal || "").replace(" ", "T")
                ).getTime();

                // String() memastikan tanggal menjadi teks.
                // replace() menyesuaikan format tanggal dari backend.
                // new Date() mengubah teks menjadi objek tanggal.
                // getTime() menghasilkan waktu dalam milidetik.

                return Number.isNaN(waktu) ? 0 : waktu;
                // Jika tanggal tidak valid, gunakan angka 0.
                // Jika valid, gunakan angka waktu yang diperoleh.
            };


            // Memastikan data komentar berbentuk array.
            const daftarKomentar = Array.isArray(komentar)

                ? [...komentar].sort(
                    (a, b) =>
                        parseWaktuKomentar(b.created_at) -
                        parseWaktuKomentar(a.created_at)
                )

                : [];

            // Array.isArray() memeriksa apakah data berbentuk array.
            // [...komentar] membuat salinan daftar komentar.
            // sort() mengurutkan komentar.
            //
            // Pengurutan menggunakan waktu b - a,
            // sehingga komentar terbaru ditampilkan lebih dahulu.
            //
            // Jika data bukan array, gunakan daftar kosong [].


            komentarSaatIni = [...daftarKomentar];
            // Menyimpan salinan komentar yang sudah diurutkan.
            // Data ini digunakan lagi ketika komentar baru dikirim.


            commentsTitle.textContent =
                `Komentar(${formatJumlah(daftarKomentar.length)})`;

            // Menampilkan jumlah komentar pada judul.
            // Contoh: Komentar(5).
            // length digunakan untuk menghitung jumlah elemen array.


            const tidakAdaKomentar = daftarKomentar.length === 0;
            // Memeriksa apakah jumlah komentar adalah 0.
            // Hasilnya berupa true atau false.


            commentsCard.classList.toggle(
                "is-empty-comments",
                tidakAdaKomentar
            );

            // Menambahkan class is-empty-comments
            // jika daftar komentar kosong.
            //
            // Class ini digunakan oleh CSS untuk
            // mengatur tampilan kondisi belum ada komentar.


            // ==================================================
            // 5. TAMPILAN KETIKA BELUM ADA KOMENTAR
            // ==================================================

            // Jika daftar komentar kosong, tampilkan empty state.
            if (tidakAdaKomentar) {

                const emptyState = document.createElement("div");
                // Membuat elemen baru untuk tampilan kosong.

                emptyState.className = "detail-empty-comments";
                // Menghubungkan elemen dengan CSS empty state.

                // Membuat ikon dan pesan belum ada komentar.
                emptyState.innerHTML = `
                    <svg width="31" height="25"
                         viewBox="0 0 31 25"
                         xmlns="http://www.w3.org/2000/svg"
                         aria-hidden="true">
                        <path
                            d="M15.5 1C7.5 1 1 6.1 1 12.4c0 3.2 1.7 6.1 4.5 8.2L3 24l6.5-2.3c1.9.7 3.9 1.1 6 1.1 8 0 14.5-5.1 14.5-11.4S23.5 1 15.5 1Z"
                            fill="#B0B0B0"
                        />
                    </svg>
                    <p>Belum ada komentar pada pengaduan ini.</p>
                `;

                commentsList.appendChild(emptyState);
                // Menambahkan tampilan kosong ke area komentar.

                return;
                // Menghentikan fungsi karena belum ada
                // komentar yang perlu ditampilkan.
            }


            // ==================================================
            // 6. MEMBUAT TAMPILAN SETIAP KOMENTAR
            // ==================================================

            // Perulangan untuk menampilkan setiap komentar.
            daftarKomentar.forEach((item) => {

                const card = document.createElement("div");
                // Membuat wadah untuk satu komentar.

                card.className = "detail-comment-item";
                // Memberikan class CSS untuk desain komentar.


                const header = document.createElement("div");
                // Membuat bagian header komentar.

                header.className = "detail-comment-header";
                // Mengatur tampilannya melalui CSS.


                const author = document.createElement("strong");
                // Membuat elemen untuk nama pengirim komentar.

                author.className = "detail-comment-author";
                // Menggunakan class CSS nama pengguna.

                author.textContent = item.nama || "Pengguna";
                // Menampilkan nama pengirim komentar.
                // Jika nama tidak tersedia, tampilkan "Pengguna".


                const date = document.createElement("span");
                // Membuat elemen untuk tanggal komentar.

                date.className = "detail-comment-date";
                // Memberikan class CSS pada tanggal.

                date.textContent = formatTanggal(item.created_at);
                // Mengubah tanggal menjadi format yang mudah dibaca.


                const description = document.createElement("p");
                // Membuat elemen paragraf untuk isi komentar.

                description.className = "detail-comment-text";
                // Memberikan class CSS pada teks komentar.

                description.textContent = item.isi_komentar || "";
                // Menampilkan isi komentar dari backend.
                //
                // textContent digunakan agar isi komentar
                // diperlakukan sebagai teks, bukan kode HTML.


                header.appendChild(author);
                // Memasukkan nama pengirim ke header komentar.

                header.appendChild(date);
                // Memasukkan tanggal ke header komentar.


                card.appendChild(header);
                // Memasukkan header ke dalam card komentar.

                card.appendChild(description);
                // Memasukkan isi komentar ke card.


                commentsList.appendChild(card);
                // Menambahkan card komentar ke halaman.
            });
        };


        // ==================================================
        // 7. MENGAMBIL ELEMEN FORM KOMENTAR
        // ==================================================

        const commentForm =
            document.getElementById("detailCommentForm");
        // Mengambil form komentar dari HTML.


        const commentInput = commentForm.querySelector("textarea");
        // Mengambil kolom input untuk menulis komentar.


        const commentBtn =
            commentForm.querySelector('button[type="submit"]');
        // Mengambil tombol Kirim pada form komentar.


        const commentError =
            document.getElementById("detailCommentError");
        // Mengambil elemen pesan validasi komentar.


        // ==================================================
        // 8. EVENT SAAT TOMBOL KIRIM DIKLIK
        // ==================================================

        // Event submit berjalan ketika pengguna
        // mengirim form komentar.
        commentForm.addEventListener("submit", async (event) => {

            event.preventDefault();
            // Mencegah browser melakukan submit form biasa.
            // Dengan begitu, halaman tidak langsung refresh.


            if (isSendingComment) return;
            // Jika komentar sedang dikirim, hentikan proses.
            // Tujuannya mencegah pengiriman berulang
            // ketika tombol diklik beberapa kali.


            const isiKomentar = commentInput.value.trim();
            // Mengambil teks yang ditulis pengguna.
            // trim() menghapus spasi di awal dan akhir teks.


            // ==================================================
            // 9. VALIDASI KOMENTAR KOSONG
            // ==================================================

            // Jika pengguna belum mengisi komentar:
            if (!isiKomentar) {

                if (commentError) {
                    // Memastikan elemen pesan error tersedia.

                    commentError.querySelector("span").textContent =
                        "Komentar wajib diisi.";
                    // Menentukan teks validasi komentar kosong.

                    commentError.hidden = false;
                    // Menampilkan pesan error pada halaman.
                }

                commentBtn.classList.add("is-empty");
                // Menambahkan class untuk kondisi komentar kosong.

                return;
                // Menghentikan pengiriman agar
                // komentar kosong tidak masuk ke backend.
            }


            // ==================================================
            // 10. VALIDASI BATAS KARAKTER
            // ==================================================

            // Jika isi komentar lebih dari 1000 karakter:
            if ([...isiKomentar].length > 1000) {

                commentInput.setCustomValidity(
                    "Komentar maksimal 1000 karakter."
                );
                // Menentukan pesan validasi dari browser.

                commentInput.reportValidity();
                // Menampilkan pesan validasi kepada pengguna.

                return;
                // Menghentikan proses jika karakter terlalu banyak.
            }


            commentInput.setCustomValidity("");
            // Menghapus pesan validasi sebelumnya
            // ketika isi komentar sudah memenuhi batas karakter.


            // Memastikan ID pengaduan tersedia dan valid.
            if (!idPengaduan || !/^[1-9]\d*$/.test(idPengaduan)) {

                showCommentError();
                // Menampilkan notifikasi gagal jika ID tidak valid.

                return;
                // Menghentikan pengiriman komentar.
            }


            // ==================================================
            // 11. MENGATUR TOMBOL SAAT PENGIRIMAN
            // ==================================================

            isSendingComment = true;
            // Menandakan bahwa proses pengiriman dimulai.

            commentBtn.disabled = true;
            // Menonaktifkan tombol Kirim sementara.
            // Supaya komentar tidak terkirim berkali-kali.

            commentBtn.textContent = "Loading...";
            // Mengubah teks tombol menjadi Loading...


            // ==================================================
            // 12. MENGIRIM KOMENTAR KE BACKEND
            // ==================================================

            try {

                // Menyiapkan data yang akan dikirim ke backend.
                const body = new URLSearchParams({

                    id_pengaduan: idPengaduan,
                    // ID pengaduan yang akan menerima komentar.

                    isi_komentar: isiKomentar
                    // Isi komentar yang sudah divalidasi.
                });


                // Mengirim komentar menggunakan HTTP POST.
                const response = await fetch(
                    `${API_BASE_URL}/komentar.php`,
                    {
                        method: "POST",
                        // POST digunakan untuk mengirim data ke backend.

                        credentials: "same-origin",
                        // Mengirim cookie pada request
                        // dengan origin yang sama.

                        headers: {

                            "Content-Type":
                                "application/x-www-form-urlencoded",
                            // Menentukan format data yang dikirim.

                            "Accept": "application/json"
                            // Mengharapkan respons dalam format JSON.
                        },

                        body: body.toString()
                        // Mengubah URLSearchParams menjadi teks
                        // yang dikirim melalui request POST.
                    }
                );


                // ==================================================
                // 13. MEMERIKSA STATUS LOGIN PENGGUNA
                // ==================================================

                // Jika server mengembalikan HTTP 401,
                // berarti pengguna tidak terautentikasi.
                if (response.status === 401) {

                    clearUserSession();
                    // Menghapus data sesi frontend.

                    window.location.replace("login.html");
                    // Mengarahkan pengguna ke halaman Login.

                    return;
                    // Menghentikan proses pengiriman komentar.
                }


                // ==================================================
                // 14. MEMBACA RESPONS BACKEND
                // ==================================================

                const result = await response.json();
                // Membaca respons JSON dari backend.
                // JSON diubah menjadi objek JavaScript.


                // Memeriksa apakah pengiriman berhasil.
                if (
                    !response.ok ||
                    // Memeriksa apakah status HTTP berhasil.

                    result.status !== "success" ||
                    // Memeriksa apakah backend mengirim status success.

                    !result.data?.komentar ||
                    // Memeriksa apakah data komentar tersedia.

                    String(result.data.id_pengaduan) !==
                        String(idPengaduan)
                    // Memastikan komentar benar-benar
                    // tercatat pada pengaduan yang sesuai.
                ) {

                    throw new Error(
                        result.message || "Gagal mengirim komentar."
                    );
                    // Membuat error jika hasil tidak sesuai.
                    // Error akan ditangani pada bagian catch().
                }


                // ==================================================
                // 15. MEMPERBARUI DAFTAR KOMENTAR
                // ==================================================

                const komentarBaru = result.data.komentar;
                // Mengambil komentar yang berhasil
                // disimpan dan dikembalikan oleh backend.


                renderKomentar([
                    komentarBaru,
                    ...komentarSaatIni
                ]);

                // Menambahkan komentar baru ke daftar yang ada.
                // Spread operator (...) memasukkan isi array lama.
                // renderKomentar() mengurutkan dan
                // menampilkan ulang semua komentar.


                commentsTitle.textContent =
                    `Komentar(${formatJumlah(result.data.total_komentar)})`;

                // Memperbarui angka jumlah komentar
                // sesuai total yang dikirim oleh backend.


                commentInput.value = "";
                // Mengosongkan kolom komentar setelah berhasil.


                commentBtn.classList.remove("is-empty");
                // Menghapus class untuk kondisi komentar kosong.


                if (commentError) {

                    commentError.hidden = true;
                    // Menyembunyikan pesan validasi sebelumnya.
                }


                showCommentSuccess();
                // Menampilkan notifikasi
                // "KOMENTAR BERHASIL DIKIRIM" selama 4 detik.


            // ==================================================
            // 16. MENANGANI KEGAGALAN PENGIRIMAN
            // ==================================================

            } catch (error) {

                console.error("Gagal mengirim komentar:", error);
                // Menampilkan informasi error di Console browser.
                // Berguna untuk debugging saat pengembangan.

                showCommentError();
                // Menampilkan notifikasi
                // "KOMENTAR GAGAL DIKIRIM".


            // ==================================================
            // 17. MENGEMBALIKAN KONDISI TOMBOL
            // ==================================================

            } finally {

                isSendingComment = false;
                // Menandakan proses pengiriman sudah selesai.

                commentBtn.disabled = false;
                // Mengaktifkan kembali tombol Kirim.

                commentBtn.textContent = "Kirim";
                // Mengembalikan tulisan tombol menjadi "Kirim".
                //
                // finally dijalankan setelah try/catch selesai,
                // baik proses berhasil maupun gagal.
            }
        });


        // ==================================================
        // 18. MENGHAPUS ERROR SAAT PENGGUNA MENGETIK
        // ==================================================

        // Fungsi ini memperbarui kondisi form
        // ketika pengguna memperbaiki isi komentar.
        const updateCommentState = () => {

            if (!commentInput || !commentBtn) return;
            // Menghentikan fungsi jika elemen input/tombol tidak ada.


            const adaIsi = commentInput.value.trim() !== "";
            // Mengecek apakah kolom komentar sudah memiliki isi.


            if (adaIsi) {

                commentBtn.classList.remove("is-empty");
                // Menghapus tampilan tombol kondisi komentar kosong.

                if (commentError) {

                    commentError.hidden = true;
                    // Menyembunyikan pesan validasi komentar kosong.
                }
            }

            commentInput.setCustomValidity("");
            // Menghapus pesan validasi browser sebelumnya
            // saat pengguna mengubah input.
        };


        // Memasang event ketika pengguna mengetik
        // atau mengubah isi kolom komentar.
        commentInput?.addEventListener("input", updateCommentState);


        commentBtn.classList.remove("is-empty");
        // Memastikan tombol tidak memiliki class
        // kondisi komentar kosong saat inisialisasi.


        // ==================================================
        // 19. MENGHUBUNGKAN MODUL DENGAN FILE UTAMA
        // ==================================================

        return {
            renderKomentar
        };

        // Mengembalikan fungsi renderKomentar
        // agar dapat digunakan oleh detail-pengaduan.js.
        //
        // File utama memanggil fungsi ini untuk
        // menampilkan daftar komentar dari backend.
    }
};
