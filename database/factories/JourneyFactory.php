<?php
namespace Database\Factories;

use App\Models\Journey;
use Illuminate\Database\Eloquent\Factories\Factory;

class JourneyFactory extends Factory
{
    protected $model = Journey::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(3),
            'parent_id' => null,
            'type' => 'service',
            'status' => 'inactive',
        ];
    }

    public function service()
    {
        return $this->state(fn() => [
            'type' => 'service',
        ]);
    }

    public function certificate()
    {
        return $this->state(fn() => [
            'type' => 'certificate',
        ]);
    }

    public function inactive()
    {
        return $this->state(fn() => [
            'status' => 'inactive',
        ]);
    }

    public function child(int $parentId)
    {
        return $this->state(fn() => [
            'parent_id' => $parentId,
        ]);
    }
}