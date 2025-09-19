<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'email',
        'mobile',
        'first_name',
        'last_name',
        'middle_initial',
        'secondary_mobile',
        'region',
        'city',
        'barangay',
        'installation_address',
        'landmark',
        'nearest_landmark1',
        'nearest_landmark2',
        'plan',
        'promo',
        'proof_of_billing_path',
        'government_id_primary_path',
        'government_id_secondary_path',
        'house_front_picture_path',
        'status',
        'notes',
        'approved_by',
        'approved_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'approved_at' => 'datetime',
    ];

    /**
     * Get the user who approved this application.
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
