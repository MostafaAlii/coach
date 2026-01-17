<?php
namespace App\Services;
use App\Repositories\Contracts\ContactMessageRepositoryInterface;
class ContactMessageService {
    public function __construct(protected ContactMessageRepositoryInterface $repo) {}

    public function create(array $payload) {
        return $this->repo->create($payload);
    }

    public function delete(int $id) {
        return $this->repo->delete($id);
    }

    public function all(int $perPage = 10) {
        return $this->repo->all($perPage);
    }

    public function bulkDelete(?array $ids = null): int {
        return $this->repo->bulkDelete($ids);
    }
}