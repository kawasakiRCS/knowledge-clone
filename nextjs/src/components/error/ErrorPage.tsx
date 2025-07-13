import React from 'react';
import Link from 'next/link';

interface Props {
  statusCode?: number;
}

const ErrorPage: React.FC<Props> = ({ statusCode = 500 }) => {
  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-12">
          <div className="error-page text-center" style={{ padding: '100px 0' }}>
            <h1 style={{ fontSize: '72px', marginBottom: '40px' }}>{statusCode}</h1>
            <h2>エラーが発生しました</h2>
            <p className="lead">申し訳ございません。エラーが発生しました。</p>
            <Link href="/" className="btn btn-primary">
              <i className="fa fa-home"></i> トップページへ戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;