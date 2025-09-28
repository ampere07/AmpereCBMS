<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;

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
        try {
            // Ensure the application table exists
            $this->ensureTableExists();
            
            // Validate the request data
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
                'referredBy' => 'nullable|string|max:255',
                'plan' => 'required|string|max:255',
                'promo' => 'nullable|string|max:255',
                'nearestLandmark1Image' => 'required|file|mimes:jpeg,jpg,png|max:2048',
                'nearestLandmark2Image' => 'required|file|mimes:jpeg,jpg,png|max:2048',
                'proofOfBilling' => 'required|file|mimes:jpeg,jpg,png,pdf|max:2048',
                'governmentIdPrimary' => 'required|file|mimes:jpeg,jpg,png,pdf|max:2048',
                'governmentIdSecondary' => 'nullable|file|mimes:jpeg,jpg,png,pdf|max:2048',
                'houseFrontPicture' => 'required|file|mimes:jpeg,jpg,png|max:2048',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // Check if email already exists
            $existingApplication = Application::where('Email_Address', $request->email)->first();
                
            if ($existingApplication) {
                return response()->json([
                    'message' => 'An application with this email already exists.',
                    'errors' => ['email' => ['This email is already registered. Please use a different email or contact support.']]
                ], 422);
            }

            // Handle document uploads first
            $documentPaths = $this->handleDocumentUploads($request);
            
            // Generate unique 11-digit Application_ID
            $applicationId = Application::generateUniqueApplicationId();
            
            // Prepare data for insertion matching the migration schema exactly
            $applicationData = [
                'Application_ID' => $applicationId,
                'Email_Address' => $request->email,
                'Mobile_Number' => $request->mobile,
                'First_Name' => $request->firstName,
                'Last_Name' => $request->lastName,
                'Middle_Initial' => $request->middleInitial,
                'Secondary_Mobile_Number' => $request->secondaryMobile,
                'Region' => $request->region,
                'City' => $request->city,
                'Barangay' => $request->barangay,
                'Installation_Address' => $request->installationAddress,
                'Landmark' => $request->landmark,
                'Referred_by' => $request->referredBy,
                'Desired_Plan' => $request->plan,
                'Select_the_applicable_promo' => $request->promo ?? 'None',
                'Status' => 'pending',
                'I_agree_to_the_terms_and_conditions' => true,
            ];

            // Add document paths to data
            $applicationData = array_merge($applicationData, $documentPaths);

            Log::info('Attempting to create application:', $applicationData);

            // Create new application using the model
            $application = Application::create($applicationData);
            
            if ($application) {
                Log::info('Application created successfully with ID: ' . $application->Application_ID);
                
                return response()->json([
                    'message' => 'Application submitted successfully',
                    'application_id' => $application->Application_ID,
                    'application' => $application
                ], 201);
            } else {
                throw new \Exception('Failed to create application');
            }
            
        } catch (\Exception $e) {
            Log::error('Application submission error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'Application submission failed: ' . $e->getMessage()
            ], 500);
        }
    }



    /**
     * Handle document uploads and return file paths
     */
    private function handleDocumentUploads(Request $request)
    {
        $documentPaths = [
            'Proof_of_Billing' => null,
            'Government_Valid_ID' => null,
            '2nd_Government_Valid_ID' => null,
            'House_Front_Picture' => null,
            'First_Nearest_landmark' => null,
            'Second_Nearest_landmark' => null,
        ];

        $documentMappings = [
            'proofOfBilling' => 'Proof_of_Billing',
            'governmentIdPrimary' => 'Government_Valid_ID',
            'governmentIdSecondary' => '2nd_Government_Valid_ID',
            'houseFrontPicture' => 'House_Front_Picture',
            'nearestLandmark1Image' => 'First_Nearest_landmark',
            'nearestLandmark2Image' => 'Second_Nearest_landmark',
        ];

        // Ensure documents directory exists
        $documentsPath = public_path('assets/documents');
        if (!file_exists($documentsPath)) {
            mkdir($documentsPath, 0755, true);
        }

        foreach ($documentMappings as $requestKey => $dbField) {
            if ($request->hasFile($requestKey)) {
                try {
                    $file = $request->file($requestKey);
                    $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    
                    if ($file->move($documentsPath, $fileName)) {
                        $documentPaths[$dbField] = 'assets/documents/' . $fileName;
                        Log::info("Successfully uploaded: {$fileName} for {$requestKey}");
                    }
                } catch (\Exception $e) {
                    Log::error("Failed to upload {$requestKey}: " . $e->getMessage());
                    // Set to null if upload fails
                    $documentPaths[$dbField] = null;
                }
            }
        }

        return $documentPaths;
    }

    /**
     * Get all applications
     */
    public function index()
    {
        try {
            $applications = Application::orderBy('Application_ID', 'desc')->paginate(10);
            
            return response()->json(['applications' => $applications]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching applications: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get specific application
     */
    public function show($id)
    {
        try {
            $application = Application::where('Application_ID', $id)->first();

            if (!$application) {
                return response()->json(['error' => 'Application not found'], 404);
            }
            
            return response()->json(['application' => $application]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching application: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Debug endpoint
     */
    public function debug()
    {
        try {
            // Get application count and sample data
            $applicationCount = Application::count();
            $sampleApplication = Application::first();
            $recentApplications = Application::orderBy('Application_ID', 'desc')->limit(3)->get();

            return response()->json([
                'application_count' => $applicationCount,
                'sample_application' => $sampleApplication,
                'recent_applications' => $recentApplications,
                'php_version' => phpversion(),
                'laravel_version' => app()->version(),
                'database_connection' => DB::connection()->getName()
            ]);
            
        } catch (\Exception $e) {
            Log::error('Debug endpoint error: ' . $e->getMessage());
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Reset table endpoint (for testing)
     */
    public function resetTable()
    {
        try {
            // Delete all applications
            Application::query()->delete();
            Log::info('All applications deleted successfully');
            
            return response()->json(['message' => 'Table reset successfully']);
        } catch (\Exception $e) {
            Log::error('Error resetting table: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Ensure the application table exists by running migrations if needed
     */
    private function ensureTableExists()
    {
        try {
            if (!Schema::hasTable('application')) {
                Log::info('Application table does not exist, running migrations...');
                Artisan::call('migrate', [
                    '--path' => 'database/migrations/2025_09_19_000003_create_application_table.php',
                    '--force' => true
                ]);
                Log::info('Migration completed successfully');
            }
        } catch (\Exception $e) {
            Log::error('Error ensuring table exists: ' . $e->getMessage());
            throw new \Exception('Database table setup failed: ' . $e->getMessage());
        }
    }
}
