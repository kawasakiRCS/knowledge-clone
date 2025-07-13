'use client';

/**
 * パスワード忘れのリクエストページ
 * 
 * @description 旧システムの open/passwordinitialization/forgot_pass_request.jsp を移植
 */
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function ForgotPasswordRequestPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * メールアドレスのバリデーション
   */
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return 'メールアドレスは必須です';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return '有効なメールアドレスを入力してください';
    }
    
    return null;
  };

  /**
   * フォーム送信処理
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    const validationError = validateEmail(username);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/password/forgot-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 成功時は結果ページへ遷移
        router.push('/open/passwordinitialization/forgot_pass_result');
      } else {
        // エラー時はメッセージを表示
        setError(data.error || 'エラーが発生しました');
      }
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h4 className="title">パスワード忘れのリクエスト</h4>
      
      <div className="container" data-testid="forgot-password-container">
        <form
          className=""
          action="/open.PasswordInitialization/request"
          name="login"
          method="post"
          onSubmit={handleSubmit}
          role="form"
        >
          <p>アカウントのメールアドレスを入力してください</p>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <div className="form-group" data-testid="form-group">
            <label htmlFor="inputEmail" className="control-label">
              メールアドレス
            </label>
            <div className="">
              <input
                type="text"
                className="form-control"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Email address"
                autoFocus
              />
            </div>
          </div>
          
          <div className="form-group" data-testid="form-group">
            <div className="">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={isSubmitting}
              >
                <i className="fa fa-sign-in"></i>&nbsp;
                パスワード初期化メールを送信
              </button>
              <Link href="/signin" className="btn btn-info">
                <i className="fa fa-sign-in"></i>&nbsp;
                サインインへ戻る
              </Link>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export default ForgotPasswordRequestPage;