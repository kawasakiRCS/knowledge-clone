<?php

namespace App\Models\Knowledge;

use App\Models\BaseModel;
use App\Models\Web\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * コメントモデル
 * 
 * @property int $comment_no
 * @property int $knowledge_id
 * @property string $comment
 * @property int $comment_status
 * @property int $anonymous
 * @property int $insert_user
 * @property \Carbon\Carbon $insert_datetime
 * @property int $update_user
 * @property \Carbon\Carbon $update_datetime
 * @property int $delete_flag
 */
class Comment extends BaseModel
{
    /**
     * テーブル名
     */
    protected $table = 'comments';

    /**
     * 主キー
     */
    protected $primaryKey = 'comment_no';

    /**
     * データベース接続名
     */
    protected $connection = 'knowledge_legacy';

    /**
     * 一括代入可能なカラム
     */
    protected $fillable = [
        'knowledge_id',
        'comment',
        'comment_status',
        'anonymous'
    ];

    /**
     * キャストするカラム
     */
    protected $casts = [
        'comment_no' => 'integer',
        'knowledge_id' => 'integer',
        'comment_status' => 'integer',
        'anonymous' => 'integer',
        'insert_user' => 'integer',
        'update_user' => 'integer',
        'delete_flag' => 'integer',
    ];

    /**
     * コメントステータスの定数
     */
    public const STATUS_ACTIVE = 0;    // アクティブ
    public const STATUS_HIDDEN = 1;    // 非表示

    /**
     * ナレッジとの関係
     */
    public function knowledge(): BelongsTo
    {
        return $this->belongsTo(Knowledge::class, 'knowledge_id', 'knowledge_id');
    }

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
     * いいねとの関係
     */
    public function likes(): HasMany
    {
        return $this->hasMany(LikeComment::class, 'comment_no', 'comment_no');
    }

    /**
     * 添付ファイルとの関係
     */
    public function files(): HasMany
    {
        return $this->hasMany(KnowledgeFile::class, 'comment_no', 'comment_no');
    }

    /**
     * アクティブなコメントのスコープ
     */
    public function scopeActive($query)
    {
        return $query->where('comment_status', self::STATUS_ACTIVE);
    }

    /**
     * 非匿名コメントのスコープ
     */
    public function scopeNotAnonymous($query)
    {
        return $query->where('anonymous', 0);
    }

    /**
     * いいね数を取得
     */
    public function getLikeCountAttribute(): int
    {
        return $this->likes()->count();
    }

    /**
     * コメント作成後の処理
     */
    protected static function booted()
    {
        parent::booted();

        static::created(function ($comment) {
            // ナレッジのコメント数を更新
            $comment->knowledge?->updateCommentCount();

            // 通知送信（非同期で実行することを推奨）
            try {
                $notificationService = app(\App\Services\CommentNotificationService::class);
                $notificationService->sendCommentNotification($comment);
            } catch (\Exception $e) {
                logger()->error('Comment notification failed', [
                    'comment_id' => $comment->comment_no,
                    'error' => $e->getMessage()
                ]);
            }
        });

        static::deleted(function ($comment) {
            // ナレッジのコメント数を更新
            $comment->knowledge?->updateCommentCount();
        });
    }
}