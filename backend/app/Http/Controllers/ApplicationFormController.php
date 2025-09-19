<?php

namespace App\Http\Controllers;

use App\Models\AppRegion;
use App\Models\AppCity;
use App\Models\AppBarangay;
use App\Models\AppVillage;
use App\Models\AppPlan;
use App\Models\AppPeriod;
use App\Models\AppGroup;
use App\Models\AppApplication;
use App\Services\TableCheckService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ApplicationFormController extends Controller
{
    /**
     * Store a new application submission
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // First ensure the database exists
        $dbExists = TableCheckService::ensureDatabaseExists();
        
        if (!$dbExists) {
            Log::error('Database could not be created. Application submission failed.');
            return response()->json([
                'message' => 'Application submission failed due to database error.'
            ], 500);
        }
        
        // Ensure all required tables exist
        $tableResults = TableCheckService::ensureAllRequiredTablesExist();
        
        // Check for any failures
        $allTablesExist = !in_array(false, $tableResults, true);
        
        if (!$allTablesExist) {
            Log::error('One or more required tables could not be created. Application submission failed.');
            return response()->json([
                'message' => 'Application submission failed due to database error.'
            ], 500);
        }
        
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255',
            'mobile' => 'required|string|max:20',
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'middleInitial' => 'nullable|string|max:10',
            'secondaryMobile' => 'nullable|string|max:20',
            'region' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'barangay' => 'required|string|max:255',
            'installationAddress' => 'required|string',
            'landmark' => 'required|string|max:255',
            'nearestLandmark1' => 'required|string|max:255',
            'nearestLandmark2' => 'required|string|max:255',
            'plan' => 'required|string|max:255',
            'promo' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Use transaction to ensure data integrity
        DB::beginTransaction();
        
        try {
            // 1. Handle Region, City, Barangay, Village data
            $regionId = $this->getOrCreateRegion($request->region);
            $cityId = $this->getOrCreateCity($regionId, $request->city);
            $barangayId = $this->getOrCreateBarangay($cityId, $request->barangay);
            
            // 2. Handle Plan data
            $planId = $this->getOrCreatePlan($request->plan);
            
            // 3. Handle Promo/Period data
            $promoId = null;
            if ($request->promo && $request->promo !== 'None') {
                $promoId = $this->getOrCreatePeriod($request->promo);
            }
            
            // 4. Create the APP_APPLICATIONS record
            $application = new AppApplication();
            $application->create_date = now()->format('Y-m-d');
            $application->create_time = now()->format('H:i:s');
            $application->email = $request->email;
            $application->first_name = $request->firstName;
            $application->middle_initial = $request->middleInitial;
            $application->last_name = $request->lastName;
            $application->mobile = $request->mobile;
            $application->mobile_alt = $request->secondaryMobile;
            $application->region_id = $regionId;
            $application->city_id = $cityId;
            $application->borough_id = $barangayId;
            $application->address_line = $request->installationAddress;
            $application->landmark = $request->landmark;
            $application->nearest_landmark1 = $request->nearestLandmark1;
            $application->nearest_landmark2 = $request->nearestLandmark2;
            $application->plan_id = $planId;
            $application->promo_id = $promoId;
            $application->primary_consent = true;
            $application->primary_consent_at = now();
            $application->source = 'Web Form';
            $application->ip_address = $request->ip();
            $application->user_agent = $request->header('User-Agent');
            $application->status = 'pending';
            $application->save();

            // 5. Handle document uploads
            $this->handleDocumentUploads($request, $application);
            
            DB::commit();

            return response()->json([
                'message' => 'Application submitted successfully',
                'application' => $application
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating application: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Application submission failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get or create a region
     *
     * @param string $regionName
     * @return int
     */
    private function getOrCreateRegion($regionName)
    {
        $region = AppRegion::firstOrCreate(['name' => $regionName]);
        return $region->id;
    }

    /**
     * Get or create a city
     *
     * @param int $regionId
     * @param string $cityName
     * @return int
     */
    private function getOrCreateCity($regionId, $cityName)
    {
        $city = AppCity::firstOrCreate(
            ['name' => $cityName, 'region_id' => $regionId]
        );
        return $city->id;
    }

    /**
     * Get or create a barangay
     *
     * @param int $cityId
     * @param string $barangayName
     * @return int
     */
    private function getOrCreateBarangay($cityId, $barangayName)
    {
        $barangay = AppBarangay::firstOrCreate(
            ['name' => $barangayName, 'city_id' => $cityId]
        );
        return $barangay->id;
    }

    /**
     * Get or create a plan
     *
     * @param string $planName
     * @return int
     */
    private function getOrCreatePlan($planName)
    {
        $plan = AppPlan::firstOrCreate(['name' => $planName]);
        return $plan->id;
    }

    /**
     * Get or create a period/promo
     *
     * @param string $promoName
     * @return int
     */
    private function getOrCreatePeriod($promoName)
    {
        $period = AppPeriod::firstOrCreate(['name' => $promoName]);
        return $period->id;
    }

    /**
     * Handle uploading documents for an application
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\AppApplication  $application
     * @return void
     */
    private function handleDocumentUploads(Request $request, AppApplication $application)
    {
        $documentTypes = [
            'proofOfBilling' => 'proof_of_billing',
            'governmentIdPrimary' => 'gov_id_primary',
            'governmentIdSecondary' => 'gov_id_secondary',
            'houseFrontPicture' => 'house_front_pic',
        ];

        foreach ($documentTypes as $requestKey => $dbField) {
            if ($request->hasFile($requestKey)) {
                $file = $request->file($requestKey);
                
                // Generate a unique filename
                $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                
                // Define the destination path
                $destinationPath = public_path('assets/documents');
                
                // Make sure the directory exists
                if (!file_exists($destinationPath)) {
                    mkdir($destinationPath, 0755, true);
                }
                
                // Move the file
                $file->move($destinationPath, $fileName);
                
                // Save the file path
                $application->$dbField = 'assets/documents/' . $fileName;
            }
        }
        
        $application->save();
    }

    /**
     * Get all applications
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $applications = AppApplication::with(['region', 'city', 'barangay', 'plan', 'promo'])
            ->orderByRaw('create_date DESC, create_time DESC')
            ->paginate(10);
        
        return response()->json([
            'applications' => $applications
        ]);
    }

    /**
     * Get a specific application
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $application = AppApplication::with(['region', 'city', 'barangay', 'village', 'plan', 'promo', 'group'])
            ->findOrFail($id);
        
        return response()->json([
            'application' => $application
        ]);
    }

    /**
     * Update application status
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:pending,approved,rejected',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $application = AppApplication::findOrFail($id);
        
        $application->status = $request->status;
        $application->update_date = now()->format('Y-m-d');
        $application->update_time = now()->format('H:i:s');
        
        $application->save();
        
        return response()->json([
            'message' => 'Application status updated',
            'application' => $application
        ]);
    }
}
