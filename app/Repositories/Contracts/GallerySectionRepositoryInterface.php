<?php
namespace App\Repositories\Contracts;
interface GallerySectionRepositoryInterface {
    public function listWithItems(int $perPage = 10);
    public function paginate(int $perPage = 10);
    public function findById(int $id);
    public function create(array $data);
    public function update(int $id, array $data);
    public function delete(int $id);
}
