<?php

function hashPassword($password)
{
    return password_hash($password, PASSWORD_DEFAULT);
}

function verifyPassword($password, $passwordHash)
{
    return password_verify($password, $passwordHash);
}