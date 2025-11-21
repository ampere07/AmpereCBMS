<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImageSizeSetting extends Model
{
    use HasFactory;

    protected $table = 'settings_image_size';

    protected $fillable = [
        'max_width',
        'max_height',
        'quality',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public static function getActiveSetting()
    {
        return self::where('is_active', true)->first();
    }
}
