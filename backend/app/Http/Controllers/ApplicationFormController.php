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

            $existingApplication = Application::where('email_address', $request->email)->first();
                
            if ($existingApplication) {
                return response()->json([
                    'message' => 'An application with this email already exists.',
                    'errors' => ['email' => ['This email is already registered. Please use a different email or contact support.']]
                ], 422);
            }

            $documentPaths = $this->handleDocumentUploads($request);
            
            $applicationData = [
                'timestamp' => now(),
                'email_address' => $request->email,
                'mobile_number' => $request->mobile,
                'first_name' => $request->firstName,
                'last_name' => $request->lastName,
                'middle_initial' => $request->middleInitial,
                'secondary_mobile_number' => $request->secondaryMobile,
                'region' => $request->region,
                'city' => $request->city,
                'barangay' => $request->barangay,
                'installation_address' => $request->installationAddress,
                'landmark' => $request->landmark,
                'referred_by' => $request->referredBy,
                'desired_plan' => $request->plan,
                'promo' => $request->promo ?? 'None',
                'status' => 'pending',
                'terms_agreed' => true,
            ];

            $applicationData = array_merge($applicationData, $documentPaths);

            Log::info('Attempting to create application:', $applicationData);

            $application = Application::create($applicationData);
            
            if ($application) {
                Log::info('Application created successfully with ID: ' . $application->id);
                
                return response()->json([
                    'message' => 'Application submitted successfully',
                    'application_id' => $application->id,
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
            'proof_of_billing_url' => null,
            'government_valid_id_url' => null,
            'second_government_valid_id_url' => null,
            'house_front_picture_url' => null,
            'document_attachment_url' => null,
            'other_isp_bill_url' => null,
        ];

        $documentMappings = [
            'proofOfBilling' => 'proof_of_billing_url',
            'governmentIdPrimary' => 'government_valid_id_url',
            'governmentIdSecondary' => 'second_government_valid_id_url',
            'houseFrontPicture' => 'house_front_picture_url',
            'nearestLandmark1Image' => 'document_attachment_url',
            'nearestLandmark2Image' => 'other_isp_bill_url',
        ];

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
            $applications = Application::orderBy('id', 'desc')->paginate(10);
            
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
            $application = Application::where('id', $id)->first();

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
            $applicationCount = Application::count();
            $sampleApplication = Application::first();
            $recentApplications = Application::orderBy('id', 'desc')->limit(3)->get();

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
            Application::query()->delete();
            Log::info('All applications deleted successfully');
            
            return response()->json(['message' => 'Table reset successfully']);
        } catch (\Exception $e) {
            Log::error('Error resetting table: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
