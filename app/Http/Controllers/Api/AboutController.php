<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Services\AboutService;
use App\Http\Resources\AboutResource;
use Illuminate\Http\Request;
use App\Models\Concernes\ApiResponseTrait;
use Illuminate\Support\Facades\DB;
class AboutController extends Controller {
    use ApiResponseTrait;
    public function __construct(protected AboutService $service) {}
    public function index() {
        $tree = $this->service->getTree();
        return $this->successResponse(AboutResource::collection($tree),'About data retrieved successfully');
    }

    public function upsert(Request $request) {
        $data = $request->validate([
            'id' => 'nullable|exists:abouts,id',
            'title' => 'required|string',
            'parent_id' => 'nullable|exists:abouts,id',
            'status' => 'required|in:active,inactive',

            'children' => 'sometimes|array',
            'children.*.id' => 'nullable|exists:abouts,id',
            'children.*.title' => 'required|string',
            'children.*.status' => 'sometimes|in:active,inactive',
        ]);

        $about = $this->service->upsert($data,$request->file('about'));

        return $this->successResponse(
            new AboutResource($about),
            isset($data['id'])
                ? 'About updated successfully'
                : 'About created successfully'
        );
    }
}
