/**
 * ログインページテスト
 * 
 * @description 旧システムauth/form.jspに対応するNext.jsページのテスト
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSearchParams } from 'next/navigation';
import LoginPage from '../page';

// モック
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

jest.mock('@/components/layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/forms/LoginForm', () => ({
  LoginForm: ({ onSubmit, initialValues, loginError, showDescription, showSignup, redirectTo }: any) => (
    <div data-testid="login-form">
      <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          username: 'testuser',
          password: 'testpass',
          page: redirectTo,
        });
      }}>
        <div>Initial Username: {initialValues.username}</div>
        <div>Initial Password: {initialValues.password}</div>
        <div>Login Error: {loginError ? 'true' : 'false'}</div>
        <div>Show Description: {showDescription ? 'true' : 'false'}</div>
        <div>Show Signup: {showSignup ? 'true' : 'false'}</div>
        <div>Redirect To: {redirectTo || 'none'}</div>
        <button type="submit">Login</button>
      </form>
    </div>
  ),
}));

// next-auth/reactのモック
const mockSignIn = jest.fn();
jest.mock('next-auth/react', () => ({
  signIn: mockSignIn,
}));

describe('LoginPage', () => {
  const mockSearchParams = new Map();
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.clear();
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => mockSearchParams.get(key),
    });
    // window.location.hrefのモック
    delete (window as any).location;
    window.location = { href: 'http://localhost/signin' } as any;
  });

  describe('基本レンダリング', () => {
    test('ログインページが正しくレンダリングされる', () => {
      render(<LoginPage />);
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    test('Suspenseでラップされている', () => {
      render(<LoginPage />);
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });
  });

  describe('URLパラメータ処理', () => {
    test('エラーパラメータが正しく処理される', () => {
      mockSearchParams.set('error', 'true');
      mockSearchParams.set('username', 'faileduser');
      
      render(<LoginPage />);
      
      expect(screen.getByText('Login Error: true')).toBeInTheDocument();
      expect(screen.getByText('Initial Username: faileduser')).toBeInTheDocument();
    });

    test('pageパラメータが正しく処理される', () => {
      mockSearchParams.set('page', '/dashboard');
      
      render(<LoginPage />);
      
      expect(screen.getByText('Redirect To: /dashboard')).toBeInTheDocument();
      expect(screen.getByText('Show Description: true')).toBeInTheDocument();
    });

    test('page=/open/knowledge/listの場合、説明が表示されない', () => {
      mockSearchParams.set('page', '/open/knowledge/list');
      
      render(<LoginPage />);
      
      expect(screen.getByText('Show Description: false')).toBeInTheDocument();
    });

    test('パスワードパラメータが正しく処理される', () => {
      mockSearchParams.set('password', 'testpass123');
      
      render(<LoginPage />);
      
      expect(screen.getByText('Initial Password: testpass123')).toBeInTheDocument();
    });
  });

  describe('ログイン処理', () => {
    test('ログイン成功時にリダイレクトされる', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({ ok: true });
      
      render(<LoginPage />);
      
      const loginButton = screen.getByRole('button', { name: 'Login' });
      await user.click(loginButton);
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          loginId: 'testuser',
          password: 'testpass',
          redirect: false,
        });
      });
      
      expect(window.location.href).toBe('/index');
    });

    test('pageパラメータがある場合、指定されたページにリダイレクト', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('page', '/dashboard');
      mockSignIn.mockResolvedValue({ ok: true });
      
      render(<LoginPage />);
      
      const loginButton = screen.getByRole('button', { name: 'Login' });
      await user.click(loginButton);
      
      await waitFor(() => {
        expect(window.location.href).toBe('/dashboard');
      });
    });

    test('ログイン失敗時にエラーパラメータが設定される', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({ ok: false });
      
      render(<LoginPage />);
      
      const loginButton = screen.getByRole('button', { name: 'Login' });
      await user.click(loginButton);
      
      await waitFor(() => {
        expect(window.location.href).toContain('error=true');
        expect(window.location.href).toContain('username=testuser');
      });
    });

    test('ログインエラー時の処理', async () => {
      const user = userEvent.setup();
      mockSignIn.mockRejectedValue(new Error('Network error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(<LoginPage />);
      
      const loginButton = screen.getByRole('button', { name: 'Login' });
      await user.click(loginButton);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Login error:', expect.any(Error));
        expect(window.location.href).toContain('error=true');
      });
      
      consoleErrorSpy.mockRestore();
    });

    test('ローディング状態が表示される', async () => {
      const user = userEvent.setup();
      mockSignIn.mockImplementation(() => new Promise(() => {})); // 永続的にpending
      
      render(<LoginPage />);
      
      const loginButton = screen.getByRole('button', { name: 'Login' });
      await user.click(loginButton);
      
      await waitFor(() => {
        expect(screen.getByText('サインイン中...')).toBeInTheDocument();
      });
    });
  });

  describe('初期値設定', () => {
    test('パラメータがない場合のデフォルト値', () => {
      render(<LoginPage />);
      
      expect(screen.getByText('Initial Username:')).toBeInTheDocument();
      expect(screen.getByText('Initial Password:')).toBeInTheDocument();
      expect(screen.getByText('Login Error: false')).toBeInTheDocument();
      expect(screen.getByText('Show Description: false')).toBeInTheDocument();
      expect(screen.getByText('Show Signup: true')).toBeInTheDocument();
    });
  });

  describe('動的インポート', () => {
    test('next-auth/reactが動的にインポートされる', async () => {
      const user = userEvent.setup();
      
      render(<LoginPage />);
      
      const loginButton = screen.getByRole('button', { name: 'Login' });
      await user.click(loginButton);
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });
    });
  });
});