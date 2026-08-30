<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [];

        for ($i = 1; $i <= 200; $i++) {
            $data[] = [
                'id_stan' => $i,
                'id_pameran' => 1,
            ];
        }

        // Insert per-chunk 100 baris supaya aman kalau nanti jumlahnya
        // ditambah jadi ribuan (menghindari satu query insert raksasa).
        foreach (array_chunk($data, 100) as $chunk) {
            DB::table('stan')->insert($chunk);
        }
    }
}