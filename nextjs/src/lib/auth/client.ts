/**
 * クライアントサイド認証ユーティリティ
 * 
 * @description 旧システムの認証機能をNext.jsで再実装
 */
import { LoginFormData, AuthenticationResult, LoginedUser } from '@/types/auth';

/**
 * ログイン実行
 */
export async function signIn(credentials: LoginFormData): Promise<AuthenticationResult> {
  try {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      return {
        success: true,
        user: result.user,
      };
    } else {
      return {
        success: false,
        error: result.error || 'ログインに失敗しました',
      };
    }
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      error: 'ネットワークエラーが発生しました',
    };
  }
}

/**
 * ログアウト実行
 */
export async function signOut(): Promise<void> {
  try {
    await fetch('/api/auth/signout', {
      method: 'POST',
    });
    
    // クライアントサイドの状態をクリア
    window.location.href = '/';
  } catch (error) {
    console.error('Sign out error:', error);
    // エラーが発生してもログアウト処理を続行
    window.location.href = '/';
  }
}

/**
 * 現在のユーザー情報を取得
 */
export async function getCurrentUser(): Promise<LoginedUser | null> {
  try {
    const response = await fetch('/api/auth/me');
    
    if (response.ok) {
      const result = await response.json();
      return result.user || null;
    }
    
    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * ユーザーがログインしているかチェック
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}