<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('karya', function (Blueprint $table) {
            $table->id('id_karya');

            $table->unsignedBigInteger('id_pengguna');
            $table->unsignedBigInteger('id_kategori');
            $table->unsignedBigInteger('id_stan');
            $table->unsignedBigInteger('id_pameran');
            $table->foreign('id_pengguna')->references('id')->on('pengguna')->cascadeOnDelete();
            $table->foreign('id_kategori')->references('id_kategori')->on('kategori')->cascadeOnDelete();
            $table->foreign('id_stan')->references('id_stan')->on('stan')->cascadeOnDelete();
            $table->foreign('id_pameran')->references('id_pameran')->on('pameran')->cascadeOnDelete();
            $table->string('judul');
            $table->text('deskripsi');
            $table->string('tautan');
            $table->string('gambar_poster');
            $table->string('gambar_sampul');
            $table->boolean('is_juara')->default(false);
            $table->boolean('is_best')->default(false);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('karya');
    }
};