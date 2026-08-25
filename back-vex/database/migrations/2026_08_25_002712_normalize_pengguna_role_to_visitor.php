<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Normalisasi role lama (Ketua PBL, KPS) menjadi Visitor,
     * lalu ubah definisi enum kolom role ke 3 role final.
     * Operasi ini aman: tidak ada data pengguna yang dihapus.
     */
    public function up(): void
    {
        // Step 1 — Ubah nilai data yang ada sebelum mengubah definisi enum
        DB::table('pengguna')
            ->whereIn('role', ['Ketua PBL', 'KPS'])
            ->update(['role' => 'Visitor']);

        // Step 2 — Ubah definisi kolom enum ke 3 role final
        DB::statement("ALTER TABLE pengguna MODIFY COLUMN role ENUM('Admin', 'Visitor', 'Pengunjung') NOT NULL DEFAULT 'Pengunjung'");
    }

    public function down(): void
    {
        // Kembalikan definisi enum ke 4 role lama
        // (data yang sudah jadi Visitor tidak bisa di-rollback otomatis)
        DB::statement("ALTER TABLE pengguna MODIFY COLUMN role ENUM('Admin', 'KPS', 'Ketua PBL', 'Pengunjung') NOT NULL DEFAULT 'Pengunjung'");
    }
};
