<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Admin;
use App\Models\Pameran;
use App\Models\Stan;
use App\Models\Kategori;
use App\Models\Karya;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class KaryaUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_update_karya()
    {
        Storage::fake('public');

        $admin = Admin::create([
            'nama' => 'Admin Test',
            'email' => 'admin_test@example.com',
            'password' => bcrypt('password'),
        ]);

        $pameran = Pameran::create([
            'judul' => 'Pameran 1',
            'deskripsi' => 'Deskripsi',
            'tanggal_mulai_persiapan' => now(),
            'tanggal_akhir_persiapan' => now()->addDays(2),
            'tanggal_buka' => now()->addDays(3),
            'banner' => 'pameran/banner.jpg',
        ]);

        $stan = Stan::create(['id_pameran' => $pameran->id_pameran]);

        $kategori = Kategori::create([
            'kode_kategori' => 'IOT',
            'nama_kategori' => 'IoT',
        ]);

        $karya = Karya::create([
            'id_admin' => $admin->id_admin,
            'id_stan' => $stan->id_stan,
            'id_pameran' => $pameran->id_pameran,
            'id_kategori' => $kategori->id_kategori,
            'judul' => 'Judul Awal',
            'deskripsi' => 'Deskripsi Awal',
            'tautan' => 'https://youtube.com/watch?v=123',
            'gambar_poster' => 'karya/poster/old.jpg',
        ]);

        // Request update
        $response = $this->actingAs($admin, 'sanctum')->postJson("/api/auth/karya/{$karya->id_karya}", [
            'id_pameran' => $pameran->id_pameran,
            'id_kategori' => $kategori->id_kategori,
            'judul' => 'Judul Baru',
            'deskripsi' => 'Deskripsi Baru',
            'tautan' => 'https://youtube.com/watch?v=456',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('karya', [
            'id_karya' => $karya->id_karya,
            'judul' => 'Judul Baru',
        ]);
    }
}
