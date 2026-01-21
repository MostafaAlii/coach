<?php
namespace App\Repositories\Eloquents;
use App\Models\GallerySection;
use App\Repositories\Contracts\GallerySectionRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class GallerySectionRepository implements GallerySectionRepositoryInterface {
    public function listWithItems(int $perPage = 10) {
        $sections = GallerySection::query()
            ->active()
            ->ordered()
            ->with(['items' => function ($query) {
                $query->active()
                    ->with('media')
                    ->orderBy('created_at', 'desc');
            }])
            ->paginate($perPage);
        $sections->getCollection()->loadMissing('items.media');
        $sections->getCollection()->transform(function ($section) {
            return new \App\Http\Resources\GallerySectionResource($section);
        });
        return $sections;
    }

    public function paginate(int $perPage = 10) {
        return GallerySection::query()->active()->ordered()->paginate($perPage);
    }

    public function findById(int $id) {
        return GallerySection::find($id);
    }

    public function create(array $data) {
        return GallerySection::create($data);
    }

    /*public function update(int $id, array $data) {
        $section = $this->findById($id);
        if (!$section) return null;
        $section->update($data);
        return $section;
    }*/
    public function update(int $id, array $data)
    {
        $section = $this->findById($id);

        if (!$section) {
            return null;
        }

        // لو الاسم اتغير → نحدّث الـ slug تلقائي
        if (isset($data['name'])) {
            $slug = \Str::slug($data['name']);
            $originalSlug = $slug;
            $i = 1;

            while (
                GallerySection::where('slug', $slug)
                ->where('id', '!=', $id)
                ->exists()
            ) {
                $slug = $originalSlug . '-' . $i++;
            }

            $data['slug'] = $slug;
        }

        $section->update($data);
        return $section;
    }


    public function delete(int $id) {
        return GallerySection::where('id', $id)->delete();
    }
}
