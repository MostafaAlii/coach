<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\ContactMessageService;
use App\Http\Resources\ContactMessageResource;
use App\Models\Concernes\ApiResponseTrait;
class ContactMessageController extends Controller {
    use ApiResponseTrait;
    public function __construct(protected ContactMessageService $service) {}
    // Create
    public function create(Request $request) {
        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'message' => 'required|string',
        ]);
        $contact = $this->service->create($data);
        return $this->createdResponse(new ContactMessageResource($contact), 'Message sent successfully');
    }

    // Delete
    public function delete(Request $request) {
        $data = $request->validate([
            'id' => 'required|exists:contact_messages,id',
        ]);
        $this->service->delete($data['id']);
        return $this->deletedResponse('Message deleted successfully');
    }

    // All with pagination
    public function all(Request $request) {
        $perPage = $request->get('per_page', 10);
        $messages = $this->service->all($perPage);
        if ($messages->isEmpty()) {
            return $this->successResponse([], 'No Messages Found.');
        }
        return $this->paginatedResponse($messages, 'Messages retrieved successfully');
    }

    public function bulkDelete(Request $request) {
        $data = $request->validate([
            'ids' => 'nullable|array',
            'ids.*' => 'integer|exists:contact_messages,id',
        ]);
        $deletedCount = $this->service->bulkDelete($data['ids'] ?? null);
        return $this->successResponse(
            ['deleted_count' => $deletedCount],
            $deletedCount ? "$deletedCount messages deleted successfully" : "No messages to delete"
        );
    }
}