<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('karya', function (Blueprint $table) {
            $table->boolean('is_juara')->default(false)->after('lantai');
            $table->boolean('is_best')->default(false)->after('is_juara');
        });
    }

    public function down(): void
    {
        Schema::table('karya', function (Blueprint $table) {
            $table->dropColumn(['is_juara', 'is_best']);
        });
    }
};