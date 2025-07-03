<?php

namespace App\Models\Web;

use App\Models\BaseModel;
use App\Models\Knowledge\Knowledge;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * グループモデル
 * 
 * @property int $group_id
 * @property string $group_name
 * @property string $description
 * @property int $insert_user
 * @property \Carbon\Carbon $insert_datetime
 * @property int $update_user
 * @property \Carbon\Carbon $update_datetime
 * @property int $delete_flag
 */
class Group extends BaseModel
{
    /**
     * テーブル名
     */
    protected $table = 'groups';

    /**
     * 主キー
     */
    protected $primaryKey = 'group_id';

    /**
     * データベース接続名
     */
    protected $connection = 'knowledge_legacy';

    /**
     * 一括代入可能なカラム
     */
    protected $fillable = [
        'group_name',
        'description'
    ];

    /**
     * キャストするカラム
     */
    protected $casts = [
        'group_id' => 'integer',
        'insert_user' => 'integer',
        'update_user' => 'integer',
        'delete_flag' => 'integer',
    ];

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
     * 所属ユーザーとの関係
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_groups', 'group_id', 'user_id');
    }

    /**
     * アクセス可能なナレッジとの関係
     */
    public function accessibleKnowledges(): BelongsToMany
    {
        return $this->belongsToMany(Knowledge::class, 'knowledge_groups', 'group_id', 'knowledge_id');
    }

    /**
     * 編集可能なナレッジとの関係
     */
    public function editableKnowledges(): BelongsToMany
    {
        return $this->belongsToMany(Knowledge::class, 'knowledge_edit_groups', 'group_id', 'knowledge_id');
    }

    /**
     * アクティブグループのスコープ
     */
    public function scopeActive($query)
    {
        return $query->where('delete_flag', '!=', 1);
    }

    /**
     * グループ名で検索するスコープ
     */
    public function scopeByName($query, $name)
    {
        return $query->where('group_name', 'LIKE', "%{$name}%");
    }

    /**
     * 特定ユーザーが所属するグループのスコープ
     */
    public function scopeForUser($query, $userId)
    {
        return $query->whereHas('users', function ($userQuery) use ($userId) {
            $userQuery->where('user_id', $userId);
        });
    }

    /**
     * グループのメンバー数を取得
     */
    public function getMemberCountAttribute(): int
    {
        return $this->users()->count();
    }

    /**
     * 特定ユーザーがこのグループのメンバーかチェック
     */
    public function hasMember($userId): bool
    {
        return $this->users()->where('user_id', $userId)->exists();
    }
}