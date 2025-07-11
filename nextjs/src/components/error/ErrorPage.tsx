import React from 'react';

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
            <a href="/" className="btn btn-primary">
              <i className="fa fa-home"></i> トップページへ戻る
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;