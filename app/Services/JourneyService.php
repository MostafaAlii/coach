<?php
namespace App\Services;
use App\Repositories\Contracts\JourneyRepositoryInterface;
class JourneyService {
    public function __construct(
        protected JourneyRepositoryInterface $journeyRepo
    ) {}

    public function list(array $filters) {
        return $this->journeyRepo->paginate(
            $filters['type']   ?? null,
            $filters['status'] ?? null,
            $filters['per_page'] ?? 10
        );
    }

    /*public function list(string $type) {
        return $this->journeyRepo->paginateByType($type);
    }*/

    public function store(array $data) {
        return $this->journeyRepo->create($data);
    }

    public function update(int $id, array $data) {
        return $this->journeyRepo->update($id, $data);
    }

    public function delete(int $id) {
        return $this->journeyRepo->delete($id);
    }
}