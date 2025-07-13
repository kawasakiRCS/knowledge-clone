/**
 * ForbiddenPageテスト
 * 
 * @description 403エラーページのテスト（旧システム: forbidden.jsp）
 */
import { render, screen } from '@testing-library/react';
import ForbiddenPage from '../ForbiddenPage';

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

describe('ForbiddenPage', () => {
  describe('基本レンダリング', () => {
    test('403エラーページが表示される', () => {
      render(<ForbiddenPage />);
      
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Error');
      expect(screen.getByText(/403/)).toBeInTheDocument();
    });

    test('エラーメッセージが表示される', () => {
      render(<ForbiddenPage />);
      
      // 403メッセージキー対応
      expect(screen.getByText(/message.httpstatus.403/)).toBeInTheDocument();
    });

    test('トップページへのリンクが表示される', () => {
      render(<ForbiddenPage />);
      
      const backLink = screen.getByRole('link', { name: /Back to Top/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveClass('btn', 'btn-info');
      expect(backLink).toHaveAttribute('href', '/index');
    });
  });

  describe('旧システム互換性', () => {
    test('containerクラスが適用される', () => {
      render(<ForbiddenPage />);
      
      const container = document.querySelector('.container');
      expect(container).toHaveClass('container');
    });

    test('エラー属性表示エリアが存在する', () => {
      const errorMessage = 'Access forbidden to this resource';
      render(<ForbiddenPage errorAttribute={errorMessage} />);
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('アクセス制御エラー表示', () => {
    test('エラー属性なしの場合は基本メッセージのみ', () => {
      render(<ForbiddenPage />);
      
      expect(screen.getByText(/message.httpstatus.403/)).toBeInTheDocument();
      // エラー属性エリアは存在するが空
      const container = document.querySelector('.container');
      expect(container).toBeInTheDocument();
    });

    test('エラー属性ありの場合は詳細表示', () => {
      const errorDetails = 'You do not have permission to access this page';
      render(<ForbiddenPage errorAttribute={errorDetails} />);
      
      expect(screen.getByText(errorDetails)).toBeInTheDocument();
    });
  });
});