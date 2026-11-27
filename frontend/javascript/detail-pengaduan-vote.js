
/**
 * =====================================================
 * FITK SIBER AHSAN
 * DETAIL PENGADUAN — UPVOTE & DOWNVOTE
 * =====================================================
 *
 * File ini mengatur fitur voting pada Detail Pengaduan.
 *
 * Upvote   = pengguna mendukung suatu pengaduan.
 * Downvote = pengguna memberikan suara tidak mendukung.
 *
 * File ini juga menangani:
 * - Perubahan tampilan tombol voting.
 * - Perhitungan sementara jumlah suara.
 * - Pengiriman suara ke backend.
 * - Pembaruan jumlah suara dari backend.
 * - Notifikasi ketika voting gagal.
 */


// Membuat objek global agar fungsi voting bisa digunakan oleh detail-pengaduan.js.
window.FITKDetailVote = {

    // Fungsi create() digunakan untuk menyiapkan seluruh fitur voting.
    // Data di bawah dikirim dari file detail-pengaduan.js.
    create({
        detailLikes,     // Elemen HTML untuk menampilkan jumlah upvote.
        detailDislikes,  // Elemen HTML untuk menampilkan jumlah downvote.
        formatJumlah,    // Fungsi untuk menyingkat angka, misalnya 1000 menjadi 1K.
        idPengaduan,     // ID pengaduan yang sedang dibuka.
        loadDetail       // Fungsi untuk mengambil ulang detail pengaduan dari backend.
    }) {

        // Mengambil semua tombol yang memiliki class "detail-vote-btn".
        // Tombol tersebut adalah tombol upvote dan downvote.
        const voteButtons = document.querySelectorAll(".detail-vote-btn");


        // ==================================================
        // 1. VARIABEL UNTUK MENYIMPAN KONDISI VOTING
        // ==================================================

        let activeVote = null;
        // Menyimpan pilihan voting yang sedang aktif.

        let totalUpvote = 0;
        // Menyimpan jumlah upvote yang akan ditampilkan.

        let totalDownvote = 0;
        // Menyimpan jumlah downvote yang akan ditampilkan.

        let latestVote = null;
        // Menyimpan pilihan voting terakhir dari pengguna.
        // Nilainya bisa "upvote", "downvote", atau null.

        let voteQueue = Promise.resolve();
        // Membuat antrean request voting.
        // Tujuannya agar request dikirim secara berurutan.

        let voteVersion = 0;
        // Memberi nomor versi pada perubahan voting.
        // Berguna untuk membedakan respons lama dan terbaru.

        let isVoting = false;
        // Menyimpan status apakah voting sedang diproses.
        // Pada kode ini nilainya diperbarui melalui setVoteLoading().

        let voteErrorTimeout = null;
        // Menyimpan timer untuk menyembunyikan notifikasi error.


        // ==================================================
        // 2. MENGATUR TAMPILAN TOMBOL VOTING
        // ==================================================

        // Fungsi ini mengatur apakah tombol voting aktif atau dinonaktifkan.
        const setVoteLoading = (loading) => {

            isVoting = loading;
            // Menyimpan status loading voting.

            // Melakukan pengaturan pada semua tombol voting.
            voteButtons.forEach((button) => {

                button.disabled = loading;
                // Jika loading bernilai true, tombol tidak bisa diklik.
                // Jika false, tombol bisa diklik kembali.

                button.setAttribute("aria-busy", String(loading));
                // Memberikan informasi status sibuk
                // untuk aksesibilitas pengguna.
            });
        };


        // Fungsi ini memberikan tanda pada tombol voting yang dipilih.
        const setActiveVote = (voteType) => {

            activeVote = voteType;
            // Menyimpan jenis voting yang sedang dipilih.

            // Memeriksa satu per satu tombol upvote dan downvote.
            voteButtons.forEach((button) => {

                const isActive = button.dataset.vote === voteType;
                // Mengecek apakah jenis tombol sama
                // dengan pilihan voting pengguna.
                //
                // Contoh:
                // data-vote="upvote" cocok dengan voteType="upvote".

                button.classList.toggle("active", isActive);
                // Menambahkan class "active" jika tombol dipilih.
                // Menghapus class "active" jika tidak dipilih.
                //
                // Class active digunakan oleh CSS
                // untuk mengatur tampilan tombol terpilih.

                button.setAttribute(
                    "aria-pressed",
                    String(isActive)
                );
                // Memberitahukan status tombol terpilih
                // untuk kebutuhan aksesibilitas.
            });
        };


        // Fungsi ini memperbarui jumlah suara di halaman.
        const renderVoteUI = () => {

            detailLikes.textContent = formatJumlah(totalUpvote);
            // Menampilkan jumlah upvote ke elemen HTML.

            detailDislikes.textContent = formatJumlah(totalDownvote);
            // Menampilkan jumlah downvote ke elemen HTML.

            setActiveVote(latestVote);
            // Memperbarui tampilan tombol sesuai pilihan terakhir.
        };


        // ==================================================
        // 3. NOTIFIKASI KETIKA VOTING GAGAL
        // ==================================================

        // Fungsi ini menampilkan notifikasi "SUARA GAGAL DIKIRIM".
        const showVoteError = () => {

            let alert = document.getElementById("voteErrorAlert");
            // Mencari elemen notifikasi error dari HTML.

            // Jika elemen notifikasi belum tersedia, buat elemen baru.
            if (!alert) {

                alert = document.createElement("div");
                // Membuat elemen div baru.

                alert.id = "voteErrorAlert";
                // Memberikan ID agar elemen mudah ditemukan.

                document.body.appendChild(alert);
                // Menambahkan elemen notifikasi ke halaman.
            }

            alert.classList.add("vote-error-alert");
            // Menambahkan class CSS untuk desain notifikasi error.

            clearTimeout(voteErrorTimeout);
            // Membatalkan timer sebelumnya jika masih ada.
            // Tujuannya agar timer lama tidak menutup notifikasi baru.

            // Menentukan isi notifikasi menggunakan HTML.
            alert.innerHTML = `
                <div class="vote-error-icon">

                    <!-- SVG untuk ikon lingkaran merah dan tanda silang -->
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <circle
                            cx="20"
                            cy="20"
                            r="20"
                            fill="#C41B1B"
                        />

                        <path
                            d="M13 13L27 27M27 13L13 27"
                            stroke="#FFFFFF"
                            stroke-width="4"
                            stroke-linecap="round"
                        />
                    </svg>
                </div>

                <div class="vote-error-content">

                    <!-- Judul notifikasi -->
                    <strong>SUARA GAGAL DIKIRIM</strong>

                    <!-- Pesan yang ditampilkan kepada pengguna -->
                    <p>
                        Terjadi kesalahan saat mengirim suara.
                        Silakan coba lagi.
                    </p>
                </div>
            `;

            alert.hidden = false;
            // Menampilkan notifikasi yang sebelumnya tersembunyi.

            voteErrorTimeout = setTimeout(() => {

                alert.hidden = true;
                // Menyembunyikan notifikasi setelah timer selesai.

            }, 4000);
            // 4000 milidetik = 4 detik.
        };


        // ==================================================
        // 4. MEMPROSES UPVOTE DAN DOWNVOTE
        // ==================================================

        // Fungsi ini dipanggil ketika pengguna mengklik tombol voting.
        const kirimVote = (tipeVote) => {

            // Hanya menerima jenis voting "upvote" atau "downvote".
            if (!["upvote", "downvote"].includes(tipeVote)) return;

            // Memastikan ID pengaduan tersedia dan valid.
            if (!idPengaduan || !/^[1-9]\d*$/.test(idPengaduan)) {
                return;
                // Menghentikan fungsi jika ID tidak valid.
            }

            const pilihanSebelumnya = latestVote;
            // Menyimpan pilihan sebelum tombol baru diklik.

            // Menentukan pilihan baru berdasarkan tombol yang diklik.
            const pilihanBaru =
                pilihanSebelumnya === tipeVote ? null : tipeVote;

            // Jika pengguna mengklik pilihan yang sama:
            // pilihanBaru menjadi null sebagai tanda pembatalan.
            //
            // Jika pengguna mengklik pilihan yang berbeda:
            // pilihanBaru menjadi upvote atau downvote.

            latestVote = pilihanBaru;
            // Memperbarui pilihan voting terakhir.

            const versiSekarang = ++voteVersion;
            // Menaikkan versi voting setiap terjadi perubahan.
            // Contoh: 1, 2, 3, dan seterusnya.


            // ==================================================
            // 5. MEMPERBARUI ANGKA VOTING SEMENTARA
            // ==================================================

            // Jika pilihan sebelumnya adalah upvote,
            // kurangi jumlah upvote karena pilihan lama dilepas.
            if (pilihanSebelumnya === "upvote") {

                totalUpvote = Math.max(0, totalUpvote - 1);
                // Math.max(0, ...) mencegah jumlah menjadi negatif.
            }

            // Jika pilihan sebelumnya adalah downvote,
            // kurangi jumlah downvote.
            if (pilihanSebelumnya === "downvote") {

                totalDownvote = Math.max(0, totalDownvote - 1);
            }

            // Jika pilihan baru adalah upvote,
            // tambahkan satu ke jumlah upvote.
            if (pilihanBaru === "upvote") {

                totalUpvote++;
                // ++ berarti menambahkan angka 1.
            }

            // Jika pilihan baru adalah downvote,
            // tambahkan satu ke jumlah downvote.
            if (pilihanBaru === "downvote") {

                totalDownvote++;
            }

            renderVoteUI();
            // Langsung memperbarui tampilan sebelum backend merespons.
            //
            // Cara ini disebut optimistic UI:
            // pengguna langsung melihat perubahan,
            // lalu hasilnya akan disesuaikan dengan respons backend.


            // ==================================================
            // 6. MENGIRIM VOTING KE BACKEND
            // ==================================================

            // Memasukkan request ke dalam antrean.
            // Request berikutnya dijalankan setelah request sebelumnya.
            voteQueue = voteQueue

                .then(async () => {

                    // Menyiapkan data yang akan dikirim ke backend.
                    const body = new URLSearchParams({

                        id_pengaduan: idPengaduan,
                        // ID pengaduan yang sedang diberi suara.

                        tipe_vote: tipeVote
                        // Jenis tombol yang diklik: upvote/downvote.
                        // Backend menentukan perubahan voting berdasarkan data ini.
                    });

                    // Mengirim request HTTP POST ke API voting.
                    const response = await fetch(
                        `${API_BASE_URL}/vote.php`,
                        {
                            method: "POST",
                            // POST digunakan untuk mengirim data
                            // atau melakukan perubahan pada server.

                            credentials: "same-origin",
                            // Mengirim cookie untuk request
                            // yang berasal dari origin yang sama.

                            headers: {

                                "Content-Type":
                                    "application/x-www-form-urlencoded",
                                // Memberitahukan format data yang dikirim.

                                "Accept": "application/json"
                                // Meminta respons berupa JSON.
                            },

                            body: body.toString()
                            // Mengubah data URLSearchParams
                            // menjadi teks untuk dikirim ke backend.
                        }
                    );


                    // ==================================================
                    // 7. MEMERIKSA STATUS RESPONS BACKEND
                    // ==================================================

                    // Jika backend mengembalikan HTTP 401,
                    // berarti pengguna tidak terautentikasi.
                    if (response.status === 401) {

                        clearUserSession();
                        // Menghapus data sesi frontend.

                        window.location.replace("login.html");
                        // Mengarahkan pengguna ke halaman Login.

                        return;
                        // Menghentikan proses request voting.
                    }

                    const result = await response.json();
                    // Membaca respons JSON dari backend
                    // dan mengubahnya menjadi objek JavaScript.

                    // Memeriksa apakah pengiriman suara berhasil.
                    if (
                        !response.ok ||
                        result.status !== "success" ||
                        !result.data?.vote
                    ) {

                        throw new Error(
                            result.message || "Gagal mengirim vote."
                        );
                        // Membuat error jika respons tidak sesuai.
                        // Error akan ditangani oleh bagian catch().
                    }


                    // ==================================================
                    // 8. MEMBACA JUMLAH VOTE DARI BACKEND
                    // ==================================================

                    const vote = result.data.vote;
                    // Mengambil data voting dari respons backend.

                    const upvote = Number(vote.upvote);
                    // Mengubah jumlah upvote dari backend menjadi angka.

                    const downvote = Number(vote.downvote);
                    // Mengubah jumlah downvote menjadi angka.

                    // Memastikan angka voting valid.
                    if (
                        !Number.isSafeInteger(upvote) ||
                        !Number.isSafeInteger(downvote) ||
                        upvote < 0 ||
                        downvote < 0
                    ) {

                        throw new Error("Jumlah vote tidak valid.");
                        // Menolak data jika bukan bilangan bulat aman
                        // atau jika jumlah voting bernilai negatif.
                    }

                    // Memastikan respons ini berasal
                    // dari versi voting terbaru.
                    if (versiSekarang === voteVersion) {

                        totalUpvote = upvote;
                        // Memperbarui jumlah upvote berdasarkan backend.

                        totalDownvote = downvote;
                        // Memperbarui jumlah downvote berdasarkan backend.

                        latestVote = vote.pilihan_user ?? null;
                        // Mengambil pilihan pengguna dari backend.
                        // Jika nilainya null/undefined, gunakan null.

                        renderVoteUI();
                        // Menyesuaikan tampilan dengan hasil backend.
                    }
                })


                // ==================================================
                // 9. MENANGANI KEGAGALAN VOTING
                // ==================================================

                .catch((error) => {

                    console.error("Gagal mengirim vote:", error);
                    // Mencatat kesalahan di Console browser.
                    // Berguna untuk proses debugging.

                    // Menampilkan error hanya jika request
                    // ini masih merupakan versi terbaru.
                    if (versiSekarang === voteVersion) {

                        showVoteError();
                        // Menampilkan notifikasi suara gagal dikirim.

                        loadDetail();
                        // Mengambil ulang detail pengaduan dari backend.
                        // Tujuannya mengembalikan angka voting
                        // sesuai data sebenarnya di server.
                    }
                });
        };


        // ==================================================
        // 10. EVENT KLIK TOMBOL UPVOTE DAN DOWNVOTE
        // ==================================================

        // Mengulangi proses untuk setiap tombol voting.
        voteButtons.forEach((button) => {

            // Memasang event ketika tombol diklik pengguna.
            button.addEventListener("click", () => {

                kirimVote(button.dataset.vote);
                // Mengambil jenis voting dari atribut data-vote.
                //
                // Contoh HTML:
                // <button data-vote="upvote">...</button>
                //
                // Jika tombol upvote diklik:
                // kirimVote("upvote") dijalankan.
                //
                // Jika tombol downvote diklik:
                // kirimVote("downvote") dijalankan.
            });
        });


        // ==================================================
        // 11. MENAMPILKAN DATA VOTING DARI BACKEND
        // ==================================================

        // Fungsi ini disediakan untuk digunakan
        // oleh file utama detail-pengaduan.js.
        return {

            renderFromBackend(vote, isDummyPreview) {

                totalUpvote = Number(vote.upvote) || 0;
                // Mengambil jumlah upvote dari backend.
                // Jika tidak ada atau tidak valid, gunakan 0.

                totalDownvote = Number(vote.downvote) || 0;
                // Mengambil jumlah downvote dari backend.
                // Jika tidak ada atau tidak valid, gunakan 0.

                // Jika halaman sedang dalam mode preview localhost:
                if (isDummyPreview) {

                    totalUpvote = 1000;
                    // Menggunakan angka 1000 sebagai data contoh.
                    // Tujuannya untuk mengecek tampilan angka besar.
                }

                latestVote = vote.pilihan_user ?? null;
                // Mengambil pilihan voting pengguna dari backend.

                activeVote = latestVote;
                // Menyamakan pilihan aktif dengan pilihan terbaru.

                renderVoteUI();
                // Menampilkan jumlah vote dan tombol yang aktif.

                setVoteLoading(false);
                // Mengatur status loading menjadi false
                // dan mengaktifkan kembali tombol voting.

                // Saat mode preview menggunakan data dummy,
                // tombol tidak boleh mengirim voting asli.
                if (isDummyPreview) {

                    voteButtons.forEach((button) => {

                        button.disabled = true;
                        // Menonaktifkan semua tombol vote
                        // khusus pada tampilan preview.
                    });
                }
            }
        };
    }
};
