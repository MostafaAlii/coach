<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class GalleryItemResource extends JsonResource {
    public function toArray($request) {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'is_active' => $this->is_active,
            'media' => $this->media->map(function ($m) {
                return [
                    'id' => $m->id,
                    'original' => asset("uploads/gallery/{$m->collection_name}/{$m->file_name}"),
                ];
            }),
        ];
    }
}
