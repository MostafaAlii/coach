<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Services\GalleryItemService;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use App\Models\Concernes\ApiResponseTrait;
use App\Http\Resources\GalleryItemResource;
use Illuminate\Support\Facades\DB;
use App\Models\GalleryItem;
use App\Models\GallerySection;
class GalleryItemController extends Controller
{
    use ApiResponseTrait;
    public function __construct(
        protected GalleryItemService $service
    ) {}

    public function index(Request $request) {
        $items = $this->service->list($request->input('section'));
        if ($items->isEmpty()) {
            return $this->successResponse([], 'No gallery items found');
        }
        return $this->paginatedResponse(
            GalleryItemResource::collection($items)
        );
    }

    public function listBySection(int $sectionId) {
        $items = $this->service->listBySection($sectionId);
        return response()->json([
            'success' => true,
            'data' => GalleryItemResource::collection($items),
        ]);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'title'        => 'nullable|string',
            'description'  => 'nullable|string',
            'is_active'    => 'boolean',
            'sections'     => 'required|array|min:1',
            'sections.*'   => 'exists:gallery_sections,id',
            'image'        => 'required|image',
        ]);

        $item = $this->service->create(
            Arr::except($data, ['sections', 'image']),
            $data['sections'],
            $request->file('image')
        );

        return $this->createdResponse(
            new GalleryItemResource($item),
            'Gallery item created successfully'
        );
    }

    public function destroy(Request $request) {
        $request->validate([
            'id' => 'required|exists:gallery_items,id'
        ]);
        $this->service->delete($request->id);
        return $this->deletedResponse('Gallery item deleted successfully');
    }

    public function batchDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:gallery_items,id'
        ]);

        $ids = $request->input('ids');

        \DB::transaction(function () use ($ids) {
            // 1. جلب الـ items مع العلاقات
            $items = \App\Models\GalleryItem::with(['sections', 'media'])
                ->whereIn('id', $ids)
                ->get();

            foreach ($items as $item) {
                // 2. جلب اسم الـ section
                $section = $item->sections->first();
                if (!$section) {
                    // إذا مفيش section، احذف الـ item بس
                    $item->delete();
                    continue;
                }

                // 3. بناء الـ baseFolder بناءً على هيكل المجلدات
                // uploads/gallery/section-name
                $baseFolder = "gallery/{$section->name}";

                // 4. استخدام deleteExistingMedia لحذف الـ media
                // نحتاج instance من Model يستخدم الـ trait
                $traitInstance = new class {
                    use \App\Models\Concernes\UploadMedia; // ضع namespace الـ trait الصحيح
                };

                // 5. تحديد useStorage بناءً على disk
                $media = $item->media->first();
                if ($media) {
                    $useStorage = $media->disk === 'direct_public';

                    // استخدام deleteExistingMedia
                    $traitInstance->deleteExistingMedia(
                        $baseFolder,       // gallery/section-name
                        $item,             // الـ GalleryItem model
                        null,              // column = null (مش مخزن في column)
                        'media',           // relation name
                        $useStorage,       // true إذا disk = 'direct_public'
                        null               // collection name
                    );
                }

                // 6. حذف الـ item نفسه
                $item->delete();
            }
        });
        return response()->json([
            'success' => true,
            'message' => count($ids) . ' items deleted successfully.'
        ]);
    }

    public function update(Request $request, GalleryItem $galleryItem) {
        $request->validate([
            'title'     => 'required|string|max:255',
            'is_active' => 'required|boolean',
            'image'     => 'nullable|image',
            'sections'  => 'required|array|min:1',
            'sections.*' => 'exists:gallery_sections,id',
        ]);

        DB::transaction(function () use ($request, $galleryItem) {

            // 1️⃣ Update basic fields
            $galleryItem->update([
                'title'     => $request->title,
                'is_active' => $request->is_active,
            ]);

            // 2️⃣ Sync sections
            $galleryItem->sections()->sync($request->sections);

            // 3️⃣ Update image (لو موجودة)
            if ($request->hasFile('image')) {

                // نجيب اسم السيكشن
                $section = GallerySection::find($request->sections[0]);
                $sectionName = str()->slug($section->name);

                $baseFolder = "gallery/{$sectionName}";

                $galleryItem->updateSingleMedia(
                    baseFolder: $baseFolder,
                    file: $request->file('image'),
                    model: $galleryItem,
                    column: null,
                    relation: 'media',
                    useStorage: true,
                    generateThumbnail: true,
                    collectionName: $sectionName
                );
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Item updated successfully',
            'data' => $galleryItem->load('media'),
        ]);
    }
}