/**
 * 404エラーページコンポーネント
 * 
 * @description 旧システムのnot_found.jspと同等の機能を提供
 */
import React from 'react';
import { MainLayout } from '../layout/MainLayout';

interface NotFoundPageProps {
  errorAttribute?: string;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  errorAttribute
}) => {
  return (
    <MainLayout>
      <div className="container">
        <h3>Error</h3>
        <p>
          message.httpstatus.404
        </p>
        
        {errorAttribute && (
          <div>{errorAttribute}</div>
        )}
        
        <p>
          <a href="/index" className="btn btn-info">
            Back to Top
          </a>
        </p>
      </div>
    </MainLayout>
  );
};