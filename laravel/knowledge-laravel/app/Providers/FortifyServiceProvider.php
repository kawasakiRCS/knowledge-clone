<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Actions\Fortify\UpdateUserPassword;
use App\Actions\Fortify\UpdateUserProfileInformation;
use App\Models\Web\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Fortify::createUsersUsing(CreateNewUser::class);
        Fortify::updateUserProfileInformationUsing(UpdateUserProfileInformation::class);
        Fortify::updateUserPasswordsUsing(UpdateUserPassword::class);
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });

        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        // カスタム認証ロジック
        Fortify::authenticateUsing(function (Request $request) {
            $user = User::where('user_key', $request->user_key)
                        ->orWhere('mail_address', $request->user_key)
                        ->first();

            if ($user && $this->validatePassword($user, $request->password)) {
                return $user;
            }

            return null;
        });
    }

    /**
     * 既存システムのパスワード形式をサポートする認証
     */
    protected function validatePassword(User $user, string $password): bool
    {
        // 既存システムのパスワード形式（salt + password のハッシュ）をチェック
        if ($user->salt) {
            $legacyHash = md5($user->salt . $password);
            if (hash_equals($user->password, $legacyHash)) {
                return true;
            }
        }

        // Laravel標準のハッシュ方式もサポート
        return password_verify($password, $user->password);
    }
}