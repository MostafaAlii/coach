<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GallerySectionResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'slug'       => $this->slug,
            'is_active'  => $this->is_active,
            'sort_order' => $this->sort_order,
            'items' => GalleryItemResource::collection($this->items),
        ];
    }
}
