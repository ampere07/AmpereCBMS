<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormUI extends Model
{
    use HasFactory;

    protected $table = 'form_ui';

    protected $fillable = [
        'page_hex',
        'form_hex',
        'logo',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
