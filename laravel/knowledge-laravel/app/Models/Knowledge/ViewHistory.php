<?php

namespace App\Models\Knowledge;

use App\Models\BaseModel;
use App\Models\Web\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * 閲覧履歴モデル
 * 
 * @property int $history_no
 * @property int $knowledge_id
 * @property int $view_user_id
 * @property \Carbon\Carbon $view_date_time
 * @property int $insert_user
 * @property \Carbon\Carbon $insert_datetime
 * @property int $update_user
 * @property \Carbon\Carbon $update_datetime
 * @property int $delete_flag
 */
class ViewHistory extends BaseModel
{
    /**
     * テーブル名
     */
    protected $table = 'view_histories';

    /**
     * 主キー
     */
    protected $primaryKey = 'history_no';

    /**
     * データベース接続名
     */
    protected $connection = 'knowledge_legacy';

    /**
     * 一括代入可能なカラム
     */
    protected $fillable = [
        'knowledge_id',
        'view_user_id',
        'view_date_time'
    ];

    /**
     * キャストするカラム
     */
    protected $casts = [
        'history_no' => 'integer',
        'knowledge_id' => 'integer',
        'view_user_id' => 'integer',
        'view_date_time' => 'datetime',
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
     * 閲覧ユーザーとの関係
     */
    public function viewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'view_user_id', 'user_id');
    }

    /**
     * 特定ユーザーの閲覧履歴を取得するスコープ
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('view_user_id', $userId);
    }

    /**
     * 最近の閲覧履歴を取得するスコープ
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('view_date_time', '>=', now()->subDays($days));
    }

    /**
     * 特定ナレッジの閲覧履歴を取得するスコープ
     */
    public function scopeForKnowledge($query, $knowledgeId)
    {
        return $query->where('knowledge_id', $knowledgeId);
    }

    /**
     * 閲覧履歴作成後の処理
     */
    protected static function booted()
    {
        parent::booted();

        static::created(function ($history) {
            // ナレッジの閲覧数を増加
            $history->knowledge?->incrementViewCount();
        });
    }
}