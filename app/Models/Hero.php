<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concernes\UploadMedia;
class Hero extends Model {
    use HasFactory, UploadMedia;

    protected $fillable = [
        'title',
        'description',
        'status',
    ];

    public function media()
    {
        return $this->morphMany(Media::class, 'mediable');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}