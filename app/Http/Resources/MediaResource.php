<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;
class MediaResource extends JsonResource {
    public function toArray($request) {
        $basePath = $this->disk === 'direct_public' ? 'uploads' : 'storage/uploads';
        $fileName = $this->file_name;
        $originalPath = "$basePath/{$this->collection_name}/$fileName";
        return [
            'id' => $this->id,
            'file_name' => $this->file_name,
            'urls' => [
                'original' => asset($originalPath),
            ],
        ];
    }
}