<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\Pengguna;

class PenggunaSeeder extends Seeder
{
    public function run(): void
    {
        // ✅ Hapus data lama dulu
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('pengguna')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Pengunjung
        Pengguna::create([
            'nama'          => 'User',
            'email'         => 'user@pbl.com',
            'password'      => Hash::make('password123'),
            'role'          => Pengguna::ROLE_PENGUNJUNG,
            'kelas'         => null,
            'kategori_kode' => null,
        ]);

        // Admin
        Pengguna::create([
            'nama'          => 'Admin Utama',
            'email'         => 'admin@pbl.com',
            'password'      => Hash::make('password123'),
            'role'          => Pengguna::ROLE_ADMIN,
            'kelas'         => null,
            'kategori_kode' => null,
        ]);

    }
}
