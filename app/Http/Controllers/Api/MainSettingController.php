<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Services\MainSettingService;
use Illuminate\Http\Request;
use App\Http\Resources\MainSettingResource;
use App\Models\Concernes\ApiResponseTrait;
class MainSettingController extends Controller {
    use ApiResponseTrait;
    public function __construct(protected MainSettingService $service) {}
    public function get() {
        $setting = $this->service->get();
        return $this->successResponse(new MainSettingResource($setting), 'Main settings retrieved successfully');
    }

    public function upsert(Request $request) {
        $data = $request->validate([
            'id' => 'nullable|exists:main_settings,id',
            'name' => 'required|string',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'email' => 'nullable|email',
        ]);
        $setting = $this->service->upsert($data, $request->file('logo'));
        return $this->successResponse(
            new MainSettingResource($setting),
            isset($data['id']) ? 'Settings updated successfully' : 'Settings created successfully'
        );
    }
}
