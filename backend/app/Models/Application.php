<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $table = 'application';
    protected $primaryKey = 'Application_ID';
    
    // Disable auto-incrementing since we'll generate random IDs
    public $incrementing = false;
    
    // Set the primary key type
    protected $keyType = 'int';
    
    // Disable Laravel's automatic timestamp handling since we use custom timestamp field
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        // Primary Key (now manually set)
        'Application_ID',
        // Contact Information (using actual database column names)
        'Email_Address',
        'Mobile_Number',
        'First_Name',
        'Last_Name',
        'Middle_Initial',
        'Secondary_Mobile_Number',
        
        // Location Information
        'Region',
        'City',
        'Barangay',
        'Installation_Address',
        'Landmark',
        'Referred_by',
        
        // Plan Selection
        'Desired_Plan',
        'Select_the_applicable_promo',
        
        // Document File Paths
        'Proof_of_Billing',
        'Government_Valid_ID',
        '2nd_Government_Valid_ID',
        'House_Front_Picture',
        'First_Nearest_landmark',
        'Second_Nearest_landmark',
        
        // Additional fields
        'I_agree_to_the_terms_and_conditions',
        'Attach_the_picture_of_your_document',
        'Attach_SOA_from_other_provider',
        'Referrers_Account_Number',
        'Applying_for',
        'Status',
        'Visit_By',
        'Visit_With',
        'Visit_With_Other',
        'Remarks',
        'Modified_By',
        'Modified_Date',
        'User_Email',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'Modified_Date' => 'datetime',
        'Timestamp' => 'datetime',
        'I_agree_to_the_terms_and_conditions' => 'boolean',
    ];

    /**
     * Get the application status with color coding.
     *
     * @return string
     */
    public function getStatusColorAttribute()
    {
        return match($this->Status) {
            'pending' => 'yellow',
            'approved' => 'green',
            'rejected' => 'red',
            'processing' => 'blue',
            default => 'gray'
        };
    }

    /**
     * Scope to filter applications by status.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $status
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('Status', $status);
    }

    /**
     * Get pending applications.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePending($query)
    {
        return $query->where('Status', 'pending');
    }

    /**
     * Get approved applications.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeApproved($query)
    {
        return $query->where('Status', 'approved');
    }

    /**
     * Generate a unique random 7-digit Application_ID
     *
     * @return int
     */
    public static function generateUniqueApplicationId()
    {
        do {
            // Generate random 7-digit number (1000000 to 9999999)
            $applicationId = mt_rand(1000000, 9999999);
        } while (static::where('Application_ID', $applicationId)->exists());
        
        return $applicationId;
    }
}
