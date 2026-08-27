<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kunjungan_pameran', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_pameran');
            $table->foreign('id_pameran')->references('id_pameran')->on('pameran')->cascadeOnDelete();
            $table->timestamp('waktu_kunjungan')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kunjungan_pameran');
    }
};