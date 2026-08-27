<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KunjunganPameran extends Model
{
    public $timestamps = false;
    protected $table = 'kunjungan_pameran';

    protected $fillable = [
        'id_pameran',
        'waktu_kunjungan',
    ];

    public function pameran()
    {
        return $this->belongsTo(Pameran::class, 'id_pameran', 'id_pameran');
    }
}