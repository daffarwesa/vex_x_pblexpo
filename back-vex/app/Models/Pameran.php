<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Pameran extends Model
{
    public $timestamps = false;
    protected $table = 'pameran';
    protected $primaryKey = 'id_pameran';
    protected $fillable = [
        'banner',
        'judul',
        'slug',
        'deskripsi',
        'tanggal_mulai_persiapan',
        'tanggal_akhir_persiapan',
        'tanggal_buka',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($pameran) {
            if (empty($pameran->slug)) {
                $base = Str::slug($pameran->judul);
                $slug = $base . '-' . Str::lower(Str::random(5));
                while (static::where('slug', $slug)->exists()) {
                    $slug = $base . '-' . Str::lower(Str::random(5));
                }
                $pameran->slug = $slug;
            }
        });
    }

    public function karya()
    {
        return $this->hasMany(Karya::class, 'id_pameran', 'id_pameran');
    }
}