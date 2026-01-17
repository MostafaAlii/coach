<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Concernes\ApiResponseTrait;
use App\Services\JourneyService;
use App\Http\Resources\JourneyResource;
class JourneyController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        protected JourneyService $service
    ) {}

    /*public function index(Request $request) {
        $type = $request->get('type');
        $data = $this->service->list($type);

        return $this->successResponse(
            JourneyResource::collection($data)->response()->getData(true)
        );
    }*/
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


    public function store(Request $request)
    {
        $data = $request->validate([
            'title'     => 'required|string',
            'type'      => 'required|in:service,certificate',
            'parent_id' => 'nullable|exists:journeys,id',
            'status'    => 'required|in:active,inactive',
        ]);

        return $this->successResponse(
            new JourneyResource($this->service->store($data)),
            'Created Successfully',
            201
        );
    }

    public function update(Request $request, $id)
    {
        return $this->successResponse(
            new JourneyResource(
                $this->service->update($id, $request->all())
            ),
            'Updated Successfully'
        );
    }

    public function destroy($id)
    {
        $this->service->delete($id);
        return $this->successResponse(null, 'Deleted Successfully');
    }
}