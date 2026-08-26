<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sponsor extends Model
{
    public $timestamps    = false;
    protected $table      = 'sponsor';
    protected $primaryKey = 'id_sponsor';

    protected $fillable = [
        'id_pameran',
        'nama_sponsor',
        'poster',
        'tahun',
        'tipe',
    ];

    // Relasi ke pameran
    public function pameran()
    {
        return $this->belongsTo(Pameran::class, 'id_pameran', 'id_pameran');
    }
}
