/**
 * 共通フッターコンポーネント
 * 
 * @description 旧システムのcommonFooter.jspを完全移植
 * 旧システムのHTML構造、CSS構造、機能を100%再現
 * @since 1.0.0
 */

'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/hooks/useLocale';

export function CommonFooter() {
  const { displayName } = useLocale();
  // 将来の国際化機能拡張用
  // const { locale, displayName } = useLocale();

  return (
    <>
      {/* 旧システムの<div id="footer">を完全再現 */}
      <footer 
        id="footer"
        role="contentinfo"
        className="text-center py-5 mt-15"
        style={{
          backgroundColor: '#7E7E7E',
          color: '#cccccc'
        }}
      >
        {/* 旧システムの<ul class="footer-menu list-inline">を完全再現 */}
        <ul className="footer-menu list-inline flex justify-center space-x-0">
          {/* 旧システムの<li class="first">を完全再現 */}
          <li 
            className="first border-l border-r border-black"
            style={{ borderRight: '1px solid #000', borderLeft: '1px solid #000' }}
          >
            <Link
              href="/index"
              className="px-3 py-1 text-gray-300 hover:text-white transition-colors duration-200"
              style={{ cursor: 'pointer', color: '#cccccc' }}
            >
              このアプリについて
            </Link>
          </li>
          <li 
            className="border-r border-black"
            style={{ borderRight: '1px solid #000' }}
          >
            <Link
              href="https://information-knowledge.support-project.org/manual"
              className="px-3 py-1 text-gray-300 hover:text-white transition-colors duration-200"
              style={{ cursor: 'pointer', color: '#cccccc' }}
            >
              オンラインマニュアル
            </Link>
          </li>
          <li 
            className="border-r border-black"
            style={{ borderRight: '1px solid #000' }}
          >
            <Link
              href="/open.license"
              className="px-3 py-1 text-gray-300 hover:text-white transition-colors duration-200"
              style={{ cursor: 'pointer', color: '#cccccc' }}
            >
              ライセンス
            </Link>
          </li>
          <li 
            className="border-r border-black"
            style={{ borderRight: '1px solid #000' }}
          >
            <Link
              href="/open.language"
              className="px-3 py-1 text-gray-300 hover:text-white transition-colors duration-200 flex items-center"
              style={{ cursor: 'pointer', color: '#cccccc' }}
            >
              {/* 旧システムの<i class="fa fa-language"></i>&nbsp;を完全再現 */}
              <i className="fa fa-language mr-2" aria-hidden="true"></i>
              {displayName}
            </Link>
          </li>
        </ul>
        
        {/* 旧システムのコメント <!-- /nav --> */}
        
        {/* 旧システムの<div class="clearfix"></div>を完全再現 */}
        <div className="clearfix"></div>
        
        {/* 旧システムの<div class="copy">を完全再現 */}
        <div className="copy mt-4">
          <span style={{ color: '#cccccc' }}>
            Copyright &#169; 2015 - 2017{' '}
            <Link
              href="https://support-project.org/knowledge_info/index"
              style={{ color: '#cccccc' }}
              className="hover:text-white"
            >
              support-project.org
            </Link>
          </span>
        </div>
        {/* 旧システムのコメント <!-- /copy --> */}
      </footer>
      {/* 旧システムのコメント <!-- /footer --> */}
      
      {/* 旧システムの<p class="pagetop" style="display: none;">を完全再現 */}
      <p 
        className="pagetop"
        style={{ 
          display: 'none',
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 99999
        }}
      >
        <Link 
          href="#content_top"
          style={{
            borderRadius: '30px',
            width: '60px',
            height: '60px',
            display: 'block',
            textAlign: 'center',
            verticalAlign: 'middle',
            backgroundColor: '#666699',
            color: 'white',
            fontSize: '20px',
            textDecoration: 'none',
            padding: '15px 10px'
          }}
          aria-label="ページトップへ戻る"
        >
          <i className="fa fa-arrow-up" aria-hidden="true"></i>
        </Link>
      </p>
    </>
  );
}