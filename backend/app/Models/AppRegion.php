<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppRegion extends Model
{
    use HasFactory;
    
    protected $table = 'APP_REGIONS';
    
    protected $fillable = [
        'name',
    ];
    
    public $timestamps = false;
    
    // Relationships
    public function cities()
    {
        return $this->hasMany(AppCity::class, 'region_id');
    }
    
    public function applications()
    {
        return $this->hasMany(AppApplication::class, 'region_id');
    }
}
