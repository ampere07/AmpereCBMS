<?php

use App\Http\Controllers\ApplicationController;
use Illuminate\Support\Facades\Route;

Route::post('/application/store', [ApplicationController::class, 'store']);

Route::get('/applications', [ApplicationController::class, 'index']);
Route::get('/applications/{id}', [ApplicationController::class, 'show']);
Route::patch('/applications/{id}/status', [ApplicationController::class, 'updateStatus']);

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now(),
        'message' => 'AmpereCBMS API is running'
    ]);
});
