/**
 * エラーページコンポーネント
 * 
 * @description 各種HTTPエラーに対応した統一エラーページ
 * 旧システムのerror.jsp、not_found.jsp、server_error.jsp等に対応
 */
import React, { useState } from 'react';

interface ErrorPageProps {
  /** HTTPステータスコード */
  statusCode?: number;
  /** カスタムエラーメッセージ */
  message?: string;
  /** エラーオブジェクト（開発環境でのみ表示） */
  error?: Error;
}

/**
 * HTTPステータスコードに応じたデフォルトメッセージを取得
 */
const getDefaultMessage = (statusCode: number): string => {
  switch (statusCode) {
    case 401:
      return '認証が必要です。ログインしてから再度お試しください。';
    case 403:
      return 'アクセスが拒否されました。このリソースにアクセスする権限がありません。';
    case 404:
      return 'ページが見つかりません。URLをご確認ください。';
    case 500:
    default:
      return '内部サーバーエラーが発生しました。しばらく時間をおいてから再度お試しください。';
  }
};

export const ErrorPage: React.FC<ErrorPageProps> = ({
  statusCode = 500,
  message,
  error
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const errorMessage = message || getDefaultMessage(statusCode);

  return (
    <main className="container">
      <h3>Error</h3>
      
      <p>{errorMessage}</p>
      
      {/* 開発環境でのエラー詳細表示 */}
      {isDevelopment && error && (
        <div className="error-details">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="btn btn-warning btn-sm"
          >
            詳細を表示
          </button>
          
          {showDetails && (
            <div className="mt-3 p-3 bg-gray-100 border rounded">
              <div>{error.message}</div>
              {error.stack && (
                <pre className="mt-2 text-sm">{error.stack}</pre>
              )}
            </div>
          )}
        </div>
      )}
      
      <p>
        <a href="/index" className="btn btn-info">
          Back to Top
        </a>
      </p>
    </main>
  );
};