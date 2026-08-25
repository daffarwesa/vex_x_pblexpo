<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Karya extends Model
{
    public $timestamps = false;
    protected $table = 'karya';
    protected $primaryKey = 'id_karya';

    protected $fillable = [
        'id_pengguna',
        'id_kategori',
        'id_stan',
        'id_pameran',
        'judul',
        'deskripsi',
        'tautan',
        'gambar_poster',
        'gambar_poster_large',
        'gambar_poster_medium',
        'gambar_poster_small',
        'gambar_sampul',
        'gambar_sampul_large',
        'gambar_sampul_medium',
        'gambar_sampul_small',
        'is_juara',
        'is_best',
    ];

    protected $casts = [
        'is_juara' => 'boolean',
        'is_best' => 'boolean',
    ];

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'id_pengguna', 'id');
    }

    public function kategori()
    {
        return $this->belongsTo(Kategori::class, 'id_kategori', 'id_kategori');
    }

    public function stan()
    {
        return $this->belongsTo(Stan::class, 'id_stan', 'id_stan');
    }

    public function pameran()
    {
        return $this->belongsTo(Pameran::class, 'id_pameran', 'id_pameran');
    }

    // Log siapa & kapan menilai — BUKAN sumber is_best/is_juara (itu kolom langsung di karya)
    public function penilaian()
    {
        return $this->hasMany(Penilaian::class, 'id_karya', 'id_karya');
    }

    public function komentar()
    {
        return $this->hasMany(Komentar::class, 'id_karya', 'id_karya');
    }

    public function suka()
    {
        return $this->hasMany(Suka::class, 'id_karya', 'id_karya');
    }

    public function totalSuka()
    {
        return $this->suka()->count();
    }
}