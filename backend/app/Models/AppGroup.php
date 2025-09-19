<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppGroup extends Model
{
    use HasFactory;
    
    protected $table = 'APP_GROUPS';
    
    protected $fillable = [
        'group_name',
        'description',
    ];
    
    public $timestamps = false;
    
    // Relationships
    public function applications()
    {
        return $this->hasMany(AppApplication::class, 'group_id');
    }
}
