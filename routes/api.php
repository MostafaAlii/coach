<?php

use App\Http\Controllers\Api;
use Illuminate\Support\Facades\Route;
Route::prefix('v1')->group(function () {
    Route::prefix('journeys')->group(function () {
        Route::get('/', [Api\JourneyController::class, 'index']);
        Route::post('/', [Api\JourneyController::class, 'store']);
        Route::put('{id}', [Api\JourneyController::class, 'update']);
        Route::delete('{id}', [Api\JourneyController::class, 'destroy']);
    });

    Route::prefix('about')->group(function () {
        Route::get('/', [Api\AboutController::class, 'index']);
        Route::post('/', [Api\AboutController::class, 'upsert']);
    });
});
