<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * ベースモデルクラス
 * 既存のKnowledgeシステムの共通フィールドを定義
 */
abstract class BaseModel extends Model
{

    /**
     * 作成日時のカラム名
     */
    public const CREATED_AT = 'insert_datetime';

    /**
     * 更新日時のカラム名
     */
    public const UPDATED_AT = 'update_datetime';

    /**
     * 削除フラグのカラム名
     */
    public const DELETED_AT = 'delete_flag';

    /**
     * 日付として扱うカラム
     */
    protected $dates = [
        'insert_datetime',
        'update_datetime'
    ];

    /**
     * JSONにキャストするカラム
     */
    protected $casts = [
        'insert_datetime' => 'datetime',
        'update_datetime' => 'datetime',
        'delete_flag' => 'integer',
        'insert_user' => 'integer',
        'update_user' => 'integer',
    ];

    /**
     * 一括代入不可能なカラム
     */
    protected $guarded = [
        'insert_user',
        'insert_datetime',
        'update_user',
        'update_datetime',
        'delete_flag'
    ];

    /**
     * モデルの初期化
     */
    protected static function boot()
    {
        parent::boot();

        // 作成時に自動的にユーザーIDをセット
        static::creating(function ($model) {
            if (auth()->check()) {
                $model->insert_user = auth()->user()->user_id;
                $model->update_user = auth()->user()->user_id;
            }
        });

        // 更新時に自動的にユーザーIDをセット
        static::updating(function ($model) {
            if (auth()->check()) {
                $model->update_user = auth()->user()->user_id;
            }
        });

        // 削除時にdelete_flagを設定（ソフトデリート）
        static::deleting(function ($model) {
            if (!$model->isForceDeleting()) {
                $model->delete_flag = 1;
                $model->save();
                return false; // 実際の削除を阻止
            }
        });
    }

    /**
     * ソフトデリートされていない（delete_flag != 1）レコードのみを取得
     */
    public function scopeNotDeleted($query)
    {
        $table = $query->getModel()->getTable();
        return $query->where(function ($q) use ($table) {
            $q->whereNull($table . '.delete_flag')
              ->orWhere($table . '.delete_flag', '!=', 1);
        });
    }

    /**
     * 削除されたレコードも含める
     */
    public function scopeWithDeleted($query)
    {
        return $query->withoutGlobalScope('notDeleted');
    }

    /**
     * 削除されたレコードのみを取得
     */
    public function scopeOnlyDeleted($query)
    {
        $table = $query->getModel()->getTable();
        return $query->where($table . '.delete_flag', 1);
    }

    /**
     * グローバルスコープを適用
     */
    protected static function booted()
    {
        static::addGlobalScope('notDeleted', function ($builder) {
            $builder->notDeleted();
        });
    }
}