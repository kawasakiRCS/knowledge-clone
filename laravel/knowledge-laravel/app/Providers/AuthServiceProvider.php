<?php

namespace App\Providers;

use App\Models\Web\User;
use App\Services\Auth\KnowledgeUserProvider;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        //
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // カスタムユーザープロバイダーを登録
        Auth::provider('knowledge_legacy', function ($app, array $config) {
            return new KnowledgeUserProvider($config['model']);
        });

        // ユーザー認証のカスタムロジック
        Auth::viaRequest('knowledge-token', function ($request) {
            // 既存システムとの互換性のためのカスタム認証ロジック
            // 必要に応じて実装
            return null;
        });
    }
}