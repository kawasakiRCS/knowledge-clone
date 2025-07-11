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
        <CommonNavbar />
        
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
        
        {/* フッター - 旧システムのcommonFooter.jspを移植 */}
        <CommonFooter />
      </div>
      
      {/* 追加スクリプト */}
      {customScripts}
    </>
  );
}