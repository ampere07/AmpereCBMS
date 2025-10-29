<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class FormUIController extends Controller
{
    /**
     * Get the form UI settings
     */
    public function getSettings(): JsonResponse
    {
        $settings = DB::table('form_ui')->first();

        if (!$settings) {
            DB::table('form_ui')->insert([
                'page_hex' => null,
                'form_hex' => null,
                'logo' => null,
            ]);
            $settings = DB::table('form_ui')->first();
        }

        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }

    /**
     * Update the form UI settings
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page_hex' => 'nullable|string|max:25',
            'form_hex' => 'nullable|string|max:25',
            'logo' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $exists = DB::table('form_ui')->exists();

        $updateData = [];
        
        if ($request->has('page_hex')) {
            $updateData['page_hex'] = $request->input('page_hex');
        }
        
        if ($request->has('form_hex')) {
            $updateData['form_hex'] = $request->input('form_hex');
        }
        
        if ($request->has('logo')) {
            $updateData['logo'] = $request->input('logo');
        }

        if (!$exists) {
            DB::table('form_ui')->insert($updateData);
        } else {
            DB::table('form_ui')->limit(1)->update($updateData);
        }

        $settings = DB::table('form_ui')->first();

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully',
            'data' => $settings
        ]);
    }
}
