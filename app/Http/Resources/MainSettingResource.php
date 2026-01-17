<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;
class MainSettingResource extends JsonResource {
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone' => $this->phone,
            'address' => $this->address,
            'email' => $this->email,
            'logo' => $this->whenLoaded('media', function () {
                $logo = $this->media->where('collection_name','logo')->first();
                return $logo ? new MediaResource($logo) : null;
            }),
        ];
    }
}