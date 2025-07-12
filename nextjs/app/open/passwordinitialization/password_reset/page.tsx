'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';

interface ResetData {
  userKey: string;
  key: string;
}

export default function PasswordResetPage() {
  const router = useRouter();
  const params = useParams();
  const key = params.key as string;
  
  const [loading, setLoading] = useState(true);
  const [resetData, setResetData] = useState<ResetData | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // リセットキーの検証とデータ取得
    const validateKey = async () => {
      try {
        const response = await fetch(`/api/password/init/${key}`);
        
        if (response.status === 404) {
          router.push('/404');
          return;
        }
        
        const data = await response.json();
        
        if (data.success) {
          setResetData(data.data);
        } else {
          setError(data.error || 'リセットキーが無効です');
        }
      } catch (err) {
        setError('エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    if (key) {
      validateKey();
    }
  }, [key, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // フィールドエラーのクリア
    setFieldErrors({});
    setError('');
    
    // バリデーション
    const errors: Record<string, string> = {};
    
    if (!password) {
      errors.password = 'パスワードは必須です';
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = 'パスワード(確認)は必須です';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'パスワードが一致しません';
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/password/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: resetData?.key,
          password,
          confirmPassword,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        router.push('/open/passwordinitialization/reset_result');
      } else {
        setError(data.error || 'パスワード変更に失敗しました');
      }
    } catch (err) {
      setError('エラーが発生しました');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container">
          <div className="row">
            <div className="col-md-6 col-md-offset-3">
              <p>読み込み中...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container">
        <div className="row">
          <div className="col-md-6 col-md-offset-3">
            <h1>パスワードリセット</h1>
            
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            
            {resetData && (
              <form role="form" onSubmit={handleSubmit}>
                <p className="text-info">
                  パスワードを変更してください
                </p>
                
                <div className="form-group">
                  <label className="control-label" htmlFor="username">
                    Mail
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={resetData.userKey}
                    readOnly
                  />
                </div>
                
                <div className={`form-group ${fieldErrors.password ? 'has-error' : ''}`}>
                  <label className="control-label" htmlFor="password">
                    パスワード
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {fieldErrors.password && (
                    <span className="help-block">{fieldErrors.password}</span>
                  )}
                </div>
                
                <div className={`form-group ${fieldErrors.confirmPassword ? 'has-error' : ''}`}>
                  <label className="control-label" htmlFor="confirm_password">
                    パスワード(確認)
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirm_password"
                    name="confirm_password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {fieldErrors.confirmPassword && (
                    <span className="help-block">{fieldErrors.confirmPassword}</span>
                  )}
                </div>
                
                <input type="hidden" name="key" value={resetData.key} />
                
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  <i className="fa fa-sign-in" aria-hidden="true"></i>&nbsp;
                  パスワード変更
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}