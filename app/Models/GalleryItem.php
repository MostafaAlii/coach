<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concernes\UploadMedia;
use Illuminate\Database\Eloquent\Builder;
class GalleryItem extends Model {
    use HasFactory, UploadMedia;
    protected $fillable = [
        'title',
        'description',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function sections() {
        return $this->belongsToMany(
            GallerySection::class,
            'gallery_item_section',
            'gallery_item_id',
            'gallery_section_id'
        )->withTimestamps();
    }

    public function media() {
        return $this->morphMany(Media::class, 'mediable');
    }

    public function scopeActive(Builder $query): Builder {
        return $query->where('is_active', true);
    }

    public function scopeInactive(Builder $query): Builder {
        return $query->where('is_active', false);
    }

    public function scopeByTitle(Builder $query, string $title): Builder {
        return $query->where('title', 'LIKE', "%{$title}%");
    }

    public function scopeLatestFirst(Builder $query): Builder {
        return $query->orderBy('created_at', 'desc');
    }

    public function scopeWithActiveSections(Builder $query): Builder {
        return $query->with(['sections' => function ($query) {
            $query->where('is_active', true)->orderBy('sort_order')->orderBy('name');
        }]);
    }
}
