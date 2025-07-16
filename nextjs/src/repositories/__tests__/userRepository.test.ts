/**
 * ユーザーリポジトリテスト
 * 
 * @description userRepositoryのテストケース
 */
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { findUserByLoginId, findUserById, getUserPassword, updateLastLoginTime } from '../userRepository';

// Prismaのモック
const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

jest.doMock('@/lib/db', () => ({
  prisma: mockPrisma,
}));

describe('userRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserByLoginId', () => {
    test('ログインIDでユーザーを取得', async () => {
      const mockUser = {
        userId: 1,
        userName: 'テストユーザー',
        userKey: 'testuser',
        deleteFlag: 0,
      };

      mockPrisma.user.findFirst.mockResolvedValue(mockUser);

      const result = await findUserByLoginId('testuser');

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          userKey: 'testuser',
          deleteFlag: 0,
        },
      });
    });

    test('存在しないユーザーの場合nullを返す', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const result = await findUserByLoginId('nonexistent');

      expect(result).toBeNull();
    });

    test('削除済みユーザーは取得されない', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const result = await findUserByLoginId('deleteduser');

      expect(result).toBeNull();
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          userKey: 'deleteduser',
          deleteFlag: 0,
        },
      });
    });
  });

  describe('findUserById', () => {
    test('ユーザーIDでユーザーを取得', async () => {
      const mockUser = {
        userId: 1,
        userName: 'テストユーザー',
        userKey: 'testuser',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await findUserById(1);

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          userId: 1,
        },
      });
    });

    test('存在しないユーザーIDの場合nullを返す', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await findUserById(999);

      expect(result).toBeNull();
    });
  });

  describe('getUserPassword', () => {
    test('ユーザーのパスワード情報を取得', async () => {
      const mockPasswordInfo = {
        password: 'hashed_password',
        salt: 'test_salt',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockPasswordInfo);

      const result = await getUserPassword(1);

      expect(result).toEqual(mockPasswordInfo);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          userId: 1,
        },
        select: {
          password: true,
          salt: true,
        },
      });
    });

    test('パスワード情報がない場合nullを返す', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        password: null,
        salt: null,
      });

      const result = await getUserPassword(1);

      expect(result).toBeNull();
    });

    test('ユーザーが存在しない場合nullを返す', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await getUserPassword(999);

      expect(result).toBeNull();
    });
  });

  describe('updateLastLoginTime', () => {
    test('最終ログイン日時を更新', async () => {
      const mockDate = new Date('2023-01-01T00:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      mockPrisma.user.update.mockResolvedValue({});

      await updateLastLoginTime(1);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: {
          userId: 1,
        },
        data: {
          updateDatetime: mockDate,
          updateUser: 1,
        },
      });

      jest.restoreAllMocks();
    });
  });
});