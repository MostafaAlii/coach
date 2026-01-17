<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    protected $fillable = ['file_name', 'disk', 'collection_name', 'type'];
    public function mediable()
    {
        return $this->morphTo();
    }
}