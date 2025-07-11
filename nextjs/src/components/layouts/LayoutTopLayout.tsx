/**
 * トップページ専用レイアウトコンポーネント
 * 
 * @description 旧システムのlayoutTop.jspと同等の機能を提供
 * - ナビゲーションバーなし
 * - コンテンツエリアはmargin/padding: 0
 * - CommonHeader、CommonFooter、CommonScriptsを含む
 * - アナリティクススクリプトサポート
 */
import React from 'react';
import { CommonHeader } from '@/components/layout/CommonHeader';
import { CommonFooter } from '@/components/layout/CommonFooter';
import { CommonScripts } from '@/components/layout/CommonScripts';

interface LayoutTopLayoutProps {
  /** ページタイトル（旧PARAM_PAGE_TITLE） */
  pageTitle?: string;
  /** 追加のヘッダーコンテンツ（旧PARAM_HEAD） */
  headContent?: string;
  /** 追加のスクリプト（旧PARAM_SCRIPTS） */
  scriptsContent?: string;
  /** 子要素（旧PARAM_CONTENT） */
  children?: React.ReactNode;
}

export function LayoutTopLayout({
  pageTitle,
  headContent,
  scriptsContent,
  children
}: LayoutTopLayoutProps) {
  // アナリティクススクリプトの取得（現在は仮実装）
  const analyticsScript = () => {
    // TODO: AnalyticsConfig.get().getAnalyticsScript() の実装
    return null;
  };

  return (
    <>
      {/* 共通ヘッダー */}
      <CommonHeader pageTitle={pageTitle} additionalContent={headContent} />
      
      {/* メインコンテンツ（旧JSPのcontent_top） */}
      <div id="content_top" style={{ margin: 0, padding: 0 }}>
        {children}
      </div>
      
      {/* 共通フッター */}
      <CommonFooter />
      
      {/* 共通スクリプト */}
      <CommonScripts />
      
      {/* 追加スクリプト（旧PARAM_SCRIPTS） */}
      {scriptsContent && (
        <div dangerouslySetInnerHTML={{ __html: scriptsContent }} />
      )}
      
      {/* アナリティクススクリプト */}
      {analyticsScript()}
    </>
  );
}