<?php
namespace App\Repositories\Eloquents;
use App\Models\Journey;
use App\Repositories\Contracts\JourneyRepositoryInterface;
class JourneyRepository implements JourneyRepositoryInterface {
    public function paginate(
        ?string $type,
        ?string $status,
        int $perPage = 10
    ) {
        return Journey::query()
            ->whereNull('parent_id')
            ->filterType($type)
            ->filterStatus($status)
            ->with([
                'children' => function ($q) use ($status) {
                    $q->filterStatus($status);
                }
            ])
            ->latest()
            ->paginate($perPage);
    }
    
    public function paginateByType(string $type, int $perPage = 10) {
        return Journey::where('type', $type)->whereNull('parent_id')->with('children')->latest()->paginate($perPage);
    }

    public function find(int $id) {
        return Journey::with('children')->findOrFail($id);
    }

    public function create(array $data) {
        return Journey::create($data);
    }

    public function update(int $id, array $data) {
        $journey = Journey::findOrFail($id);
        $journey->update($data);
        return $journey;
    }

    public function delete(int $id) {
        return Journey::findOrFail($id)->delete();
    }
}