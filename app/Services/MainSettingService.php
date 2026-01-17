<?php
namespace App\Services;
use App\Repositories\Contracts\MainSettingRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;
use App\Models\MainSetting;
class MainSettingService {
    public function __construct(protected MainSettingRepositoryInterface $repo) {}
    public function get(): ?MainSetting {
        return $this->repo->get();
    }

    public function upsert(array $payload, ?UploadedFile $logo = null): MainSetting {
        return DB::transaction(function () use ($payload, $logo) {
            $setting = $this->repo->upsert([
                'name' => $payload['name'],
                'phone' => $payload['phone'] ?? null,
                'address' => $payload['address'] ?? null,
                'email' => $payload['email'] ?? null,
            ], $payload['id'] ?? null);
            if ($logo) {
                $setting->updateSingleMedia('logo', $logo, $setting, null, 'media', true, false, 'logo');
            }
            return $setting->load('media');
        });
    }
}
