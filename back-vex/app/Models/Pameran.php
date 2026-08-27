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

    protected $appends = [
        'id',
        'title',
        'subtitle',
        'category',
        'date',
        'year',
        'bannerImage',
        'likes',
        'karya_count',
        'stats',
        'description',
        'institution',
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

    public function kunjungan()
    {
        return $this->hasMany(Kunjungan::class, 'id_pameran', 'id_pameran');
    }

    // Accessors for Frontend compatibility
    public function getIdAttribute()
    {
        return $this->attributes['id_pameran'] ?? null;
    }

    public function getTitleAttribute()
    {
        return $this->attributes['judul'] ?? '';
    }

    public function getSubtitleAttribute()
    {
        // return 'Pameran Karya';
    }

    public function getCategoryAttribute()
    {
        return 'Umum';
    }

    public function getDateAttribute()
    {
        $date = $this->attributes['tanggal_buka'] ?? null;
        if (!$date) return '';
        try {
            return \Carbon\Carbon::parse($date)->translatedFormat('d F Y');
        } catch (\Throwable $e) {
            return $date;
        }
    }

    public function getYearAttribute()
    {
        $date = $this->attributes['tanggal_buka'] ?? null;
        if (!$date) return '';
        try {
            return \Carbon\Carbon::parse($date)->format('Y');
        } catch (\Throwable $e) {
            $match = [];
            if (preg_match('/\b(19\d\d|20\d\d)\b/', $date, $match)) {
                return $match[1];
            }
            return '';
        }
    }

    public function getBannerImageAttribute()
    {
        $banner = $this->attributes['banner'] ?? '';
        if (!$banner) return '';
        if (str_starts_with($banner, 'http://') || str_starts_with($banner, 'https://')) {
            return $banner;
        }
        return 'http://localhost:8000/storage/' . ltrim($banner, '/');
    }

    public function getLikesAttribute()
    {
        return 0;
    }

    public function getKaryaCountAttribute()
    {
        if (array_key_exists('karya_count', $this->attributes)) {
            return (int) $this->attributes['karya_count'];
        }
        if ($this->relationLoaded('karya')) {
            return $this->karya->count();
        }
        return 0;
    }

    public function getStatsAttribute()
    {
        $count = array_key_exists('karya_count', $this->attributes)
            ? (int) $this->attributes['karya_count']
            : ($this->relationLoaded('karya') ? $this->karya->count() : 0);

        return [
            'likes' => 0,
            'karya' => $count,
            'prepareStartDate' => $this->attributes['tanggal_mulai_persiapan'] ?? '',
            'prepareEndDate' => $this->attributes['tanggal_akhir_persiapan'] ?? '',
            'startDate' => $this->attributes['tanggal_buka'] ?? '',
            'endDate' => null,
            'studyLevel' => 'PBL EXPO',
        ];
    }

    public function getDescriptionAttribute()
    {
        $deskripsi = $this->attributes['deskripsi'] ?? '';
        return [
            [
                'title' => 'Description',
                'content' => $deskripsi,
            ],
        ];
    }

    public function getInstitutionAttribute()
    {
        return 'Politeknik Negeri Batam';
    }
}
