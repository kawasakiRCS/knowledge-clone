/**
 * 認証エラーページ
 * 
 * @description 旧システムauth/authorizerError.jspに対応するNext.jsページ
 * URL: /authorizer_error
 */
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

export default function AuthorizerErrorPage() {
  return (
    <MainLayout>
      <div className="container">
        <h4 className="title">アクセスエラー</h4>
        <div className="alert alert-danger" role="alert">
          <h4>権限がありません</h4>
          <p>アクセスする権限がありません。</p>
          <hr />
          <div className="text-center">
            <Link href="/" className="btn btn-primary">
              <i className="fa fa-home"></i>&nbsp;トップページへ戻る
            </Link>
            <Link href="/signin" className="btn btn-info ml-2">
              <i className="fa fa-sign-in"></i>&nbsp;サインイン
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}