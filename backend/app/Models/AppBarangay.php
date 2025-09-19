<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppBarangay extends Model
{
    use HasFactory;
    
    protected $table = 'APP_BARANGAYS';
    
    protected $fillable = [
        'city_id',
        'name',
    ];
    
    public $timestamps = false;
    
    // Relationships
    public function city()
    {
        return $this->belongsTo(AppCity::class, 'city_id');
    }
    
    public function villages()
    {
        return $this->hasMany(AppVillage::class, 'barangay_id');
    }
    
    public function applications()
    {
        return $this->hasMany(AppApplication::class, 'borough_id');
    }
}
