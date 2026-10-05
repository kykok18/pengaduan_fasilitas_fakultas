/* =====================================================
   KONFIGURASI API
===================================================== */

/*
 * Kalau frontend dan backend berada
 * dalam project / localhost yang sama:
 */

const API_BASE = "";



/* =====================================================
   DATA FALLBACK
===================================================== */

/*
 * Data ini hanya digunakan kalau backend
 * belum bisa diakses.
 *
 * Nanti kalau API sudah aktif,
 * data dari backend akan otomatis digunakan.
 */

const fallbackComplaints = [

    {
        id_pengaduan: 1,
        judul: "AC Tidak Panas",
        status: "diproses"
    },

    {
        id_pengaduan: 2,
        judul: "Pintu Toilet Rusak",
        status: "diajukan"
    },

    {
        id_pengaduan: 3,
        judul: "Kursi Rusak",
        status: "selesai"
    }

];



/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(value) {

    return String(value ?? "")

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}



/* =====================================================
   ICON BERDASARKAN JUDUL
===================================================== */

function getComplaintIcon(title) {

    const text =
        String(title || "")
            .toLowerCase();


    if (text.includes("ac")) {

        return "bi-wind";

    }


    if (
        text.includes("toilet") ||
        text.includes("kamar mandi")
    ) {

        return "bi-droplet-fill";

    }


    if (
        text.includes("kursi") ||
        text.includes("kelas")
    ) {

        return "bi-easel2-fill";

    }


    if (
        text.includes("wifi") ||
        text.includes("wi-fi") ||
        text.includes("internet")
    ) {

        return "bi-wifi";

    }


    if (
        text.includes("listrik") ||
        text.includes("lampu")
    ) {

        return "bi-lightning-charge-fill";

    }


    if (
        text.includes("keamanan") ||
        text.includes("satpam")
    ) {

        return "bi-shield-lock-fill";

    }


    return "bi-building-fill";

}



/* =====================================================
   RENDER PENGADUAN
===================================================== */

function renderComplaints(data) {

    const container =
        document.getElementById(
            "complaintList"
        );


    const empty =
        document.getElementById(
            "emptyState"
        );


    if (!container) {

        return;

    }


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        container.innerHTML = "";

        if (empty) {

            empty.classList.remove(
                "d-none"
            );

        }

        return;

    }


    if (empty) {

        empty.classList.add(
            "d-none"
        );

    }


    container.innerHTML = data
        .slice(0, 6)
        .map(item => {


            const title =
                item.judul ||
                "Pengaduan Fasilitas";


            const status =
                item.status ||
                "diajukan";


            const id =
                item.id_pengaduan ??
                "-";


            return `

                <div class="col-md-6 col-lg-4">

                    <div class="complaint-card">

                        <div class="complaint-image">

                            <i class="bi ${getComplaintIcon(title)}"></i>

                        </div>


                        <div class="complaint-body">

                            <span class="status-badge">

                                ${escapeHtml(status)}

                            </span>


                            <h3>

                                ${escapeHtml(title)}

                            </h3>


                            <div class="complaint-meta">

                                <i class="bi bi-hash"></i>

                                Pengaduan #${escapeHtml(id)}

                            </div>


                            <div class="complaint-actions">

                                <span>

                                    <i class="bi bi-hand-thumbs-up"></i>

                                    Dukung

                                </span>


                                <a href="login.html">

                                    Lihat detail

                                    <i class="bi bi-arrow-right"></i>

                                </a>

                            </div>

                        </div>

                    </div>

                </div>

            `;

        })
        .join("");

}



/* =====================================================
   UPDATE STATISTIK
===================================================== */

function updateStatistics(data) {

    if (!Array.isArray(data)) {

        return;

    }


    const total =
        data.length;


    const sedangDiproses =
        data.filter(item => {

            const status =
                String(
                    item.status || ""
                ).toLowerCase();


            return (
                status === "diproses" ||
                status === "diproses"
            );

        }).length;


    const selesai =
        data.filter(item => {

            const status =
                String(
                    item.status || ""
                ).toLowerCase();


            return status === "selesai";

        }).length;


    const totalElement =
        document.getElementById(
            "totalPengaduan"
        );


    const processElement =
        document.getElementById(
            "sedangDiproses"
        );


    const selesaiElement =
        document.getElementById(
            "pengaduanSelesai"
        );


    /*
     * Hanya ubah angka jika
     * data API memang tersedia.
     */

    if (totalElement && total > 0) {

        totalElement.textContent =
            total;

    }


    if (processElement) {

        processElement.textContent =
            sedangDiproses;

    }


    if (
        selesaiElement &&
        selesai > 0
    ) {

        selesaiElement.textContent =
            selesai;

    }

}



/* =====================================================
   GET PENGADUAN DARI BACKEND
===================================================== */

async function loadComplaints() {

    try {

        const response =
            await fetch(
                `${API_BASE}/api/pengaduan`,
                {
                    method: "GET",

                    credentials: "include",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        /*
         * Kalau status HTTP bukan 2xx,
         * anggap API belum tersedia.
         */

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const result =
            await response.json();


        /*
         * Format response yang diharapkan:
         *
         * {
         *     status: "success",
         *     data: [...]
         * }
         */

        if (
            result.status !==
            "success"
        ) {

            throw new Error(
                result.message ||
                "API mengembalikan error"
            );

        }


        const data =
            Array.isArray(result.data)
                ? result.data
                : [];


        renderComplaints(data);

        updateStatistics(data);

    }


    catch (error) {

        console.warn(
            "API belum tersedia:",
            error
        );


        /*
         * Backend belum aktif?
         *
         * Landing page tetap ditampilkan
         * menggunakan data sementara.
         */

        renderComplaints(
            fallbackComplaints
        );

        updateStatistics(
            fallbackComplaints
        );

    }

}



/* =====================================================
   SMOOTH SCROLL
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadComplaints();


        /*
         * Semua anchor internal
         * menggunakan smooth scroll.
         */

        document
            .querySelectorAll(
                'a[href^="#"]'
            )
            .forEach(link => {

                link.addEventListener(
                    "click",
                    function (event) {

                        const targetId =
                            this.getAttribute(
                                "href"
                            );


                        if (
                            targetId === "#"
                        ) {

                            return;

                        }


                        const target =
                            document.querySelector(
                                targetId
                            );


                        if (target) {

                            event.preventDefault();


                            target.scrollIntoView({
                                behavior:
                                    "smooth",
                                block:
                                    "start"
                            });

                        }

                    }
                );

            });

    }
);