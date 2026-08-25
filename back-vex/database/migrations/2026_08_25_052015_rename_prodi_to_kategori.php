<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('prodi')) {
            return;
        }

        DB::statement('ALTER TABLE pengguna DROP FOREIGN KEY pengguna_program_studi_foreign');
        DB::statement('ALTER TABLE pameran DROP FOREIGN KEY pameran_kategori_foreign');

        Schema::rename('prodi', 'kategori');

        DB::statement('ALTER TABLE kategori RENAME COLUMN id_prodi TO id_kategori');
        DB::statement('ALTER TABLE kategori RENAME COLUMN kode_prodi TO kode_kategori');
        DB::statement('ALTER TABLE kategori RENAME COLUMN nama_prodi TO nama_kategori');
        DB::statement('ALTER TABLE pengguna RENAME COLUMN program_studi TO kategori_kode');
        DB::statement('ALTER TABLE pameran RENAME COLUMN kategori TO kategori_kode');

        DB::statement('ALTER TABLE pengguna ADD CONSTRAINT pengguna_kategori_kode_foreign FOREIGN KEY (kategori_kode) REFERENCES kategori(kode_kategori) ON DELETE CASCADE');
        DB::statement('ALTER TABLE pameran ADD CONSTRAINT pameran_kategori_kode_foreign FOREIGN KEY (kategori_kode) REFERENCES kategori(kode_kategori) ON DELETE CASCADE');
    }

    public function down(): void
    {
        if (!Schema::hasTable('kategori') || Schema::hasTable('prodi')) {
            return;
        }

        DB::statement('ALTER TABLE pengguna DROP FOREIGN KEY pengguna_kategori_kode_foreign');
        DB::statement('ALTER TABLE pameran DROP FOREIGN KEY pameran_kategori_kode_foreign');

        DB::statement('ALTER TABLE pengguna RENAME COLUMN kategori_kode TO program_studi');
        DB::statement('ALTER TABLE pameran RENAME COLUMN kategori_kode TO kategori');
        DB::statement('ALTER TABLE kategori RENAME COLUMN id_kategori TO id_prodi');
        DB::statement('ALTER TABLE kategori RENAME COLUMN kode_kategori TO kode_prodi');
        DB::statement('ALTER TABLE kategori RENAME COLUMN nama_kategori TO nama_prodi');

        Schema::rename('kategori', 'prodi');

        DB::statement('ALTER TABLE pengguna ADD CONSTRAINT pengguna_program_studi_foreign FOREIGN KEY (program_studi) REFERENCES prodi(kode_prodi) ON DELETE CASCADE');
        DB::statement('ALTER TABLE pameran ADD CONSTRAINT pameran_kategori_foreign FOREIGN KEY (kategori) REFERENCES prodi(kode_prodi) ON DELETE CASCADE');
    }
};
