<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pameran', function (Blueprint $table) {
            $table->id('id_pameran');

            $table->unsignedBigInteger('model_pameran');
            $table->string('kategori_kode');

            $table->foreign('model_pameran')->references('id_model')->on('model')->cascadeOnDelete();
            $table->foreign('kategori_kode')->references('kode_kategori')->on('kategori')->cascadeOnDelete();
            $table->string('banner');
            $table->string('judul');
            $table->text('deskripsi');
            $table->date('tanggal_mulai_persiapan')->useCurrent();
            $table->date('tanggal_akhir_persiapan')->useCurrent();
            $table->date('tanggal_buka')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pameran');
    }
};