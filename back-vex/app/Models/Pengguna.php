<?php

namespace App\Models;

// Tambahkan HasApiTokens agar bisa digunakan oleh Sanctum
use Laravel\Sanctum\HasApiTokens; 
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Pengguna extends Authenticatable
{
    // HasApiTokens 
    use HasApiTokens, HasFactory, Notifiable;

    public $timestamps = false;

    protected $table = 'pengguna';
    
    // konstanta role
    const ROLE_ADMIN     = 'Admin';
    const ROLE_CREATOR   = 'Creator';
    const ROLE_PENGUNJUNG = 'Pengunjung';

    const STATUS_AKTIF ='Aktif';
    const STATUS_TIDAK_AKTIF ='Tidak Aktif';


   
    protected $fillable = [
        'nama',
        'email',
        'password',
        'kategori_kode',
        'role',
        'status',
        'new_email',  //tambah untuk ganti email
        'new_email_verification_token', // tambah untuk ganti email
        'new_email_expires_at',  //tambah untuk ganti email
        
    ];

    protected $hidden = [

        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [

            'password' => 'hashed',
        ];
    }

    // Helper Methods
    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isCreator(): bool
    {
        return $this->role === self::ROLE_CREATOR;
    }

    public function isPengunjung(): bool
    {
        return $this->role === self::ROLE_PENGUNJUNG;
    }

    public function isAktif(): bool
    {
        return $this->status === self::STATUS_AKTIF;
    }


    public function kategori()
    {
        return $this->belongsTo(Kategori::class, 'kategori_kode', 'kode_kategori');
    }
}
