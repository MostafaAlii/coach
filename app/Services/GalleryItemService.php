<?php
namespace App\Services;
use App\Repositories\Contracts\GalleryItemRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Database\Eloquent\Collection;
class GalleryItemService
{
    public function __construct(
        protected GalleryItemRepositoryInterface $repository
    ) {}

    public function list(?string $section)
    {
        return $this->repository->paginate($section);
    }

    public function listBySection(int $sectionId): Collection
    {
        return $this->repository->getItemsBySectionId($sectionId);
    }

    public function create(array $data, ?array $sections, ?UploadedFile $image) {
        $item = $this->repository->create($data);
        if (!empty($sections)) {
            $item->sections()->sync($sections);
        }

        $mainSection = null;
        if (!empty($sections)) {
            $mainSection = \App\Models\GallerySection::find($sections[0]);
        }
        if ($image && $mainSection) {
            $item->updateSingleMedia(
                baseFolder: 'gallery/' . $mainSection->slug,
                file: $image,
                model: $item,
                column: null,
                relation: 'media',
                useStorage: true,
                generateThumbnail: false,
                collectionName: $mainSection->slug,
                addWatermark: false
            );
        }
        return $item->load(['media', 'sections']);
    }
    public function delete(int $id) {
        return $this->repository->delete($id);
    }
}
