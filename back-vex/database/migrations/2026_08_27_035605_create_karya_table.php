<?php

use Database\Seeders\KategoriSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('karya', function (Blueprint $table) {
            $table->id('id_karya');
            $table->unsignedBigInteger('id_admin');
            $table->unsignedBigInteger('id_stan');
            $table->unsignedBigInteger('id_pameran');
            $table->unsignedBigInteger('id_kategori');
            $table->foreign('id_admin')->references('id_admin')->on('admin')->cascadeOnDelete();
            $table->foreign('id_stan')->references('id_stan')->on('stan')->cascadeOnDelete();
            $table->foreign('id_pameran')->references('id_pameran')->on('pameran')->cascadeOnDelete();
            $table->foreign('id_kategori')->references('id_kategori')->on('kategori')->cascadeOnDelete();
            $table->string('judul');
            $table->text('deskripsi');
            $table->string('tautan');
            $table->string('gambar_poster');
            $table->enum('predikat', ['1', '2'])->nullable()->default(null);
            $table->enum('is_best', ['1', '2', '3', '4', '5', '6', '7'])->nullable()->default(null);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('karya');
    }
};