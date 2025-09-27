<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $table = 'application';
    protected $primaryKey = 'Application_ID';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'Email_Address',
        'Mobile_Number',
        'First_Name',
        'Last_Name',
        'Middle_Initial',
        'Secondary_Mobile_Number',
        'Region',
        'City',
        'Barangay',
        'Installation_Address',
        'Landmark',
        'First_Nearest_landmark',
        'Second_Nearest_landmark',
        'Desired_Plan',
        'select_the_applicable_promo',
        'Proof_of_Billing',
        'Government_Valid_ID',
        '2nd_Government_Valid_ID',
        'House_Front_Picture',
        'I_agree_to_the_terms_and_conditions',
        'Referred_By',
        'nearest_landmark1_image',
        'nearest_landmark2_image',
        'Status',
        'Applying_for',
        'Visit_By',
        'Modified_By',
        'Modified_Date',
        'User_Email',
        'Attach_the_picture_of_your_document',
        'Attach_SOA_from_other_provider',
        'Referrers_Account_Number',
        'nearest_landmark1_image',
        'nearest_landmark2_image'
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

    // Disable Laravel's automatic timestamp handling since we're using custom fields
    public $timestamps = false;
}
