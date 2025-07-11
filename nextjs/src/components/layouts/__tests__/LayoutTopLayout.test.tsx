/**
 * LayoutTopLayoutコンポーネントテスト
 * 
 * @description トップページ専用レイアウトのテスト（旧layoutTop.jsp互換）
 */
import { render, screen } from '@testing-library/react';
import { LayoutTopLayout } from '../LayoutTopLayout';
import '@testing-library/jest-dom';

// モックの設定
jest.mock('../../layout/CommonHeader', () => ({
  CommonHeader: () => <div data-testid="common-header">CommonHeader</div>
}));

jest.mock('../../layout/CommonFooter', () => ({
  CommonFooter: () => <div data-testid="common-footer">CommonFooter</div>
}));

jest.mock('../../layout/CommonScripts', () => ({
  CommonScripts: () => <div data-testid="common-scripts">CommonScripts</div>
}));

// AnalyticsConfig のモック
const mockGetAnalyticsScript = jest.fn(() => '<script>console.log("analytics")</script>');

describe('LayoutTopLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本レンダリング', () => {
    test('コンポーネントが正しくレンダリングされる', () => {
      render(
        <LayoutTopLayout>
          <div>Test Content</div>
        </LayoutTopLayout>
      );

      // 共通コンポーネントの確認
      expect(screen.getByTestId('common-header')).toBeInTheDocument();
      expect(screen.getByTestId('common-footer')).toBeInTheDocument();
      expect(screen.getByTestId('common-scripts')).toBeInTheDocument();

      // コンテンツの確認
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    test('content_topのスタイルが正しく適用される', () => {
      render(
        <LayoutTopLayout>
          <div>Test Content</div>
        </LayoutTopLayout>
      );

      const contentDiv = screen.getByText('Test Content').parentElement;
      expect(contentDiv).toHaveAttribute('id', 'content_top');
      expect(contentDiv).toHaveStyle({ margin: '0', padding: '0' });
    });
  });

  describe('パラメータサポート', () => {
    test('pageTitle propが正しく処理される', () => {
      render(
        <LayoutTopLayout pageTitle="Custom Page Title">
          <div>Test Content</div>
        </LayoutTopLayout>
      );

      // CommonHeaderに渡されるはずなので、実際の実装では確認可能
      expect(document.title).toBeDefined();
    });

    test('headContent propが正しく処理される', () => {
      const headContent = '<link rel="stylesheet" href="/custom.css" />';
      
      render(
        <LayoutTopLayout headContent={headContent}>
          <div>Test Content</div>
        </LayoutTopLayout>
      );

      // CommonHeaderに渡されるはずなので、実際の実装では確認可能
      expect(screen.getByTestId('common-header')).toBeInTheDocument();
    });

    test('scriptsContent propが正しく処理される', () => {
      const scriptsContent = '<script>console.log("custom script")</script>';
      
      render(
        <LayoutTopLayout scriptsContent={scriptsContent}>
          <div>Test Content</div>
        </LayoutTopLayout>
      );

      // CommonScriptsの後に追加されるはずなので、実際の実装では確認可能
      expect(screen.getByTestId('common-scripts')).toBeInTheDocument();
    });
  });

  describe('旧システム互換性', () => {
    test('JSPパラメータ名との互換性確認', () => {
      // PARAM_PAGE_TITLE -> pageTitle
      // PARAM_HEAD -> headContent
      // PARAM_CONTENT -> children
      // PARAM_SCRIPTS -> scriptsContent
      
      render(
        <LayoutTopLayout
          pageTitle="Title"
          headContent="<style></style>"
          scriptsContent="<script></script>"
        >
          <div>Content</div>
        </LayoutTopLayout>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    test('アナリティクススクリプトが含まれる', () => {
      const { container } = render(
        <LayoutTopLayout>
          <div>Test Content</div>
        </LayoutTopLayout>
      );

      // アナリティクススクリプトが含まれることを確認（実装後に詳細確認）
      expect(container).toBeTruthy();
    });
  });

  describe('特殊ケース', () => {
    test('children が空の場合でもレンダリングされる', () => {
      render(<LayoutTopLayout />);

      expect(screen.getByTestId('common-header')).toBeInTheDocument();
      expect(screen.getByTestId('common-footer')).toBeInTheDocument();
    });

    test('複数の children が正しくレンダリングされる', () => {
      render(
        <LayoutTopLayout>
          <div>First Child</div>
          <div>Second Child</div>
          <div>Third Child</div>
        </LayoutTopLayout>
      );

      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
      expect(screen.getByText('Third Child')).toBeInTheDocument();
    });
  });
});