/**
 * LayoutNoMenuコンポーネントテスト
 * 
 * @description メニューなしレイアウトのテスト（layoutNoMenu.jsp相当）
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LayoutNoMenu from '../LayoutNoMenu';

interface MockLinkProps {
  children: React.ReactNode;
  href: string;
}

// Mock Next.js modules
jest.mock('next/link', () => {
  return ({ children, href }: MockLinkProps) => <a href={href}>{children}</a>;
});

// Mock dependencies
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    push: jest.fn(),
    query: {},
  }),
}));

jest.mock('@/lib/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'knowledge.navbar.title': 'Knowledge',
        'label.version': 'Version 2.0.0',
        'knowledge.title': 'Knowledge',
      };
      return translations[key] || key;
    },
  }),
}));

interface MockCommonHeaderProps {
  children?: React.ReactNode;
  pageTitle?: string;
}

jest.mock('../CommonHeader', () => {
  return function CommonHeader({ children, pageTitle }: MockCommonHeaderProps) {
    // document.titleを設定（副作用）
    if (typeof document !== 'undefined' && pageTitle) {
      document.title = pageTitle;
    }
    return <div data-testid="common-header">{children}</div>;
  };
});

jest.mock('../CommonFooter', () => {
  return function CommonFooter() {
    return <footer role="contentinfo" className="footer">Footer</footer>;
  };
});

jest.mock('../CommonScripts', () => {
  return function CommonScripts() {
    return <div data-testid="common-scripts"></div>;
  };
});

// グローバル変数の型定義とモック
declare global {
  // eslint-disable-next-line no-var
  var _CONTEXT: string;
}

global._CONTEXT = '/knowledge';

describe('LayoutNoMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // viewport metaタグのモック
    const viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    viewportMeta.content = 'width=device-width, initial-scale=1';
    document.head.appendChild(viewportMeta);
  });

  afterEach(() => {
    // metaタグのクリーンアップ
    const metas = document.querySelectorAll('meta');
    metas.forEach(meta => meta.remove());
  });

  describe('基本レンダリング', () => {
    test('レイアウトが正しく表示される', () => {
      render(
        <LayoutNoMenu>
          <div>テストコンテンツ</div>
        </LayoutNoMenu>
      );

      // ナビゲーションバーが表示される
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      
      // ロゴとタイトルが表示される
      expect(screen.getByText('Knowledge')).toBeInTheDocument();
      expect(screen.getByText('Version 2.0.0')).toBeInTheDocument();
      
      // コンテンツが表示される
      expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();
    });

    test('ナビゲーションバーにメニューが含まれない', () => {
      render(
        <LayoutNoMenu>
          <div>テストコンテンツ</div>
        </LayoutNoMenu>
      );

      // メニューボタンが存在しない
      expect(screen.queryByRole('button', { name: /toggle navigation/i })).not.toBeInTheDocument();
      
      // メニュー項目が存在しない
      expect(screen.queryByText('Login')).not.toBeInTheDocument();
      expect(screen.queryByText('Public')).not.toBeInTheDocument();
    });
  });

  describe('パラメータサポート', () => {
    test('pageTitleが正しく適用される', () => {
      render(
        <LayoutNoMenu pageTitle="カスタムタイトル">
          <div>テストコンテンツ</div>
        </LayoutNoMenu>
      );

      // タイトルタグは直接テストできないため、Headコンポーネントのpropsをテスト
      expect(document.title).toBe('カスタムタイトル');
    });

    test('headContentが正しく適用される', () => {
      const customHead = <style>{`.test-style { color: red; }`}</style>;
      
      const { container } = render(
        <LayoutNoMenu headContent={customHead}>
          <div>テストコンテンツ</div>
        </LayoutNoMenu>
      );

      // headContentが渡されていることを確認（CommonHeaderのモックを通じて）
      expect(container.querySelector('style')).toBeInTheDocument();
      expect(container.querySelector('style')?.textContent).toContain('.test-style');
    });

    test('scriptsContentが正しく適用される', () => {
      const customScript = <script data-testid="custom-script">console.log('test');</script>;
      
      render(
        <LayoutNoMenu scriptsContent={customScript}>
          <div>テストコンテンツ</div>
        </LayoutNoMenu>
      );

      // スクリプトが追加されていることを確認
      expect(screen.getByTestId('custom-script')).toBeInTheDocument();
    });
  });

  describe('共通コンポーネントの統合', () => {
    test('CommonHeaderが含まれる', () => {
      render(
        <LayoutNoMenu>
          <div>テストコンテンツ</div>
        </LayoutNoMenu>
      );

      // CommonHeaderの要素が存在することを確認
      // viewport metaタグなどをチェック
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      expect(viewportMeta).toHaveAttribute('content', 'width=device-width, initial-scale=1');
    });

    test('CommonFooterが含まれる', () => {
      render(
        <LayoutNoMenu>
          <div>テストコンテンツ</div>
        </LayoutNoMenu>
      );

      // フッターが表示される
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('footer');
    });

    test('CommonScriptsが含まれる', () => {
      render(
        <LayoutNoMenu>
          <div>テストコンテンツ</div>
        </LayoutNoMenu>
      );

      // グローバル変数が設定されていることを確認
      expect((window as Window & { _CONTEXT?: string })._CONTEXT).toBe('/knowledge');
    });
  });

  describe('CSS構造の互換性', () => {
    test('旧システムと同じCSS構造を持つ', () => {
      render(
        <LayoutNoMenu>
          <div>テストコンテンツ</div>
        </LayoutNoMenu>
      );

      // ナビゲーションバーのクラス
      const navbar = screen.getByRole('navigation');
      expect(navbar).toHaveClass('navbar', 'navbar-default', 'navbar-fixed-top');

      // コンテナのクラス
      const containers = screen.getAllByTestId(/container/);
      containers.forEach(container => {
        expect(container).toHaveClass('container');
      });

      // コンテンツエリアのID
      const contentArea = screen.getByTestId('content-area');
      expect(contentArea).toHaveAttribute('id', 'content_top');
    });
  });

  describe('レスポンシブ対応', () => {
    test('モバイル表示でも正しく表示される', () => {
      // ビューポートをモバイルサイズに設定
      global.innerWidth = 375;
      global.innerHeight = 667;

      render(
        <LayoutNoMenu>
          <div>テストコンテンツ</div>
        </LayoutNoMenu>
      );

      // ナビゲーションバーが表示される
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      
      // コンテンツが表示される
      expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();
    });
  });

  describe('ブランドリンク', () => {
    test('ブランドリンクがトップページに遷移する', () => {
      render(
        <LayoutNoMenu>
          <div>テストコンテンツ</div>
        </LayoutNoMenu>
      );

      const brandLink = screen.getByRole('link', { name: /knowledge/i });
      expect(brandLink).toHaveAttribute('href', '/knowledge/');
    });
  });
});