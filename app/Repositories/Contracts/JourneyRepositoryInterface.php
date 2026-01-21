<?php
namespace App\Repositories\Contracts;
interface JourneyRepositoryInterface {
    public function paginate(?string $type,?string $status,int $perPage = 10);
    public function paginateByType(string $type, int $perPage = 10);
    public function find(int $id);
    public function create(array $data);
    public function addPoints(int $journeyId, array $points);
    public function update(int $id, array $data);
    public function delete(int $id);
}