<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;
class ContactMessageResource extends JsonResource {
    public function toArray($request) {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'message' => $this->message,
            'created_at' => $this->created_at->toDateTimeString(),
        ];
    }
}