<?php
namespace App\Repositories\Eloquents;
use App\Models\Hero;
use App\Repositories\Contracts\HeroRepositoryInterface;
use Illuminate\Support\Collection;
class HeroRepository implements HeroRepositoryInterface {
    public function getAll(): Collection {
        return Hero::active()->with('media')->get();
    }

    public function upsert(array $data, ?int $id = null): Hero {
        return Hero::updateOrCreate(
            ['id' => $id],
            $data
        );
    }
}
