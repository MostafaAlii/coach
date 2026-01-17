<?php
namespace App\Repositories\Contracts;
use App\Models\ContactMessage;
use Illuminate\Pagination\LengthAwarePaginator;
interface ContactMessageRepositoryInterface {
    public function create(array $data): ContactMessage;
    public function delete(int $id): bool;
    public function all(int $perPage = 10): LengthAwarePaginator;
    public function bulkDelete(?array $ids = null): int;
}