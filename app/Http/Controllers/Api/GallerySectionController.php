<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Services\GallerySectionService;
use App\Http\Resources\GallerySectionResource;
use Illuminate\Http\Request;
use App\Models\Concernes\ApiResponseTrait;
use Illuminate\Support\Arr;
class GallerySectionController extends Controller {
    use ApiResponseTrait;
    public function __construct(
        protected GallerySectionService $service
    ) {}

    public function index() {
        $sections = $this->service->list();
        if ($sections->isEmpty()) {
            return $this->successResponse([], 'No sections found');
        }
        return $this->paginatedResponse($sections);
    }


    public function store(Request $request) {
        $data = $request->validate([
            'sections' => 'required|array',
            'sections.*.name' => 'required|string',
            'sections.*.is_active' => 'boolean',
        ]);
        $section = $this->service->create($data['sections']);
        $response = array_map(function ($section) {
            return [
                'id' => $section->id,
                'name' => $section->name,
                'is_active' => $section->is_active,
                'items_count' => $section->items()->count(), // assume relation exists
            ];
        }, $section);
        return response()->json($response);
    }

    public function update(Request $request, int $id) {
        $data = $request->validate([
            'name' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $section = $this->service->update($id, $data);

        if (!$section) {
            return $this->notFoundResponse();
        }
        return $this->updatedResponse(new GallerySectionResource($section));
    }

    public function destroy(int $id) {
        $deleted = $this->service->delete($id);
        if (!$deleted) {
            return $this->notFoundResponse();
        }
        return $this->deletedResponse();
    }
}
