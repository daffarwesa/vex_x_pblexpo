<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class KategoriSeeder extends Seeder
{
    public function run(): void
    {


        DB::table('prodi')->insert([
            [
                'kode_prodi' => 'IOT',
                'nama_prodi' => 'Internet of Things (IoT)',
            ],
            [
                'kode_prodi' => 'WEB',
                'nama_prodi' => 'Aplikasi Berbasis Web dan Mobile',
            ],
            [
                'kode_prodi' => 'ANV',
                'nama_prodi' => 'Animasi dan Videografi',
            ],
            [
                'kode_prodi' => 'JCS',
                'nama_prodi' => 'Jaringan dan Cybersecurity',
            ],
            [
                'kode_prodi' => 'OTO',
                'nama_prodi' => 'Sistem Otomasi',
            ],
            [
                'kode_prodi' => 'RAI',
                'nama_prodi' => 'Robotics and Artificial Intelligence',
            ],
            [
                'kode_prodi' => 'TTG',
                'nama_prodi' => 'Teknologi Tepat Guna',
            ],
            [
                'kode_prodi' => 'PRF',
                'nama_prodi' => 'Proses Fabrikasi / Manufacturing',
            ],
            [
                'kode_prodi' => 'PDF',
                'nama_prodi' => 'Produk Fabrikasi / Manufacturing',
            ],
            [
                'kode_prodi' => 'KDS',
                'nama_prodi' => 'Konsep Desain',
            ],
            [
                'kode_prodi' => 'LJU',
                'nama_prodi' => 'Layanan dan Jasa Usaha',
            ],
            [
                'kode_prodi' => 'KTI',
                'nama_prodi' => 'Karya Tulis Ilmiah',
            ],
        ]);
    }
}