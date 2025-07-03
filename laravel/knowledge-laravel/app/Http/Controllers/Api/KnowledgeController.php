<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Knowledge\Knowledge;
use App\Models\Knowledge\Tag;
use App\Services\KnowledgeService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class KnowledgeController extends Controller
{
    public function __construct(
        protected KnowledgeService $knowledgeService
    ) {}
    /**
     * ナレッジ一覧API
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $query = Knowledge::with(['creator', 'tags', 'templateMaster'])
                          ->accessibleBy($user->user_id);

        // 検索
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('content', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('tag_names', 'LIKE', "%{$searchTerm}%");
            });
        }

        // フィルター
        if ($request->filled('tag')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('tag_name', $request->tag);
            });
        }

        if ($request->filled('template')) {
            $query->where('type_id', $request->template);
        }

        if ($request->filled('public_flag')) {
            $query->where('public_flag', $request->public_flag);
        }

        // ソート
        $sortBy = $request->get('sort', 'updated');
        switch ($sortBy) {
            case 'title':
                $query->orderBy('title');
                break;
            case 'created':
                $query->orderBy('insert_datetime', 'desc');
                break;
            case 'likes':
                $query->orderBy('like_count', 'desc');
                break;
            case 'views':
                $query->orderBy('view_count', 'desc');
                break;
            default:
                $query->orderBy('update_datetime', 'desc');
        }

        $knowledges = $query->paginate($request->get('per_page', 20));

        return response()->json($knowledges);
    }

    /**
     * ナレッジ詳細API
     */
    public function show(Knowledge $knowledge): JsonResponse
    {
        $user = Auth::user();

        // アクセス権限チェック
        if (!$knowledge->isAccessibleBy($user->user_id)) {
            return response()->json([
                'message' => 'アクセス権限がありません。'
            ], 403);
        }

        $knowledge->load([
            'creator',
            'updater',
            'tags',
            'templateMaster',
            'comments.creator',
            'files'
        ]);

        return response()->json($knowledge);
    }

    /**
     * いいね状態取得API
     */
    public function likeStatus(Knowledge $knowledge): JsonResponse
    {
        $user = Auth::user();

        // アクセス権限チェック
        if (!$knowledge->isAccessibleBy($user->user_id)) {
            return response()->json([
                'message' => 'アクセス権限がありません。'
            ], 403);
        }

        $userLiked = $knowledge->likes()->where('insert_user', $user->user_id)->exists();

        return response()->json([
            'liked' => $userLiked,
            'like_count' => $knowledge->like_count,
        ]);
    }

    /**
     * いいね切り替えAPI
     */
    public function toggleLike(Knowledge $knowledge): JsonResponse
    {
        $user = Auth::user();

        // アクセス権限チェック
        if (!$knowledge->isAccessibleBy($user->user_id)) {
            return response()->json([
                'message' => 'アクセス権限がありません。'
            ], 403);
        }

        $existingLike = $knowledge->likes()->where('insert_user', $user->user_id)->first();

        if ($existingLike) {
            // いいね解除
            $existingLike->delete();
            $liked = false;
            $message = 'いいねを解除しました。';
        } else {
            // いいね追加
            $knowledge->likes()->create([
                'insert_user' => $user->user_id,
            ]);
            $liked = true;
            $message = 'いいねしました。';
        }

        return response()->json([
            'liked' => $liked,
            'like_count' => $knowledge->fresh()->like_count,
            'message' => $message,
        ]);
    }

    /**
     * タグ一覧API
     */
    public function tags(): JsonResponse
    {
        $tags = Tag::popular(50)->get();

        return response()->json($tags);
    }

    /**
     * 最近のナレッジAPI
     */
    public function recent(): JsonResponse
    {
        $user = Auth::user();

        $knowledges = Knowledge::with(['creator', 'tags'])
                              ->accessibleBy($user->user_id)
                              ->orderBy('update_datetime', 'desc')
                              ->limit(10)
                              ->get();

        return response()->json($knowledges);
    }

    /**
     * 人気のナレッジAPI
     */
    public function popular(): JsonResponse
    {
        $user = Auth::user();

        $knowledges = Knowledge::with(['creator', 'tags'])
                              ->accessibleBy($user->user_id)
                              ->orderBy('like_count', 'desc')
                              ->orderBy('view_count', 'desc')
                              ->limit(10)
                              ->get();

        return response()->json($knowledges);
    }
}