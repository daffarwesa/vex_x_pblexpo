<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Admin;
use App\Models\Pameran;
use App\Models\Stan;
use App\Models\Kategori;
use App\Models\Karya;

class DummyKaryaSeeder extends Seeder
{
    public function run(): void
    {
        $admin = Admin::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['nama' => 'Super Admin', 'password' => bcrypt('password')]
        );

        $pameran = Pameran::firstOrCreate(
            ['judul' => 'PBL EXPO 2026'],
            [
                'deskripsi' => 'Pameran Karya Inovasi Mahasiswa PBL',
                'tanggal_mulai_persiapan' => now(),
                'tanggal_akhir_persiapan' => now()->addDays(7),
                'tanggal_buka' => now()->addDays(8),
                'banner' => 'pameran/sample.jpg',
            ]
        );

        $stan = Stan::firstOrCreate(['id_pameran' => $pameran->id_pameran]);

        $kategoriIot = Kategori::where('kode_kategori', 'IOT')->first();

        Karya::create([
            'id_admin' => $admin->id_admin,
            'id_stan' => $stan->id_stan,
            'id_pameran' => $pameran->id_pameran,
            'id_kategori' => $kategoriIot ? $kategoriIot->id_kategori : 1,
            'judul' => 'Smart IoT Greenhouse Monitoring System',
            'deskripsi' => 'Sistem pemantauan lingkungan greenhouse cerdas berbasis IoT dengan visualisasi sensor suhu, kelembaban, dan otomasi penyiraman.',
            'tautan' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'gambar_poster' => 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
            'predikat' => null,
            'is_best' => false,
        ]);
    }
}
