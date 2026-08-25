<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop FK constraint + kolom program_studi dulu, sebelum tabel prodi bisa dihapus
        Schema::table('pengguna', function (Blueprint $table) {
            $table->dropForeign('pengguna_program_studi_foreign');
            $table->dropColumn('program_studi');
        });

        Schema::dropIfExists('prodi');
    }

    public function down(): void
    {
        Schema::create('prodi', function (Blueprint $table) {
            $table->id();
            $table->string('kode_prodi')->unique();
            $table->string('nama_prodi');
            $table->timestamps();
        });

        Schema::table('pengguna', function (Blueprint $table) {
            $table->string('program_studi')->nullable();
            $table->foreign('program_studi')->references('kode_prodi')->on('prodi')->onDelete('cascade');
        });
    }
};