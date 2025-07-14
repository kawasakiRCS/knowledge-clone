/**
 * メインレイアウトコンポーネント
 * 
 * @description 旧システムのlayoutMain.jspを移植したレイアウト
 * @param children - ページコンテンツ
 * @param pageTitle - ページタイトル（省略時は "Knowledge" を使用）
 * @param customHead - 追加ヘッダー要素
 * @param customScripts - 追加スクリプト
 * @since 1.0.0
 */

import { ReactNode } from 'react';
import Head from 'next/head';
import { cn } from '@/lib/utils';
import { CommonNavbar } from './CommonNavbar';
import { CommonFooter } from './CommonFooter';
import { CommonHeader } from './CommonHeader';
import { CommonScripts } from './CommonScripts';

interface MainLayoutProps {
  children: ReactNode;
  pageTitle?: string;
  customHead?: ReactNode;
  customScripts?: ReactNode;
  className?: string;
  /** テーマ名（デフォルト: flatly） */
  thema?: string;
  /** ハイライトテーマ名（デフォルト: darkula） */
  highlight?: string;
  /** ページ説明 */
  description?: string;
  /** デスクトップ通知を有効にするか */
  desktopNotify?: boolean;
  /** 通知メッセージ */
  messages?: {
    success: string[];
    info: string[];
    warn: string[];
    error: string[];
  };
}

function MainLayout({
  children,
  pageTitle = "Knowledge",
  customHead,
  customScripts,
  className,
  thema,
  highlight,
  description,
  desktopNotify = false,
  messages
}: MainLayoutProps) {
  return (
    <>
      {/* 共通ヘッダー（メタタグ、CSS読み込み等） */}
      <CommonHeader 
        title={pageTitle}
        description={description}
        thema={thema}
        highlight={highlight}
      />
      
      {customHead && (
        <Head>
          {customHead}
        </Head>
      )}
      
      <div className="min-h-screen flex flex-col">
        {/* ナビゲーションバー - Bootstrap固定ナビバーを再現 */}
        <CommonNavbar />
        
        {/* メインコンテンツ - 旧システムのcontainerクラスを再現 */}
        <main 
          className={cn(
            "flex-1 container mx-auto px-4",
            className
          )}
          style={{ paddingTop: '80px' }}
          id="content_top"
        >
          {children}
        </main>
        
        {/* フッター - 旧システムのcommonFooter.jspを移植 */}
        <CommonFooter />
      </div>
      
      {/* 共通スクリプト（グローバル変数、外部ライブラリ、通知システム） */}
      <CommonScripts
        contextPath=""
        loginUserId={null} // TODO: 認証システム実装後に連携
        lang="ja"
        desktopNotify={desktopNotify}
        messages={messages}
      />
      
      {/* 追加スクリプト */}
      {customScripts}
    </>
  );
}

export default MainLayout;