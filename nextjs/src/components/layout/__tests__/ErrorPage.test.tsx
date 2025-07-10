/**
 * エラーページコンポーネントテスト
 * 
 * @description 旧システムとの互換性テストを含む
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorPage } from '../ErrorPage';

describe('ErrorPage', () => {
  describe('基本レンダリング', () => {
    test('一般エラー（500）が表示される', () => {
      render(<ErrorPage />);
      
      expect(screen.getByRole('heading', { name: /error/i })).toBeInTheDocument();
      expect(screen.getByText(/内部サーバーエラーが発生しました/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /back to top/i })).toBeInTheDocument();
    });

    test('404エラーが表示される', () => {
      render(<ErrorPage statusCode={404} />);
      
      expect(screen.getByRole('heading', { name: /error/i })).toBeInTheDocument();
      expect(screen.getByText(/ページが見つかりません/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /back to top/i })).toBeInTheDocument();
    });

    test('403エラーが表示される', () => {
      render(<ErrorPage statusCode={403} />);
      
      expect(screen.getByRole('heading', { name: /error/i })).toBeInTheDocument();
      expect(screen.getByText(/アクセスが拒否されました/)).toBeInTheDocument();
    });

    test('401エラーが表示される', () => {
      render(<ErrorPage statusCode={401} />);
      
      expect(screen.getByRole('heading', { name: /error/i })).toBeInTheDocument();
      expect(screen.getByText(/認証が必要です/)).toBeInTheDocument();
    });
  });

  describe('開発環境機能', () => {
    const originalEnv = process.env.NODE_ENV;
    
    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    test('開発環境でエラー詳細が表示される', async () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Test error');
      
      render(<ErrorPage error={error} />);
      
      const detailButton = screen.getByRole('button', { name: /詳細を表示/i });
      expect(detailButton).toBeInTheDocument();
      
      // 初期状態では詳細は非表示
      expect(screen.queryByText('Test error')).not.toBeInTheDocument();
      
      // ボタンクリック後に詳細が表示される
      await userEvent.click(detailButton);
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    test('本番環境でエラー詳細が非表示', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Test error');
      
      render(<ErrorPage error={error} />);
      
      expect(screen.queryByText('Test error')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /詳細を表示/i })).not.toBeInTheDocument();
    });
  });

  describe('トップページリンク', () => {
    test('トップページへのリンクが正しい', () => {
      render(<ErrorPage />);
      
      const backLink = screen.getByRole('link', { name: /back to top/i });
      expect(backLink).toHaveAttribute('href', '/index');
    });

    test('リンクに正しいCSSクラスが設定されている', () => {
      render(<ErrorPage />);
      
      const backLink = screen.getByRole('link', { name: /back to top/i });
      expect(backLink).toHaveClass('btn', 'btn-info');
    });
  });

  describe('カスタムエラーメッセージ', () => {
    test('カスタムメッセージが表示される', () => {
      const customMessage = 'カスタムエラーメッセージ';
      render(<ErrorPage message={customMessage} />);
      
      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    test('カスタムメッセージがある場合デフォルトメッセージは表示されない', () => {
      const customMessage = 'カスタムエラーメッセージ';
      render(<ErrorPage message={customMessage} />);
      
      expect(screen.queryByText(/内部サーバーエラーが発生しました/)).not.toBeInTheDocument();
    });
  });

  describe('旧システム互換性', () => {
    test('メインコンテナにcontainerクラスが適用される', () => {
      render(<ErrorPage />);
      
      const container = screen.getByRole('main');
      expect(container).toHaveClass('container');
    });

    test('BootstrapボタンクラスがBack to Topリンクに適用される', () => {
      render(<ErrorPage />);
      
      const backLink = screen.getByRole('link', { name: /back to top/i });
      expect(backLink).toHaveClass('btn', 'btn-info');
    });
  });
});