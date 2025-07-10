/**
 * 403エラーページコンポーネント
 * 
 * @description 旧システムのforbidden.jspと同等の機能を提供
 */
import React from 'react';
import { MainLayout } from '../layout/MainLayout';

interface ForbiddenPageProps {
  errorAttribute?: string;
}

export const ForbiddenPage: React.FC<ForbiddenPageProps> = ({
  errorAttribute
}) => {
  return (
    <MainLayout>
      <div className="container">
        <h3>Error</h3>
        <p>
          message.httpstatus.403
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