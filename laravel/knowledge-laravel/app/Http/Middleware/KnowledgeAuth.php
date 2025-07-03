<?php

namespace App\Http\Middleware;

use App\Services\Auth\LdapAuthService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class KnowledgeAuth
{
    public function __construct(
        protected LdapAuthService $ldapAuthService
    ) {}

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 既にログイン済みの場合はそのまま通す
        if (Auth::check()) {
            return $next($request);
        }

        // ログインページの場合はそのまま通す
        if ($request->routeIs('login') || $request->routeIs('register')) {
            return $next($request);
        }

        // 認証が必要な場合はログインページにリダイレクト
        return redirect()->route('login');
    }

    /**
     * LDAP認証を試行（今後の実装用）
     */
    protected function attemptLdapAuth(Request $request): bool
    {
        if (!$this->ldapAuthService->isEnabled()) {
            return false;
        }

        // 自動ログイン用のロジック（SSO等）
        // 現在は未実装
        return false;
    }
}