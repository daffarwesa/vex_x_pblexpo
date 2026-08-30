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
                'nama_kategori' => 'Internet of Things (IoT)', // 1
            ],
            [
                'kode_kategori' => 'WEB',
                'nama_kategori' => 'Aplikasi Berbasis Web dan Mobile', //2
            ],
            [
                'kode_kategori' => 'ANV',
                'nama_kategori' => 'Animasi dan Videografi', //3
            ],
            [
                'kode_kategori' => 'JCS',
                'nama_kategori' => 'Jaringan dan Cybersecurity', //4
            ],
            [
                'kode_kategori' => 'OTO',
                'nama_kategori' => 'Sistem Otomasi', //5
            ],
            [
                'kode_kategori' => 'RAI',
                'nama_kategori' => 'Robotics and Artificial Intelligence', //6
            ],
            [
                'kode_kategori' => 'TTG',
                'nama_kategori' => 'Teknologi Tepat Guna', //7
            ],
            [
                'kode_kategori' => 'PRF',
                'nama_kategori' => 'Proses Fabrikasi / Manufacturing', //8
            ],
            [
                'kode_kategori' => 'PDF',
                'nama_kategori' => 'Produk Fabrikasi / Manufacturing', //9
            ],
            [
                'kode_kategori' => 'KDS',
                'nama_kategori' => 'Konsep Desain', //10
            ],
            [
                'kode_kategori' => 'LJU',
                'nama_kategori' => 'Layanan dan Jasa Usaha', //11
            ],
            [
                'kode_kategori' => 'KTI',
                'nama_kategori' => 'Karya Tulis Ilmiah', //12
            ],
        ]);
    }
}


