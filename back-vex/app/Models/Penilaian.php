<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Penilaian extends Model
{
    public $timestamps = false;
    protected $table = 'penilaian';
    protected $primaryKey = 'id_penilaian';

    protected $fillable = [
        'id_pengguna',
        'id_karya',
        'waktu_penilaian',
    ];

    protected $casts = [
        'waktu_penilaian' => 'datetime',
    ];

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'id_pengguna', 'id');
    }

    public function karya()
    {
        return $this->belongsTo(Karya::class, 'id_karya', 'id_karya');
    }
}