<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppCity extends Model
{
    use HasFactory;
    
    protected $table = 'APP_CITIES';
    
    protected $fillable = [
        'region_id',
        'name',
    ];
    
    public $timestamps = false;
    
    // Relationships
    public function region()
    {
        return $this->belongsTo(AppRegion::class, 'region_id');
    }
    
    public function barangays()
    {
        return $this->hasMany(AppBarangay::class, 'city_id');
    }
    
    public function applications()
    {
        return $this->hasMany(AppApplication::class, 'city_id');
    }
}
