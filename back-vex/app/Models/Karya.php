<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Karya extends Model
{
    protected $table = 'karya';
    protected $primaryKey = 'id_karya';
    public $timestamps = false; // migrasi tidak punya kolom created_at/updated_at

    protected $fillable = [
        'id_admin',
        'id_stan',
        'id_pameran',
        'id_kategori',
        'judul',
        'deskripsi',
        'tautan',
        'gambar_poster',
        'predikat',
        'is_best',
    ];

    protected $casts = [
        'is_best' => 'boolean',
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'id_admin', 'id_admin');
    }

    public function stan()
    {
        return $this->belongsTo(Stan::class, 'id_stan', 'id_stan');
    }

    public function pameran()
    {
        return $this->belongsTo(Pameran::class, 'id_pameran', 'id_pameran');
    }

    public function kategori()
    {
        return $this->belongsTo(Kategori::class, 'id_kategori', 'id_kategori');
    }
}