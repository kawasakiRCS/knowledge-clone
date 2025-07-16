/**
 * AuthOptions テスト
 * 
 * @description NextAuth設定オプションのテストケース
 */
import { describe, test, expect, beforeEach } from '@jest/globals';
import { authOptions } from '../authOptions';

// fetch のモック
global.fetch = jest.fn();

describe('authOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('providers', () => {
    test('credentials providerが設定されている', () => {
      expect(authOptions.providers).toHaveLength(1);
      
      const provider = authOptions.providers[0];
      expect(provider.name).toBe('credentials');
      expect(provider.credentials).toEqual({
        loginId: { label: 'Login ID', type: 'text' },
        password: { label: 'Password', type: 'password' },
      });
    });

    test('authorize関数が存在する', () => {
      const provider = authOptions.providers[0] as any;
      expect(typeof provider.authorize).toBe('function');
    });
  });

  describe('authorize function', () => {
    let authorize: any;

    beforeEach(() => {
      const provider = authOptions.providers[0] as any;
      authorize = provider.authorize;
    });

    test('有効な認証情報で認証成功', async () => {
      const mockUser = {
        userId: 1,
        userName: 'testuser',
        email: 'test@example.com',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          user: mockUser,
        }),
      });

      const result = await authorize({
        loginId: 'testuser',
        password: 'password123',
      });

      expect(result).toEqual(mockUser);
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.NEXTAUTH_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            loginId: 'testuser',
            password: 'password123',
          }),
        }
      );
    });

    test('無効な認証情報で認証失敗', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: 'Invalid credentials',
        }),
      });

      const result = await authorize({
        loginId: 'testuser',
        password: 'wrongpassword',
      });

      expect(result).toBeNull();
    });

    test('認証情報が不足している場合nullを返す', async () => {
      const result1 = await authorize({
        password: 'password123',
      });

      const result2 = await authorize({
        loginId: 'testuser',
      });

      const result3 = await authorize({});

      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(result3).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('fetch エラー時にnullを返す', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await authorize({
        loginId: 'testuser',
        password: 'password123',
      });

      expect(result).toBeNull();
    });

    test('レスポンスが成功でもユーザー情報がない場合nullを返す', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          user: null,
        }),
      });

      const result = await authorize({
        loginId: 'testuser',
        password: 'password123',
      });

      expect(result).toBeNull();
    });

    test('successがfalseの場合nullを返す', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: 'Authentication failed',
        }),
      });

      const result = await authorize({
        loginId: 'testuser',
        password: 'password123',
      });

      expect(result).toBeNull();
    });
  });

  describe('session configuration', () => {
    test('session strategyがjwtに設定されている', () => {
      expect(authOptions.session?.strategy).toBe('jwt');
    });

    test('maxAgeが設定されている', () => {
      expect(authOptions.session?.maxAge).toBe(30 * 24 * 60 * 60); // 30日
    });

    test('updateAgeが設定されている', () => {
      expect(authOptions.session?.updateAge).toBe(24 * 60 * 60); // 24時間
    });
  });

  describe('jwt configuration', () => {
    test('maxAgeが設定されている', () => {
      expect(authOptions.jwt?.maxAge).toBe(30 * 24 * 60 * 60); // 30日
    });
  });

  describe('pages configuration', () => {
    test('カスタムページが設定されている', () => {
      expect(authOptions.pages?.signIn).toBe('/signin');
      expect(authOptions.pages?.signOut).toBe('/signout');
      expect(authOptions.pages?.error).toBe('/auth/error');
    });
  });

  describe('callbacks', () => {
    test('jwt callbackが設定されている', () => {
      expect(typeof authOptions.callbacks?.jwt).toBe('function');
    });

    test('session callbackが設定されている', () => {
      expect(typeof authOptions.callbacks?.session).toBe('function');
    });

    test('jwt callbackでユーザー情報が正しく処理される', async () => {
      const mockUser = {
        userId: 1,
        userName: 'testuser',
        email: 'test@example.com',
      };

      const token = await authOptions.callbacks?.jwt?.({
        token: {},
        user: mockUser,
      } as any);

      expect(token).toEqual(expect.objectContaining({
        userId: 1,
        userName: 'testuser',
        email: 'test@example.com',
      }));
    });

    test('session callbackでトークン情報が正しく処理される', async () => {
      const mockToken = {
        userId: 1,
        userName: 'testuser',
        email: 'test@example.com',
      };

      const session = await authOptions.callbacks?.session?.({
        session: { user: {} },
        token: mockToken,
      } as any);

      expect(session.user).toEqual(expect.objectContaining({
        userId: 1,
        userName: 'testuser',
        email: 'test@example.com',
      }));
    });
  });
});