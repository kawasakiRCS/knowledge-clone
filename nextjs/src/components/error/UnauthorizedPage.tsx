/**
 * 401エラーページコンポーネント
 * 
 * @description 旧システムのunauthorized.jspと同等の機能を提供
 */
import React from 'react';
import MainLayout from '../layout/MainLayout';

interface UnauthorizedPageProps {
  errorAttribute?: string;
}

const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({
  errorAttribute
}) => {
  return (
    <MainLayout>
      <div className="container">
        <h3>Error</h3>
        <p>
          message.httpstatus.401
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

export default UnauthorizedPage;