<?php

$host = "localhost";
$user = "kykok";
$pw = "root";
$db = "";

$conn = mysqli_connect($host, $user, $pw, $db);

if (!$conn){
    die("Koneksi Database gagal: " . mysqli_connect_error());
}

