/**
 * パスワードリセット結果ページ
 * 
 * @description 旧システムの open/passwordinitialization/forgot_pass_result.jsp を移植
 */
import React from 'react';
import Link from 'next/link';

export function ForgotPasswordResultPage() {
  return (
    <>
      <h4 className="title">パスワード忘れのリクエスト</h4>
      
      <div className="container">
        <div className="alert alert-info" role="alert">
          <p>
            <strong>リクエストを受け付けました。</strong>
          </p>
          <p>
            パスワード初期化のためのメールを送信しました。
            メールボックスをご確認ください。
          </p>
          <p>
            メールが届かない場合は、迷惑メールフォルダもご確認ください。
          </p>
        </div>
        
        <div className="form-group">
          <Link href="/signin" className="btn btn-info">
            <i className="fa fa-sign-in"></i>&nbsp;
            サインインページへ戻る
          </Link>
        </div>
      </div>
    </>
  );
}

export default ForgotPasswordResultPage;