/**
 * ログインページ
 * 
 * @description 旧システムauth/form.jspに対応するNext.jsページ
 * URL: /signin (旧システムのGETアクセス時のパス)
 */
'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { LoginForm } from '@/components/forms/LoginForm';
import { LoginFormData } from '@/types/auth';

function LoginPageContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  
  const page = searchParams.get('page');
  const loginError = searchParams.get('error') === 'true';
  const username = searchParams.get('username') || '';
  const password = searchParams.get('password') || '';

  // URLパラメータから認証説明の表示判定
  const showDescription = page !== null && page !== '/open/knowledge/list';
  
  // システム設定でサインアップ機能が有効かどうか（仮実装）
  const showSignup = true; // 実際はシステム設定から取得

  const handleSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // NextAuthのsignIn関数を使用して認証
      const { signIn } = await import('next-auth/react');
      
      const result = await signIn('credentials', {
        loginId: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.ok) {
        // ログイン成功時の処理
        const redirectTo = data.page || '/index';
        window.location.href = redirectTo;
      } else {
        // ログイン失敗時の処理
        const url = new URL(window.location.href);
        url.searchParams.set('error', 'true');
        url.searchParams.set('username', data.username);
        window.location.href = url.toString();
      }
    } catch (error) {
      console.error('Login error:', error);
      // エラー処理
      const url = new URL(window.location.href);
      url.searchParams.set('error', 'true');
      url.searchParams.set('username', data.username);
      window.location.href = url.toString();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <LoginForm
        onSubmit={handleSubmit}
        initialValues={{ username, password }}
        loginError={loginError}
        showDescription={showDescription}
        showSignup={showSignup}
        redirectTo={page || undefined}
      />
      {isLoading && (
        <div className="text-center">
          <div>サインイン中...</div>
        </div>
      )}
    </MainLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}