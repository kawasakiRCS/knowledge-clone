/**
 * レイアウトテストページ
 * 
 * @description MainLayoutコンポーネントのテスト用ページ
 * @since 1.0.0
 */

'use client';

import { MainLayout } from '@/components/layout';

export default function TestLayoutPage() {
  return (
    <MainLayout pageTitle="レイアウトテスト - Knowledge">
      <div className="space-y-8 py-8">
        {/* ページタイトル */}
        <div className="title">
          <h1 className="text-3xl font-bold">MainLayoutテストページ</h1>
        </div>

        {/* テストコンテンツ */}
        <div className="space-y-6">
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="sub_title">レイアウト構成要素</h2>
            <ul className="space-y-2">
              <li>✅ 固定ナビゲーションバー（上部70px）</li>
              <li>✅ ブランドロゴ＋検索フォーム</li>
              <li>✅ ユーザーメニュー（ログイン状態対応）</li>
              <li>✅ メインコンテンツエリア</li>
              <li>✅ フッター（リンク＋コピーライト）</li>
              <li>✅ ページトップボタン</li>
            </ul>
          </section>

          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="sub_title">旧システムとの互換性</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">CSS クラス</h3>
                <ul className="text-sm space-y-1">
                  <li><code className="bg-gray-100 px-1">container</code> - レスポンシブコンテナ</li>
                  <li><code className="bg-gray-100 px-1">title</code> - ページタイトル</li>
                  <li><code className="bg-gray-100 px-1">sub_title</code> - サブタイトル</li>
                  <li><code className="bg-gray-100 px-1">content_top</code> - メインコンテンツID</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">レイアウト構造</h3>
                <ul className="text-sm space-y-1">
                  <li>Fixed navbar（Bootstrap 3互換）</li>
                  <li>Body padding-top: 70px</li>
                  <li>Footer margin-top: 60px</li>
                  <li>Font Awesome アイコン</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="sub_title">動作テスト</h2>
            <div className="space-y-4">
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => alert('ボタンクリックテスト')}
              >
                インタラクションテスト
              </button>
              
              <div className="text-sm text-gray-600">
                <p>• ナビバーの検索フォームをテストしてください</p>
                <p>• メニューのドロップダウンをテストしてください</p>
                <p>• ページトップボタンをテストしてください</p>
                <p>• レスポンシブ表示をテストしてください</p>
              </div>
            </div>
          </section>

          {/* 長いコンテンツでスクロールテスト */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="sub_title">スクロールテスト用長いコンテンツ</h2>
            {Array.from({ length: 10 }, (_, i) => (
              <p key={i} className="mb-4">
                これはスクロールテスト用の段落 {i + 1} です。
                ページトップボタンの動作確認のために十分な高さを確保するためのダミーコンテンツです。
                旧システムのJSPレイアウトと同様の表示・動作になることを確認してください。
              </p>
            ))}
          </section>
        </div>
      </div>
    </MainLayout>
  );
}