<?php

use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\GeographicController;
use App\Http\Controllers\PlanController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Http\Controllers\PromoController;

Route::post('/application/store', [ApplicationController::class, 'store']);

Route::get('/applications', [ApplicationController::class, 'index']);
Route::get('/applications/{id}', [ApplicationController::class, 'show']);
Route::patch('/applications/{id}/status', [ApplicationController::class, 'updateStatus']);

Route::get('/regions', [GeographicController::class, 'getRegions']);
Route::get('/cities', [GeographicController::class, 'getCities']);
Route::get('/barangays', [GeographicController::class, 'getBarangays']);

// Also keep singular versions for backward compatibility
Route::get('/region', [GeographicController::class, 'getRegions']);
Route::get('/city', [GeographicController::class, 'getCities']);
Route::get('/barangay', [GeographicController::class, 'getBarangays']);

// Plan Management Routes - Using plan_list table
Route::get('/plans', [PlanController::class, 'index']);
Route::get('/plans/{id}', [PlanController::class, 'show']);
Route::post('/plans', [PlanController::class, 'store']);
Route::put('/plans/{id}', [PlanController::class, 'update']);
Route::delete('/plans/{id}', [PlanController::class, 'destroy']);

Route::get('/promo_list', [PromoController::class, 'index']);

Route::get('/debug/tables', function () {
    try {
        $result = [];
        
        $result['tables_exist'] = [
            'region' => Schema::hasTable('region'),
            'city' => Schema::hasTable('city'),
            'barangay' => Schema::hasTable('barangay'),
        ];
        
        if (Schema::hasTable('region')) {
            $result['region_columns'] = Schema::getColumnListing('region');
            $result['region_count'] = DB::table('region')->count();
            $result['region_sample'] = DB::table('region')->limit(3)->get();
        }
        
        if (Schema::hasTable('city')) {
            $result['city_columns'] = Schema::getColumnListing('city');
            $result['city_count'] = DB::table('city')->count();
            $result['city_sample'] = DB::table('city')->limit(3)->get();
        }
        
        if (Schema::hasTable('barangay')) {
            $result['barangay_columns'] = Schema::getColumnListing('barangay');
            $result['barangay_count'] = DB::table('barangay')->count();
            $result['barangay_sample'] = DB::table('barangay')->limit(3)->get();
        }
        
        return response()->json(['success' => true, 'data' => $result]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error checking tables: ' . $e->getMessage()
        ], 500);
    }
});

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now(),
        'message' => 'AmpereCBMS API is running'
    ]);
});
