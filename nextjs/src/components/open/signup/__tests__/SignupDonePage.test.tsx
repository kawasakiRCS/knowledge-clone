import { render, screen } from '@testing-library/react';
import SignupDonePage from '../SignupDonePage';

// Mocking Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock MainLayout to avoid its dependencies
jest.mock('@/components/layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('SignupDonePage', () => {
  describe('基本レンダリング', () => {
    test('コンポーネントが表示される', () => {
      render(<SignupDonePage />);
      
      // タイトルが表示されること
      expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('ユーザ新規登録');
      expect(screen.getByRole('heading', { level: 4 })).toHaveClass('title');
    });

    test('完了メッセージが表示される', () => {
      render(<SignupDonePage />);
      
      // 完了メッセージが表示されること
      expect(screen.getByText('ユーザ登録が完了しました')).toBeInTheDocument();
    });

    test('ナレッジ一覧へのリンクが表示される', () => {
      render(<SignupDonePage />);
      
      // リンクが表示されること
      const link = screen.getByRole('link', { name: 'Knowledge の利用開始' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveClass('btn', 'btn-info');
      expect(link).toHaveAttribute('href', '/open/knowledge/list');
    });
  });

  describe('レイアウト', () => {
    test('MainLayoutが使用される', () => {
      const { container } = render(<SignupDonePage />);
      
      // MainLayoutでラップされていること（モック化されているため、divで確認）
      expect(container.firstChild?.nodeName).toBe('DIV');
    });
  });
});