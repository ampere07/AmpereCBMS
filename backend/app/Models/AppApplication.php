<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppApplication extends Model
{
    use HasFactory;
    
    protected $table = 'APP_APPLICATIONS';
    
    protected $fillable = [
        'create_date',
        'create_time',
        'update_date',
        'update_time',
        'email',
        'first_name',
        'middle_initial',
        'last_name',
        'mobile',
        'mobile_alt',
        'region_id',
        'city_id',
        'borough_id',
        'village_id',
        'address_line',
        'landmark',
        'nearest_landmark1',
        'nearest_landmark2',
        'plan_id',
        'promo_id',
        'proof_of_billing',
        'gov_id_primary',
        'gov_id_secondary',
        'house_front_pic',
        'room_pic',
        'primary_consent',
        'primary_consent_at',
        'source',
        'ip_address',
        'user_agent',
        'status',
        'portal_id',
        'group_id',
    ];
    
    public $timestamps = false;
    
    // Relationships
    public function region()
    {
        return $this->belongsTo(AppRegion::class, 'region_id');
    }
    
    public function city()
    {
        return $this->belongsTo(AppCity::class, 'city_id');
    }
    
    public function barangay()
    {
        return $this->belongsTo(AppBarangay::class, 'borough_id');
    }
    
    public function village()
    {
        return $this->belongsTo(AppVillage::class, 'village_id');
    }
    
    public function plan()
    {
        return $this->belongsTo(AppPlan::class, 'plan_id');
    }
    
    public function group()
    {
        return $this->belongsTo(AppGroup::class, 'group_id');
    }
    
    public function documents()
    {
        return $this->hasMany(ApplicationDocument::class, 'application_id');
    }
}
