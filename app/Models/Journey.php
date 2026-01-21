<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class Journey extends Model {
    use HasFactory;
    protected $fillable = [
        'title',
        'parent_id',
        'type',
        'status',
    ];

    public static function validationRules($withChildren = false) {
        $rules = [
            'title' => 'required|string|max:255',
            'type' => 'required|in:service,certificate',
            'parent_id' => 'nullable|exists:journeys,id',
            'status' => 'required|in:active,inactive',
        ];
        if ($withChildren) {
            $rules['children'] = 'nullable|array';
            $rules['children.*.title'] = 'required|string|max:255';
        }
        return $rules;
    }

    // Parent
    public function parent() {
        return $this->belongsTo(self::class, 'parent_id');
    }

    // Children (points)
    public function children() {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function scopeFilterType($query, ?string $type) {
        if ($type) {
            $query->where('type', $type);
        }
    }

    public function scopeFilterStatus($query, ?string $status) {
        if ($status && in_array($status, ['active', 'inactive'])) {
            $query->where('status', $status);
        }
    }
}