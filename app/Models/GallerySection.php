<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
class GallerySection extends Model {
    use HasFactory;
    protected $fillable = [
        'name',
        'slug',
        'is_active',
        'sort_order'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function items() {
        return $this->belongsToMany(
            GalleryItem::class,
            'gallery_item_section',
            'gallery_section_id',
            'gallery_item_id'
        )->withTimestamps();
    }

    public function scopeActive(Builder $query): Builder {
        return $query->where('is_active', true);
    }

    public function scopeOrdered(Builder $query): Builder {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    public function scopeByName(Builder $query, string $name): Builder {
        return $query->where('name', 'LIKE', "%{$name}%");
    }

    public function scopeWithActiveItems(Builder $query): Builder {
        return $query->with(['items' => function ($query) {
            $query->where('is_active', true);
        }]);
    }

    public function getWithActiveItems() {
        return $this->load(['items' => function ($query) {
            $query->where('is_active', true)->orderBy('created_at', 'desc');
        }]);
    }
}
