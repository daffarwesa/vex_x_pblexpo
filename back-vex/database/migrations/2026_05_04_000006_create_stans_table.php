<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stan', function (Blueprint $table) {
            $table->id('id_stan');
            $table->unsignedBigInteger('id_pameran');
            $table->unsignedBigInteger('id_kategori');
            $table->unsignedBigInteger('model_stan');
            $table->foreign('id_pameran')->references('id_pameran')->on('pameran')->cascadeOnDelete();
            $table->foreign('id_kategori')->references('id_kategori')->on('kategori')->cascadeOnDelete();
            $table->foreign('model_stan')->references('id_model')->on('model')->cascadeOnDelete();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('stan');
    }
};