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
                'proofOfBilling' => 'required|file|mimes:jpg,jpeg,png,pdf|max:10240',
                'governmentIdPrimary' => 'required|file|mimes:jpg,jpeg,png,pdf|max:10240',
                'governmentIdSecondary' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:10240',
                'houseFrontPicture' => 'required|file|mimes:jpg,jpeg,png|max:10240',
                'nearestLandmark1Image' => 'required|file|mimes:jpg,jpeg,png|max:10240',
                'nearestLandmark2Image' => 'required|file|mimes:jpg,jpeg,png|max:10240',
                'promoProof' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:10240',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $fullName = trim($request->firstName . ' ' . ($request->middleInitial ? $request->middleInitial . '. ' : '') . $request->lastName);

            Log::info('=== APPLICATION FORM SUBMITTED ===', [
                'applicant' => $fullName,
                'email' => $request->email
            ]);

            $localDocumentPaths = $this->handleLocalDocumentUploads($request);
            
            Log::info('All images resized and saved locally, ready for Google Drive upload', [
                'count' => count($localDocumentPaths),
                'paths' => $localDocumentPaths
            ]);
            
            $googleDriveUrls = [];
            try {
                Log::info('=== UPLOADING RESIZED IMAGES TO GOOGLE DRIVE ===');
                Log::info('Applicant: ' . $fullName);
                
                $filesToUpload = [];
                
                foreach ($localDocumentPaths as $fieldName => $localPath) {
                    if ($localPath) {
                        $fullPath = public_path($localPath);
                        Log::info("Preparing resized image for upload: {$fieldName}", [
                            'path' => $fullPath,
                            'exists' => file_exists($fullPath),
                            'size' => file_exists($fullPath) ? filesize($fullPath) : 0
                        ]);
                        $filesToUpload[$fieldName] = $fullPath;
                    }
                }

                Log::info('Resized images ready for upload', [
                    'count' => count($filesToUpload),
                    'files' => array_keys($filesToUpload)
                ]);

                if (count($filesToUpload) > 0) {
                    Log::info('Uploading resized images to Google Drive...');
                    $googleDriveUrls = $this->googleDriveService->uploadApplicationDocuments($fullName, $filesToUpload);
                    Log::info('Google Drive upload completed', ['urls' => $googleDriveUrls]);
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
        Log::info('=== STEP 1: RESIZE AND SAVE IMAGES LOCALLY ===');
        
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
            Log::info('Created documents directory', ['path' => $documentsPath]);
        }

        foreach ($documentMappings as $requestKey => $fieldKey) {
            if ($request->hasFile($requestKey)) {
                try {
                    $file = $request->file($requestKey);
                    $originalName = $file->getClientOriginalName();
                    $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $finalPath = $documentsPath . '/' . $fileName;
                    $fileType = $file->getClientMimeType();
                    $originalSize = $file->getSize();
                    
                    Log::info("Processing {$requestKey}", [
                        'original_name' => $originalName,
                        'file_name' => $fileName,
                        'mime_type' => $fileType,
                        'original_size' => $originalSize,
                        'is_image' => ImageResizeService::isImageFile($fileType)
                    ]);
                    
                    if (ImageResizeService::isImageFile($fileType)) {
                        Log::info("Image detected: {$requestKey} - Attempting to resize based on active settings");
                        
                        $tempPath = $file->getPathname();
                        $resized = ImageResizeService::resizeImage($tempPath, $finalPath);
                        
                        if ($resized && file_exists($finalPath)) {
                            $resizedSize = filesize($finalPath);
                            $documentPaths[$fieldKey] = 'assets/documents/' . $fileName;
                            
                            Log::info("SUCCESS: Image resized for {$requestKey}", [
                                'file_name' => $fileName,
                                'original_size' => $originalSize . ' bytes',
                                'resized_size' => $resizedSize . ' bytes',
                                'reduction_percentage' => round((($originalSize - $resizedSize) / $originalSize) * 100, 2) . '%',
                                'saved_path' => $documentPaths[$fieldKey]
                            ]);
                        } else {
                            Log::warning("Resize failed for {$requestKey}, saving original image", [
                                'file_name' => $fileName
                            ]);
                            
                            if ($file->move($documentsPath, $fileName)) {
                                $documentPaths[$fieldKey] = 'assets/documents/' . $fileName;
                                Log::info("Original image saved: {$fileName} for {$requestKey}");
                            }
                        }
                    } else {
                        Log::info("Non-image file detected: {$requestKey} (PDF) - Saving without resize");
                        
                        if ($file->move($documentsPath, $fileName)) {
                            $documentPaths[$fieldKey] = 'assets/documents/' . $fileName;
                            Log::info("File saved: {$fileName} for {$requestKey}");
                        }
                    }
                } catch (\Exception $e) {
                    Log::error("Failed to process {$requestKey}: " . $e->getMessage(), [
                        'trace' => $e->getTraceAsString()
                    ]);
                    $documentPaths[$fieldKey] = null;
                }
            } else {
                Log::info("No file uploaded for {$requestKey}");
            }
        }
        
        Log::info('=== STEP 1 COMPLETED: ALL IMAGES RESIZED ===', [
            'total_files_processed' => count($documentPaths),
            'files' => array_keys($documentPaths)
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
