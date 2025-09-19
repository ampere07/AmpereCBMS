<?php

use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\ApplicationDocumentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Response;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public Application Routes - with ensure.tables middleware
Route::middleware('ensure.tables')->group(function () {
    // Use ApplicationController for user registration
    Route::post('/application/submit', [ApplicationController::class, 'submitApplication']);
    
    // ApplicationFormController routes for client-side applications
    Route::post('/application/store', [\App\Http\Controllers\ApplicationFormController::class, 'store']);
    Route::get('/applications', [\App\Http\Controllers\ApplicationFormController::class, 'index']);
    Route::get('/applications/{id}', [\App\Http\Controllers\ApplicationFormController::class, 'show']);
    Route::patch('/applications/{id}/status', [\App\Http\Controllers\ApplicationFormController::class, 'updateStatus']);
});

// Old routes - comment out or remove these
// Route::post('/application/submit', [ApplicationController::class, 'submitApplication']);
// Route::post('/documents', [ApplicationDocumentController::class, 'store']);
// Route::get('/documents/user/{userId}', [ApplicationDocumentController::class, 'getUserDocuments']);
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Document routes - with table check
Route::middleware('ensure.tables')->group(function () {
    Route::post('/documents', [ApplicationDocumentController::class, 'store']);
    Route::get('/documents/user/{userId}', [ApplicationDocumentController::class, 'getUserDocuments']);
});

// Protected Application Routes
Route::middleware(['auth:sanctum', 'ensure.tables'])->group(function () {
    // User Application Routes
    Route::get('/application', [ApplicationController::class, 'getApplicationInfo']);
    
    // Document Routes
    Route::get('/documents', [ApplicationDocumentController::class, 'getUserDocuments']);
    Route::get('/documents/{id}', [ApplicationDocumentController::class, 'show']);
    Route::delete('/documents/{id}', [ApplicationDocumentController::class, 'destroy']);
});

// Admin Routes
Route::middleware(['auth:sanctum', 'admin', 'ensure.tables'])->group(function () {
    // Application Management
    Route::get('/admin/applications', [ApplicationController::class, 'getAllApplications']);
    Route::patch('/admin/applications/{id}/status', [ApplicationController::class, 'updateApplicationStatus']);
    
    // Document Verification
    Route::patch('/admin/documents/{id}/verification', [ApplicationDocumentController::class, 'updateVerification']);
});

// Database error fallback route
Route::get('/database/error', function() {
    return Response::json([
        'error' => 'Database setup error',
        'message' => 'Unable to setup required database tables. Please contact system administrator.'
    ], 500);
})->name('database.error');
