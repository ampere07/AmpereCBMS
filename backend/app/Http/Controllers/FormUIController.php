<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Services\GoogleDriveService;
use App\Services\ImageResizeService;

class FormUIController extends Controller
{
    /**
     * Get the form UI settings
     */
    public function getSettings(): JsonResponse
    {
        try {
            Log::info('=== FormUI getSettings START ===');
            
            Log::info('Attempting to fetch from form_ui table');
            $settings = DB::table('form_ui')->first();
            Log::info('Query result', ['settings' => $settings]);

            if (!$settings) {
                Log::warning('No settings found, creating default');
                DB::table('form_ui')->insert([
                    'page_hex' => null,
                    'button_hex' => null,
                    'form_hex' => null,
                    'transparency_rgba' => null,
                    'logo_url' => null,
                    'multi_step' => 'inactive',
                    'brand_name' => null,
                ]);
                $settings = DB::table('form_ui')->first();
                Log::info('Default settings created', ['settings' => $settings]);
            }

            Log::info('=== FormUI getSettings SUCCESS ===');
            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            Log::error('=== FormUI getSettings ERROR ===');
            Log::error('Error message: ' . $e->getMessage());
            Log::error('Error file: ' . $e->getFile() . ':' . $e->getLine());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch form UI settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the form UI settings
     */
    public function updateSettings(Request $request): JsonResponse
    {
        try {
            Log::info('=== FormUI updateSettings START ===');
            Log::info('Form UI Update Request:', [
                'all_data' => $request->all(),
                'page_hex' => $request->input('page_hex'),
                'button_hex' => $request->input('button_hex'),
                'multi_step' => $request->input('multi_step'),
                'has_logo' => $request->hasFile('logo') || $request->hasFile('logo_url')
            ]);
            
            $validator = Validator::make($request->all(), [
                'page_hex' => 'nullable|string|max:25',
                'button_hex' => 'nullable|string|max:25',
                'form_hex' => 'nullable|string|max:25',
                'transparency_rgba' => 'nullable|string|max:50',
                'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'logo_url' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'multi_step' => 'nullable|string|in:active,inactive',
                'brand_name' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                Log::warning('Validation failed', ['errors' => $validator->errors()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $exists = DB::table('form_ui')->exists();
            Log::info('Form UI table exists check', ['exists' => $exists]);

            $updateData = [];
            
            if ($request->has('page_hex')) {
                $updateData['page_hex'] = $request->input('page_hex');
            }
            
            if ($request->has('button_hex')) {
                $updateData['button_hex'] = $request->input('button_hex');
            }
            
            if ($request->has('multi_step')) {
                $updateData['multi_step'] = $request->input('multi_step');
            }
            
            if ($request->has('brand_name')) {
                $updateData['brand_name'] = $request->input('brand_name');
            }
            
            if ($request->has('form_hex')) {
                $updateData['form_hex'] = $request->input('form_hex');
            }
            
            if ($request->has('transparency_rgba')) {
                $updateData['transparency_rgba'] = $request->input('transparency_rgba');
            }
            
            Log::info('Update data prepared', ['updateData' => $updateData]);
            
            if ($request->hasFile('logo') || $request->hasFile('logo_url')) {
                try {
                    Log::info('Processing logo upload');
                    $logoFile = $request->file('logo') ?: $request->file('logo_url');
                    $fileType = $logoFile->getClientMimeType();
                    $brandName = $request->input('brand_name');
                    
                    $tempDir = public_path('assets/temp');
                    if (!file_exists($tempDir)) {
                        mkdir($tempDir, 0755, true);
                        Log::info('Created temp directory', ['path' => $tempDir]);
                    }
                    
                    $fileName = 'logo_' . time() . '.' . $logoFile->getClientOriginalExtension();
                    $finalPath = $tempDir . '/' . $fileName;
                    
                    if (ImageResizeService::isImageFile($fileType)) {
                        Log::info('Logo is image, attempting resize');
                        $originalSize = filesize($logoFile->getPathname());
                        $tempPath = $logoFile->getPathname();
                        $resized = ImageResizeService::resizeImage($tempPath, $finalPath);
                        
                        if ($resized) {
                            $resizedSize = filesize($finalPath);
                            Log::info('Logo resized successfully', [
                                'original_size' => $originalSize,
                                'resized_size' => $resizedSize,
                                'reduction' => round((($originalSize - $resizedSize) / $originalSize) * 100, 2) . '%'
                            ]);
                        } else {
                            Log::warning('Logo resize failed, using original');
                            $logoFile->move($tempDir, $fileName);
                        }
                    } else {
                        Log::info('Logo is not image, moving as-is');
                        $logoFile->move($tempDir, $fileName);
                    }
                    
                    Log::info('Uploading logo to Google Drive');
                    $googleDriveService = new GoogleDriveService();
                    $driveUrl = $googleDriveService->uploadFormLogo($finalPath, $brandName);
                    
                    $updateData['logo_url'] = $driveUrl;
                    Log::info('Logo uploaded successfully', ['url' => $driveUrl]);
                    
                    if (file_exists($finalPath)) {
                        unlink($finalPath);
                        Log::info('Temp file cleaned up');
                    }
                    
                } catch (\Exception $e) {
                    Log::error('Logo upload failed', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to upload logo: ' . $e->getMessage()
                    ], 500);
                }
            }

            if (!$exists) {
                Log::info('Inserting new form_ui record');
                DB::table('form_ui')->insert($updateData);
            } else {
                Log::info('Updating existing form_ui record');
                DB::table('form_ui')->limit(1)->update($updateData);
            }

            $settings = DB::table('form_ui')->first();
            Log::info('Settings after update', ['settings' => $settings]);

            Log::info('=== FormUI updateSettings SUCCESS ===');
            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully',
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            Log::error('=== FormUI updateSettings ERROR ===');
            Log::error('Error message: ' . $e->getMessage());
            Log::error('Error file: ' . $e->getFile() . ':' . $e->getLine());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update form UI settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
