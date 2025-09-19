<?php

namespace App\Http\Controllers;

use App\Models\AppApplication;
use App\Services\TableCheckService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ApplicationController extends Controller
{
    /**
     * Process a new application
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function submitApplication(Request $request)
    {
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
        
        // First check if the email already exists
        $existingApplication = AppApplication::where('email', $request->email)->first();
        
        if ($existingApplication) {
            // If this is testing, allow reusing the email
            if (app()->environment('local', 'testing')) {
                // Delete the application
                $existingApplication->delete();
                Log::info('Development environment: Deleted existing application to allow resubmission.');
            } else {
                // In production, return a more helpful message
                return response()->json([
                    'message' => 'An application with this email already exists',
                    'errors' => [
                        'email' => ['This email is already registered. Please use a different email or contact support.']
                    ]
                ], 422);
            }
        }
        
        // Now we modify our validation rules
        $emailRule = 'required|string|email|max:255';
        
        // Only add the unique constraint in production
        if (!app()->environment('local', 'testing')) {
            $emailRule .= '|unique:APP_APPLICATIONS';
        }
        
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => $emailRule,
            'password' => 'required|string|min:6|confirmed',  // Reduced min length
            'phone_number' => 'required|string|max:20',
            'address_line1' => 'required|string|max:255',
            'city' => 'required|string',
            'province' => 'required|string',
            'postal_code' => 'nullable|string|max:20',
            'application_status' => 'nullable|string',
            'application_date' => 'nullable|date',
            'is_applicant' => 'nullable',  // Can be a string 'true'/'false' now
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $application = new AppApplication();
        $application->create_date = now()->format('Y-m-d');
        $application->create_time = now()->format('H:i:s');
        $application->email = $request->email;
        $application->first_name = $request->first_name;
        $application->middle_initial = $request->middle_name;
        $application->last_name = $request->last_name;
        $application->mobile = $request->phone_number;
        $application->address_line = $request->address_line1;
        $application->region_id = null; // Set appropriately if available
        $application->city_id = null; // Set appropriately if available
        $application->borough_id = null; // Set appropriately if available
        $application->status = $request->application_status ?: 'pending';
        $application->source = 'Web Form';
        $application->ip_address = $request->ip();
        $application->user_agent = $request->header('User-Agent');
        $application->primary_consent = true;
        $application->primary_consent_at = now();
        $application->save();
        
        // No token creation since we're not using User model

        return response()->json([
            'message' => 'Application submitted successfully',
            'application' => $application
        ], 201);
    }

    /**
     * Get application information
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function getApplicationInfo(Request $request)
    {
        $email = $request->input('email');
        
        if (!$email) {
            return response()->json([
                'message' => 'Email is required'
            ], 400);
        }
        
        $application = AppApplication::where('email', $email)->first();
        
        if (!$application) {
            return response()->json([
                'message' => 'Application not found'
            ], 404);
        }
        
        return response()->json([
            'application' => $application
        ]);
    }

    /**
     * Update application status (admin only)
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function updateApplicationStatus(Request $request, $id)
    {
        // This should be protected by admin middleware in routes
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

    /**
     * Get all applications (admin only)
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function getAllApplications(Request $request)
    {
        // This should be protected by admin middleware in routes
        $status = $request->query('status');
        
        $query = AppApplication::query();
        
        if ($status) {
            $query->where('status', $status);
        }
        
        $applications = $query->with(['region', 'city', 'barangay', 'village', 'plan'])->paginate(10);
        
        return response()->json([
            'applications' => $applications
        ]);
    }
}
