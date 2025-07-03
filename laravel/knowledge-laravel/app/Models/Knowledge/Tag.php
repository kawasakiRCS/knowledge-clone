<?php

namespace App\Models\Knowledge;

use App\Models\BaseModel;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * タグモデル
 * 
 * @property int $tag_id
 * @property string $tag_name
 * @property int $insert_user
 * @property \Carbon\Carbon $insert_datetime
 * @property int $update_user
 * @property \Carbon\Carbon $update_datetime
 * @property int $delete_flag
 */
class Tag extends BaseModel
{
    /**
     * テーブル名
     */
    protected $table = 'tags';

    /**
     * 主キー
     */
    protected $primaryKey = 'tag_id';

    /**
     * データベース接続名
     */
    protected $connection = 'knowledge_legacy';

    /**
     * 一括代入可能なカラム
     */
    protected $fillable = [
        'tag_name'
    ];

    /**
     * キャストするカラム
     */
    protected $casts = [
        'tag_id' => 'integer',
        'insert_user' => 'integer',
        'update_user' => 'integer',
        'delete_flag' => 'integer',
    ];

    /**
     * ナレッジとの多対多関係
     */
    public function knowledges(): BelongsToMany
    {
        return $this->belongsToMany(Knowledge::class, 'knowledge_tags', 'tag_id', 'knowledge_id');
    }

    /**
     * タグ名で検索するスコープ
     */
    public function scopeByName($query, $name)
    {
        return $query->where('tag_name', 'LIKE', "%{$name}%");
    }

    /**
     * 人気タグ（使用回数順）のスコープ
     */
    public function scopePopular($query, $limit = 10)
    {
        return $query->withCount('knowledges')
                    ->orderBy('knowledges_count', 'desc')
                    ->limit($limit);
    }

    /**
     * タグの使用回数を取得
     */
    public function getUsageCountAttribute(): int
    {
        return $this->knowledges()->count();
    }
}