/**
 * フッターコンポーネント
 * 
 * @description 旧システムのcommonFooter.jspを移植したフッター
 * ナビゲーションリンクとコピーライトを含む
 * @since 1.0.0
 */

import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Footer() {
  // const { displayName } = useLocale(); // 一時的にコメントアウト
  const displayName = '日本語'; // 仮の値

  return (
    <footer 
      id="footer"
      className={cn(
        "text-center py-5 mt-15",
        "bg-gray-600 text-gray-300",
        "border-t"
      )}
    >
      {/* フッターナビゲーション */}
      <nav>
        <ul className="flex justify-center items-center space-x-0 text-sm">
          <li className="border-l border-black">
            <Link
              href="/"
              className={cn(
                "px-3 py-1 text-gray-300 hover:text-white",
                "transition-colors duration-200"
              )}
            >
              About
            </Link>
          </li>
          <li className="border-l border-black">
            <Link
              href="https://information-knowledge.support-project.org/manual"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "px-3 py-1 text-gray-300 hover:text-white",
                "transition-colors duration-200"
              )}
            >
              Manual
            </Link>
          </li>
          <li className="border-l border-black">
            <Link
              href="/license"
              className={cn(
                "px-3 py-1 text-gray-300 hover:text-white",
                "transition-colors duration-200"
              )}
            >
              License
            </Link>
          </li>
          <li className="border-l border-r border-black">
            <Link
              href="/language"
              className={cn(
                "px-3 py-1 text-gray-300 hover:text-white",
                "transition-colors duration-200 flex items-center"
              )}
            >
              <i className="fa fa-language mr-2"></i>
              {displayName}
            </Link>
          </li>
        </ul>
      </nav>

      {/* コピーライト */}
      <div className="mt-4">
        <span className="text-gray-300 text-sm">
          Copyright © 2015 - {new Date().getFullYear()}{' '}
          <Link
            href="https://support-project.org/knowledge_info/index"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white underline"
          >
            support-project.org
          </Link>
        </span>
      </div>

      {/* ページトップボタン - 旧システムのp.pagetopを再現 */}
      <PageTopButton />
    </footer>
  );
}

/**
 * ページトップボタン
 * 旧システムのclass="pagetop"を再現
 */
function PageTopButton() {
  const scrollToTop = () => {
    const contentTop = document.getElementById('content_top');
    if (contentTop) {
      contentTop.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-4 right-4 p-3 rounded-full",
        "bg-gray-600 text-white shadow-lg",
        "hover:bg-gray-700 transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-gray-500",
        "opacity-80 hover:opacity-100"
      )}
      aria-label="ページトップへ戻る"
    >
      <i className="fa fa-arrow-up" aria-hidden="true"></i>
    </button>
  );
}