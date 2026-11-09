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
        // Identitas pengguna berasal dari session.
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

        $tipeValid = ['upvote', 'downvote'];

        if (!in_array($tipe_vote, $tipeValid, true)) {
            errorResponse('Jenis vote tidak valid', 400);
        }

        // Proses vote.
        $aksi = $this->voteModel->setVote(
            $id_pengaduan,
            $id_user,
            $tipe_vote
        );

        if ($aksi === false) {
            errorResponse('Gagal memproses vote', 500);
        }

        if ($aksi === 'not_found') {
            errorResponse('Pengaduan tidak ditemukan', 404);
        }

        // Tentukan pesan berdasarkan aksi.
        $pesan = [
            'added' => 'Vote berhasil disimpan',
            'changed' => 'Vote berhasil diubah',
            'removed' => 'Vote berhasil dibatalkan'
        ];

        // Ambil jumlah vote terbaru.
        $dataVote = $this->voteModel->getVoteData(
            $id_pengaduan,
            $id_user
        );

        if ($dataVote === false) {
            errorResponse('Gagal mengambil data vote terbaru', 500);
        }

        successResponse($pesan[$aksi], [
            'id_pengaduan' => (int) $id_pengaduan,
            'aksi' => $aksi,
            'vote' => $dataVote
        ]);
    }
}
