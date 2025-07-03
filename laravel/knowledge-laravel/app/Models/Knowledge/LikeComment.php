<?php

namespace App\Models\Knowledge;

use App\Models\BaseModel;
use App\Models\Web\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * コメントいいねモデル
 * 
 * @property int $like_comment_no
 * @property int $comment_no
 * @property int $insert_user
 * @property \Carbon\Carbon $insert_datetime
 * @property int $update_user
 * @property \Carbon\Carbon $update_datetime
 * @property int $delete_flag
 */
class LikeComment extends BaseModel
{
    /**
     * テーブル名
     */
    protected $table = 'like_comments';

    /**
     * 主キー
     */
    protected $primaryKey = 'like_comment_no';

    /**
     * データベース接続名
     */
    protected $connection = 'knowledge_legacy';

    /**
     * 一括代入可能なカラム
     */
    protected $fillable = [
        'comment_no'
    ];

    /**
     * キャストするカラム
     */
    protected $casts = [
        'like_comment_no' => 'integer',
        'comment_no' => 'integer',
        'insert_user' => 'integer',
        'update_user' => 'integer',
        'delete_flag' => 'integer',
    ];

    /**
     * コメントとの関係
     */
    public function comment(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'comment_no', 'comment_no');
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
}