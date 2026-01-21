<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Concernes\ApiResponseTrait;
use App\Services\JourneyService;
use App\Http\Resources\JourneyResource;
use App\Models\Journey;
class JourneyController extends Controller {
    use ApiResponseTrait;

    public function __construct(
        protected JourneyService $service
    ) {}

    public function index(Request $request) {
        $filters = $request->validate([
            'type'   => 'nullable|in:service,certificate',
            'status' => 'nullable|in:active,inactive,all',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);
        if (($filters['status'] ?? null) === 'all') {
            $filters['status'] = null;
        }
        $data = $this->service->list($filters);
        return $this->successResponse(
            JourneyResource::collection($data)->response()->getData(true)
        );
    }

    public function store(Request $request) {
        $data = $request->validate(Journey::validationRules(true));
        if (isset($data['parent_id']) && isset($data['children'])) {
            return $this->errorResponse(
                'Cannot add children to existing parent in single request',
                422
            );
        }
        if (isset($data['parent_id'])) {
            unset($data['children']);
        }
        return $this->successResponse(
            new JourneyResource($this->service->store($data)),
            'Created Successfully',
            201
        );
    }

    public function addPoints(Request $request, $journeyId) {
        $data = $request->validate([
            'points' => 'required|array|min:1',
            'points.*.title' => 'required|string|max:255',
        ]);
        $journey = $this->service->addPoints($journeyId, $data['points']);
        return $this->successResponse(new JourneyResource($journey),'Points added successfully');
    }


    public function update(Request $request, $id) {
        return $this->successResponse(
            new JourneyResource(
                $this->service->update($id, $request->all())
            ),
            'Updated Successfully'
        );
    }

    public function destroy($id) {
        $this->service->delete($id);
        return $this->successResponse(null, 'Deleted Successfully');
    }
}