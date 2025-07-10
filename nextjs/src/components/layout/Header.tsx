/**
 * ヘッダーコンポーネント
 * 
 * @description 旧システムのcommonHeader.jspを移植したヘッダー
 * メタタグ、CSS、テーマ設定を含む
 * @since 1.0.0
 */

import Head from 'next/head';
import { useTheme } from '@/lib/hooks/useTheme';

interface HeaderProps {
  pageTitle?: string;
  description?: string;
  keywords?: string;
  customMeta?: React.ReactNode;
}

export function Header({ 
  pageTitle = "Knowledge", 
  description = "ナレッジマネジメントシステム",
  keywords = "ナレッジマネジメント,ナレッジベース,情報共有,オープンソース,KnowledgeBase,KnowledgeManagement,OSS,Markdown",
  customMeta
}: HeaderProps) {
  const { theme, highlightTheme } = useTheme();

  return (
    <Head>
      {/* 基本メタタグ - 旧システムのcommonHeader.jspより */}
      <meta charSet="UTF-8" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta httpEquiv="Content-Style-Type" content="text/css" />
      <meta httpEquiv="Content-Script-Type" content="text/javascript" />
      <meta httpEquiv="imagetoolbar" content="no" />
      
      {/* キャッシュ制御 */}
      <meta httpEquiv="expires" content="0" />
      <meta httpEquiv="Pragma" content="no-cache" />
      <meta httpEquiv="Cache-Control" content="no-cache" />
      
      {/* レスポンシブ対応 */}
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1" />
      
      {/* SEO関連 */}
      <meta name="title" content={pageTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content="https://support-project.org/knowledge/index" />
      <meta property="og:site_name" content="Knowledge" />
      
      {/* ファビコン */}
      <link rel="icon" href="/favicon.ico" type="image/vnd.microsoft.icon" />
      
      {/* テーマ別CSS（動的読み込み） */}
      <link 
        rel="stylesheet" 
        href={`/css/themes/${theme || 'flatly'}.css`}
      />
      
      {/* シンタックスハイライト */}
      <link 
        rel="stylesheet" 
        href={`/css/highlight/${highlightTheme || 'darkula'}.css`}
      />
      
      {/* Font Awesome - 旧システムと同じアイコンライブラリ */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        integrity="sha512-9usAa10IRO0HhonpyAIVpjrylPvoDwiPUiKdWk5t3PyolY1cOd4DSE0Ga+ri4AuTroPR5aQvXU9xC6qOPnzFeg=="
        crossOrigin="anonymous"
      />
      
      {/* 国旗アイコン */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/6.6.6/css/flag-icons.min.css"
        integrity="sha512-uvXdJud8WaOlQFjlz9B15Yy2Au/bMAvz79F7Xa6OakCl2jvQPdHD0hb3dEqZRdSwG4/sknePXlE7GiarwA/9Wg=="
        crossOrigin="anonymous"
      />
      
      {/* カスタムメタタグ */}
      {customMeta}
      
      {/* バージョン情報コメント */}
      {/* Knowledge - 1.0.0 */}
    </Head>
  );
}