<?php
namespace App\Services;
use App\Models\About;
use App\Repositories\Contracts\AboutRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;
class AboutService {
    public function __construct(protected AboutRepositoryInterface $repo) {}
    public function getTree() {
        return $this->repo->getTree();
    }

    public function upsert(array $payload, ?UploadedFile $aboutImage = null): About {
        return DB::transaction(function () use ($payload, $aboutImage) {
            $parent = $this->repo->upsert([
                    'title'     => $payload['title'],
                    'parent_id' => $payload['parent_id'] ?? null,
                    'status'    => $payload['status'],
                ],
                $payload['id'] ?? null
            );
            if ($aboutImage) {
                $parent->updateSingleMedia('about',$aboutImage,$parent,null,'media',true,false,'about');
            }
            $sentChildIds = [];
            if (!empty($payload['children'])) {
                foreach ($payload['children'] as $child) {
                    $childModel = $this->repo->upsert(
                        [
                            'title'     => $child['title'],
                            'parent_id' => $parent->id,
                            'status'    => $child['status'] ?? 'active',
                        ],
                        $child['id'] ?? null
                    );
                    $sentChildIds[] = $childModel->id;
                }
                $parent->children()
                    ->whereNotIn('id', $sentChildIds)
                    ->delete();
            }
            return $parent->load([
                'media',
                'activeChildrenRecursive'
            ]);
        });
    }
}