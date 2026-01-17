<?php
namespace App\Repositories\Contracts;
use Illuminate\Support\Collection;
use App\Models\About;
interface AboutRepositoryInterface {
    public function getTree(): Collection;
    public function upsert(array $data, ?int $id = null): About;
}