<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabel kunjungan menyimpan setiap kunjungan ke pameran.
     * Kolom visited_at otomatis terisi waktu sekarang saat insert.
     * Index komposit (id_pameran, visited_at) mempercepat query statistik.
     */
    public function up(): void
    {
        Schema::create('kunjungan', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_pameran');

            $table->foreign('id_pameran')
                  ->references('id_pameran')
                  ->on('pameran')
                  ->cascadeOnDelete();

            // Waktu kunjungan — otomatis diisi Laravel (CREATED_AT) & DB default
            $table->timestamp('visited_at')->useCurrent();

            // Index untuk mempercepat query statistik per pameran & tanggal
            $table->index(['id_pameran', 'visited_at'], 'idx_kunjungan_pameran_waktu');
            $table->index('visited_at', 'idx_kunjungan_waktu');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kunjungan');
    }
};
