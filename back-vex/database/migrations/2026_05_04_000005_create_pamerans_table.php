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
            $table->foreign('model_pameran')->references('id_model')->on('model')->cascadeOnDelete();

            $table->string('banner');
            $table->string('judul');
            $table->text('deskripsi');
            $table->integer('kapasitas')->default(24);
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