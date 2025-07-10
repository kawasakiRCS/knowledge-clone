'use client';

import { useState } from 'react';
import { LoginFormProps, LoginFormData } from '@/types/auth';

/**
 * ログインフォームコンポーネント
 * 
 * @description 旧システムauth/form.jspの完全互換実装
 */
export function LoginForm({
  onSubmit,
  initialValues = {},
  loginError = false,
  showDescription = false,
  showSignup = false,
  redirectTo
}: LoginFormProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    username: initialValues.username || '',
    password: initialValues.password || '',
    page: redirectTo || initialValues.page
  });
  const [showError, setShowError] = useState(loginError);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  return (
    <div className="container">
      <h4 className="title">ログイン</h4>
      
      <form 
        role="form"
        action="/signin"
        method="post"
        onSubmit={handleSubmit}
      >
        {showDescription && (
          <div className="form-group">
            <div>
              サインインが必要な機能です。<br />
              (ナレッジの編集などはサインインが必要です)
            </div>
          </div>
        )}
        
        {showError && (
          <div className="form-group">
            <div>
              <div className="alert alert-danger alert-dismissible" role="alert">
                <button 
                  type="button" 
                  className="close" 
                  onClick={handleCloseError}
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
                ID/Passwordが間違っています。
              </div>
            </div>
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="inputEmail" className="control-label">ID</label>
          <div>
            <input
              id="inputEmail"
              type="text"
              className="form-control"
              name="username"
              value={formData.username}
              placeholder="ID"
              autoFocus
              onChange={(e) => handleInputChange('username', e.target.value)}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="inputPass" className="control-label">パスワード</label>
          <div>
            <input
              id="inputPass"
              type="password"
              className="form-control"
              name="password"
              value={formData.password}
              placeholder="パスワード"
              onChange={(e) => handleInputChange('password', e.target.value)}
            />
          </div>
        </div>
        
        <input type="hidden" name="page" value={formData.page || ''} />
        
        <div className="form-group">
          <div>
            <button className="btn btn-primary" type="submit">
              <i className="fa fa-sign-in"></i>&nbsp;サインイン実行
            </button>
            
            {showSignup && (
              <button type="button" className="btn btn-info">
                <i className="fa fa-plus-square"></i>&nbsp;アカウント新規登録
              </button>
            )}
            
            <br /><br />
            <a href="/open.PasswordInitialization/view" className="text-primary">
              <i className="fa fa-key"></i>&nbsp;パスワードを忘れましたか？
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}