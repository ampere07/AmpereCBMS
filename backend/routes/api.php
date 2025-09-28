<?php

use App\Http\Controllers\ApplicationFormController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Main form submission endpoint
Route::post('/application/store', [ApplicationFormController::class, 'store']);

// Application management
Route::get('/applications', [ApplicationFormController::class, 'index']);
Route::get('/applications/{id}', [ApplicationFormController::class, 'show']);

// Debug endpoints (remove in production)
Route::get('/debug', [ApplicationFormController::class, 'debug']);
Route::post('/reset-table', [ApplicationFormController::class, 'resetTable']);

// Health check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now(),
        'message' => 'AmpereCBMS API is running'
    ]);
});
