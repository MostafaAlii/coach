<?php
namespace App\Repositories\Eloquents;
use App\Models\ContactMessage;
use App\Repositories\Contracts\ContactMessageRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
class ContactMessageRepository implements ContactMessageRepositoryInterface {
    public function create(array $data): ContactMessage {
        return ContactMessage::create($data);
    }

    public function delete(int $id): bool {
        $message = ContactMessage::findOrFail($id);
        return $message->delete();
    }

    public function all(int $perPage = 10): LengthAwarePaginator {
        return ContactMessage::orderByDesc('created_at')->paginate($perPage);
    }

    public function bulkDelete(?array $ids = null): int {
        if ($ids && count($ids) > 0) {
            return ContactMessage::whereIn('id', $ids)->delete();
        }
        return ContactMessage::query()->delete();
    }
}
