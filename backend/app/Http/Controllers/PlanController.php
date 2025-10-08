<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PlanController extends Controller
{
    private function getCurrentUserId()
    {
        $user = DB::table('users')->first();
        return $user ? $user->id : null;
    }

    public function index()
    {
        try {
            $plans = Plan::orderBy('plan_name', 'asc')->get();

            return response()->json([
                'success' => true,
                'data' => $plans
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve plans', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve plans',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $plan = Plan::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $plan
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve plan', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Plan not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'plan_name' => 'required|string|max:255|unique:plan_list,plan_name',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $currentUserId = $this->getCurrentUserId();

            $plan = Plan::create([
                'plan_name' => $request->plan_name,
                'description' => $request->description,
                'price' => $request->price,
                'modified_by_user_id' => $currentUserId,
                'modified_date' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Plan created successfully',
                'data' => $plan
            ], 201);

        } catch (\Exception $e) {
            Log::error('Failed to create plan', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create plan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $plan = Plan::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'plan_name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'price' => 'sometimes|required|numeric|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $currentUserId = $this->getCurrentUserId();

            $plan->update(array_merge(
                $request->only(['plan_name', 'description', 'price']),
                [
                    'modified_by_user_id' => $currentUserId,
                    'modified_date' => now()
                ]
            ));

            return response()->json([
                'success' => true,
                'message' => 'Plan updated successfully',
                'data' => $plan
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update plan', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update plan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $plan = Plan::findOrFail($id);
            $plan->delete();

            return response()->json([
                'success' => true,
                'message' => 'Plan deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to delete plan', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete plan',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
