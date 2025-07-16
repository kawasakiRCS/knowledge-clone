/**
 * サーバーサイド認証ユーティリティテスト
 * 
 * @description serverAuth.tsのテストケース
 */
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import {
  getAuthenticatedUser,
  requireAdmin,
  requireOwnerOrAdmin,
  withAuth,
  withAdminAuth,
  AuthenticationError,
  AuthorizationError,
} from '../serverAuth';

// モック
jest.mock('next-auth/jwt');
jest.mock('@/repositories/userRepository');

const mockGetToken = jest.fn();
const mockFindUserById = jest.fn();

jest.doMock('next-auth/jwt', () => ({
  getToken: mockGetToken,
}));

jest.doMock('@/repositories/userRepository', () => ({
  findUserById: mockFindUserById,
}));

describe('serverAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuthenticatedUser', () => {
    test('有効なトークンでユーザー情報を取得', async () => {
      const mockToken = {
        userId: 1,
        role: 'user',
      };

      const mockUser = {
        userId: 1,
        userName: 'テストユーザー',
        userKey: 'testuser',
        mailAddress: 'test@example.com',
        deleteFlag: 0,
      };

      mockGetToken.mockResolvedValue(mockToken);
      mockFindUserById.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/test');
      const user = await getAuthenticatedUser(request);

      expect(user).toEqual({
        userId: 1,
        userName: 'テストユーザー',
        userKey: 'testuser',
        role: 'user',
        email: 'test@example.com',
      });
    });

    test('トークンがない場合は認証エラー', async () => {
      mockGetToken.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/test');

      await expect(getAuthenticatedUser(request)).rejects.toThrow(AuthenticationError);
    });

    test('ユーザーが削除済みの場合は認証エラー', async () => {
      const mockToken = { userId: 1, role: 'user' };
      const mockUser = { userId: 1, deleteFlag: 1 };

      mockGetToken.mockResolvedValue(mockToken);
      mockFindUserById.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/test');

      await expect(getAuthenticatedUser(request)).rejects.toThrow(AuthenticationError);
    });

    test('ユーザーが存在しない場合は認証エラー', async () => {
      const mockToken = { userId: 1, role: 'user' };

      mockGetToken.mockResolvedValue(mockToken);
      mockFindUserById.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/test');

      await expect(getAuthenticatedUser(request)).rejects.toThrow(AuthenticationError);
    });
  });

  describe('requireAdmin', () => {
    test('管理者ユーザーは通過', () => {
      const adminUser = {
        userId: 1,
        userName: '管理者',
        userKey: 'admin',
        role: 'admin' as const,
      };

      expect(() => requireAdmin(adminUser)).not.toThrow();
    });

    test('一般ユーザーは権限エラー', () => {
      const normalUser = {
        userId: 2,
        userName: 'ユーザー',
        userKey: 'user',
        role: 'user' as const,
      };

      expect(() => requireAdmin(normalUser)).toThrow(AuthorizationError);
    });
  });

  describe('requireOwnerOrAdmin', () => {
    const adminUser = {
      userId: 1,
      userName: '管理者',
      userKey: 'admin',
      role: 'admin' as const,
    };

    const normalUser = {
      userId: 2,
      userName: 'ユーザー',
      userKey: 'user',
      role: 'user' as const,
    };

    test('管理者は他人のリソースにアクセス可能', () => {
      expect(() => requireOwnerOrAdmin(adminUser, 999)).not.toThrow();
    });

    test('所有者は自分のリソースにアクセス可能', () => {
      expect(() => requireOwnerOrAdmin(normalUser, 2)).not.toThrow();
    });

    test('他人のリソースにアクセスする一般ユーザーは権限エラー', () => {
      expect(() => requireOwnerOrAdmin(normalUser, 999)).toThrow(AuthorizationError);
    });
  });

  describe('withAuth', () => {
    test('認証成功時はハンドラーを実行', async () => {
      const mockToken = { userId: 1, role: 'user' };
      const mockUser = {
        userId: 1,
        userName: 'テストユーザー',
        userKey: 'testuser',
        deleteFlag: 0,
      };

      mockGetToken.mockResolvedValue(mockToken);
      mockFindUserById.mockResolvedValue(mockUser);

      const mockHandler = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true }))
      );

      const wrappedHandler = withAuth(mockHandler);
      const request = new NextRequest('http://localhost:3000/api/test');

      const response = await wrappedHandler(request);

      expect(mockHandler).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('認証失敗時は401エラー', async () => {
      mockGetToken.mockResolvedValue(null);

      const mockHandler = jest.fn();
      const wrappedHandler = withAuth(mockHandler);
      const request = new NextRequest('http://localhost:3000/api/test');

      const response = await wrappedHandler(request);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(401);
    });
  });

  describe('withAdminAuth', () => {
    test('管理者認証成功時はハンドラーを実行', async () => {
      const mockToken = { userId: 1, role: 'admin' };
      const mockUser = {
        userId: 1,
        userName: '管理者',
        userKey: 'admin',
        deleteFlag: 0,
      };

      mockGetToken.mockResolvedValue(mockToken);
      mockFindUserById.mockResolvedValue(mockUser);

      const mockHandler = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true }))
      );

      const wrappedHandler = withAdminAuth(mockHandler);
      const request = new NextRequest('http://localhost:3000/api/test');

      const response = await wrappedHandler(request);

      expect(mockHandler).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    test('一般ユーザーは403エラー', async () => {
      const mockToken = { userId: 2, role: 'user' };
      const mockUser = {
        userId: 2,
        userName: 'ユーザー',
        userKey: 'user',
        deleteFlag: 0,
      };

      mockGetToken.mockResolvedValue(mockToken);
      mockFindUserById.mockResolvedValue(mockUser);

      const mockHandler = jest.fn();
      const wrappedHandler = withAdminAuth(mockHandler);
      const request = new NextRequest('http://localhost:3000/api/test');

      const response = await wrappedHandler(request);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(403);
    });
  });
});