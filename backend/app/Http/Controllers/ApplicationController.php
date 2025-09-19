<?php

namespace App\Http\Controllers;

use App\Models\User;
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
        $existingUser = User::where('email', $request->email)->first();
        
        if ($existingUser) {
            // If this is testing, allow reusing the email
            if (app()->environment('local', 'testing')) {
                // Delete any related application documents
                \App\Models\ApplicationDocument::where('user_id', $existingUser->id)->delete();
                
                // Delete the user
                $existingUser->delete();
                Log::info('Development environment: Deleted existing user to allow resubmission.');
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
            $emailRule .= '|unique:users';
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

        $user = User::create([
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone_number' => $request->phone_number,
            'address_line1' => $request->address_line1,
            'city' => $request->city,
            'province' => $request->province,
            'postal_code' => $request->postal_code ?: '1000',
            'application_status' => $request->application_status ?: 'pending',
            'application_date' => $request->application_date ?: now(),
            'is_applicant' => true,  // Always true for applicants
        ]);

        // Create token for document uploads
        $token = $user->createToken('application-token')->plainTextToken;

        return response()->json([
            'message' => 'Application submitted successfully',
            'user' => $user,
            'token' => $token
        ], 201);
    }

    /**
     * Get application information for the authenticated user
     *
     * @return \Illuminate\Http\Response
     */
    public function getApplicationInfo()
    {
        $user = auth()->user();
        
        // Include application documents
        $user->load('applicationDocuments');
        
        return response()->json([
            'application' => $user
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
            'application_status' => 'required|string|in:pending,approved,rejected',
            'application_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::findOrFail($id);
        
        $user->application_status = $request->application_status;
        $user->application_notes = $request->application_notes;
        $user->save();
        
        return response()->json([
            'message' => 'Application status updated',
            'user' => $user
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
        
        $query = User::where('is_applicant', true);
        
        if ($status) {
            $query->where('application_status', $status);
        }
        
        $applications = $query->with('applicationDocuments')->paginate(10);
        
        return response()->json([
            'applications' => $applications
        ]);
    }
}
