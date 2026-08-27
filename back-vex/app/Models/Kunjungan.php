<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kunjungan extends Model
{
    /*
    |--------------------------------------------------------------------------
    | Konfigurasi Timestamp
    |--------------------------------------------------------------------------
    | Laravel hanya menyimpan waktu pembuatan (visited_at).
    | Tidak ada kolom updated_at.
    */
    const CREATED_AT = 'visited_at';
    const UPDATED_AT = null;

    protected $table    = 'kunjungan';
    protected $fillable = ['id_pameran'];

    protected $casts = [
        'visited_at' => 'datetime',
    ];

    // ==========================================
    // RELASI
    // ==========================================

    public function pameran()
    {
        return $this->belongsTo(Pameran::class, 'id_pameran', 'id_pameran');
    }
}
