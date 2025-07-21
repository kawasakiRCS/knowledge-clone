/**
 * SessionProviderテスト
 * 
 * @description NextAuthセッションプロバイダーの動作を検証
 */
import { render, screen } from '@testing-library/react';
import { SessionProvider } from '../SessionProvider';
import { Session } from 'next-auth';

// next-auth/reactのモック
jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children, session }: { children: React.ReactNode; session?: Session | null }) => {
    return (
      <div data-testid="next-auth-provider" data-session={session ? 'true' : 'false'}>
        {children}
      </div>
    );
  },
}));

describe('SessionProvider', () => {
  describe('基本レンダリング', () => {
    test('子要素が正しくレンダリングされる', () => {
      render(
        <SessionProvider>
          <div data-testid="child-element">テスト子要素</div>
        </SessionProvider>
      );
      
      expect(screen.getByTestId('child-element')).toBeInTheDocument();
      expect(screen.getByText('テスト子要素')).toBeInTheDocument();
    });

    test('NextAuthSessionProviderがレンダリングされる', () => {
      render(
        <SessionProvider>
          <div>テスト</div>
        </SessionProvider>
      );
      
      expect(screen.getByTestId('next-auth-provider')).toBeInTheDocument();
    });
  });

  describe('セッション管理', () => {
    test('セッションなしでレンダリングされる', () => {
      render(
        <SessionProvider>
          <div>テスト</div>
        </SessionProvider>
      );
      
      const provider = screen.getByTestId('next-auth-provider');
      expect(provider).toHaveAttribute('data-session', 'false');
    });

    test('セッションありでレンダリングされる', () => {
      const mockSession: Session = {
        user: {
          id: '1',
          name: 'テストユーザー',
          email: 'test@example.com',
        },
        expires: '2024-12-31',
      };
      
      render(
        <SessionProvider session={mockSession}>
          <div>テスト</div>
        </SessionProvider>
      );
      
      const provider = screen.getByTestId('next-auth-provider');
      expect(provider).toHaveAttribute('data-session', 'true');
    });

    test('nullセッションが正しく処理される', () => {
      render(
        <SessionProvider session={null}>
          <div>テスト</div>
        </SessionProvider>
      );
      
      const provider = screen.getByTestId('next-auth-provider');
      expect(provider).toHaveAttribute('data-session', 'false');
    });
  });

  describe('複数の子要素', () => {
    test('複数の子要素が全てレンダリングされる', () => {
      render(
        <SessionProvider>
          <div data-testid="child-1">子要素1</div>
          <div data-testid="child-2">子要素2</div>
          <div data-testid="child-3">子要素3</div>
        </SessionProvider>
      );
      
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });
  });

  describe('ネストしたコンポーネント', () => {
    test('深くネストした要素もレンダリングされる', () => {
      render(
        <SessionProvider>
          <div>
            <div>
              <div data-testid="nested-element">ネストした要素</div>
            </div>
          </div>
        </SessionProvider>
      );
      
      expect(screen.getByTestId('nested-element')).toBeInTheDocument();
    });
  });

  describe('動的なセッション更新', () => {
    test('異なるセッションでの再レンダリング', () => {
      const { rerender } = render(
        <SessionProvider session={null}>
          <div>テスト</div>
        </SessionProvider>
      );
      
      let provider = screen.getByTestId('next-auth-provider');
      expect(provider).toHaveAttribute('data-session', 'false');
      
      const newSession: Session = {
        user: {
          id: '2',
          name: '新しいユーザー',
          email: 'new@example.com',
        },
        expires: '2025-01-01',
      };
      
      rerender(
        <SessionProvider session={newSession}>
          <div>テスト</div>
        </SessionProvider>
      );
      
      provider = screen.getByTestId('next-auth-provider');
      expect(provider).toHaveAttribute('data-session', 'true');
    });
  });
});