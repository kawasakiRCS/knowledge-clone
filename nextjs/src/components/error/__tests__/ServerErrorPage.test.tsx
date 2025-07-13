/**
 * ServerErrorPageテスト
 * 
 * @description 500エラーページのテスト（旧システム: server_error.jsp）
 */
import { render, screen } from '@testing-library/react';
import ServerErrorPage from '../ServerErrorPage';

// Next.js関連のmock
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

describe('ServerErrorPage', () => {
  describe('基本レンダリング', () => {
    test('500エラーページが表示される', () => {
      render(<ServerErrorPage />);
      
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Server Error');
      expect(screen.getByText(/500/)).toBeInTheDocument();
    });

    test('エラーメッセージが表示される', () => {
      render(<ServerErrorPage />);
      
      // 500メッセージキー対応
      expect(screen.getByText(/message.httpstatus.500/)).toBeInTheDocument();
    });

    test('トップページへのリンクが表示される', () => {
      render(<ServerErrorPage />);
      
      const backLink = screen.getByRole('link', { name: /Back to Top/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveClass('btn', 'btn-info');
      expect(backLink).toHaveAttribute('href', '/index');
    });
  });

  describe('開発環境での例外表示', () => {
    test('localhost環境でスタックトレースが表示される', () => {
      const exception = new Error('Test server error');
      const isLocalhost = true;
      
      render(
        <ServerErrorPage 
          exception={exception} 
          isLocalhost={isLocalhost}
        />
      );
      
      expect(screen.getByText(/Test server error/)).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /stack trace/i })).toBeInTheDocument();
    });

    test('本番環境ではスタックトレースが非表示', () => {
      const exception = new Error('Test server error');
      const isLocalhost = false;
      
      render(
        <ServerErrorPage 
          exception={exception} 
          isLocalhost={isLocalhost}
        />
      );
      
      expect(screen.queryByText('Test server error')).not.toBeInTheDocument();
      expect(screen.queryByRole('region', { name: /stack trace/i })).not.toBeInTheDocument();
    });
  });

  describe('旧システム互換性', () => {
    test('containerクラスが適用される', () => {
      render(<ServerErrorPage />);
      
      const container = document.querySelector('.container');
      expect(container).toHaveClass('container');
    });

    test('エラー属性表示エリアが存在する', () => {
      const errorMessage = 'Internal server error occurred';
      render(<ServerErrorPage errorAttribute={errorMessage} />);
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    test('brタグの改行が適用される', () => {
      render(<ServerErrorPage />);
      
      // br要素の存在確認
      const brElement = document.querySelector('br');
      expect(brElement).toBeInTheDocument();
    });
  });

  describe('例外ハンドリング', () => {
    test('例外なしの場合は通常表示', () => {
      render(<ServerErrorPage isLocalhost={true} />);
      
      expect(screen.getByRole('heading')).toHaveTextContent('Server Error');
      expect(screen.queryByRole('region', { name: /stack trace/i })).not.toBeInTheDocument();
    });

    test('SERVER_EXCEPTION属性からの例外取得', () => {
      const serverException = new Error('Server exception from attribute');
      const isLocalhost = true;
      
      render(
        <ServerErrorPage 
          serverException={serverException}
          isLocalhost={isLocalhost}
        />
      );
      
      expect(screen.getByText(/Server exception from attribute/)).toBeInTheDocument();
    });
  });
});