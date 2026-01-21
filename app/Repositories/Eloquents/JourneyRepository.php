<?php
namespace App\Repositories\Eloquents;
use App\Models\Journey;
use App\Repositories\Contracts\JourneyRepositoryInterface;
use Illuminate\Support\Facades\DB;
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
        $children = $data['children'] ?? [];
        unset($data['children']);
        DB::beginTransaction();
        try {
            $parent = Journey::create($data);
            $savedChildren = [];
            foreach ($children as $childData) {
                $child = Journey::create([
                    'title' => $childData['title'],
                    'parent_id' => $parent->id,
                    'type' => $parent->type,
                    'status' => $parent->status,
                ]);
                $savedChildren[] = $child;
            }
            DB::commit();
            $parentWithChildren = Journey::with('children')->find($parent->id);
            return $parentWithChildren;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function addPoints(int $journeyId, array $points) {
        DB::beginTransaction();
        try {
            $parent = Journey::whereNull('parent_id')->findOrFail($journeyId);
            foreach ($points as $point) {
                Journey::create([
                    'title'     => $point['title'],
                    'parent_id' => $parent->id,
                    'type'      => $parent->type,
                    'status'    => $parent->status,
                ]);
            }
            DB::commit();
            return Journey::with('children')->find($parent->id);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
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
