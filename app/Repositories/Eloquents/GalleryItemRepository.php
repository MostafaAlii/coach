<?php
namespace App\Repositories\Eloquents;
use App\Models\GalleryItem;
use App\Repositories\Contracts\GalleryItemRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use App\Models\Concernes\UploadMedia;
class GalleryItemRepository implements GalleryItemRepositoryInterface {
    use UploadMedia;
    public function paginate(?string $section, int $perPage = 10) {
        return GalleryItem::query()
            ->active()
            ->latestFirst()
            ->withActiveSections()
            ->with('media')
            ->when($section && $section !== 'all', function ($q) use ($section) {
                $q->whereHas(
                    'sections',
                    fn($s) =>
                    $s->where('slug', $section)
                );
            })->paginate($perPage);
    }

    public function create(array $data) {
        return GalleryItem::create($data);
    }

    public function findById(int $id) {
        return GalleryItem::find($id);
    }

    public function delete(int $id): void
    {
        $item = GalleryItem::with(['sections', 'media'])->findOrFail($id);

        // نحدد السيكشن الأساسي
        $section = $item->sections->first();
        if ($section) {
            $sectionName = str()->slug($section->name);
            $baseFolder = "gallery/{$sectionName}";

            // حذف الميديا
            $this->deleteExistingMedia(
                baseFolder: $baseFolder,
                model: $item,
                column: null,
                relation: 'media',
                useStorage: true,
                collectionName: $sectionName
            );
        }

        // حذف الـ item نفسه
        $item->delete();
    }


    public function getItemsBySectionId(int $sectionId): Collection
    {
        return GalleryItem::with('media')
            ->whereHas('sections', function ($q) use ($sectionId) {
                $q->where('gallery_section_id', $sectionId);
            })
            ->latestFirst()
            ->get();
    }
}