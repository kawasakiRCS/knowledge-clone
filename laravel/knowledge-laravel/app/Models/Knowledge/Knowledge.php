<?php

namespace App\Models\Knowledge;

use App\Models\BaseModel;
use App\Models\Web\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Scout\Searchable;

/**
 * ナレッジモデル
 * 
 * @property int $knowledge_id
 * @property string $title
 * @property string $content
 * @property int $public_flag
 * @property string $tag_ids
 * @property string $tag_names
 * @property int $like_count
 * @property int $comment_count
 * @property int $view_count
 * @property int $type_id
 * @property int $notify_status
 * @property int $point
 * @property int $anonymous
 * @property int $insert_user
 * @property \Carbon\Carbon $insert_datetime
 * @property int $update_user
 * @property \Carbon\Carbon $update_datetime
 * @property int $delete_flag
 */
class Knowledge extends BaseModel
{
    use Searchable;

    /**
     * テーブル名
     */
    protected $table = 'knowledges';

    /**
     * 主キー
     */
    protected $primaryKey = 'knowledge_id';

    /**
     * データベース接続名（既存DBを使用する場合）
     */
    protected $connection = 'knowledge_legacy';

    /**
     * 一括代入可能なカラム
     */
    protected $fillable = [
        'title',
        'content',
        'public_flag',
        'tag_ids',
        'tag_names',
        'type_id',
        'notify_status',
        'point',
        'anonymous'
    ];

    /**
     * キャストするカラム
     */
    protected $casts = [
        'knowledge_id' => 'integer',
        'public_flag' => 'integer',
        'like_count' => 'integer',
        'comment_count' => 'integer',
        'view_count' => 'integer',
        'type_id' => 'integer',
        'notify_status' => 'integer',
        'point' => 'integer',
        'anonymous' => 'integer',
        'insert_user' => 'integer',
        'update_user' => 'integer',
        'delete_flag' => 'integer',
    ];

    /**
     * 公開フラグの定数
     */
    public const PUBLIC_FLAG_PRIVATE = 0;  // 非公開
    public const PUBLIC_FLAG_PUBLIC = 1;   // 公開
    public const PUBLIC_FLAG_PROTECT = 2;  // 保護（グループ・ユーザー限定）

    /**
     * 通知ステータスの定数
     */
    public const NOTIFY_STATUS_INIT = 0;     // 初期状態
    public const NOTIFY_STATUS_NOTIFY = 1;   // 通知済み

    /**
     * 作成者との関係
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'insert_user', 'user_id');
    }

    /**
     * 更新者との関係
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'update_user', 'user_id');
    }

    /**
     * コメントとの関係
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class, 'knowledge_id', 'knowledge_id');
    }

    /**
     * いいねとの関係
     */
    public function likes(): HasMany
    {
        return $this->hasMany(Like::class, 'knowledge_id', 'knowledge_id');
    }

    /**
     * 添付ファイルとの関係
     */
    public function files(): HasMany
    {
        return $this->hasMany(KnowledgeFile::class, 'knowledge_id', 'knowledge_id');
    }

    /**
     * タグとの多対多関係
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'knowledge_tags', 'knowledge_id', 'tag_id');
    }

    /**
     * 閲覧履歴との関係
     */
    public function viewHistories(): HasMany
    {
        return $this->hasMany(ViewHistory::class, 'knowledge_id', 'knowledge_id');
    }

    /**
     * テンプレートとの関係
     */
    public function templateMaster(): BelongsTo
    {
        return $this->belongsTo(TemplateMaster::class, 'type_id', 'type_id');
    }

    /**
     * アクセス許可ユーザーとの関係
     */
    public function allowedUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'knowledge_users', 'knowledge_id', 'user_id');
    }

    /**
     * アクセス許可グループとの関係
     */
    public function allowedGroups(): BelongsToMany
    {
        return $this->belongsToMany(\App\Models\Web\Group::class, 'knowledge_groups', 'knowledge_id', 'group_id');
    }

    /**
     * 編集許可ユーザーとの関係
     */
    public function editUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'knowledge_edit_users', 'knowledge_id', 'user_id');
    }

    /**
     * 編集許可グループとの関係
     */
    public function editGroups(): BelongsToMany
    {
        return $this->belongsToMany(\App\Models\Web\Group::class, 'knowledge_edit_groups', 'knowledge_id', 'group_id');
    }

    /**
     * 検索可能なフィールド
     */
    public function toSearchableArray(): array
    {
        return [
            'knowledge_id' => $this->knowledge_id,
            'title' => $this->title,
            'content' => $this->content,
            'tag_names' => $this->tag_names,
        ];
    }

    /**
     * 公開されているナレッジのスコープ
     */
    public function scopePublic($query)
    {
        return $query->where('public_flag', self::PUBLIC_FLAG_PUBLIC);
    }

    /**
     * 特定ユーザーがアクセス可能なナレッジのスコープ
     */
    public function scopeAccessibleBy($query, $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('public_flag', self::PUBLIC_FLAG_PUBLIC)
              ->orWhere('insert_user', $userId)
              ->orWhereHas('allowedUsers', function ($userQuery) use ($userId) {
                  $userQuery->where('user_id', $userId);
              })
              ->orWhereHas('allowedGroups.users', function ($groupUserQuery) use ($userId) {
                  $groupUserQuery->where('user_id', $userId);
              });
        });
    }

    /**
     * いいね数を更新
     */
    public function updateLikeCount(): void
    {
        $this->like_count = $this->likes()->count();
        $this->save();
    }

    /**
     * コメント数を更新
     */
    public function updateCommentCount(): void
    {
        $this->comment_count = $this->comments()->count();
        $this->save();
    }

    /**
     * 閲覧数を増加
     */
    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }

    /**
     * ユーザーがこのナレッジにアクセス可能かチェック
     */
    public function isAccessibleBy($userId): bool
    {
        if ($this->public_flag === self::PUBLIC_FLAG_PUBLIC) {
            return true;
        }

        if ($this->insert_user === $userId) {
            return true;
        }

        if ($this->allowedUsers()->where('user_id', $userId)->exists()) {
            return true;
        }

        // グループアクセス権限のチェック
        return $this->allowedGroups()
            ->whereHas('users', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })->exists();
    }

    /**
     * ユーザーがこのナレッジを編集可能かチェック
     */
    public function isEditableBy($userId): bool
    {
        if ($this->insert_user === $userId) {
            return true;
        }

        if ($this->editUsers()->where('user_id', $userId)->exists()) {
            return true;
        }

        // グループ編集権限のチェック
        return $this->editGroups()
            ->whereHas('users', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })->exists();
    }
}