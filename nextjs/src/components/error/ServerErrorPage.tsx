/**
 * 500エラーページコンポーネント
 * 
 * @description 旧システムのserver_error.jspと同等の機能を提供
 */
import React from 'react';
import { MainLayout } from '../layout/MainLayout';

interface ServerErrorPageProps {
  errorAttribute?: string;
  exception?: Error;
  serverException?: Error;
  isLocalhost?: boolean;
}

export const ServerErrorPage: React.FC<ServerErrorPageProps> = ({
  errorAttribute,
  exception,
  serverException,
  isLocalhost = false
}) => {
  // 例外の優先順位: exception -> serverException
  const displayException = exception || serverException;
  const shouldShowStackTrace = isLocalhost && displayException;

  return (
    <MainLayout>
      <div className="container">
        <h3>Server Error</h3>
        
        <p>
          message.httpstatus.500
        </p>
        
        {errorAttribute && (
          <div>{errorAttribute}</div>
        )}
        <br />
        
        {shouldShowStackTrace && (
          <div role="region" aria-label="stack trace">
            <pre>
              {displayException.message}
              {displayException.stack && `\n${displayException.stack}`}
            </pre>
          </div>
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