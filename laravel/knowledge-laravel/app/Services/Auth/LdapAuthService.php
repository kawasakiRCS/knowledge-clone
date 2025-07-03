<?php

namespace App\Services\Auth;

use App\Models\Web\User;
use Exception;
use Illuminate\Support\Facades\Log;

class LdapAuthService
{
    protected array $config;

    public function __construct()
    {
        $this->config = config('ldap.connections.default');
    }

    /**
     * LDAP認証を試行
     */
    public function authenticate(string $username, string $password): ?User
    {
        try {
            if (!$this->isEnabled()) {
                return null;
            }

            // LDAP接続
            $connection = $this->connect();
            if (!$connection) {
                return null;
            }

            // ユーザー検索
            $userDn = $this->findUser($connection, $username);
            if (!$userDn) {
                Log::info('LDAP user not found', ['username' => $username]);
                return null;
            }

            // パスワード認証
            if (!$this->bind($connection, $userDn, $password)) {
                Log::info('LDAP authentication failed', ['username' => $username]);
                return null;
            }

            // ユーザー情報取得
            $userInfo = $this->getUserInfo($connection, $userDn);
            
            // ローカルユーザーとして同期
            $user = $this->syncUser($username, $userInfo);

            Log::info('LDAP authentication successful', ['username' => $username]);
            
            return $user;

        } catch (Exception $e) {
            Log::error('LDAP authentication error', [
                'username' => $username,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * LDAP認証が有効かチェック
     */
    public function isEnabled(): bool
    {
        return !empty($this->config['hosts'][0]) && 
               !empty($this->config['base_dn']);
    }

    /**
     * LDAP接続を確立
     */
    protected function connect()
    {
        $host = $this->config['hosts'][0];
        $port = $this->config['port'];
        
        $connection = ldap_connect($host, $port);
        
        if (!$connection) {
            Log::error('LDAP connection failed', ['host' => $host, 'port' => $port]);
            return false;
        }

        // オプション設定
        ldap_set_option($connection, LDAP_OPT_PROTOCOL_VERSION, 3);
        ldap_set_option($connection, LDAP_OPT_REFERRALS, 0);
        ldap_set_option($connection, LDAP_OPT_NETWORK_TIMEOUT, $this->config['timeout']);

        // SSL/TLS設定
        if ($this->config['use_tls']) {
            if (!ldap_start_tls($connection)) {
                Log::error('LDAP TLS start failed');
                return false;
            }
        }

        return $connection;
    }

    /**
     * 管理者としてバインド
     */
    protected function adminBind($connection): bool
    {
        if (empty($this->config['username']) || empty($this->config['password'])) {
            return true; // 匿名バインド
        }

        return ldap_bind($connection, $this->config['username'], $this->config['password']);
    }

    /**
     * ユーザーを検索
     */
    protected function findUser($connection, string $username): ?string
    {
        if (!$this->adminBind($connection)) {
            Log::error('LDAP admin bind failed');
            return null;
        }

        $baseDn = $this->config['base_dn'];
        $filter = "(|(sAMAccountName={$username})(userPrincipalName={$username})(mail={$username}))";
        
        $search = ldap_search($connection, $baseDn, $filter, ['dn']);
        
        if (!$search) {
            return null;
        }

        $entries = ldap_get_entries($connection, $search);
        
        if ($entries['count'] === 0) {
            return null;
        }

        return $entries[0]['dn'];
    }

    /**
     * ユーザーパスワードでバインド
     */
    protected function bind($connection, string $userDn, string $password): bool
    {
        return ldap_bind($connection, $userDn, $password);
    }

    /**
     * ユーザー情報を取得
     */
    protected function getUserInfo($connection, string $userDn): array
    {
        $search = ldap_read($connection, $userDn, '(objectClass=*)', [
            'sAMAccountName',
            'userPrincipalName', 
            'displayName',
            'givenName',
            'sn',
            'mail',
            'department',
            'title'
        ]);

        if (!$search) {
            return [];
        }

        $entries = ldap_get_entries($connection, $search);
        
        if ($entries['count'] === 0) {
            return [];
        }

        $entry = $entries[0];
        
        return [
            'username' => $entry['samaccountname'][0] ?? '',
            'email' => $entry['mail'][0] ?? '',
            'display_name' => $entry['displayname'][0] ?? '',
            'first_name' => $entry['givenname'][0] ?? '',
            'last_name' => $entry['sn'][0] ?? '',
            'department' => $entry['department'][0] ?? '',
            'title' => $entry['title'][0] ?? '',
        ];
    }

    /**
     * ローカルユーザーとして同期
     */
    protected function syncUser(string $username, array $userInfo): User
    {
        $user = User::where('user_key', $username)->first();

        if (!$user) {
            // 新規ユーザー作成
            $user = User::create([
                'user_key' => $username,
                'user_name' => $userInfo['display_name'] ?: $username,
                'mail_address' => $userInfo['email'] ?: "{$username}@example.com",
                'auth_ldap' => 1,
                'password' => '', // LDAPユーザーはパスワード不要
                'salt' => null,
                'locale_key' => 'ja',
            ]);
        } else {
            // 既存ユーザー更新
            $user->update([
                'user_name' => $userInfo['display_name'] ?: $user->user_name,
                'mail_address' => $userInfo['email'] ?: $user->mail_address,
                'auth_ldap' => 1,
            ]);
        }

        return $user;
    }
}