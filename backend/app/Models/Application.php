<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $table = 'applications';
    
    public $timestamps = true;

    protected $fillable = [
        'timestamp',
        'email_address',
        'first_name',
        'middle_initial',
        'last_name',
        'mobile_number',
        'secondary_mobile_number',
        'installation_address',
        'landmark',
        'region',
        'city',
        'barangay',
        'village',
        'plan_list',
        'promo_id',
        'referred_by',
        'proof_of_billing',
        'government_valid_id',
        'second_government_valid_id',
        'house_front_picture',
        'first_nearest_landmark',
        'second_nearest_landmark',
        'terms_agreed',
        'status',
    ];

    protected $casts = [
        'terms_agreed' => 'boolean',
        'timestamp' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $attributes = [
        'status' => 'pending',
        'terms_agreed' => false,
        'promo_id' => 'None',
    ];

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }
}
