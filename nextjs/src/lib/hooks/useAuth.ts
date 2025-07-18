/**
 * 認証状態管理フック
 * 
 * @description NextAuthセッションを使用したユーザー認証状態管理
 * @since 1.0.0
 */

'use client';

import { useSession } from 'next-auth/react';
import { LoginedUser } from '@/types/auth';

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
  const { data: session, status } = useSession();



  if (status === 'loading') {
    return {
      isLoggedIn: false,
      user: null,
      unreadCount: 0,
      loading: true,
    };
  }

  if (session?.user && 'userId' in session.user) {
    const loginedUser = session.user as any; // NextAuthのセッション構造
    
    return {
      isLoggedIn: true,
      user: {
        id: loginedUser.userId,
        name: loginedUser.userName,
        email: `${loginedUser.userName}@knowledge.local`, // 仮想メールアドレス
        isAdmin: loginedUser.role === 'admin',
        icon: undefined, // TODO: ユーザーアイコンの実装
      },
      unreadCount: loginedUser.unreadCount || 0,
      loading: false,
    };
  }

  return {
    isLoggedIn: false,
    user: null,
    unreadCount: 0,
    loading: false,
  };
}