/**
 * 認証状態管理フック
 * 
 * @description ユーザーの認証状態とメタデータを管理
 * @since 1.0.0
 */

import { useState, useEffect } from 'react';

export interface User {
  id: number;
  name: string;
  email?: string;
  isAdmin: boolean;
  icon?: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  unreadCount: number;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    unreadCount: 0,
    loading: true,
  });

  useEffect(() => {
    // TODO: 実際の認証API呼び出しを実装
    // 現在はモック実装
    const checkAuth = async () => {
      try {
        // APIから認証状態を取得
        // const response = await fetch('/api/auth/me');
        // const data = await response.json();
        
        // 一時的なモック実装
        const mockUser = localStorage.getItem('mockUser');
        if (mockUser) {
          const user = JSON.parse(mockUser);
          setAuthState({
            isLoggedIn: true,
            user,
            unreadCount: 0, // TODO: API経由で取得
            loading: false,
          });
        } else {
          setAuthState({
            isLoggedIn: false,
            user: null,
            unreadCount: 0,
            loading: false,
          });
        }
      } catch (error) {
        console.error('認証状態の確認に失敗:', error);
        setAuthState({
          isLoggedIn: false,
          user: null,
          unreadCount: 0,
          loading: false,
        });
      }
    };

    checkAuth();
  }, []);

  return authState;
}