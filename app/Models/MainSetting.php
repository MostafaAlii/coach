<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concernes\UploadMedia;
class MainSetting extends Model {
    use HasFactory, UploadMedia;
    protected $fillable = [
        'name',
        'phone',
        'address',
        'email',
    ];

    public function media() {
        return $this->morphMany(Media::class, 'mediable');
    }

    public function logo() {
        return $this->media()->where('collection_name', 'logo')->latest()->first();
    }
}
