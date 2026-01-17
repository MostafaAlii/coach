<?php
namespace App\Repositories\Eloquents;
use App\Models\About;
use App\Repositories\Contracts\AboutRepositoryInterface;
use Illuminate\Support\Collection;
class AboutRepository implements AboutRepositoryInterface {
    public function getTree(): Collection {
        return About::whereNull('parent_id')
            ->active()
            ->with(['media', 'activeChildrenRecursive'])
            ->get();
    }

    public function upsert(array $data, ?int $id = null): About {
        return About::updateOrCreate(
            ['id' => $id],
            $data
        );
    }
}