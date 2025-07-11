/**
 * 共通ヘッダーコンポーネント
 * 
 * @description 旧システムcommonHeader.jspの完全移植
 * 全ページに共通するHTML head要素（メタタグ、CSS読み込み等）を管理
 */
import Head from 'next/head';

export interface CommonHeaderProps {
  /** テーマ名（デフォルト: flatly） */
  thema?: string;
  /** ハイライトテーマ名（デフォルト: darkula） */
  highlight?: string;
  /** ページタイトル */
  title?: string;
  /** ページ説明 */
  description?: string;
}

export function CommonHeader({
  thema = 'flatly',
  highlight = 'darkula',
  title = 'Knowledge',
  description = 'Knowledge Management System',
}: CommonHeaderProps) {
  return (
    <Head>
      {/* 文字エンコーディング */}
      <meta charSet="UTF-8" />
      
      {/* Content-Type設定 */}
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta httpEquiv="Content-Style-Type" content="text/css" />
      <meta httpEquiv="Content-Script-Type" content="text/javascript" />
      <meta httpEquiv="imagetoolbar" content="no" />
      
      {/* キャッシュ制御 */}
      <meta httpEquiv="expires" content="0" />
      <meta httpEquiv="Pragma" content="no-cache" />
      <meta httpEquiv="Cache-Control" content="no-cache" />
      
      {/* ブラウザ互換性 */}
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      
      {/* レスポンシブ対応 */}
      <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1" />
      
      {/* SEO・メタ情報 */}
      <meta content={title} name="title" />
      <meta content={description} name="description" />
      <meta
        content="ナレッジマネジメント,ナレッジベース,情報共有,オープンソース,KnowledgeBase,KnowledgeManagement,OSS,Markdown"
        name="keywords"
      />
      
      {/* OGP設定 */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content="https://support-project.org/knowledge/index" />
      <meta property="og:site_name" content="Knowledge" />
      
      {/* favicon */}
      <link rel="icon" href="/favicon.ico" type="image/vnd.microsoft.icon" />
      
      {/* Bootstrap CSS（テーマ対応） */}
      <link rel="stylesheet" href={`/bower/bootswatch/${thema}/bootstrap.min.css`} />
      <link rel="stylesheet" href={`/css/thema/${thema}.css`} />
      
      {/* Highlight.js CSS（テーマ対応） */}
      <link rel="stylesheet" href={`/bower/highlightjs/styles/${highlight}.css`} />
      
      {/* Font Awesome */}
      <link rel="stylesheet" href="/bower/font-awesome/css/font-awesome.min.css" />
      
      {/* Flag Icon CSS */}
      <link rel="stylesheet" href="/bower/flag-icon-css/css/flag-icon.min.css" />
      
      {/* jQuery oEmbed CSS */}
      <link rel="stylesheet" href="/bower/jquery-oembed-all/jquery.oembed.css" />
      
      {/* 共通CSS */}
      <link rel="stylesheet" href="/css/common.css" />
      
      {/* IE8以下対応スクリプト */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            <!--[if lt IE 9]>
              <script src="/bower/html5shiv/dist/html5shiv.min.js"></script>
              <script src="/bower/respond/dest/respond.min.js"></script>
            <![endif]-->
          `
        }}
      />
      
      {/* Knowledge コメント */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* Knowledge */
          `
        }}
      />
    </Head>
  );
}