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

    Route::prefix('hero')->group(function () {
        Route::get('/', [Api\HeroController::class, 'index']);
        Route::post('/', [Api\HeroController::class, 'upsert']);
    });

    Route::prefix('main-settings')->group(function () {
        Route::get('/', [Api\MainSettingController::class, 'get']);
        Route::post('/', [Api\MainSettingController::class, 'upsert']);
    });

    Route::prefix('contact-messages')->group(function () {
        Route::get('/', [Api\ContactMessageController::class, 'all']);
        Route::post('create', [Api\ContactMessageController::class, 'create']);
        Route::post('delete', [Api\ContactMessageController::class, 'delete']);
        Route::post('bulk-delete', [Api\ContactMessageController::class, 'bulkDelete']);
    });
});
