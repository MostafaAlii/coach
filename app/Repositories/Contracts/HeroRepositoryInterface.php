<?php
namespace App\Repositories\Contracts;
use Illuminate\Support\Collection;
use App\Models\Hero;
interface HeroRepositoryInterface {
    public function getAll(): Collection;
    public function upsert(array $data, ?int $id = null): Hero;
}