<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Auth\EloquentUserProvider;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class KnowledgeUserProvider extends EloquentUserProvider
{
    /**
     * 既存のKnowledgeシステムのパスワード認証に対応
     */
    public function validateCredentials(Authenticatable $user, array $credentials): bool
    {
        $plain = $credentials['password'];

        // 既存システムのパスワード形式（salt + password のハッシュ）をチェック
        if ($user->salt) {
            // 既存システムのハッシュ方式：MD5(salt + password)
            $legacyHash = md5($user->salt . $plain);
            if (hash_equals($user->getAuthPassword(), $legacyHash)) {
                return true;
            }
        }

        // Laravel標準のハッシュ方式もサポート
        return Hash::check($plain, $user->getAuthPassword());
    }

    /**
     * ユーザーキーまたはメールアドレスでユーザーを取得
     */
    public function retrieveByCredentials(array $credentials): ?Authenticatable
    {
        if (empty($credentials) ||
           (count($credentials) === 1 &&
            str_contains($this->firstCredentialKey($credentials), 'password'))) {
            return null;
        }

        // Build a query for the given credentials.
        $query = $this->newModelQuery();

        foreach ($credentials as $key => $value) {
            if (str_contains($key, 'password')) {
                continue;
            }

            if (is_array($value) || $value instanceof \Arrayable) {
                $query->whereIn($key, $value);
            } else {
                // user_key または mail_address での認証をサポート
                if ($key === 'email' || $key === 'user_key') {
                    $query->where(function ($q) use ($value) {
                        $q->where('user_key', $value)
                          ->orWhere('mail_address', $value);
                    });
                } else {
                    $query->where($key, $value);
                }
            }
        }

        return $query->first();
    }

    /**
     * パスワードを更新
     */
    public function updatePassword(Authenticatable $user, string $password): void
    {
        // Laravel標準のハッシュ方式で保存
        $user->forceFill([
            'password' => Hash::make($password),
            'salt' => null, // saltは使用しない
        ])->save();
    }

    /**
     * 新しいユーザーを作成
     */
    public function createUser(array $attributes): Authenticatable
    {
        $model = $this->createModel();

        // user_keyが指定されていない場合は自動生成
        if (!isset($attributes['user_key'])) {
            $attributes['user_key'] = $this->generateUserKey($attributes['user_name'] ?? 'user');
        }

        // パスワードをハッシュ化
        if (isset($attributes['password'])) {
            $attributes['password'] = Hash::make($attributes['password']);
        }

        return $model->create($attributes);
    }

    /**
     * ユニークなuser_keyを生成
     */
    protected function generateUserKey(string $baseName): string
    {
        $baseKey = Str::slug($baseName);
        $userKey = $baseKey;
        $counter = 1;

        while ($this->createModel()->where('user_key', $userKey)->exists()) {
            $userKey = $baseKey . '_' . $counter;
            $counter++;
        }

        return $userKey;
    }

    /**
     * 最初の認証情報キーを取得
     */
    protected function firstCredentialKey(array $credentials): string
    {
        foreach ($credentials as $key => $value) {
            return $key;
        }

        return '';
    }
}