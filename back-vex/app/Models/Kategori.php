<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kategori extends Model
{
    public $timestamps = false;
    protected $table = 'kategori';
    protected $primaryKey = 'id_kategori';

    protected $fillable = ['kode_kategori', 'nama_kategori'];

    public function karya()
    {
        return $this->hasMany(Karya::class, 'id_kategori', 'id_kategori');
    }
}