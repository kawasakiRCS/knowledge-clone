<?php

namespace App\Http\Controllers;

use App\Models\Knowledge\Knowledge;
use App\Models\Knowledge\Comment;
use App\Http\Requests\CommentStoreRequest;
use App\Http\Requests\CommentUpdateRequest;
use App\Services\CommentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CommentController extends Controller
{
    public function __construct(
        protected CommentService $commentService
    ) {}

    /**
     * ナレッジのコメント一覧取得
     */
    public function index(Knowledge $knowledge): JsonResponse
    {
        $user = Auth::user();

        // アクセス権限チェック
        if (!$knowledge->isAccessibleBy($user->user_id)) {
            return response()->json([
                'success' => false,
                'message' => 'このナレッジへのアクセス権限がありません。'
            ], 403);
        }

        $comments = $this->commentService->getKnowledgeComments($knowledge, $user);

        return response()->json([
            'success' => true,
            'comments' => $comments,
            'total_count' => $knowledge->comment_count,
        ]);
    }

    /**
     * コメント詳細取得
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

        $comment->load(['creator', 'likes', 'files']);

        // ユーザーがいいねしているかチェック
        $userLiked = $comment->likes()->where('insert_user', $user->user_id)->exists();

        return response()->json([
            'success' => true,
            'comment' => $comment,
            'user_liked' => $userLiked,
        ]);
    }

    /**
     * コメント作成
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
                'comment' => $comment,
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
     * コメント編集フォーム表示
     */
    public function edit(Comment $comment): Response
    {
        $user = Auth::user();

        // 編集権限チェック
        if (!$this->commentService->canEditComment($comment, $user)) {
            abort(403, 'このコメントの編集権限がありません。');
        }

        $comment->load(['knowledge', 'files']);

        return Inertia::render('Comment/Edit', [
            'comment' => $comment,
            'knowledge' => $comment->knowledge,
        ]);
    }

    /**
     * コメント更新
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
                'comment' => $updatedComment,
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
     * コメント削除
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
     * コメントいいね機能
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
     * コメント状態変更（非表示/表示）
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
     * ユーザーのコメント履歴取得
     */
    public function userComments(Request $request): Response
    {
        $user = Auth::user();
        $page = $request->get('page', 1);
        
        $comments = $this->commentService->getUserComments($user, 20);

        return Inertia::render('Comment/UserComments', [
            'comments' => $comments,
        ]);
    }

    /**
     * 最近のコメント取得（管理用）
     */
    public function recent(Request $request): JsonResponse
    {
        $user = Auth::user();
        $limit = $request->get('limit', 10);

        // 管理者権限チェック（今後の実装）
        // if (!$user->isAdmin()) {
        //     return response()->json(['success' => false, 'message' => '権限がありません。'], 403);
        // }

        $comments = $this->commentService->getRecentComments($limit);

        return response()->json([
            'success' => true,
            'comments' => $comments,
        ]);
    }

    /**
     * コメント統計取得
     */
    public function stats(): JsonResponse
    {
        $user = Auth::user();

        // 管理者権限チェック（今後の実装）
        // if (!$user->isAdmin()) {
        //     return response()->json(['success' => false, 'message' => '権限がありません。'], 403);
        // }

        $stats = $this->commentService->getCommentStats();

        return response()->json([
            'success' => true,
            'stats' => $stats,
        ]);
    }
}