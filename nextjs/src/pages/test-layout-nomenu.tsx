/**
 * LayoutNoMenuテストページ
 * 
 * @description レイアウトの見た目確認用の一時的なページ
 */
import LayoutNoMenu from '@/components/layout/LayoutNoMenu';

const TestLayoutNoMenu = () => {
  return (
    <LayoutNoMenu pageTitle="テストページ - メニューなしレイアウト">
      <div className="row">
        <div className="col-md-12">
          <h1>LayoutNoMenuテストページ</h1>
          <p>このページはLayoutNoMenuコンポーネントの見た目を確認するためのテストページです。</p>
          
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">テストパネル</h3>
            </div>
            <div className="panel-body">
              <p>メニューがないシンプルなレイアウトです。</p>
              <p>認証画面やエラーページなどで使用されることを想定しています。</p>
            </div>
          </div>

          <div className="alert alert-info">
            <strong>情報:</strong> このレイアウトには以下の特徴があります：
            <ul>
              <li>ナビゲーションメニューがありません</li>
              <li>ロゴとバージョン番号のみが表示されます</li>
              <li>シンプルで集中しやすいデザインです</li>
            </ul>
          </div>

          <button className="btn btn-primary">テストボタン</button>
          {' '}
          <button className="btn btn-default">キャンセル</button>
        </div>
      </div>
    </LayoutNoMenu>
  );
};

export default TestLayoutNoMenu;