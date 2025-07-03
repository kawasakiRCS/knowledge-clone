<?php

namespace App\Services;

use App\Models\Knowledge\Knowledge;
use App\Models\Knowledge\Comment;
use App\Models\Knowledge\LikeComment;
use App\Models\Web\User;
use App\Services\FileService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class CommentService
{
    public function __construct(
        protected FileService $fileService
    ) {}

    /**
     * ナレッジのコメント一覧を取得
     */
    public function getKnowledgeComments(Knowledge $knowledge, User $user, int $perPage = 20): LengthAwarePaginator
    {
        $query = $knowledge->comments()
                          ->with(['creator', 'likes', 'files'])
                          ->active(); // 非表示でないコメントのみ

        // 管理者でない場合は、自分のコメントか公開コメントのみ表示
        if (!$this->isAdmin($user)) {
            $query->where(function ($q) use ($user) {
                $q->where('insert_user', $user->user_id)
                  ->orWhere('anonymous', 0);
            });
        }

        $comments = $query->orderBy('insert_datetime', 'asc')
                         ->paginate($perPage);

        // 各コメントにユーザーのいいね状態を追加
        $comments->getCollection()->transform(function ($comment) use ($user) {
            $comment->user_liked = $comment->likes()
                                          ->where('insert_user', $user->user_id)
                                          ->exists();
            $comment->like_count = $comment->likes()->count();
            $comment->can_edit = $this->canEditComment($comment, $user);
            $comment->can_delete = $this->canDeleteComment($comment, $user);
            return $comment;
        });

        return $comments;
    }

    /**
     * コメントを作成
     */
    public function createComment(array $data, User $user): Comment
    {
        // ナレッジへのアクセス権限チェック
        $knowledge = Knowledge::findOrFail($data['knowledge_id']);
        if (!$knowledge->isAccessibleBy($user->user_id)) {
            throw new \Exception('このナレッジにコメントする権限がありません。');
        }

        return DB::transaction(function () use ($data, $user, $knowledge) {
            // コメント作成
            $comment = Comment::create([
                'knowledge_id' => $data['knowledge_id'],
                'comment' => $data['comment'],
                'comment_status' => Comment::STATUS_ACTIVE,
                'anonymous' => $data['anonymous'] ?? 0,
                'insert_user' => $user->user_id,
            ]);

            // 一時ファイルを本ファイルに変換
            if (!empty($data['temp_file_ids'])) {
                $this->fileService->convertTemporaryFiles(
                    $data['temp_file_ids'],
                    $data['knowledge_id'],
                    $comment->comment_no,
                    $user
                );
            }

            // ナレッジのコメント数を更新（モデルイベントで自動実行）
            
            return $comment->load(['creator', 'likes', 'files']);
        });
    }

    /**
     * コメントを更新
     */
    public function updateComment(Comment $comment, array $data, User $user): Comment
    {
        if (!$this->canEditComment($comment, $user)) {
            throw new \Exception('このコメントの編集権限がありません。');
        }

        return DB::transaction(function () use ($comment, $data, $user) {
            // コメント更新
            $comment->update([
                'comment' => $data['comment'],
                'anonymous' => $data['anonymous'] ?? $comment->anonymous,
                'update_user' => $user->user_id,
            ]);

            // ファイル削除処理
            if (!empty($data['remove_file_ids'])) {
                foreach ($data['remove_file_ids'] as $fileId) {
                    $file = $comment->files()->find($fileId);
                    if ($file) {
                        $this->fileService->deleteFile($file);
                    }
                }
            }

            // 新しいファイル追加
            if (!empty($data['temp_file_ids'])) {
                $this->fileService->convertTemporaryFiles(
                    $data['temp_file_ids'],
                    $comment->knowledge_id,
                    $comment->comment_no,
                    $user
                );
            }

            return $comment->load(['creator', 'likes', 'files']);
        });
    }

    /**
     * コメントを削除
     */
    public function deleteComment(Comment $comment, User $user): void
    {
        if (!$this->canDeleteComment($comment, $user)) {
            throw new \Exception('このコメントの削除権限がありません。');
        }

        DB::transaction(function () use ($comment) {
            // 添付ファイルを削除
            foreach ($comment->files as $file) {
                $this->fileService->deleteFile($file);
            }

            // いいねを削除
            $comment->likes()->delete();

            // コメント削除（ソフトデリート）
            $comment->delete();

            // ナレッジのコメント数を更新（モデルイベントで自動実行）
        });
    }

    /**
     * コメントいいね切り替え
     */
    public function toggleCommentLike(Comment $comment, User $user): array
    {
        // アクセス権限チェック
        if (!$comment->knowledge->isAccessibleBy($user->user_id)) {
            throw new \Exception('このコメントへのアクセス権限がありません。');
        }

        $existingLike = $comment->likes()->where('insert_user', $user->user_id)->first();

        if ($existingLike) {
            // いいね解除
            $existingLike->delete();
            $liked = false;
            $message = 'いいねを解除しました。';
        } else {
            // いいね追加
            LikeComment::create([
                'comment_no' => $comment->comment_no,
                'insert_user' => $user->user_id,
            ]);
            $liked = true;
            $message = 'いいねしました。';
        }

        return [
            'liked' => $liked,
            'like_count' => $comment->likes()->count(),
            'message' => $message,
        ];
    }

    /**
     * コメント状態切り替え（表示/非表示）
     */
    public function toggleCommentStatus(Comment $comment, User $user): array
    {
        // 権限チェック（作成者または管理者）
        if (!$this->canModerateComment($comment, $user)) {
            throw new \Exception('このコメントの状態を変更する権限がありません。');
        }

        $newStatus = $comment->comment_status === Comment::STATUS_ACTIVE 
                    ? Comment::STATUS_HIDDEN 
                    : Comment::STATUS_ACTIVE;

        $comment->update([
            'comment_status' => $newStatus,
            'update_user' => $user->user_id,
        ]);

        $message = $newStatus === Comment::STATUS_ACTIVE 
                  ? 'コメントを表示状態にしました。' 
                  : 'コメントを非表示状態にしました。';

        return [
            'status' => $newStatus,
            'message' => $message,
        ];
    }

    /**
     * ユーザーのコメント履歴を取得
     */
    public function getUserComments(User $user, int $perPage = 20): LengthAwarePaginator
    {
        return Comment::with(['knowledge', 'likes', 'files'])
                     ->where('insert_user', $user->user_id)
                     ->orderBy('insert_datetime', 'desc')
                     ->paginate($perPage);
    }

    /**
     * 最近のコメントを取得
     */
    public function getRecentComments(int $limit = 10): Collection
    {
        return Comment::with(['knowledge', 'creator', 'likes'])
                     ->active()
                     ->orderBy('insert_datetime', 'desc')
                     ->limit($limit)
                     ->get()
                     ->map(function ($comment) {
                         $comment->like_count = $comment->likes()->count();
                         return $comment;
                     });
    }

    /**
     * コメント統計を取得
     */
    public function getCommentStats(): array
    {
        $totalComments = Comment::count();
        $activeComments = Comment::active()->count();
        $hiddenComments = Comment::where('comment_status', Comment::STATUS_HIDDEN)->count();
        $anonymousComments = Comment::where('anonymous', 1)->count();

        // 今日のコメント数
        $todayComments = Comment::whereDate('insert_datetime', today())->count();

        // 今週のコメント数
        $weekComments = Comment::whereBetween('insert_datetime', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ])->count();

        // 今月のコメント数
        $monthComments = Comment::whereMonth('insert_datetime', now()->month)
                              ->whereYear('insert_datetime', now()->year)
                              ->count();

        // 最もコメントが多いナレッジ
        $topCommentedKnowledges = Knowledge::withCount('comments')
                                          ->orderByDesc('comments_count')
                                          ->take(5)
                                          ->get(['knowledge_id', 'title', 'comments_count']);

        // 最もコメントしているユーザー
        $topCommentUsers = Comment::selectRaw('insert_user, COUNT(*) as comment_count')
                                 ->groupBy('insert_user')
                                 ->orderByDesc('comment_count')
                                 ->take(5)
                                 ->with('creator:user_id,user_name')
                                 ->get();

        return [
            'total_comments' => $totalComments,
            'active_comments' => $activeComments,
            'hidden_comments' => $hiddenComments,
            'anonymous_comments' => $anonymousComments,
            'today_comments' => $todayComments,
            'week_comments' => $weekComments,
            'month_comments' => $monthComments,
            'top_commented_knowledges' => $topCommentedKnowledges,
            'top_comment_users' => $topCommentUsers,
        ];
    }

    /**
     * コメント編集権限チェック
     */
    public function canEditComment(Comment $comment, User $user): bool
    {
        // 作成者は編集可能
        if ($comment->insert_user === $user->user_id) {
            return true;
        }

        // 管理者は編集可能（今後の実装）
        if ($this->isAdmin($user)) {
            return true;
        }

        return false;
    }

    /**
     * コメント削除権限チェック
     */
    public function canDeleteComment(Comment $comment, User $user): bool
    {
        // 作成者は削除可能
        if ($comment->insert_user === $user->user_id) {
            return true;
        }

        // ナレッジの作成者は削除可能
        if ($comment->knowledge->insert_user === $user->user_id) {
            return true;
        }

        // 管理者は削除可能（今後の実装）
        if ($this->isAdmin($user)) {
            return true;
        }

        return false;
    }

    /**
     * コメントモデレート権限チェック
     */
    public function canModerateComment(Comment $comment, User $user): bool
    {
        // 作成者はモデレート可能
        if ($comment->insert_user === $user->user_id) {
            return true;
        }

        // ナレッジの作成者はモデレート可能
        if ($comment->knowledge->insert_user === $user->user_id) {
            return true;
        }

        // 管理者はモデレート可能（今後の実装）
        if ($this->isAdmin($user)) {
            return true;
        }

        return false;
    }

    /**
     * 管理者権限チェック（今後の実装）
     */
    protected function isAdmin(User $user): bool
    {
        // 今後の実装：管理者ロールをチェック
        return false;
    }
}