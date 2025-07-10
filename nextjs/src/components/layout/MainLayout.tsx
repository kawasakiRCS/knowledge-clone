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
import { SimpleNavbar } from './SimpleNavbar';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: ReactNode;
  pageTitle?: string;
  customHead?: ReactNode;
  customScripts?: ReactNode;
  className?: string;
}

export function MainLayout({
  children,
  pageTitle = "Knowledge",
  customHead,
  customScripts,
  className
}: MainLayoutProps) {
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        {customHead}
      </Head>
      
      <div className="min-h-screen flex flex-col">
        {/* ナビゲーションバー - Bootstrap固定ナビバーを再現 */}
        <SimpleNavbar />
        
        {/* メインコンテンツ - 旧システムのcontainerクラスを再現 */}
        <main 
          className={cn(
            "flex-1 container mx-auto px-4",
            "pt-[70px]", // body { padding-top: 70px; } を再現
            className
          )}
          id="content_top"
        >
          {children}
        </main>
        
        {/* フッター */}
        <Footer />
      </div>
      
      {/* 追加スクリプト */}
      {customScripts}
      
      {/* ページトップボタン - 旧システムの再現 */}
      <PageTopButton />
    </>
  );
}

/**
 * ページトップボタンコンポーネント
 * 旧システムのclass="pagetop"を再現
 */
function PageTopButton() {
  return (
    <button
      className={cn(
        "fixed bottom-4 right-4 p-3 rounded-full",
        "bg-gray-600 text-white shadow-lg",
        "hover:bg-gray-700 transition-colors",
        "hidden group-hover:block" // 初期状態は非表示（旧システムstyle="display: none;"）
      )}
      onClick={() => {
        document.getElementById('content_top')?.scrollIntoView({ 
          behavior: 'smooth' 
        });
      }}
      aria-label="ページトップへ戻る"
    >
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 10l7-7m0 0l7 7m-7-7v18" 
        />
      </svg>
    </button>
  );
}