<?php
namespace App\Services;
use App\Repositories\Contracts\HeroRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;
use App\Models\Hero;
class HeroService {
    public function __construct(protected HeroRepositoryInterface $repo) {}
    public function getAll() {
        return $this->repo->getAll();
    }

    public function upsert(array $payload, ?UploadedFile $image = null): Hero {
        return DB::transaction(function () use ($payload, $image) {
            $hero = $this->repo->upsert([
                'title' => $payload['title'],
                'description' => $payload['description'] ?? null,
                'status' => $payload['status'] ?? 'active',
            ], $payload['id'] ?? null);
            if ($image) {
                $hero->updateSingleMedia('hero', $image, $hero, null, 'media', true, false, 'hero');
            }
            return $hero->load('media');
        });
    }
}
