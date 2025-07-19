/**
 * メニューなしレイアウトコンポーネント
 * 
 * @description 旧システムのlayoutNoMenu.jspに相当
 * 認証画面やエラーページなど、メニューが不要なシンプルな画面で使用
 */
import React, { ReactNode } from 'react';
import Link from 'next/link';
import CommonHeader from './CommonHeader';
import CommonFooter from './CommonFooter';
import CommonScripts from './CommonScripts';
import { useLocale } from '@/hooks/useLocale';

interface LayoutNoMenuProps {
  children: ReactNode;
  pageTitle?: string;
  headContent?: ReactNode;
  scriptsContent?: ReactNode;
}

const LayoutNoMenu: React.FC<LayoutNoMenuProps> = ({
  children,
  pageTitle,
  headContent,
  scriptsContent,
}) => {
  const { t } = useLocale();
  const contextPath = (global as typeof global & { _CONTEXT?: string })._CONTEXT || '';
  
  // デフォルトタイトル
  const title = pageTitle || t('knowledge.title');

  return (
    <>
      <CommonHeader pageTitle={title}>
        {headContent}
      </CommonHeader>
      
      <div className="navbar navbar-default navbar-fixed-top" role="navigation">
        <div className="container" data-testid="navbar-container">
          <div className="navbar-header">
            <Link href={`${contextPath}/`} className="navbar-brand">
              <i className="fa fa-book"></i>&nbsp;{t('knowledge.navbar.title')}
              <span style={{ fontSize: '8pt' }}>{t('label.version')}</span>
            </Link>
          </div>
          <div className="navbar-collapse collapse">
            {/* メニューなし */}
          </div>
        </div>
      </div>

      <div className="container" id="content_top" data-testid="content-area">
        {children}
      </div>

      <CommonFooter />
      
      <CommonScripts />
      
      {scriptsContent}
    </>
  );
};

export default LayoutNoMenu;