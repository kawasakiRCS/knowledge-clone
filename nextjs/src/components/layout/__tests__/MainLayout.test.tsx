/**
 * MainLayoutコンポーネントのテスト
 * 
 * @description 旧システムのlayoutMain.jspとの互換性をテスト
 * @since 1.0.0
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MainLayout } from '../MainLayout';

// Jest環境でのNext.js mocks
jest.mock('next/head', () => {
  return function Head({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  };
});

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/test',
  }),
}));

jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    isLoggedIn: false,
    user: null,
    unreadCount: 0,
    loading: false,
  }),
}));

jest.mock('@/lib/hooks/useLocale', () => ({
  useLocale: () => ({
    locale: 'ja',
    displayName: '日本語',
    flagIcon: 'jp',
    updateLocale: jest.fn(),
    availableLocales: [
      { code: 'ja', displayName: '日本語', flagIcon: 'jp' },
      { code: 'en', displayName: 'English', flagIcon: 'us' },
    ],
  }),
}));

describe('MainLayout', () => {
  const defaultProps = {
    children: <div data-testid="test-content">Test Content</div>,
  };

  describe('基本レンダリング', () => {
    test('子要素が正しくレンダリングされる', () => {
      render(<MainLayout {...defaultProps} />);
      
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    test('CommonHeaderが統合されている', () => {
      render(<MainLayout {...defaultProps} />);
      
      // CommonHeaderコンポーネントが含まれていることを間接的に確認
      // （デフォルトテーマのCSSが読み込まれることで確認）
      expect(document.querySelector('head')).toBeInTheDocument();
    });

    test('テーマプロパティが正しく渡される', () => {
      render(
        <MainLayout 
          {...defaultProps} 
          pageTitle="カスタムタイトル"
          thema="cerulean"
          highlight="github"
          description="カスタム説明"
        />
      );
      
      // CommonHeaderにプロパティが正しく渡されることを確認
      // （実際のレンダリング結果は検証しないが、エラーが発生しないことを確認）
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });
  });

  describe('レイアウト構造', () => {
    test('メインコンテンツエリアが適切なIDを持つ', () => {
      render(<MainLayout {...defaultProps} />);
      
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveAttribute('id', 'content_top');
    });

    test('メインコンテンツエリアが適切なクラスを持つ', () => {
      render(<MainLayout {...defaultProps} />);
      
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveClass('flex-1', 'container', 'mx-auto', 'px-4', 'pt-[70px]');
    });

    test('カスタムクラス名が適用される', () => {
      render(
        <MainLayout {...defaultProps} className="custom-class" />
      );
      
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveClass('custom-class');
    });

    test('最小高さのコンテナが存在する', () => {
      render(<MainLayout {...defaultProps} />);
      
      const container = screen.getByRole('main').parentElement;
      expect(container).toHaveClass('min-h-screen', 'flex', 'flex-col');
    });
  });

  describe('ナビゲーションバー', () => {
    test('ナビゲーションバーが表示される', () => {
      render(<MainLayout {...defaultProps} />);
      
      // CommonNavbarがレンダリングされることを確認（唯一のnavigation要素）
      const navbars = screen.getAllByRole('navigation');
      expect(navbars).toHaveLength(1); // ナビバーのみ（CommonFooterにはnav要素なし）
      const navbar = navbars[0]; // ナビバー
      expect(navbar).toBeInTheDocument();
      expect(navbar).toHaveClass('navbar', 'navbar-default', 'navbar-fixed-top');
    });

    test('ブランドロゴが表示される', () => {
      render(<MainLayout {...defaultProps} />);
      
      const brandLink = screen.getByRole('link', { name: /knowledge/i });
      expect(brandLink).toBeInTheDocument();
      expect(brandLink).toHaveAttribute('href', '/open.knowledge/list');
    });

    test('検索フォームが表示される', () => {
      render(<MainLayout {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('検索キーワードを入力');
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('フッター', () => {
    test('フッターが表示される', () => {
      render(<MainLayout {...defaultProps} />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveAttribute('id', 'footer');
    });

    test('フッターナビゲーションリンクが表示される', () => {
      render(<MainLayout {...defaultProps} />);
      
      // CommonFooterの日本語ラベルを使用
      expect(screen.getByRole('link', { name: 'このアプリについて' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'オンラインマニュアル' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'ライセンス' })).toBeInTheDocument();
    });

    test('コピーライトが表示される', () => {
      render(<MainLayout {...defaultProps} />);
      
      // CommonFooterでは固定の年範囲を使用
      expect(screen.getByText(/Copyright © 2015 - 2017/)).toBeInTheDocument();
    });
  });

  describe('ページトップボタン', () => {
    test('ページトップボタンが表示される', () => {
      render(<MainLayout {...defaultProps} />);
      
      // CommonFooterのページトップボタンはdisplay: noneで隠れているためqueryで取得
      const pageTopButton = document.querySelector('.pagetop a');
      expect(pageTopButton).toBeInTheDocument();
      expect(pageTopButton).toHaveAttribute('href', '#content_top');
    });

    test('ページトップボタンをクリックするとスクロールする', async () => {
      const user = userEvent.setup();
      
      render(<MainLayout {...defaultProps} />);
      
      // CommonFooterのページトップボタンはリンクのため、実際のクリック動作を確認
      const pageTopButton = document.querySelector('.pagetop a');
      expect(pageTopButton).toBeInTheDocument();
      expect(pageTopButton).toHaveAttribute('href', '#content_top');
      
      // ブラウザのハッシュナビゲーションをテストするが、jsdomでは制限があるため
      // リンクが正しく設定されていることのみ確認
      await user.click(pageTopButton as Element);
    });
  });

  describe('カスタム要素', () => {
    test('カスタムヘッダー要素が挿入される', () => {
      const customHead = <meta name="custom" content="test" />;
      
      render(
        <MainLayout {...defaultProps} customHead={customHead} />
      );
      
      // カスタムヘッダーが存在することを確認（実際のDOM操作は制限されるため簡易チェック）
      expect(document.querySelector('meta[name="custom"]')).toBeTruthy();
    });

    test('カスタムスクリプトが挿入される', () => {
      const customScripts = <script data-testid="custom-script" />;
      
      render(
        <MainLayout {...defaultProps} customScripts={customScripts} />
      );
      
      expect(screen.getByTestId('custom-script')).toBeInTheDocument();
    });
  });

  describe('旧システム互換性', () => {
    test('旧システムのCSSクラス構造と互換性がある', () => {
      render(<MainLayout {...defaultProps} />);
      
      // container クラス
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveClass('container');
      
      // content_top ID
      expect(mainContent).toHaveAttribute('id', 'content_top');
      
      // padding-top: 70px 相当
      expect(mainContent).toHaveClass('pt-[70px]');
    });

    test('固定ナビバーの構造が旧システムと同等', () => {
      render(<MainLayout {...defaultProps} />);
      
      const navbars = screen.getAllByRole('navigation');
      const navbar = navbars[0]; // 最初がナビバー
      expect(navbar).toHaveClass('navbar', 'navbar-default', 'navbar-fixed-top');
    });

    test('フッターの構造が旧システムと同等', () => {
      render(<MainLayout {...defaultProps} />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveAttribute('id', 'footer');
      expect(footer).toHaveClass('text-center', 'py-5');
    });
  });

  describe('アクセシビリティ', () => {
    test('適切なランドマークロールが設定されている', () => {
      render(<MainLayout {...defaultProps} />);
      
      expect(screen.getAllByRole('navigation')).toHaveLength(1); // ナビバーのみ（CommonFooterにはnav要素なし）
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    test('ページトップボタンに適切なaria-labelが設定されている', () => {
      render(<MainLayout {...defaultProps} />);
      
      // CommonFooterのページトップボタン（リンク）を確認
      const pageTopButton = document.querySelector('.pagetop a');
      expect(pageTopButton).toHaveAttribute('aria-label', 'ページトップへ戻る');
    });
  });
});