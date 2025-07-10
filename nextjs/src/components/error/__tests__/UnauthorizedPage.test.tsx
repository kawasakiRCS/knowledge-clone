/**
 * UnauthorizedPageテスト
 * 
 * @description 401エラーページのテスト（旧システム: unauthorized.jsp）
 */
import { render, screen } from '@testing-library/react';
import { UnauthorizedPage } from '../UnauthorizedPage';

describe('UnauthorizedPage', () => {
  describe('基本レンダリング', () => {
    test('401エラーページが表示される', () => {
      render(<UnauthorizedPage />);
      
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Error');
      expect(screen.getByText(/401/)).toBeInTheDocument();
    });

    test('エラーメッセージが表示される', () => {
      render(<UnauthorizedPage />);
      
      // 401メッセージキー対応
      expect(screen.getByText(/message.httpstatus.401/)).toBeInTheDocument();
    });

    test('トップページへのリンクが表示される', () => {
      render(<UnauthorizedPage />);
      
      const backLink = screen.getByRole('link', { name: /Back to Top/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveClass('btn', 'btn-info');
      expect(backLink).toHaveAttribute('href', '/index');
    });
  });

  describe('旧システム互換性', () => {
    test('containerクラスが適用される', () => {
      render(<UnauthorizedPage />);
      
      const container = document.querySelector('.container');
      expect(container).toHaveClass('container');
    });

    test('エラー属性表示エリアが存在する', () => {
      const errorMessage = 'Authentication required for this resource';
      render(<UnauthorizedPage errorAttribute={errorMessage} />);
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('認証エラー表示', () => {
    test('エラー属性なしの場合は基本メッセージのみ', () => {
      render(<UnauthorizedPage />);
      
      expect(screen.getByText(/message.httpstatus.401/)).toBeInTheDocument();
      // エラー属性エリアは存在するが空
      const container = document.querySelector('.container');
      expect(container).toBeInTheDocument();
    });

    test('エラー属性ありの場合は詳細表示', () => {
      const errorDetails = 'Please log in to access this page';
      render(<UnauthorizedPage errorAttribute={errorDetails} />);
      
      expect(screen.getByText(errorDetails)).toBeInTheDocument();
    });
  });
});