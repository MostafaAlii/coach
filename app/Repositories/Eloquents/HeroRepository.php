<?php
namespace App\Repositories\Eloquents;
use App\Models\Hero;
use App\Repositories\Contracts\HeroRepositoryInterface;
use Illuminate\Support\Collection;
class HeroRepository implements HeroRepositoryInterface {
    public function getAll(): Hero {
        return Hero::active()->with('media')->first();
    }

    public function upsert(array $data): Hero {
        $hero = Hero::first();
        if ($hero) {
            $hero->update($data);
            return $hero;
        }
        return Hero::create($data);
    }
}