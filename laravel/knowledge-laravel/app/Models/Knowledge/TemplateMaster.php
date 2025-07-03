<?php

namespace App\Models\Knowledge;

use App\Models\BaseModel;
use App\Models\Web\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * テンプレートマスターモデル
 * 
 * @property int $type_id
 * @property string $type_name
 * @property string $type_icon
 * @property string $description
 * @property int $insert_user
 * @property \Carbon\Carbon $insert_datetime
 * @property int $update_user
 * @property \Carbon\Carbon $update_datetime
 * @property int $delete_flag
 */
class TemplateMaster extends BaseModel
{
    /**
     * テーブル名
     */
    protected $table = 'template_masters';

    /**
     * 主キー
     */
    protected $primaryKey = 'type_id';

    /**
     * データベース接続名
     */
    protected $connection = 'knowledge_legacy';

    /**
     * 一括代入可能なカラム
     */
    protected $fillable = [
        'type_name',
        'type_icon',
        'description'
    ];

    /**
     * キャストするカラム
     */
    protected $casts = [
        'type_id' => 'integer',
        'insert_user' => 'integer',
        'update_user' => 'integer',
        'delete_flag' => 'integer',
    ];

    /**
     * このテンプレートを使用するナレッジとの関係
     */
    public function knowledges(): HasMany
    {
        return $this->hasMany(Knowledge::class, 'type_id', 'type_id');
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
     * アクティブなテンプレートのスコープ
     */
    public function scopeActive($query)
    {
        return $query->where('delete_flag', '!=', 1);
    }

    /**
     * 人気テンプレート（使用回数順）のスコープ
     */
    public function scopePopular($query, $limit = 10)
    {
        return $query->withCount('knowledges')
                    ->orderBy('knowledges_count', 'desc')
                    ->limit($limit);
    }

    /**
     * テンプレートの使用回数を取得
     */
    public function getUsageCountAttribute(): int
    {
        return $this->knowledges()->count();
    }
}