<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppVillage extends Model
{
    use HasFactory;
    
    protected $table = 'APP_VILLAGES';
    
    protected $fillable = [
        'barangay_id',
        'name',
    ];
    
    public $timestamps = false;
    
    // Relationships
    public function barangay()
    {
        return $this->belongsTo(AppBarangay::class, 'barangay_id');
    }
    
    public function applications()
    {
        return $this->hasMany(AppApplication::class, 'village_id');
    }
}
