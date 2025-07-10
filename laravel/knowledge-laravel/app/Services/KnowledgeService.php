<?php

namespace App\Services;

use App\Models\Knowledge\Knowledge;
use App\Models\Knowledge\Tag;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class KnowledgeService
{
    /**
     * ユーザーがアクセス可能なナレッジを取得
     */
    public function getAccessibleKnowledges(User $user, array $filters = [], string $sort = 'updated', int $perPage = 20): LengthAwarePaginator
    {
        $query = Knowledge::with(['creator', 'tags', 'templateMaster'])
                          ->accessibleBy($user->user_id);

        // フィルター適用
        $this->applyFilters($query, $filters);

        // ソート適用
        $this->applySorting($query, $sort);

        return $query->paginate($perPage);
    }

    /**
     * ナレッジを作成
     */
    public function createKnowledge(array $data, User $user): Knowledge
    {
        return DB::transaction(function () use ($data, $user) {
            // ナレッジ作成
            $knowledge = Knowledge::create(array_merge($data, [
                'insert_user' => $user->user_id,
            ]));

            // タグ処理
            if (isset($data['tags'])) {
                $this->syncTags($knowledge, $data['tags']);
            }

            // アクセス権限設定
            $this->syncPermissions($knowledge, $data);

            return $knowledge->load(['creator', 'tags', 'templateMaster']);
        });
    }

    /**
     * ナレッジを更新
     */
    public function updateKnowledge(Knowledge $knowledge, array $data, User $user): Knowledge
    {
        if (!$knowledge->isEditableBy($user->user_id)) {
            throw new \Exception('このナレッジの編集権限がありません。');
        }

        return DB::transaction(function () use ($knowledge, $data) {
            // ナレッジ更新
            $knowledge->update($data);

            // タグ処理
            if (array_key_exists('tags', $data)) {
                $this->syncTags($knowledge, $data['tags'] ?? []);
            }

            // アクセス権限更新
            $this->syncPermissions($knowledge, $data);

            return $knowledge->load(['creator', 'tags', 'templateMaster']);
        });
    }

    /**
     * ナレッジを削除
     */
    public function deleteKnowledge(Knowledge $knowledge, User $user): void
    {
        if (!$knowledge->isEditableBy($user->user_id)) {
            throw new \Exception('このナレッジの削除権限がありません。');
        }

        $knowledge->delete();
    }

    /**
     * いいね機能
     */
    public function toggleLike(Knowledge $knowledge, User $user): array
    {
        if (!$knowledge->isAccessibleBy($user->user_id)) {
            throw new \Exception('このナレッジへのアクセス権限がありません。');
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

        return [
            'liked' => $liked,
            'like_count' => $knowledge->fresh()->like_count,
            'message' => $message,
        ];
    }

    /**
     * 閲覧履歴を記録
     */
    public function recordView(Knowledge $knowledge, User $user): void
    {
        if (!$knowledge->isAccessibleBy($user->user_id)) {
            return;
        }

        // 同じユーザーの同じナレッジの閲覧は1日1回まで記録
        $today = now()->toDateString();
        $existingView = $knowledge->viewHistories()
                                 ->where('insert_user', $user->user_id)
                                 ->whereDate('view_date_time', $today)
                                 ->first();

        if (!$existingView) {
            $knowledge->viewHistories()->create([
                'view_date_time' => $today,
            ]);
        }
    }

    /**
     * 関連ナレッジを取得
     */
    public function getRelatedKnowledges(Knowledge $knowledge, User $user, int $limit = 5): Collection
    {
        $tagIds = $knowledge->tags->pluck('tag_id')->toArray();
        
        if (empty($tagIds)) {
            return collect();
        }

        return Knowledge::with(['creator', 'tags'])
                       ->accessibleBy($user->user_id)
                       ->where('knowledge_id', '!=', $knowledge->knowledge_id)
                       ->whereHas('tags', function ($query) use ($tagIds) {
                           $query->whereIn('tags.tag_id', $tagIds);
                       })
                       ->orderBy('like_count', 'desc')
                       ->orderBy('view_count', 'desc')
                       ->limit($limit)
                       ->get();
    }

    /**
     * フィルターを適用
     */
    protected function applyFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['search'])) {
            $searchTerm = $filters['search'];
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('content', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('tag_names', 'LIKE', "%{$searchTerm}%");
            });
        }

        if (!empty($filters['tag'])) {
            $query->whereHas('tags', function ($q) use ($filters) {
                $q->where('tag_name', $filters['tag']);
            });
        }

        if (!empty($filters['template'])) {
            $query->where('type_id', $filters['template']);
        }

        if (isset($filters['public_flag'])) {
            $query->where('public_flag', $filters['public_flag']);
        }

        if (!empty($filters['creator'])) {
            $query->whereHas('creator', function ($q) use ($filters) {
                $q->where('user_name', 'LIKE', "%{$filters['creator']}%")
                  ->orWhere('user_key', 'LIKE', "%{$filters['creator']}%");
            });
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('insert_datetime', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('insert_datetime', '<=', $filters['date_to']);
        }
    }

    /**
     * ソートを適用
     */
    protected function applySorting(Builder $query, string $sort): void
    {
        switch ($sort) {
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
            case 'comments':
                $query->orderBy('comment_count', 'desc');
                break;
            default:
                $query->orderBy('update_datetime', 'desc');
        }
    }

    /**
     * タグを同期
     */
    protected function syncTags(Knowledge $knowledge, array $tagNames): void
    {
        $tagIds = [];
        $tagNamesForStorage = [];

        foreach ($tagNames as $tagName) {
            $tagName = trim($tagName);
            if (empty($tagName)) {
                continue;
            }

            $tag = Tag::firstOrCreate(['tag_name' => $tagName]);
            $tagIds[] = $tag->tag_id;
            $tagNamesForStorage[] = $tag->tag_name;
        }

        // 多対多リレーションを同期（insert_userとタイムスタンプを含む）
        $syncData = [];
        $now = now();
        $userId = auth()->id() ?? $knowledge->insert_user;
        
        foreach ($tagIds as $tagId) {
            $syncData[$tagId] = [
                'insert_user' => $userId,
                'insert_datetime' => $now,
                'update_user' => $userId,
                'update_datetime' => $now,
            ];
        }
        
        $knowledge->tags()->sync($syncData);

        // tag_namesフィールドも更新（既存システムとの互換性）
        $knowledge->update([
            'tag_names' => implode(',', $tagNamesForStorage)
        ]);
    }

    /**
     * アクセス権限を同期
     */
    protected function syncPermissions(Knowledge $knowledge, array $data): void
    {
        // アクセス権限
        if (array_key_exists('allowed_users', $data)) {
            $knowledge->allowedUsers()->sync($data['allowed_users'] ?? []);
        }

        if (array_key_exists('allowed_groups', $data)) {
            $knowledge->allowedGroups()->sync($data['allowed_groups'] ?? []);
        }

        // 編集権限
        if (array_key_exists('edit_users', $data)) {
            $knowledge->editUsers()->sync($data['edit_users'] ?? []);
        }

        if (array_key_exists('edit_groups', $data)) {
            $knowledge->editGroups()->sync($data['edit_groups'] ?? []);
        }
    }
}