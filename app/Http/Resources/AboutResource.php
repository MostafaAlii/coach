<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AboutResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'status' => $this->status,
            'parent_id' => $this->parent_id,
            'media' => $this->whenLoaded('media', function () {
                if ($this->media->isNotEmpty()) {
                    return MediaResource::collection($this->media);
                }
                return null;
            }),
            /*'main_media' => $this->whenLoaded('media', function () {
                $mainMedia = $this->media->where('type', 'main')->first();
                return $mainMedia ? new MediaResource($mainMedia) : null;
            }),*/
            'children' => $this->whenLoaded('activeChildrenRecursive', function () {
                return AboutResource::collection($this->activeChildrenRecursive);
            }),
        ];
    }
}
