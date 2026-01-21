<?php
use App\Http\Controllers\Api;
use Illuminate\Support\Facades\Route;
function simpleApiRoutes($prefix, $controller, $methods = ['index', 'upsert']) {
    Route::prefix($prefix)->group(function () use ($controller, $methods) {
        if (in_array('index', $methods))
            Route::get('/', [$controller, 'index']);
        if (in_array('upsert', $methods))
            Route::post('/', [$controller, 'upsert']);
        if (in_array('get', $methods))
            Route::get('/', [$controller, 'get']);
    });
}

Route::prefix('v1')->group(function () {
    Route::apiResource('journeys', Api\JourneyController::class)->only(['index','store','update','destroy']);
    Route::post('journeys/{journey}/points',[Api\JourneyController::class, 'addPoints']);

    simpleApiRoutes('about', Api\AboutController::class);
    simpleApiRoutes('hero', Api\HeroController::class);
    simpleApiRoutes('main-settings', Api\MainSettingController::class, ['get', 'upsert']);

    Route::prefix('contact-messages')->group(function () {
        Route::get('/', [Api\ContactMessageController::class, 'all']);
        Route::post('create', [Api\ContactMessageController::class, 'create']);
        Route::post('delete', [Api\ContactMessageController::class, 'delete']);
        Route::post('bulk-delete', [Api\ContactMessageController::class, 'bulkDelete']);
    });

    Route::apiResource('gallery-sections', Api\GallerySectionController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::apiResource('gallery-items', Api\GalleryItemController::class)->only(['index', 'store', 'destroy', 'update']);
    Route::post('gallery-items/batch-delete', [Api\GalleryItemController::class, 'batchDelete']);
    Route::get('gallery-sections/{sectionId}/items', [Api\GalleryItemController::class, 'listBySection']);
});
