'use client';

/**
 * Next.js アプリケーションエラーページ
 * 
 * @description 旧システムのerror.jsp相当のエラーページ
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */
import { useEffect } from 'react';
import { ErrorPage } from '@/components/layout';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // エラーログの記録（本番環境）
    console.error('Application Error:', error);
  }, [error]);

  return (
    <ErrorPage 
      error={error}
      message="予期しないエラーが発生しました。"
    />
  );
}