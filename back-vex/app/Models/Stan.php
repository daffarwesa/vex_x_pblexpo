<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stan extends Model
{
    public $timestamps    = false;
    protected $table      = 'stan';
    protected $primaryKey = 'id_stan';

    protected $fillable = [
        'id_pameran',
    ];

    public function pameran()
    {
        return $this->belongsTo(Pameran::class, 'id_pameran', 'id_pameran');
    }

    public function karya()
    {
        return $this->hasMany(Karya::class, 'id_stan', 'id_stan');
    }
}
