<?php
namespace App\Repositories\Eloquents;
use App\Models\MainSetting;
use App\Repositories\Contracts\MainSettingRepositoryInterface;
class MainSettingRepository implements MainSettingRepositoryInterface {
    public function get(): ?MainSetting {
        return MainSetting::with('media')->first();
    }

    public function upsert(array $data, ?int $id = null): MainSetting {
        return MainSetting::updateOrCreate(
            ['id' => $id],
            $data
        );
    }
}