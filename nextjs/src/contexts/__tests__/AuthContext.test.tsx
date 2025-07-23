/**
 * AuthContextテスト
 * 
 * @description 認証コンテキストの各機能をテスト
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { signIn, signOut, useSession } from 'next-auth/react';
import { bypassAuth } from '@/lib/auth';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  useSession: jest.fn()
}));

// Mock bypass auth
jest.mock('@/lib/auth', () => ({
  bypassAuth: jest.fn()
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
const mockBypassAuth = bypassAuth as jest.MockedFunction<typeof bypassAuth>;

// テスト用コンポーネント
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="isLoggedIn">{String(auth.isLoggedIn)}</div>
      <div data-testid="user-email">{auth.user?.email || 'no-email'}</div>
      <div data-testid="loading">{String(auth.loading)}</div>
      <button onClick={() => auth.login('test@example.com', 'password')}>Login</button>
      <button onClick={() => auth.logout()}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('初期状態', () => {
    test('ローディング中の状態で開始する', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn()
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('true');
      expect(screen.getByTestId('isLoggedIn')).toHaveTextContent('false');
    });
  });

  describe('認証済み状態', () => {
    test('セッションがある場合、ログイン状態になる', () => {
      const mockSession = {
        user: {
          email: 'test@example.com',
          name: 'Test User'
        },
        expires: '2024-12-31'
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
        update: jest.fn()
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('isLoggedIn')).toHaveTextContent('true');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  describe('未認証状態', () => {
    test('セッションがない場合、ログアウト状態になる', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn()
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('isLoggedIn')).toHaveTextContent('false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('no-email');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  describe('ログイン処理', () => {
    test('通常のログインが成功する', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn()
      });

      mockSignIn.mockResolvedValue({
        ok: true,
        error: undefined,
        status: 200,
        url: null
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByText('Login');
      loginButton.click();

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          username: 'test@example.com',
          password: 'password',
          redirect: false
        });
      });
    });

    test('バイパス認証でログインする', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn()
      });

      mockBypassAuth.mockResolvedValue({
        success: true,
        user: {
          email: 'bypass@example.com',
          name: 'Bypass User'
        }
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByText('Login');
      loginButton.click();

      await waitFor(() => {
        expect(mockBypassAuth).toHaveBeenCalledWith('test@example.com', 'password');
      });
    });

    test('ログインエラーを処理する', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn()
      });

      mockSignIn.mockResolvedValue({
        ok: false,
        error: 'Invalid credentials',
        status: 401,
        url: null
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByText('Login');
      loginButton.click();

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('ログインエラー:', 'Invalid credentials');
      });

      consoleSpy.mockRestore();
    });
  });

  describe('ログアウト処理', () => {
    test('ログアウトが成功する', async () => {
      const mockSession = {
        user: {
          email: 'test@example.com',
          name: 'Test User'
        },
        expires: '2024-12-31'
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
        update: jest.fn()
      });

      mockSignOut.mockResolvedValue({ url: '/' });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const logoutButton = screen.getByText('Logout');
      logoutButton.click();

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledWith({ redirect: false });
      });
    });

    test('ログアウトエラーを処理する', async () => {
      const mockSession = {
        user: {
          email: 'test@example.com',
          name: 'Test User'
        },
        expires: '2024-12-31'
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
        update: jest.fn()
      });

      mockSignOut.mockRejectedValue(new Error('Logout failed'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const logoutButton = screen.getByText('Logout');
      logoutButton.click();

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('ログアウトエラー:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('エラー処理', () => {
    test('コンテキスト外でuseAuthを使用するとエラーになる', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });
});