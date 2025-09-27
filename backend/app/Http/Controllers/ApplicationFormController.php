<?php

namespace App\Http\Controllers;


use App\Models\Application;
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
            'referredBy' => 'nullable|string|max:255',
            'plan' => 'required|string|max:255',
            'promo' => 'nullable|string|max:255',
            'nearestLandmark1Image' => 'required|file|mimes:jpeg,jpg,png|max:2048',
            'nearestLandmark2Image' => 'required|file|mimes:jpeg,jpg,png|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Use transaction to ensure data integrity
        DB::beginTransaction();
        
        try {
            
            // Create the application record
            $application = new Application();
            $application->Email_Address = $request->email;
            $application->First_Name = $request->firstName;
            $application->Middle_Initial = $request->middleInitial;
            $application->Last_Name = $request->lastName;
            $application->Mobile_Number = $request->mobile;
            $application->Secondary_Mobile_Number = $request->secondaryMobile;
            $application->Region = $request->region;
            $application->City = $request->city;
            $application->Barangay = $request->barangay;
            $application->Installation_Address = $request->installationAddress;
            $application->Landmark = $request->landmark;
            $application->Referred_By = $request->referredBy;
            $application->Desired_Plan = $request->plan;
            $application->select_the_applicable_promo = $request->promo ?: 'None';
            $application->Status = 'pending';
            $application->Timestamp = now();
            $application->I_agree_to_the_terms_and_conditions = true;
            $application->save();

            // Handle document uploads
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
     * Handle uploading documents for an application
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Application  $application
     * @return void
     */
    private function handleDocumentUploads(Request $request, Application $application)
    {
        $documentTypes = [
            'proofOfBilling' => 'Proof_of_Billing',
            'governmentIdPrimary' => 'Government_Valid_ID',
            'governmentIdSecondary' => '2nd_Government_Valid_ID',
            'houseFrontPicture' => 'House_Front_Picture',
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
        $applications = Application::orderBy('Timestamp', 'desc')
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
        $application = Application::findOrFail($id);
        
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

        $application = Application::findOrFail($id);
        
        $application->Status = $request->status;
        if ($request->has('notes')) {
            // Note: there's no 'notes' field in your table structure
            // You might want to add one or handle notes differently
        }
        
        $application->save();
        
        return response()->json([
            'message' => 'Application status updated',
            'application' => $application
        ]);
    }
}
