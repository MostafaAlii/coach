<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
class JourneyResource extends JsonResource {
    public function toArray($request) {
        return [
            'id'     => $this->id,
            'title'  => $this->title,
            'type'   => $this->type,
            'status' => $this->status,
            'points' => JourneyResource::collection($this->children ?? collect()),
        ];
    }
}
