<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kategori extends Model
{
    public $timestamps    = false;
    protected $table      = 'kategori';
    protected $primaryKey = 'kode_kategori';
    public $incrementing  = false;
    protected $keyType    = 'string';

    protected $fillable = [
        'kode_kategori',
        'nama_kategori',
    ];
}
