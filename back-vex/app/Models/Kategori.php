<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kategori extends Model
{
    protected $table = 'kategori';
    protected $primaryKey = 'id_kategori';

    protected $fillable = [
        'kode_kategori',
        'nama_kategori',
        'warna',
    ];

    public function karya()
    {
        return $this->hasMany(Karya::class, 'id_kategori', 'id_kategori');
    }

    public function stan()
    {
        return $this->hasMany(Stan::class, 'id_kategori', 'id_kategori');
    }
}