<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Perlebar enum dulu (sementara), biar data lama nggak ke-truncate/hilang
        DB::statement("ALTER TABLE pengguna MODIFY role ENUM('Admin','KPS','Ketua PBL','Pencipta','Pengunjung') NOT NULL DEFAULT 'Pengunjung'");

        // 2. Migrasi data lama ke role baru
        DB::table('pengguna')->where('role', 'Ketua PBL')->update(['role' => 'Pencipta']);
        DB::table('pengguna')->where('role', 'KPS')->update(['role' => 'Admin']);

        // 3. Persempit enum jadi final: Admin, Pencipta, Pengunjung
        DB::statement("ALTER TABLE pengguna MODIFY role ENUM('Admin','Pencipta','Pengunjung') NOT NULL DEFAULT 'Pengunjung'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE pengguna MODIFY role ENUM('Admin','KPS','Ketua PBL','Pengunjung') NOT NULL DEFAULT 'Pengunjung'");
        DB::table('pengguna')->where('role', 'Pencipta')->update(['role' => 'Ketua PBL']);
    }
};