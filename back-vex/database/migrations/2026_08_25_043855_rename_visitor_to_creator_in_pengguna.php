<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Rename role 'Visitor' → 'Creator' di tabel pengguna.
     */
    public function up(): void
    {
        // Step 1 — Tambah 'Creator' ke enum dulu (sementara 4 value)
        DB::statement("ALTER TABLE pengguna MODIFY COLUMN role ENUM('Admin', 'Visitor', 'Creator', 'Pengunjung') NOT NULL DEFAULT 'Pengunjung'");

        // Step 2 — Update semua row Visitor → Creator
        DB::table('pengguna')
            ->where('role', 'Visitor')
            ->update(['role' => 'Creator']);

        // Step 3 — Hapus 'Visitor' dari enum (final 3 value)
        DB::statement("ALTER TABLE pengguna MODIFY COLUMN role ENUM('Admin', 'Creator', 'Pengunjung') NOT NULL DEFAULT 'Pengunjung'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE pengguna MODIFY COLUMN role ENUM('Admin', 'Visitor', 'Creator', 'Pengunjung') NOT NULL DEFAULT 'Pengunjung'");

        DB::table('pengguna')
            ->where('role', 'Creator')
            ->update(['role' => 'Visitor']);

        DB::statement("ALTER TABLE pengguna MODIFY COLUMN role ENUM('Admin', 'Visitor', 'Pengunjung') NOT NULL DEFAULT 'Pengunjung'");
    }
};
