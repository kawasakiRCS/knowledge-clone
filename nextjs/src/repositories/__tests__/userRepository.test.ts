/**
 * ユーザーリポジトリテスト
 * 
 * @description userRepositoryのテストケース
 */
import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Prismaのモック作成
const mockFindFirst = jest.fn();
const mockFindUnique = jest.fn();
const mockUpdate = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findFirst: mockFindFirst,
      findUnique: mockFindUnique,
      update: mockUpdate,
    },
  },
}));

import {
  findUserByLoginId,
  findUserById,
  getUserPassword,
  findUserByEmail,
  updateLastLoginTime,
} from '../userRepository';

describe('userRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserByLoginId', () => {
    test('ログインIDでユーザーを検索できる', async () => {
      const mockUser = {
        userId: 1,
        userKey: 'testuser',
        userName: 'Test User',
        mailAddress: 'test@example.com',
        deleteFlag: 0,
      };

      mockFindFirst.mockResolvedValue(mockUser);

      const result = await findUserByLoginId('testuser');

      expect(result).toEqual(mockUser);
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          userKey: 'testuser',
          deleteFlag: 0,
        },
      });
    });

    test('存在しないユーザーの場合はnullを返す', async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await findUserByLoginId('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findUserById', () => {
    test('ユーザーIDでユーザーを検索できる', async () => {
      const mockUser = {
        userId: 1,
        userKey: 'testuser',
        userName: 'Test User',
        mailAddress: 'test@example.com',
      };

      mockFindUnique.mockResolvedValue(mockUser);

      const result = await findUserById(1);

      expect(result).toEqual(mockUser);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: {
          userId: 1,
        },
      });
    });

    test('存在しないユーザーIDの場合はnullを返す', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await findUserById(999);

      expect(result).toBeNull();
    });
  });

  describe('getUserPassword', () => {
    test('ユーザーのパスワードとソルトを取得できる', async () => {
      mockFindUnique.mockResolvedValue({
        password: 'hashedpassword',
        salt: 'randomsalt',
      });

      const result = await getUserPassword(1);

      expect(result).toEqual({
        password: 'hashedpassword',
        salt: 'randomsalt',
      });
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: {
          userId: 1,
        },
        select: {
          password: true,
          salt: true,
        },
      });
    });

    test('ユーザーが存在しない場合はnullを返す', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await getUserPassword(999);

      expect(result).toBeNull();
    });

    test('パスワードがnullの場合はnullを返す', async () => {
      mockFindUnique.mockResolvedValue({
        password: null,
        salt: 'salt',
      });

      const result = await getUserPassword(1);

      expect(result).toBeNull();
    });

    test('ソルトがnullの場合はnullを返す', async () => {
      mockFindUnique.mockResolvedValue({
        password: 'password',
        salt: null,
      });

      const result = await getUserPassword(1);

      expect(result).toBeNull();
    });
  });

  describe('findUserByEmail', () => {
    test('メールアドレスでユーザーを検索できる', async () => {
      const mockUser = {
        userId: 1,
        userKey: 'testuser',
        userName: 'Test User',
        mailAddress: 'test@example.com',
        deleteFlag: 0,
      };

      mockFindFirst.mockResolvedValue(mockUser);

      const result = await findUserByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          mailAddress: 'test@example.com',
          deleteFlag: 0,
        },
      });
    });

    test('存在しないメールアドレスの場合はnullを返す', async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await findUserByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('updateLastLoginTime', () => {
    test('最終ログイン日時を更新できる', async () => {
      const mockDate = new Date('2024-01-01T12:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);

      mockUpdate.mockResolvedValue({});

      await updateLastLoginTime(1);

      expect(mockUpdate).toHaveBeenCalledWith({
        where: {
          userId: 1,
        },
        data: {
          updateDatetime: mockDate,
          updateUser: 1,
        },
      });

      jest.useRealTimers();
    });

    test('更新エラーが発生した場合は例外がスローされる', async () => {
      mockUpdate.mockRejectedValue(new Error('Database error'));

      await expect(updateLastLoginTime(1)).rejects.toThrow('Database error');
    });
  });
});