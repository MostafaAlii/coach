<?php
namespace App\Repositories\Contracts;
use App\Models\MainSetting;
interface MainSettingRepositoryInterface {
    public function get(): ?MainSetting;
    public function upsert(array $data, ?int $id = null): MainSetting;
}