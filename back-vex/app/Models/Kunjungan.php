<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kunjungan extends Model
{
    public $timestamps = false;

    protected $table = 'kunjungan';

    protected $fillable = ['id_pameran'];

    protected $casts = [
        'visited_at' => 'datetime',
    ];

    public function pameran()
    {
        return $this->belongsTo(Pameran::class, 'id_pameran', 'id_pameran');
    }
}
