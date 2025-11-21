<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Services\GoogleDriveService;
use App\Services\ImageResizeService;

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
                'button_hex' => null,
                'logo_url' => null,
                'multi_step' => 'inactive',
                'brand_name' => null,
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
        \Log::info('Form UI Update Request:', [
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
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $exists = DB::table('form_ui')->exists();

        $updateData = [];
        
        \Log::info('Building update data...');
        
        if ($request->has('page_hex')) {
            \Log::info('Has page_hex: ' . $request->input('page_hex'));
            $updateData['page_hex'] = $request->input('page_hex');
        } else {
            \Log::info('Does NOT have page_hex');
        }
        
        if ($request->has('button_hex')) {
            \Log::info('Has button_hex: ' . $request->input('button_hex'));
            $updateData['button_hex'] = $request->input('button_hex');
        } else {
            \Log::info('Does NOT have button_hex');
        }
        
        if ($request->has('multi_step')) {
            \Log::info('Has multi_step: ' . $request->input('multi_step'));
            $updateData['multi_step'] = $request->input('multi_step');
        } else {
            \Log::info('Does NOT have multi_step');
        }
        
        if ($request->has('brand_name')) {
            \Log::info('Has brand_name: ' . $request->input('brand_name'));
            $updateData['brand_name'] = $request->input('brand_name');
        } else {
            \Log::info('Does NOT have brand_name');
        }
        
        if ($request->has('form_hex')) {
            \Log::info('Has form_hex: ' . $request->input('form_hex'));
            $updateData['form_hex'] = $request->input('form_hex');
        } else {
            \Log::info('Does NOT have form_hex');
        }
        
        if ($request->has('transparency_rgba')) {
            \Log::info('Has transparency_rgba: ' . $request->input('transparency_rgba'));
            $updateData['transparency_rgba'] = $request->input('transparency_rgba');
        } else {
            \Log::info('Does NOT have transparency_rgba');
        }
        
        \Log::info('Final updateData array:', $updateData);
        
        if ($request->hasFile('logo') || $request->hasFile('logo_url')) {
            try {
                $logoFile = $request->file('logo') ?: $request->file('logo_url');
                $fileType = $logoFile->getClientMimeType();
                $brandName = $request->input('brand_name');
                
                // Create temp directory for resized logo
                $tempDir = public_path('assets/temp');
                if (!file_exists($tempDir)) {
                    mkdir($tempDir, 0755, true);
                }
                
                $fileName = 'logo_' . time() . '.' . $logoFile->getClientOriginalExtension();
                $finalPath = $tempDir . '/' . $fileName;
                
                // Check if logo is an image and resize if needed
                if (ImageResizeService::isImageFile($fileType)) {
                    \Log::info('Logo image detected - applying active resize settings', [
                        'file_name' => $fileName,
                        'mime_type' => $fileType,
                        'destination' => 'Google Drive',
                        'brand_name' => $brandName
                    ]);
                    
                    $originalSize = filesize($logoFile->getPathname());
                    $tempPath = $logoFile->getPathname();
                    $resized = ImageResizeService::resizeImage($tempPath, $finalPath);
                    
                    if ($resized) {
                        $resizedSize = filesize($finalPath);
                        \Log::info('Logo successfully resized before Google Drive upload', [
                            'file_name' => $fileName,
                            'original_size' => $originalSize,
                            'resized_size' => $resizedSize,
                            'reduction' => round((($originalSize - $resizedSize) / $originalSize) * 100, 2) . '%'
                        ]);
                    } else {
                        \Log::warning('Logo resize failed, uploading original', ['file_name' => $fileName]);
                        // If resize fails, save the original
                        $logoFile->move($tempDir, $fileName);
                    }
                } else {
                    // Not an image, move as normal
                    $logoFile->move($tempDir, $fileName);
                }
                
                \Log::info('Uploading logo to Google Drive', [
                    'file_size' => filesize($finalPath),
                    'brand_name' => $brandName
                ]);
                
                $googleDriveService = new GoogleDriveService();
                $driveUrl = $googleDriveService->uploadFormLogo($finalPath, $brandName);
                
                $updateData['logo_url'] = $driveUrl;
                
                \Log::info('Logo uploaded to Google Drive successfully', [
                    'drive_url' => $driveUrl
                ]);
                
                // Clean up temp file
                if (file_exists($finalPath)) {
                    unlink($finalPath);
                }
                
            } catch (\Exception $e) {
                \Log::error('Failed to upload logo to Google Drive: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to upload logo to Google Drive: ' . $e->getMessage()
                ], 500);
            }
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
