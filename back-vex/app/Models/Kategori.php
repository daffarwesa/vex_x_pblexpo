<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kategori extends Model
{
    protected $table = 'kategori';
    protected $primaryKey = 'id_kategori';

    protected $fillable = ['kode', 'nama'];

    public function karya()
    {
        return $this->hasMany(Karya::class, 'id_kategori', 'id_kategori');
    }
}