<?php

namespace App\Models\Web;

use App\Models\BaseModel;
use App\Models\Knowledge\Knowledge;
use App\Models\Knowledge\Comment;
use App\Models\Knowledge\Like;
use App\Models\Knowledge\LikeComment;
use App\Models\Knowledge\ViewHistory;
use Illuminate\Auth\Authenticatable;
use Illuminate\Auth\MustVerifyEmail;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\Access\Authorizable;
use Illuminate\Notifications\Notifiable;

/**
 * ユーザーモデル
 * 
 * @property int $user_id
 * @property string $user_key
 * @property string $user_name
 * @property string $password
 * @property string $salt
 * @property string $locale_key
 * @property string $mail_address
 * @property int $auth_ldap
 * @property string $row_id
 * @property int $insert_user
 * @property \Carbon\Carbon $insert_datetime
 * @property int $update_user
 * @property \Carbon\Carbon $update_datetime
 * @property int $delete_flag
 */
class User extends BaseModel implements
    AuthenticatableContract,
    AuthorizableContract,
    CanResetPasswordContract
{
    use Authenticatable, Authorizable, CanResetPassword, MustVerifyEmail, Notifiable;

    /**
     * テーブル名
     */
    protected $table = 'users';

    /**
     * 主キー
     */
    protected $primaryKey = 'user_id';

    /**
     * データベース接続名
     */
    protected $connection = 'knowledge_legacy';

    /**
     * 一括代入可能なカラム
     */
    protected $fillable = [
        'user_key',
        'user_name',
        'password',
        'salt',
        'locale_key',
        'mail_address',
        'auth_ldap',
        'row_id'
    ];

    /**
     * 非表示カラム
     */
    protected $hidden = [
        'password',
        'salt',
        'remember_token',
    ];

    /**
     * キャストするカラム
     */
    protected $casts = [
        'user_id' => 'integer',
        'auth_ldap' => 'integer',
        'insert_user' => 'integer',
        'update_user' => 'integer',
        'delete_flag' => 'integer',
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * 認証に使用するユーザー識別子
     */
    public function getAuthIdentifierName()
    {
        return 'user_key';
    }

    /**
     * パスワード認証に使用するカラム名
     */
    public function getAuthPasswordName()
    {
        return 'password';
    }

    /**
     * メール認証に使用するメールアドレス
     */
    public function getEmailForVerification()
    {
        return $this->mail_address;
    }

    /**
     * 作成したナレッジとの関係
     */
    public function knowledges(): HasMany
    {
        return $this->hasMany(Knowledge::class, 'insert_user', 'user_id');
    }

    /**
     * 作成したコメントとの関係
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class, 'insert_user', 'user_id');
    }

    /**
     * いいねとの関係
     */
    public function likes(): HasMany
    {
        return $this->hasMany(Like::class, 'insert_user', 'user_id');
    }

    /**
     * コメントいいねとの関係
     */
    public function commentLikes(): HasMany
    {
        return $this->hasMany(LikeComment::class, 'insert_user', 'user_id');
    }

    /**
     * 閲覧履歴との関係
     */
    public function viewHistories(): HasMany
    {
        return $this->hasMany(ViewHistory::class, 'insert_user', 'user_id');
    }

    /**
     * アクセス可能なナレッジとの関係
     */
    public function accessibleKnowledges(): BelongsToMany
    {
        return $this->belongsToMany(Knowledge::class, 'knowledge_users', 'user_id', 'knowledge_id');
    }

    /**
     * 編集可能なナレッジとの関係
     */
    public function editableKnowledges(): BelongsToMany
    {
        return $this->belongsToMany(Knowledge::class, 'knowledge_edit_users', 'user_id', 'knowledge_id');
    }

    /**
     * 所属グループとの関係
     */
    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(Group::class, 'user_groups', 'user_id', 'group_id');
    }

    /**
     * LDAPユーザーのスコープ
     */
    public function scopeLdapUser($query)
    {
        return $query->where('auth_ldap', 1);
    }

    /**
     * ローカルユーザーのスコープ
     */
    public function scopeLocalUser($query)
    {
        return $query->where('auth_ldap', 0);
    }

    /**
     * アクティブユーザーのスコープ
     */
    public function scopeActive($query)
    {
        return $query->where('delete_flag', '!=', 1);
    }

    /**
     * ユーザーキーで検索するスコープ
     */
    public function scopeByKey($query, $userKey)
    {
        return $query->where('user_key', $userKey);
    }

    /**
     * ユーザーがLDAPユーザーかどうか
     */
    public function getIsLdapUserAttribute(): bool
    {
        return $this->auth_ldap === 1;
    }

    /**
     * ユーザーの表示名を取得
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->user_name ?: $this->user_key;
    }

    /**
     * ユーザーのナレッジ投稿数を取得
     */
    public function getKnowledgeCountAttribute(): int
    {
        return $this->knowledges()->count();
    }

    /**
     * ユーザーのコメント投稿数を取得
     */
    public function getCommentCountAttribute(): int
    {
        return $this->comments()->count();
    }

    /**
     * ユーザーの獲得いいね数を取得
     */
    public function getTotalLikesReceivedAttribute(): int
    {
        return $this->knowledges()->sum('like_count');
    }
}