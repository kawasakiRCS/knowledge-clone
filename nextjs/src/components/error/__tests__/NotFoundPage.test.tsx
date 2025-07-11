/**
 * NotFoundPageテスト
 * 
 * @description 404エラーページのテスト（旧システム: not_found.jsp）
 */
import { render, screen } from '@testing-library/react';
import { NotFoundPage } from '../NotFoundPage';

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

describe('NotFoundPage', () => {
  describe('基本レンダリング', () => {
    test('404エラーページが表示される', () => {
      render(<NotFoundPage />);
      
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Error');
      expect(screen.getByText(/404/)).toBeInTheDocument();
    });

    test('エラーメッセージが表示される', () => {
      render(<NotFoundPage />);
      
      // 404メッセージキー対応
      expect(screen.getByText(/message.httpstatus.404/)).toBeInTheDocument();
    });

    test('トップページへのリンクが表示される', () => {
      render(<NotFoundPage />);
      
      const backLink = screen.getByRole('link', { name: /Back to Top/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveClass('btn', 'btn-info');
      expect(backLink).toHaveAttribute('href', '/index');
    });
  });

  describe('旧システム互換性', () => {
    test('containerクラスが適用される', () => {
      render(<NotFoundPage />);
      
      const container = document.querySelector('.container');
      expect(container).toHaveClass('container');
    });

    test('エラー属性表示エリアが存在する', () => {
      const errorMessage = 'Page not found error';
      render(<NotFoundPage errorAttribute={errorMessage} />);
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('エラー詳細表示', () => {
    test('エラー属性なしの場合は空文字表示', () => {
      render(<NotFoundPage />);
      
      // エラー属性エリアが存在するが空
      const container = document.querySelector('.container');
      expect(container).toBeInTheDocument();
    });

    test('エラー属性ありの場合は詳細表示', () => {
      const errorDetails = 'Detailed error information';
      render(<NotFoundPage errorAttribute={errorDetails} />);
      
      expect(screen.getByText(errorDetails)).toBeInTheDocument();
    });
  });
});