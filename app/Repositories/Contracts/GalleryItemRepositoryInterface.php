<?php

namespace App\Repositories\Contracts;
use Illuminate\Database\Eloquent\Collection;
interface GalleryItemRepositoryInterface {
    public function paginate(?string $section, int $perPage = 10);
    public function create(array $data);
    public function findById(int $id);
    public function delete(int $id);
    public function getItemsBySectionId(int $sectionId): Collection;
}