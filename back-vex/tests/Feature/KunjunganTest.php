<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Pengguna;
use App\Models\Pameran;
use App\Models\ModelPameran;
use App\Models\Kategori;
use App\Models\Kunjungan;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class KunjunganTest extends TestCase
{
    use DatabaseTransactions;

    public function test_can_record_kunjungan_publicly()
    {
        $kategori = Kategori::first();
        if (!$kategori) {
            $kategori = Kategori::create([
                'kode_kategori' => 'TEST',
                'nama_kategori' => 'Testing Kategori',
            ]);
        }

        $model = ModelPameran::first();
        if (!$model) {
            $model = ModelPameran::create([
                'jenis' => 'Pameran',
                'nama_model' => 'Hall Model',
                '3d_model' => 'models/hall.glb',
            ]);
        }

        $pameran = Pameran::first();
        if (!$pameran) {
            $pameran = Pameran::create([
                'model_pameran' => $model->id_model,
                'kategori_kode' => $kategori->kode_kategori,
                'banner' => 'banners/dummy.jpg',
                'judul' => 'Pameran Testing',
                'deskripsi' => 'Deskripsi testing',
                'tanggal_mulai_persiapan' => now()->subDays(5),
                'tanggal_akhir_persiapan' => now()->addDays(5),
                'tanggal_buka' => now()->addDays(6),
            ]);
        }

        $response = $this->postJson('/api/kunjungan', [
            'id_pameran' => $pameran->id_pameran,
        ]);

        $response->assertStatus(201)
                 ->assertJson(['message' => 'Kunjungan dicatat']);

        $this->assertDatabaseHas('kunjungan', [
            'id_pameran' => $pameran->id_pameran,
        ]);
    }

    public function test_kunjungan_requires_valid_pameran_id()
    {
        $response = $this->postJson('/api/kunjungan', [
            'id_pameran' => 999999,
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['id_pameran']);
    }

    public function test_admin_can_access_date_range_statistik()
    {
        $admin = Pengguna::where('role', Pengguna::ROLE_ADMIN)->first();
        if (!$admin) {
            $admin = Pengguna::create([
                'nama' => 'Test Admin',
                'email' => 'testadmin@example.com',
                'password' => 'password123',
                'role' => Pengguna::ROLE_ADMIN,
            ]);
        }

        // Test 1: Hourly (<= 1 day)
        $response1 = $this->actingAs($admin)->getJson('/api/admin/kunjungan/statistik?start_date=2026-08-26&end_date=2026-08-26');
        $response1->assertStatus(200)->assertJsonStructure([['label', 'pengunjung']]);

        // Test 2: Daily (<= 31 days)
        $response2 = $this->actingAs($admin)->getJson('/api/admin/kunjungan/statistik?start_date=2026-08-01&end_date=2026-08-26');
        $response2->assertStatus(200)->assertJsonStructure([['label', 'pengunjung']]);

        // Test 3: Weekly (<= 90 days)
        $response3 = $this->actingAs($admin)->getJson('/api/admin/kunjungan/statistik?start_date=2026-06-01&end_date=2026-08-26');
        $response3->assertStatus(200)->assertJsonStructure([['label', 'pengunjung']]);

        // Test 4: Monthly (> 90 days)
        $response4 = $this->actingAs($admin)->getJson('/api/admin/kunjungan/statistik?start_date=2025-08-26&end_date=2026-08-26');
        $response4->assertStatus(200)->assertJsonStructure([['label', 'pengunjung']]);
    }

    public function test_non_admin_cannot_access_statistik()
    {
        $visitor = Pengguna::where('role', Pengguna::ROLE_VISITOR)->first();
        if (!$visitor) {
            $visitor = Pengguna::create([
                'nama' => 'Test Visitor',
                'email' => 'testvisitor@example.com',
                'password' => 'password123',
                'role' => Pengguna::ROLE_VISITOR,
            ]);
        }

        $response = $this->actingAs($visitor)
                         ->getJson('/api/admin/kunjungan/statistik?start_date=2026-08-26&end_date=2026-08-26');

        $response->assertStatus(403);
    }

    public function test_hourly_grouping_accurately_places_visits_in_correct_time_slots()
    {
        $admin = Pengguna::where('role', Pengguna::ROLE_ADMIN)->first();
        if (!$admin) {
            $admin = Pengguna::create([
                'nama' => 'Test Admin',
                'email' => 'testadmin@example.com',
                'password' => 'password123',
                'role' => Pengguna::ROLE_ADMIN,
            ]);
        }

        $pameran = Pameran::first();
        if (!$pameran) {
            $kategori = Kategori::first() ?? Kategori::create(['kode_kategori' => 'TST', 'nama_kategori' => 'Testing']);
            $model = ModelPameran::first() ?? ModelPameran::create(['jenis' => 'Pameran', 'nama_model' => 'Hall', '3d_model' => 'm.glb']);
            $pameran = Pameran::create([
                'model_pameran' => $model->id_model,
                'kategori_kode' => $kategori->kode_kategori,
                'banner' => 'dummy.jpg',
                'judul' => 'Test',
                'deskripsi' => 'Desc',
                'tanggal_mulai_persiapan' => now(),
                'tanggal_akhir_persiapan' => now(),
                'tanggal_buka' => now(),
            ]);
        }

        // Hapus kunjungan pada tanggal uji coba agar hitungan murni
        $testDate = '2026-08-26';
        Kunjungan::whereDate('visited_at', $testDate)->delete();

        // 1. Simulasikan 3 kunjungan di jam 02:15, 02:30, 02:59
        for ($i = 0; $i < 3; $i++) {
            \Illuminate\Support\Facades\DB::table('kunjungan')->insert([
                'id_pameran' => $pameran->id_pameran,
                'visited_at' => "{$testDate} 02:" . str_pad($i * 15, 2, '0', STR_PAD_LEFT) . ':00',
            ]);
        }

        // 2. Simulasikan 5 kunjungan di jam 10:05 s/d 10:45
        for ($i = 0; $i < 5; $i++) {
            \Illuminate\Support\Facades\DB::table('kunjungan')->insert([
                'id_pameran' => $pameran->id_pameran,
                'visited_at' => "{$testDate} 10:" . str_pad($i * 10, 2, '0', STR_PAD_LEFT) . ':00',
            ]);
        }

        // 3. Simulasikan 2 kunjungan di jam 18:20 & 18:50
        for ($i = 0; $i < 2; $i++) {
            \Illuminate\Support\Facades\DB::table('kunjungan')->insert([
                'id_pameran' => $pameran->id_pameran,
                'visited_at' => "{$testDate} 18:" . str_pad($i * 30, 2, '0', STR_PAD_LEFT) . ':00',
            ]);
        }

        // Panggil API untuk rentang hari tersebut
        $response = $this->actingAs($admin)
                         ->getJson("/api/admin/kunjungan/statistik?start_date={$testDate}&end_date={$testDate}");

        $response->assertStatus(200);

        $data = $response->json();

        // Verifikasi ada 24 slot jam (00:00 - 23:00)
        $this->assertCount(24, $data);

        // Ubah array jadi key-value [label => pengunjung] untuk verifikasi
        $mapped = [];
        foreach ($data as $item) {
            $mapped[$item['label']] = $item['pengunjung'];
        }

        // Pastikan jam 02:00 = 3
        $this->assertEquals(3, $mapped['02:00'], 'Jam 02:00 harus bernilai 3');

        // Pastikan jam 10:00 = 5
        $this->assertEquals(5, $mapped['10:00'], 'Jam 10:00 harus bernilai 5');

        // Pastikan jam 18:00 = 2
        $this->assertEquals(2, $mapped['18:00'], 'Jam 18:00 harus bernilai 2');

        // Pastikan jam lainnya bernilai 0 (contoh jam 00:00, 07:00, 23:00)
        $this->assertEquals(0, $mapped['00:00']);
        $this->assertEquals(0, $mapped['07:00']);
        $this->assertEquals(0, $mapped['23:00']);

        // Total semua slot jam harus tepat 10
        $this->assertEquals(10, array_sum($mapped));
    }
}
