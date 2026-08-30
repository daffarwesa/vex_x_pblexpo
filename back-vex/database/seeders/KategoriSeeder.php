<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class KategoriSeeder extends Seeder
{
    public function run(): void
    {


        DB::table('kategori')->insert([
            [
                'kode_kategori' => 'IOT',
                'nama_kategori' => 'Internet of Things (IoT)',
            ],
            [
                'kode_kategori' => 'WEB',
                'nama_kategori' => 'Aplikasi Berbasis Web dan Mobile',
            ],
            [
                'kode_kategori' => 'ANV',
                'nama_kategori' => 'Animasi dan Videografi',
            ],
            [
                'kode_kategori' => 'JCS',
                'nama_kategori' => 'Jaringan dan Cybersecurity',
            ],
            [
                'kode_kategori' => 'OTO',
                'nama_kategori' => 'Sistem Otomasi',
            ],
            [
                'kode_kategori' => 'RAI',
                'nama_kategori' => 'Robotics and Artificial Intelligence',
            ],
            [
                'kode_kategori' => 'TTG',
                'nama_kategori' => 'Teknologi Tepat Guna',
            ],
            [
                'kode_kategori' => 'PRF',
                'nama_kategori' => 'Proses Fabrikasi / Manufacturing',
            ],
            [
                'kode_kategori' => 'PDF',
                'nama_kategori' => 'Produk Fabrikasi / Manufacturing',
            ],
            [
                'kode_kategori' => 'KDS',
                'nama_kategori' => 'Konsep Desain',
            ],
            [
                'kode_kategori' => 'LJU',
                'nama_kategori' => 'Layanan dan Jasa Usaha',
            ],
            [
                'kode_kategori' => 'KTI',
                'nama_kategori' => 'Karya Tulis Ilmiah',
            ],
        ]);
    }
}
