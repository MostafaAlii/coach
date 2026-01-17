<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;
class HeroResource extends JsonResource {
    public function toArray($request) {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'media' => $this->whenLoaded('media', function () {
                return $this->media->isNotEmpty() ? MediaResource::collection($this->media) : null;
            }),
        ];
    }
}