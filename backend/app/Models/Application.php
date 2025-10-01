<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $table = 'applications';
    
    public $timestamps = true;
    
    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';

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
        'desired_plan',
        'promo',
        'referrer_account_id',
        'referred_by',
        'proof_of_billing_url',
        'government_valid_id_url',
        'second_government_valid_id_url',
        'house_front_picture_url',
        'document_attachment_url',
        'other_isp_bill_url',
        'terms_agreed',
        'status',
        'created_by_user_id',
        'updated_by_user_id',
    ];

    protected $casts = [
        'terms_agreed' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'timestamp' => 'datetime',
    ];

    protected $attributes = [
        'status' => 'pending',
        'terms_agreed' => false,
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
