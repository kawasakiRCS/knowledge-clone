/**
 * ヘッダーコンポーネントのテスト
 * 
 * @description Header.tsxの単体テスト
 */

import { render } from '@testing-library/react';
import Head from 'next/head';
import { Header } from '../Header';
import { useTheme } from '@/lib/hooks/useTheme';

// モックの設定
jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

jest.mock('@/lib/hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

describe('Header', () => {
  const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

  beforeEach(() => {
    mockUseTheme.mockReturnValue({
      theme: 'flatly',
      highlightTheme: 'darkula',
      setTheme: jest.fn(),
      setHighlightTheme: jest.fn(),
    });
  });

  test('デフォルトのプロパティでレンダリングされる', () => {
    const { container } = render(<Header />);
    
    // メタタグの確認
    expect(container.querySelector('meta[charset="UTF-8"]')).toBeInTheDocument();
    expect(container.querySelector('meta[name="title"]')).toHaveAttribute('content', 'Knowledge');
    expect(container.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'ナレッジマネジメントシステム'
    );
    expect(container.querySelector('meta[name="keywords"]')).toHaveAttribute(
      'content',
      'ナレッジマネジメント,ナレッジベース,情報共有,オープンソース,KnowledgeBase,KnowledgeManagement,OSS,Markdown'
    );
  });

  test('カスタムプロパティでレンダリングされる', () => {
    const { container } = render(
      <Header
        pageTitle="カスタムタイトル"
        description="カスタム説明"
        keywords="カスタム,キーワード"
      />
    );
    
    expect(container.querySelector('meta[name="title"]')).toHaveAttribute('content', 'カスタムタイトル');
    expect(container.querySelector('meta[name="description"]')).toHaveAttribute('content', 'カスタム説明');
    expect(container.querySelector('meta[name="keywords"]')).toHaveAttribute('content', 'カスタム,キーワード');
  });

  test('Open Graphメタタグが設定される', () => {
    const { container } = render(<Header pageTitle="テストページ" description="テスト説明" />);
    
    expect(container.querySelector('meta[property="og:type"]')).toHaveAttribute('content', 'article');
    expect(container.querySelector('meta[property="og:title"]')).toHaveAttribute('content', 'テストページ');
    expect(container.querySelector('meta[property="og:description"]')).toHaveAttribute('content', 'テスト説明');
    expect(container.querySelector('meta[property="og:site_name"]')).toHaveAttribute('content', 'Knowledge');
  });

  test('レスポンシブメタタグが設定される', () => {
    const { container } = render(<Header />);
    
    expect(container.querySelector('meta[http-equiv="X-UA-Compatible"]')).toHaveAttribute('content', 'IE=edge');
    expect(container.querySelector('meta[name="viewport"]')).toHaveAttribute(
      'content',
      'width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1'
    );
  });

  test('キャッシュ制御メタタグが設定される', () => {
    const { container } = render(<Header />);
    
    expect(container.querySelector('meta[http-equiv="expires"]')).toHaveAttribute('content', '0');
    expect(container.querySelector('meta[http-equiv="Pragma"]')).toHaveAttribute('content', 'no-cache');
    expect(container.querySelector('meta[http-equiv="Cache-Control"]')).toHaveAttribute('content', 'no-cache');
  });

  test('テーマCSSが動的に読み込まれる', () => {
    const { container } = render(<Header />);
    
    const themeLink = container.querySelector('link[href="/css/themes/flatly.css"]');
    expect(themeLink).toBeInTheDocument();
    expect(themeLink).toHaveAttribute('rel', 'stylesheet');
  });

  test('カスタムテーマが適用される', () => {
    mockUseTheme.mockReturnValue({
      theme: 'superhero',
      highlightTheme: 'github',
      setTheme: jest.fn(),
      setHighlightTheme: jest.fn(),
    });

    const { container } = render(<Header />);
    
    expect(container.querySelector('link[href="/css/themes/superhero.css"]')).toBeInTheDocument();
    expect(container.querySelector('link[href="/css/highlight/github.css"]')).toBeInTheDocument();
  });

  test('外部ライブラリのCSSが読み込まれる', () => {
    const { container } = render(<Header />);
    
    // Font Awesome
    const fontAwesomeLink = container.querySelector('link[href*="font-awesome"]');
    expect(fontAwesomeLink).toBeInTheDocument();
    expect(fontAwesomeLink).toHaveAttribute('integrity');
    expect(fontAwesomeLink).toHaveAttribute('crossorigin', 'anonymous');
    
    // Flag Icons
    const flagIconLink = container.querySelector('link[href*="flag-icon-css"]');
    expect(flagIconLink).toBeInTheDocument();
    expect(flagIconLink).toHaveAttribute('integrity');
    expect(flagIconLink).toHaveAttribute('crossorigin', 'anonymous');
  });

  test('ファビコンが設定される', () => {
    const { container } = render(<Header />);
    
    const favicon = container.querySelector('link[rel="icon"]');
    expect(favicon).toHaveAttribute('href', '/favicon.ico');
    expect(favicon).toHaveAttribute('type', 'image/vnd.microsoft.icon');
  });

  test('カスタムメタタグが追加される', () => {
    const customMeta = (
      <>
        <meta name="custom-meta" content="custom-value" />
        <meta property="custom:property" content="custom-property-value" />
      </>
    );
    
    const { container } = render(<Header customMeta={customMeta} />);
    
    expect(container.querySelector('meta[name="custom-meta"]')).toHaveAttribute('content', 'custom-value');
    expect(container.querySelector('meta[property="custom:property"]')).toHaveAttribute(
      'content',
      'custom-property-value'
    );
  });

  test('コンテンツタイプメタタグが設定される', () => {
    const { container } = render(<Header />);
    
    expect(container.querySelector('meta[http-equiv="Content-Type"]')).toHaveAttribute(
      'content',
      'text/html; charset=utf-8'
    );
    expect(container.querySelector('meta[http-equiv="Content-Style-Type"]')).toHaveAttribute('content', 'text/css');
    expect(container.querySelector('meta[http-equiv="Content-Script-Type"]')).toHaveAttribute(
      'content',
      'text/javascript'
    );
    expect(container.querySelector('meta[http-equiv="imagetoolbar"]')).toHaveAttribute('content', 'no');
  });

  test('テーマが指定されていない場合はデフォルトを使用', () => {
    mockUseTheme.mockReturnValue({
      theme: null as any,
      highlightTheme: null as any,
      setTheme: jest.fn(),
      setHighlightTheme: jest.fn(),
    });

    const { container } = render(<Header />);
    
    expect(container.querySelector('link[href="/css/themes/flatly.css"]')).toBeInTheDocument();
    expect(container.querySelector('link[href="/css/highlight/darkula.css"]')).toBeInTheDocument();
  });

  test('Open Graph URLが正しく設定される', () => {
    const { container } = render(<Header />);
    
    expect(container.querySelector('meta[property="og:url"]')).toHaveAttribute(
      'content',
      'https://support-project.org/knowledge/index'
    );
  });

  test('すべてのプロパティがundefinedの場合でも動作する', () => {
    const { container } = render(
      <Header
        pageTitle={undefined}
        description={undefined}
        keywords={undefined}
        customMeta={undefined}
      />
    );
    
    expect(container.querySelector('meta[name="title"]')).toHaveAttribute('content', 'Knowledge');
    expect(container.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'ナレッジマネジメントシステム'
    );
  });

  test('空文字列が渡された場合も正しく処理される', () => {
    const { container } = render(
      <Header
        pageTitle=""
        description=""
        keywords=""
      />
    );
    
    expect(container.querySelector('meta[name="title"]')).toHaveAttribute('content', '');
    expect(container.querySelector('meta[name="description"]')).toHaveAttribute('content', '');
    expect(container.querySelector('meta[name="keywords"]')).toHaveAttribute('content', '');
    expect(container.querySelector('meta[property="og:title"]')).toHaveAttribute('content', '');
    expect(container.querySelector('meta[property="og:description"]')).toHaveAttribute('content', '');
  });
});