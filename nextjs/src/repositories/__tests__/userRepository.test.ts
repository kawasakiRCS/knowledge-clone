/**
 * ユーザーリポジトリテスト
 * 
 * @description userRepositoryのテストケース
 */
import type { User } from '@prisma/client';

// Prismaクライアントのモックをjest.mockの前に定義
jest.mock('@/lib/db');

// テスト対象のインポート
import {
  findUserByLoginId,
  findUserById,
  getUserPassword,
  findUserByEmail,
  updateLastLoginTime,
} from '../userRepository';
import { prisma } from '@/lib/db';

// 型付きモック
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('userRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserByLoginId', () => {
    test('ログインIDでユーザーを検索できる', async () => {
      const mockUser: User = {
        userId: 1,
        userKey: 'testuser',
        userName: 'Test User',
        mailAddress: 'test@example.com',
        password: 'hashed',
        salt: 'salt',
        roleId: 1,
        locale: 'ja',
        deleteFlag: 0,
        insertDatetime: new Date(),
        insertUser: 1,
        updateDatetime: new Date(),
        updateUser: 1,
      };

      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const result = await findUserByLoginId('testuser');

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          userKey: 'testuser',
          deleteFlag: 0,
        },
      });
    });

    test('存在しないユーザーの場合はnullを返す', async () => {
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await findUserByLoginId('nonexistent');

      expect(result).toBeNull();
    });

    test('エラーが発生した場合は例外がスローされる', async () => {
      (mockPrisma.user.findFirst as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(findUserByLoginId('error')).rejects.toThrow('Database error');
    });
  });

  describe('findUserById', () => {
    test('ユーザーIDでユーザーを検索できる', async () => {
      const mockUser: User = {
        userId: 1,
        userKey: 'testuser',
        userName: 'Test User',
        mailAddress: 'test@example.com',
        password: 'hashed',
        salt: 'salt',
        roleId: 1,
        locale: 'ja',
        deleteFlag: 0,
        insertDatetime: new Date(),
        insertUser: 1,
        updateDatetime: new Date(),
        updateUser: 1,
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await findUserById(1);

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          userId: 1,
        },
      });
    });

    test('存在しないユーザーIDの場合はnullを返す', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await findUserById(999);

      expect(result).toBeNull();
    });

    test('エラーが発生した場合は例外がスローされる', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(findUserById(1)).rejects.toThrow('Database error');
    });
  });

  describe('getUserPassword', () => {
    test('ユーザーのパスワードとソルトを取得できる', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        password: 'hashedpassword',
        salt: 'randomsalt',
      });

      const result = await getUserPassword(1);

      expect(result).toEqual({
        password: 'hashedpassword',
        salt: 'randomsalt',
      });
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

    test('ユーザーが存在しない場合はnullを返す', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getUserPassword(999);

      expect(result).toBeNull();
    });

    test('パスワードがnullの場合はnullを返す', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        password: null,
        salt: 'salt',
      });

      const result = await getUserPassword(1);

      expect(result).toBeNull();
    });

    test('ソルトがnullの場合はnullを返す', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        password: 'password',
        salt: null,
      });

      const result = await getUserPassword(1);

      expect(result).toBeNull();
    });

    test('エラーが発生した場合は例外がスローされる', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(getUserPassword(1)).rejects.toThrow('Database error');
    });
  });

  describe('findUserByEmail', () => {
    test('メールアドレスでユーザーを検索できる', async () => {
      const mockUser: User = {
        userId: 1,
        userKey: 'testuser',
        userName: 'Test User',
        mailAddress: 'test@example.com',
        password: 'hashed',
        salt: 'salt',
        roleId: 1,
        locale: 'ja',
        deleteFlag: 0,
        insertDatetime: new Date(),
        insertUser: 1,
        updateDatetime: new Date(),
        updateUser: 1,
      };

      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const result = await findUserByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          mailAddress: 'test@example.com',
          deleteFlag: 0,
        },
      });
    });

    test('存在しないメールアドレスの場合はnullを返す', async () => {
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await findUserByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    test('空のメールアドレスの場合も検索できる', async () => {
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await findUserByEmail('');

      expect(result).toBeNull();
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          mailAddress: '',
          deleteFlag: 0,
        },
      });
    });

    test('エラーが発生した場合は例外がスローされる', async () => {
      (mockPrisma.user.findFirst as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(findUserByEmail('test@example.com')).rejects.toThrow('Database error');
    });
  });

  describe('updateLastLoginTime', () => {
    test('最終ログイン日時を更新できる', async () => {
      const mockDate = new Date('2024-01-01T12:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);

      (mockPrisma.user.update as jest.Mock).mockResolvedValue({});

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

      jest.useRealTimers();
    });

    test('異なるユーザーIDでも更新できる', async () => {
      (mockPrisma.user.update as jest.Mock).mockResolvedValue({});

      await updateLastLoginTime(999);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: {
          userId: 999,
        },
        data: {
          updateDatetime: expect.any(Date),
          updateUser: 999,
        },
      });
    });

    test('更新エラーが発生した場合は例外がスローされる', async () => {
      (mockPrisma.user.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(updateLastLoginTime(1)).rejects.toThrow('Database error');
    });
  });
});