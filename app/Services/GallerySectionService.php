<?php
namespace App\Services;
use App\Repositories\Contracts\GallerySectionRepositoryInterface;
use App\Models\GallerySection;
class GallerySectionService {
    public function __construct(
        protected GallerySectionRepositoryInterface $repository
    ) {}

    public function list() {
        return $this->repository->listWithItems();
    }

    /*public function create(array $data) {
        return $this->repository->create($data);
    }*/
    public function create(array $sectionsData)
    {
        $createdSections = [];

        foreach ($sectionsData as $data) {
            // توليد slug تلقائي وفريد
            $slug = \Str::slug($data['name']);
            $originalSlug = $slug;
            $i = 1;
            while (GallerySection::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $i;
                $i++;
            }
            // توليد sort_order تلقائي (أعلى رقم + 1)
            $sortOrder = GallerySection::max('sort_order') + 1;

            $createdSections[] = $this->repository->create([
                'name' => $data['name'],
                'slug' => $slug,
                'is_active' => $data['is_active'] ?? true,
                'sort_order' => $sortOrder,
            ]);
        }
        return $createdSections;
    }


    public function update(int $id, array $data) {
        return $this->repository->update($id, $data);
    }

    public function delete(int $id) {
        return $this->repository->delete($id);
    }
}