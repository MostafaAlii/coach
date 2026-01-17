<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concernes\UploadMedia;
class About extends Model {
    use HasFactory, UploadMedia;
    protected $fillable = [
        'title',
        'parent_id',
        'status',
    ];

    public function parent() {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children() {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function scopeActive($query) {
        return $query->where('status', 'active');
    }

    public function activeChildren() {
        return $this->hasMany(self::class, 'parent_id')->where('status', 'active');
    }

    public function activeChildrenRecursive() {
        return $this->activeChildren()->with('activeChildrenRecursive');
    }

    public function activeChildrenRecursiveWithMedia() {
        return $this->hasMany(self::class, 'parent_id')->where('status', 'active')->with(['media','activeChildrenRecursive']);
    }

    public function media() {
        return $this->morphMany(Media::class, 'mediable');
    }
}