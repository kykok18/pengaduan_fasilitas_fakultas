<?php

$host = "localhost";
$user = "kykok";
$pw = "kykok18";
$db = "pengaduan_fasilitas_fakultasDB";

$conn = mysqli_connect($host, $user, $pw, $db);

if (!$conn){
    die("Koneksi Database gagal: " . mysqli_connect_error());
}


