<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sponsor', function (Blueprint $table) {
            $table->id('id_sponsor');
            $table->unsignedBigInteger('id_pameran');
            $table->foreign('id_pameran')->references('id_pameran')->on('pameran')->cascadeOnDelete();
            $table->string('nama_sponsor');
            $table->string('poster')->nullable();
            $table->string('logo')->nullable(); //ga ada
            $table->string('tipe')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sponsor');
    }
};
