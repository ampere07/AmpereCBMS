<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ApplicationController extends Controller
{
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
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
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
            $application->installation_address = $request->installationAddress;
            $application->landmark = $request->landmark;
            $application->referred_by = $request->referredBy;
            $application->desired_plan = $request->plan;
            $application->promo = $request->promo ?? 'None';
            $application->terms_agreed = true;
            $application->status = 'pending';

            if ($request->hasFile('proofOfBilling')) {
                $path = $request->file('proofOfBilling')->store('applications/proof_of_billing', 'public');
                $application->proof_of_billing_url = $path;
            }

            if ($request->hasFile('governmentIdPrimary')) {
                $path = $request->file('governmentIdPrimary')->store('applications/government_ids', 'public');
                $application->government_valid_id_url = $path;
            }

            if ($request->hasFile('governmentIdSecondary')) {
                $path = $request->file('governmentIdSecondary')->store('applications/government_ids', 'public');
                $application->second_government_valid_id_url = $path;
            }

            if ($request->hasFile('houseFrontPicture')) {
                $path = $request->file('houseFrontPicture')->store('applications/house_pictures', 'public');
                $application->house_front_picture_url = $path;
            }

            if ($request->hasFile('nearestLandmark1Image')) {
                $path = $request->file('nearestLandmark1Image')->store('applications/landmarks', 'public');
                $application->document_attachment_url = $path;
            }

            if ($request->hasFile('nearestLandmark2Image')) {
                $path = $request->file('nearestLandmark2Image')->store('applications/landmarks', 'public');
                $application->other_isp_bill_url = $path;
            }

            $application->save();

            Log::info('Application submitted successfully', [
                'application_id' => $application->id,
                'email' => $application->email_address
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

    public function index(Request $request)
    {
        try {
            $status = $request->query('status');
            
            $query = Application::query();
            
            if ($status) {
                $query->where('status', $status);
            }
            
            $applications = $query->orderBy('created_at', 'desc')->paginate(15);
            
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
