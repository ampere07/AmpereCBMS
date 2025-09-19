<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppPeriod extends Model
{
    use HasFactory;
    
    protected $table = 'APP_PERIODS';
    
    protected $fillable = [
        'name',
        'description',
    ];
    
    public $timestamps = false;
    
    // Relationships
    public function applications()
    {
        return $this->hasMany(AppApplication::class, 'promo_id');
    }
}
