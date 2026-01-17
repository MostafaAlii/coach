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

    /*public function upsert(Request $request, ?int $id = null) {
        $data = $request->validate([
            'title' => 'required|string',
            'parent_id' => 'nullable|exists:abouts,id',
            'status' => 'required|in:active,inactive',
        ]);

        $about = $this->service->upsert($data, $id);
        if ($id)
            return $this->updatedResponse(new AboutResource($about),'About updated successfully');

        return $this->createdResponse(new AboutResource($about),'About created successfully');
    }*/

    /*public function upsert(Request $request)
    {
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

        $about = DB::transaction(function () use ($data) {

            // 1️⃣ Parent
            $parent = $this->service->upsert(
                [
                    'title' => $data['title'],
                    'parent_id' => $data['parent_id'] ?? null,
                    'status' => $data['status'],
                ],
                $data['id'] ?? null
            );

            // 2️⃣ Children
            $sentChildIds = [];

            if (!empty($data['children'])) {
                foreach ($data['children'] as $child) {

                    $childModel = $this->service->upsert(
                        [
                            'title' => $child['title'],
                            'parent_id' => $parent->id,
                            'status' => $child['status'] ?? 'active',
                        ],
                        $child['id'] ?? null
                    );

                    $sentChildIds[] = $childModel->id;
                }

                // 3️⃣ حذف الأطفال اللي اتشالت من الفورم
                $parent->children()
                    ->whereNotIn('id', $sentChildIds)
                    ->delete();
            }

            return $parent;
        });

        return $this->successResponse(
            new AboutResource(
                $about->load('activeChildrenRecursive.media')
            ),
            isset($data['id']) ? 'About updated successfully' : 'About created successfully'
        );
    }*/
    public function upsert(Request $request)
    {
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
