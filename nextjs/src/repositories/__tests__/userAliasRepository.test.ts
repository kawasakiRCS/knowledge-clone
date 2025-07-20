/**
 * ユーザーエイリアスリポジトリのテスト
 * 
 * @description userAliasRepositoryの単体テスト
 */

import { prisma } from '@/lib/db';
import {
  findUserAliasByKey,
  findEntraIdUserAlias,
  findUserAliasesByUserId,
  saveUserAlias,
  createEntraIdUserAlias,
  deleteUserAlias,
  ENTRAID_AUTH_KEY,
  UserAlias
} from '../userAliasRepository';

// Prismaクライアントをモック化
jest.mock('@/lib/db', () => ({
  prisma: {
    userAlias: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('userAliasRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserAliasByKey', () => {
    test('認証キーとエイリアスキーでユーザーエイリアスを検索できる', async () => {
      const mockUserAlias = {
        userId: 1,
        authKey: 'test_auth',
        aliasKey: 'test_alias',
        aliasName: 'Test User',
        aliasMail: 'test@example.com',
        userInfoUpdate: 1,
        insertUser: 1,
        insertDatetime: new Date(),
        updateUser: 1,
        updateDatetime: new Date(),
        deleteFlag: 0,
      };

      (prisma.userAlias.findFirst as jest.Mock).mockResolvedValue(mockUserAlias);

      const result = await findUserAliasByKey('test_auth', 'TEST_ALIAS');

      expect(prisma.userAlias.findFirst).toHaveBeenCalledWith({
        where: {
          authKey: 'test_auth',
          aliasKey: 'test_alias', // 小文字に変換される
          deleteFlag: 0,
        },
      });

      expect(result).toEqual(mockUserAlias);
    });

    test('エイリアスキーは小文字に変換される', async () => {
      await findUserAliasByKey('test_auth', 'UPPERCASE_KEY');

      expect(prisma.userAlias.findFirst).toHaveBeenCalledWith({
        where: {
          authKey: 'test_auth',
          aliasKey: 'uppercase_key',
          deleteFlag: 0,
        },
      });
    });

    test('見つからない場合はnullを返す', async () => {
      (prisma.userAlias.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await findUserAliasByKey('test_auth', 'not_found');

      expect(result).toBeNull();
    });

    test('エラーが発生した場合はnullを返す', async () => {
      (prisma.userAlias.findFirst as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await findUserAliasByKey('test_auth', 'test_alias');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error finding user alias by key:', expect.any(Error));
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('findEntraIdUserAlias', () => {
    test('EntraIDユーザーをメールアドレスで検索できる', async () => {
      const mockUserAlias = {
        userId: 1,
        authKey: ENTRAID_AUTH_KEY,
        aliasKey: 'user@example.com',
        aliasName: 'EntraID User',
        deleteFlag: 0,
      };

      (prisma.userAlias.findFirst as jest.Mock).mockResolvedValue(mockUserAlias);

      const result = await findEntraIdUserAlias('user@example.com');

      expect(prisma.userAlias.findFirst).toHaveBeenCalledWith({
        where: {
          authKey: ENTRAID_AUTH_KEY,
          aliasKey: 'user@example.com',
          deleteFlag: 0,
        },
      });

      expect(result).toEqual(mockUserAlias);
    });
  });

  describe('findUserAliasesByUserId', () => {
    test('ユーザーIDで全てのエイリアスを検索できる', async () => {
      const mockUserAliases = [
        {
          userId: 1,
          authKey: 'auth1',
          aliasKey: 'alias1',
          aliasName: 'Alias 1',
          deleteFlag: 0,
        },
        {
          userId: 1,
          authKey: 'auth2',
          aliasKey: 'alias2',
          aliasName: 'Alias 2',
          deleteFlag: 0,
        },
      ];

      (prisma.userAlias.findMany as jest.Mock).mockResolvedValue(mockUserAliases);

      const result = await findUserAliasesByUserId(1);

      expect(prisma.userAlias.findMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          deleteFlag: 0,
        },
        orderBy: { authKey: 'asc' },
      });

      expect(result).toEqual(mockUserAliases);
    });

    test('認証キーを指定してエイリアスを検索できる', async () => {
      const mockUserAliases = [
        {
          userId: 1,
          authKey: 'specific_auth',
          aliasKey: 'alias1',
          aliasName: 'Alias 1',
          deleteFlag: 0,
        },
      ];

      (prisma.userAlias.findMany as jest.Mock).mockResolvedValue(mockUserAliases);

      const result = await findUserAliasesByUserId(1, 'specific_auth');

      expect(prisma.userAlias.findMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          authKey: 'specific_auth',
          deleteFlag: 0,
        },
        orderBy: { authKey: 'asc' },
      });

      expect(result).toEqual(mockUserAliases);
    });

    test('エラーが発生した場合は空配列を返す', async () => {
      (prisma.userAlias.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await findUserAliasesByUserId(1);

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error finding user aliases by user ID:', expect.any(Error));
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('saveUserAlias', () => {
    test('新規ユーザーエイリアスを作成できる', async () => {
      const mockDate = new Date();
      jest.useFakeTimers().setSystemTime(mockDate);

      const userAlias: UserAlias = {
        userId: 1,
        authKey: 'test_auth',
        aliasKey: 'TEST_ALIAS',
        aliasName: 'Test User',
        aliasMail: 'test@example.com',
      };

      const mockCreatedAlias = {
        ...userAlias,
        aliasKey: 'test_alias',
        userInfoUpdate: 1,
        insertUser: 1,
        insertDatetime: mockDate,
        updateUser: 1,
        updateDatetime: mockDate,
        deleteFlag: 0,
      };

      (prisma.userAlias.upsert as jest.Mock).mockResolvedValue(mockCreatedAlias);

      const result = await saveUserAlias(userAlias);

      expect(prisma.userAlias.upsert).toHaveBeenCalledWith({
        where: {
          userId_authKey: {
            userId: 1,
            authKey: 'test_auth',
          },
        },
        create: {
          userId: 1,
          authKey: 'test_auth',
          aliasKey: 'test_alias',
          aliasName: 'Test User',
          aliasMail: 'test@example.com',
          userInfoUpdate: 1,
          updateUser: 1,
          updateDatetime: mockDate,
          insertUser: 1,
          insertDatetime: mockDate,
          deleteFlag: 0,
        },
        update: {
          aliasKey: 'test_alias',
          aliasName: 'Test User',
          aliasMail: 'test@example.com',
          userInfoUpdate: 1,
          updateUser: 1,
          updateDatetime: mockDate,
        },
      });

      expect(result).toEqual(mockCreatedAlias);
      
      jest.useRealTimers();
    });

    test('既存のユーザーエイリアスを更新できる', async () => {
      const mockDate = new Date();
      jest.useFakeTimers().setSystemTime(mockDate);

      const userAlias: UserAlias = {
        userId: 1,
        authKey: 'test_auth',
        aliasKey: 'test_alias',
        aliasName: 'Updated User',
        aliasMail: 'updated@example.com',
        userInfoUpdate: 0,
        updateUser: 2,
      };

      const mockUpdatedAlias = {
        ...userAlias,
        updateDatetime: mockDate,
      };

      (prisma.userAlias.upsert as jest.Mock).mockResolvedValue(mockUpdatedAlias);

      const result = await saveUserAlias(userAlias);

      expect(result).toEqual(mockUpdatedAlias);
      
      jest.useRealTimers();
    });

    test('エラーが発生した場合は例外をスローする', async () => {
      (prisma.userAlias.upsert as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const userAlias: UserAlias = {
        userId: 1,
        authKey: 'test_auth',
        aliasKey: 'test_alias',
        aliasName: 'Test User',
      };

      await expect(saveUserAlias(userAlias)).rejects.toThrow('ユーザーエイリアスの保存に失敗しました');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving user alias:', expect.any(Error));
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('createEntraIdUserAlias', () => {
    test('EntraIDユーザーエイリアスを作成できる', async () => {
      const mockDate = new Date();
      jest.useFakeTimers().setSystemTime(mockDate);

      const mockCreatedAlias = {
        userId: 1,
        authKey: ENTRAID_AUTH_KEY,
        aliasKey: 'user@example.com',
        aliasName: 'EntraID User',
        aliasMail: 'user@example.com',
        userInfoUpdate: 1,
        insertUser: 1,
        insertDatetime: mockDate,
        updateUser: 1,
        updateDatetime: mockDate,
        deleteFlag: 0,
      };

      (prisma.userAlias.upsert as jest.Mock).mockResolvedValue(mockCreatedAlias);

      const result = await createEntraIdUserAlias(1, 'user@example.com', 'EntraID User');

      expect(prisma.userAlias.upsert).toHaveBeenCalledWith({
        where: {
          userId_authKey: {
            userId: 1,
            authKey: ENTRAID_AUTH_KEY,
          },
        },
        create: expect.objectContaining({
          userId: 1,
          authKey: ENTRAID_AUTH_KEY,
          aliasKey: 'user@example.com',
          aliasName: 'EntraID User',
          aliasMail: 'user@example.com',
          userInfoUpdate: 1,
        }),
        update: expect.objectContaining({
          aliasKey: 'user@example.com',
          aliasName: 'EntraID User',
          aliasMail: 'user@example.com',
          userInfoUpdate: 1,
        }),
      });

      expect(result).toEqual(mockCreatedAlias);
      
      jest.useRealTimers();
    });
  });

  describe('deleteUserAlias', () => {
    test('ユーザーエイリアスを論理削除できる', async () => {
      const mockDate = new Date();
      jest.useFakeTimers().setSystemTime(mockDate);

      (prisma.userAlias.update as jest.Mock).mockResolvedValue({
        userId: 1,
        authKey: 'test_auth',
        deleteFlag: 1,
        updateDatetime: mockDate,
        updateUser: 1,
      });

      const result = await deleteUserAlias(1, 'test_auth');

      expect(prisma.userAlias.update).toHaveBeenCalledWith({
        where: {
          userId_authKey: {
            userId: 1,
            authKey: 'test_auth',
          },
        },
        data: {
          deleteFlag: 1,
          updateDatetime: mockDate,
          updateUser: 1,
        },
      });

      expect(result).toBe(true);
      
      jest.useRealTimers();
    });

    test('エラーが発生した場合はfalseを返す', async () => {
      (prisma.userAlias.update as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await deleteUserAlias(1, 'test_auth');

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting user alias:', expect.any(Error));
      
      consoleErrorSpy.mockRestore();
    });
  });
});