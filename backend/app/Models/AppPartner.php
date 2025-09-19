<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppPartner extends Model
{
    use HasFactory;
    
    protected $table = 'APP_PARTNERS';
    
    protected $fillable = [
        'name',
        'status',
    ];
    
    public $timestamps = false;
}
