<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Knowledge\Knowledge;
use App\Models\Knowledge\Comment;
use App\Http\Requests\CommentStoreRequest;
use App\Http\Requests\CommentUpdateRequest;
use App\Services\CommentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function __construct(
        protected CommentService $commentService
    ) {}

    /**
     * ナレッジのコメント一覧API
     */
    public function index(Knowledge $knowledge, Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
        ]);

        $user = Auth::user();

        // アクセス権限チェック
        if (!$knowledge->isAccessibleBy($user->user_id)) {
            return response()->json([
                'success' => false,
                'message' => 'このナレッジへのアクセス権限がありません。'
            ], 403);
        }

        $perPage = $request->input('per_page', 20);
        $comments = $this->commentService->getKnowledgeComments($knowledge, $user, $perPage);

        return response()->json([
            'success' => true,
            'data' => $comments,
            'knowledge_id' => $knowledge->knowledge_id,
        ]);
    }

    /**
     * コメント詳細API
     */
    public function show(Comment $comment): JsonResponse
    {
        $user = Auth::user();

        // アクセス権限チェック
        if (!$comment->knowledge->isAccessibleBy($user->user_id)) {
            return response()->json([
                'success' => false,
                'message' => 'このコメントへのアクセス権限がありません。'
            ], 403);
        }

        $comment->load(['creator', 'likes', 'files', 'knowledge']);

        // ユーザーがいいねしているかチェック
        $userLiked = $comment->likes()->where('insert_user', $user->user_id)->exists();
        $comment->user_liked = $userLiked;
        $comment->like_count = $comment->likes()->count();
        $comment->can_edit = $this->commentService->canEditComment($comment, $user);
        $comment->can_delete = $this->commentService->canDeleteComment($comment, $user);

        return response()->json([
            'success' => true,
            'data' => $comment,
        ]);
    }

    /**
     * コメント作成API
     */
    public function store(CommentStoreRequest $request): JsonResponse
    {
        $user = Auth::user();

        try {
            $comment = $this->commentService->createComment(
                $request->validated(),
                $user
            );

            return response()->json([
                'success' => true,
                'data' => $comment,
                'message' => 'コメントを投稿しました。'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * コメント更新API
     */
    public function update(CommentUpdateRequest $request, Comment $comment): JsonResponse
    {
        $user = Auth::user();

        try {
            $updatedComment = $this->commentService->updateComment(
                $comment,
                $request->validated(),
                $user
            );

            return response()->json([
                'success' => true,
                'data' => $updatedComment,
                'message' => 'コメントを更新しました。'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * コメント削除API
     */
    public function destroy(Comment $comment): JsonResponse
    {
        $user = Auth::user();

        try {
            $this->commentService->deleteComment($comment, $user);

            return response()->json([
                'success' => true,
                'message' => 'コメントを削除しました。'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * コメントいいねAPI
     */
    public function like(Comment $comment): JsonResponse
    {
        $user = Auth::user();

        try {
            $result = $this->commentService->toggleCommentLike($comment, $user);

            return response()->json([
                'success' => true,
                'liked' => $result['liked'],
                'like_count' => $result['like_count'],
                'message' => $result['message'],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * コメント状態変更API
     */
    public function toggleStatus(Comment $comment): JsonResponse
    {
        $user = Auth::user();

        try {
            $result = $this->commentService->toggleCommentStatus($comment, $user);

            return response()->json([
                'success' => true,
                'comment_status' => $result['status'],
                'message' => $result['message'],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * ユーザーコメント履歴API
     */
    public function userComments(Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
        ]);

        $user = Auth::user();
        $perPage = $request->input('per_page', 20);
        
        $comments = $this->commentService->getUserComments($user, $perPage);

        return response()->json([
            'success' => true,
            'data' => $comments,
        ]);
    }

    /**
     * 最近のコメントAPI
     */
    public function recent(Request $request): JsonResponse
    {
        $request->validate([
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        $limit = $request->input('limit', 10);
        $comments = $this->commentService->getRecentComments($limit);

        return response()->json([
            'success' => true,
            'data' => $comments,
        ]);
    }

    /**
     * コメント統計API
     */
    public function stats(): JsonResponse
    {
        $stats = $this->commentService->getCommentStats();

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}