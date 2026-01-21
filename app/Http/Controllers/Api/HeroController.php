<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Services\HeroService;
use Illuminate\Http\Request;
use App\Http\Resources\HeroResource;
use App\Models\Concernes\ApiResponseTrait;
class HeroController extends Controller {
    use ApiResponseTrait;
    public function __construct(protected HeroService $service) {}
    public function index() {
        $hero = $this->service->getAll();
        return $this->successResponse(
            $hero ? new HeroResource($hero) : null,
            'Hero retrieved successfully'
        );
    }

    public function upsert(Request $request) {
        $data = $request->validate([
            'id' => 'nullable|exists:heroes,id',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);
        $hero = $this->service->upsert($data, $request->file('image'));
        return $this->successResponse(new HeroResource($hero),isset($data['id']) ? 'Hero updated successfully' : 'Hero created successfully'
        );
    }
}
