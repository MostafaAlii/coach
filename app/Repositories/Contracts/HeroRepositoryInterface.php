<?php
namespace App\Repositories\Contracts;
use Illuminate\Support\Collection;
use App\Models\Hero;
interface HeroRepositoryInterface {
    public function getAll(): Hero;
    public function upsert(array $data): Hero;
}