/**
 * クライアントサイド認証ユーティリティテスト
 * 
 * @description 認証関連のクライアントサイド関数のテストカバレッジを向上
 */
import { signIn, signOut, getCurrentUser, isAuthenticated } from '../client';
import { LoginFormData, AuthenticationResult, LoginedUser } from '@/types/auth';

// fetchのモック
global.fetch = jest.fn();

describe('client.ts - 認証ユーティリティ', () => {
  // window.location.hrefのモック
  const originalLocation = window.location;

  beforeEach(() => {
    jest.clearAllMocks();
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  describe('signIn', () => {
    const mockCredentials: LoginFormData = {
      userId: 'testuser',
      password: 'password123',
      cookieLogin: false
    };

    test('正常にログインできる', async () => {
      const mockUser: LoginedUser = {
        userId: 1,
        userName: 'testuser',
        roleId: 1
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser })
      });

      const result = await signIn(mockCredentials);

      expect(result).toEqual({
        success: true,
        user: mockUser
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockCredentials),
      });
    });

    test('ログイン失敗時にエラーメッセージを返す', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ success: false, error: 'Invalid credentials' })
      });

      const result = await signIn(mockCredentials);

      expect(result).toEqual({
        success: false,
        error: 'Invalid credentials'
      });
    });

    test('エラーメッセージがない場合のデフォルトメッセージ', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ success: false })
      });

      const result = await signIn(mockCredentials);

      expect(result).toEqual({
        success: false,
        error: 'ログインに失敗しました'
      });
    });

    test('ネットワークエラーを処理する', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await signIn(mockCredentials);

      expect(result).toEqual({
        success: false,
        error: 'ネットワークエラーが発生しました'
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Sign in error:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('signOut', () => {
    test.skip('正常にログアウトできる', async () => {
      // window.location.hrefのセッターをモック
      const hrefSetter = jest.fn();
      Object.defineProperty(window.location, 'href', {
        set: hrefSetter,
        configurable: true,
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      });

      await signOut();

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/signout', {
        method: 'POST',
      });
      expect(hrefSetter).toHaveBeenCalledWith('/');
    });

    test.skip('エラーが発生してもホームページにリダイレクトする', async () => {
      // window.location.hrefのセッターをモック
      const hrefSetter = jest.fn();
      Object.defineProperty(window.location, 'href', {
        set: hrefSetter,
        configurable: true,
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await signOut();

      expect(hrefSetter).toHaveBeenCalledWith('/');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Sign out error:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getCurrentUser', () => {
    test('ユーザー情報を正常に取得できる', async () => {
      const mockUser: LoginedUser = {
        userId: 1,
        userName: 'testuser',
        roleId: 1
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser })
      });

      const user = await getCurrentUser();

      expect(user).toEqual(mockUser);
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/me');
    });

    test('ユーザーが存在しない場合nullを返す', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      const user = await getCurrentUser();

      expect(user).toBeNull();
    });

    test('レスポンスがokでない場合nullを返す', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      const user = await getCurrentUser();

      expect(user).toBeNull();
    });

    test('ネットワークエラー時にnullを返す', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const user = await getCurrentUser();

      expect(user).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Get current user error:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('isAuthenticated', () => {
    test('ユーザーが存在する場合trueを返す', async () => {
      const mockUser: LoginedUser = {
        userId: 1,
        userName: 'testuser',
        roleId: 1
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser })
      });

      const result = await isAuthenticated();

      expect(result).toBe(true);
    });

    test('ユーザーが存在しない場合falseを返す', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      const result = await isAuthenticated();

      expect(result).toBe(false);
    });
  });
});