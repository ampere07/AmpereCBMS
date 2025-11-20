<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Plan;
use App\Models\PromoList;
use App\Services\GoogleDriveService;
use App\Services\ImageResizeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ApplicationController extends Controller
{
    protected $googleDriveService;

    public function __construct(GoogleDriveService $googleDriveService)
    {
        $this->googleDriveService = $googleDriveService;
    }   

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|max:255',
                'mobile' => 'required|string|regex:/^09[0-9]{9}$/',
                'firstName' => 'required|string|max:255',
                'lastName' => 'required|string|max:255',
                'middleInitial' => 'nullable|string|max:1',
                'secondaryMobile' => 'nullable|string|regex:/^09[0-9]{9}$/',
                'region' => 'required|string|max:255',
                'city' => 'required|string|max:255',
                'barangay' => 'required|string|max:255',
                'location' => 'nullable|string|max:255',
                'installationAddress' => 'required|string',
                'landmark' => 'required|string|max:255',
                'referredBy' => 'nullable|string|max:255',
                'plan' => 'required|string|max:255',
                'promo' => 'nullable|string|max:255',
                'proofOfBilling' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
                'governmentIdPrimary' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
                'governmentIdSecondary' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
                'houseFrontPicture' => 'required|file|mimes:jpg,jpeg,png|max:2048',
                'nearestLandmark1Image' => 'required|file|mimes:jpg,jpeg,png|max:2048',
                'nearestLandmark2Image' => 'required|file|mimes:jpg,jpeg,png|max:2048',
                'promoProof' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $fullName = trim($request->firstName . ' ' . ($request->middleInitial ? $request->middleInitial . '. ' : '') . $request->lastName);

            $localDocumentPaths = $this->handleLocalDocumentUploads($request);
            
            Log::info('Local document paths ready for Google Drive', [
                'count' => count($localDocumentPaths),
                'paths' => $localDocumentPaths
            ]);
            
            $googleDriveUrls = [];
            try {
                Log::info('=== GOOGLE DRIVE UPLOAD START ===');
                Log::info('Full Name: ' . $fullName);
                
                $filesToUpload = [];
                
                foreach ($localDocumentPaths as $fieldName => $localPath) {
                    if ($localPath) {
                        $fullPath = public_path($localPath);
                        Log::info("Checking file: {$fieldName}", [
                            'path' => $fullPath,
                            'exists' => file_exists($fullPath),
                            'readable' => is_readable($fullPath),
                            'size' => file_exists($fullPath) ? filesize($fullPath) : 0
                        ]);
                        $filesToUpload[$fieldName] = $fullPath;
                    }
                }

                Log::info('Files to upload', [
                    'count' => count($filesToUpload),
                    'files' => array_keys($filesToUpload)
                ]);

                if (count($filesToUpload) > 0) {
                    Log::info('Calling GoogleDriveService...');
                    $googleDriveUrls = $this->googleDriveService->uploadApplicationDocuments($fullName, $filesToUpload);
                    Log::info('Google Drive URLs received', ['urls' => $googleDriveUrls]);
                } else {
                    Log::warning('No files to upload to Google Drive');
                }
                
                Log::info('=== GOOGLE DRIVE UPLOAD END ===');
                
            } catch (\Exception $e) {
                Log::error('=== GOOGLE DRIVE UPLOAD FAILED ===');
                Log::error('Error Message: ' . $e->getMessage());
                Log::error('Error File: ' . $e->getFile() . ':' . $e->getLine());
                Log::error('Stack trace: ' . $e->getTraceAsString());
                Log::error('=== END ERROR ===');
            }

            $application = new Application();
            
            $application->timestamp = now();
            $application->email_address = $request->email;
            $application->mobile_number = $request->mobile;
            $application->first_name = $request->firstName;
            $application->last_name = $request->lastName;
            $application->middle_initial = $request->middleInitial;
            $application->secondary_mobile_number = $request->secondaryMobile;
            $application->region = $request->region;
            $application->city = $request->city;
            $application->barangay = $request->barangay;
            $application->location = $request->location;
            $application->installation_address = $request->installationAddress;
            $application->landmark = $request->landmark;
            $application->referred_by = $request->referredBy;
            
            $plan = Plan::find($request->plan);
            if ($plan) {
                $application->desired_plan = $plan->plan_name;
            } else {
                $application->desired_plan = $request->plan;
            }
            
            if ($request->promo && $request->promo !== '') {
                $application->promo = $request->promo;
            } else {
                $application->promo = 'None';
            }
            
            $application->terms_agreed = true;
            $application->status = 'pending';

            if (isset($googleDriveUrls['proof_of_billing_url'])) {
                $application->proof_of_billing_url = $googleDriveUrls['proof_of_billing_url'];
            }

            if (isset($googleDriveUrls['government_valid_id_url'])) {
                $application->government_valid_id_url = $googleDriveUrls['government_valid_id_url'];
            }

            if (isset($googleDriveUrls['second_government_valid_id_url'])) {
                $application->second_government_valid_id_url = $googleDriveUrls['second_government_valid_id_url'];
            }

            if (isset($googleDriveUrls['house_front_picture_url'])) {
                $application->house_front_picture_url = $googleDriveUrls['house_front_picture_url'];
            }

            if (isset($googleDriveUrls['nearest_landmark1_url'])) {
                $application->nearest_landmark1_url = $googleDriveUrls['nearest_landmark1_url'];
            }

            if (isset($googleDriveUrls['nearest_landmark2_url'])) {
                $application->nearest_landmark2_url = $googleDriveUrls['nearest_landmark2_url'];
            }

            if (isset($googleDriveUrls['promo_url'])) {
                $application->promo_url = $googleDriveUrls['promo_url'];
            }

            $application->save();

            Log::info('Application submitted successfully', [
                'application_id' => $application->id,
                'email' => $application->email_address,
                'google_drive_folder' => $fullName
            ]);

            return response()->json([
                'message' => 'Application submitted successfully',
                'application' => $application
            ], 201);

        } catch (\Exception $e) {
            Log::error('Application submission failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to submit application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function handleLocalDocumentUploads(Request $request)
    {
        Log::info('=== STARTING LOCAL DOCUMENT UPLOADS ===');
        
        $documentPaths = [];

        $documentMappings = [
            'proofOfBilling' => 'proofOfBilling',
            'governmentIdPrimary' => 'governmentIdPrimary',
            'governmentIdSecondary' => 'governmentIdSecondary',
            'houseFrontPicture' => 'houseFrontPicture',
            'nearestLandmark1Image' => 'nearestLandmark1Image',
            'nearestLandmark2Image' => 'nearestLandmark2Image',
            'promoProof' => 'promoProof',
        ];

        $documentsPath = public_path('assets/documents');
        if (!file_exists($documentsPath)) {
            mkdir($documentsPath, 0755, true);
        }

        foreach ($documentMappings as $requestKey => $fieldKey) {
            Log::info("Checking for file: {$requestKey}", [
                'has_file' => $request->hasFile($requestKey)
            ]);
            
            if ($request->hasFile($requestKey)) {
                try {
                    $file = $request->file($requestKey);
                    $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $finalPath = $documentsPath . '/' . $fileName;
                    $fileType = $file->getClientMimeType();
                    
                    Log::info("Processing file: {$requestKey}", [
                        'file_name' => $fileName,
                        'mime_type' => $fileType,
                        'is_image' => ImageResizeService::isImageFile($fileType)
                    ]);
                    
                    // Check if file is an image and resize if needed
                    if (ImageResizeService::isImageFile($fileType)) {
                        Log::info('Image detected - applying active resize settings', [
                            'field' => $requestKey,
                            'file_name' => $fileName,
                            'mime_type' => $fileType,
                            'destination' => 'backend + Google Drive'
                        ]);
                        
                        $originalSize = filesize($file->getPathname());
                        $tempPath = $file->getPathname();
                        $resized = ImageResizeService::resizeImage($tempPath, $finalPath);
                        
                        if ($resized) {
                            $resizedSize = filesize($finalPath);
                            $documentPaths[$fieldKey] = 'assets/documents/' . $fileName;
                            Log::info('Image successfully resized for backend storage', [
                                'field' => $requestKey,
                                'file_name' => $fileName,
                                'original_size' => $originalSize,
                                'resized_size' => $resizedSize,
                                'reduction' => round((($originalSize - $resizedSize) / $originalSize) * 100, 2) . '%'
                            ]);
                        } else {
                            Log::warning('Image resize failed, saving original', [
                                'field' => $requestKey,
                                'file_name' => $fileName
                            ]);
                            // If resize fails, fallback to normal file move
                            if ($file->move($documentsPath, $fileName)) {
                                $documentPaths[$fieldKey] = 'assets/documents/' . $fileName;
                                Log::info("Successfully uploaded locally (resize skipped): {$fileName} for {$requestKey}");
                            }
                        }
                    } else {
                        // Not an image, move as normal
                        if ($file->move($documentsPath, $fileName)) {
                            $documentPaths[$fieldKey] = 'assets/documents/' . $fileName;
                            Log::info("Successfully uploaded locally: {$fileName} for {$requestKey}");
                        }
                    }
                } catch (\Exception $e) {
                    Log::error("Failed to upload locally {$requestKey}: " . $e->getMessage());
                    $documentPaths[$fieldKey] = null;
                }
            }
        }
        
        Log::info('=== LOCAL DOCUMENT UPLOADS COMPLETED ===', [
            'files_processed' => count($documentPaths),
            'paths' => $documentPaths
        ]);

        return $documentPaths;
    }

    public function index(Request $request)
    {
        try {
            $status = $request->query('status');
            
            $query = Application::query();
            
            if ($status) {
                $query->where('status', $status);
            }
            
            $applications = $query->orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'applications' => $applications
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve applications', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to retrieve applications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $application = Application::findOrFail($id);
            
            return response()->json([
                'application' => $application
            ]);

        } catch (\Exception $e) {
            Log::error('Application not found', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Application not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'status' => 'required|string|in:pending,approved,rejected',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $application = Application::findOrFail($id);
            $application->status = $request->status;
            $application->save();

            return response()->json([
                'message' => 'Application status updated successfully',
                'application' => $application
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update application status', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to update application status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
