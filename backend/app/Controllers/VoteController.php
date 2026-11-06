<?php

require_once __DIR__ . '/../Models/Vote.php';
require_once __DIR__ . '/../Helpers/response.php';

class VoteController
{
    private $voteModel;

    public function __construct($conn)
    {
        $this->voteModel = new Vote($conn);
    }

    public function prosesVote()
    {
        // Identitas pengguna wajib berasal dari session.
        $id_user = (int) $_SESSION['id_user'];

        // Validasi ID pengaduan.
        $id_pengaduan = filter_var(
            $_POST['id_pengaduan'] ?? null,
            FILTER_VALIDATE_INT,
            ['options' => ['min_range' => 1]]
        );

        if ($id_pengaduan === false || $id_pengaduan === null) {
            errorResponse('ID pengaduan tidak valid', 400);
        }

        // Validasi jenis vote.
        $tipe_vote = $_POST['tipe_vote'] ?? null;

        if (!is_string($tipe_vote)) {
            errorResponse('Jenis vote tidak valid', 400);
        }

        $tipe_vote = trim($tipe_vote);

        $tipeValid = ['upvote', 'downvote', 'remove'];

        if (!in_array($tipe_vote, $tipeValid, true)) {
            errorResponse('Jenis vote tidak valid', 400);
        }

        // Pastikan pengaduan tersedia.
        $pengaduanExists = $this->voteModel->pengaduanExists($id_pengaduan);

        if ($pengaduanExists === false) {
            errorResponse('Gagal memeriksa data pengaduan', 500);
        }

        if (!$pengaduanExists) {
            errorResponse('Pengaduan tidak ditemukan', 404);
        }

        // Proses penyimpanan atau pembatalan vote.
        if ($tipe_vote === 'remove') {
            $berhasil = $this->voteModel->removeVote(
                $id_pengaduan,
                $id_user
            );

            $pesan = 'Vote berhasil dibatalkan';
        } else {
            $berhasil = $this->voteModel->setVote(
                $id_pengaduan,
                $id_user,
                $tipe_vote
            );

            $pesan = 'Vote berhasil disimpan';
        }

        if (!$berhasil) {
            errorResponse('Gagal memproses vote', 500);
        }

        // Ambil jumlah vote terbaru dan pilihan pengguna.
        $dataVote = $this->voteModel->getVoteData(
            $id_pengaduan,
            $id_user
        );

        if ($dataVote === false) {
            errorResponse('Gagal mengambil data vote terbaru', 500);
        }

        successResponse($pesan, [
            'id_pengaduan' => (int) $id_pengaduan,
            'vote' => $dataVote
        ]);
    }
}
