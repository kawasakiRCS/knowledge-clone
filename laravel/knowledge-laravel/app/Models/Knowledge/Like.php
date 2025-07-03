<?php

namespace App\Models\Knowledge;

use App\Models\BaseModel;
use App\Models\Web\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * いいねモデル（ナレッジ用）
 * 
 * @property int $like_no
 * @property int $knowledge_id
 * @property int $insert_user
 * @property \Carbon\Carbon $insert_datetime
 * @property int $update_user
 * @property \Carbon\Carbon $update_datetime
 * @property int $delete_flag
 */
class Like extends BaseModel
{
    /**
     * テーブル名
     */
    protected $table = 'likes';

    /**
     * 主キー
     */
    protected $primaryKey = 'like_no';

    /**
     * データベース接続名
     */
    protected $connection = 'knowledge_legacy';

    /**
     * 一括代入可能なカラム
     */
    protected $fillable = [
        'knowledge_id'
    ];

    /**
     * キャストするカラム
     */
    protected $casts = [
        'like_no' => 'integer',
        'knowledge_id' => 'integer',
        'insert_user' => 'integer',
        'update_user' => 'integer',
        'delete_flag' => 'integer',
    ];

    /**
     * ナレッジとの関係
     */
    public function knowledge(): BelongsTo
    {
        return $this->belongsTo(Knowledge::class, 'knowledge_id', 'knowledge_id');
    }

    /**
     * いいねしたユーザーとの関係
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'insert_user', 'user_id');
    }

    /**
     * 特定ユーザーのいいねを取得するスコープ
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('insert_user', $userId);
    }

    /**
     * いいね作成後の処理
     */
    protected static function booted()
    {
        parent::booted();

        static::created(function ($like) {
            // ナレッジのいいね数を更新
            $like->knowledge?->updateLikeCount();
        });

        static::deleted(function ($like) {
            // ナレッジのいいね数を更新
            $like->knowledge?->updateLikeCount();
        });
    }
}