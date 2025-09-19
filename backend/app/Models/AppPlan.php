<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppPlan extends Model
{
    use HasFactory;
    
    protected $table = 'APP_PLANS';
    
    protected $fillable = [
        'name',
        'description',
        'price',
    ];
    
    public $timestamps = false;
    
    // Relationships
    public function applications()
    {
        return $this->hasMany(AppApplication::class, 'plan_id');
    }
}
