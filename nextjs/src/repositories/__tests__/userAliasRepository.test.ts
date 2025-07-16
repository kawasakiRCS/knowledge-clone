/**
 * ユーザーエイリアスリポジトリテスト
 * 
 * @description userAliasRepositoryのテストケース
 */
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import {
  findUserAliasByKey,
  findEntraIdUserAlias,
  findUserAliasesByUserId,
  saveUserAlias,
  createEntraIdUserAlias,
  deleteUserAlias,
  ENTRAID_AUTH_KEY,
  UserAlias,
} from '../userAliasRepository';

// Prismaのモック
const mockPrisma = {
  userAlias: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
  },
};

jest.doMock('@/lib/db', () => ({
  prisma: mockPrisma,
}));

describe('userAliasRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserAliasByKey', () => {
    test('認証キーとエイリアスキーでユーザーエイリアスを検索', async () => {
      const mockUserAlias = {
        userId: 1,
        authKey: 'entraid',
        aliasKey: 'test@hoge.onmicrosoft.com',
        aliasName: 'テストユーザー',
        aliasMail: 'test@hoge.onmicrosoft.com',
        userInfoUpdate: 1,
        deleteFlag: 0,
      };

      mockPrisma.userAlias.findFirst.mockResolvedValue(mockUserAlias);

      const result = await findUserAliasByKey('entraid', 'test@hoge.onmicrosoft.com');

      expect(result).toEqual(mockUserAlias);
      expect(mockPrisma.userAlias.findFirst).toHaveBeenCalledWith({
        where: {
          authKey: 'entraid',
          aliasKey: 'test@hoge.onmicrosoft.com',
          deleteFlag: 0,
        },
      });
    });

    test('見つからない場合はnullを返す', async () => {
      mockPrisma.userAlias.findFirst.mockResolvedValue(null);

      const result = await findUserAliasByKey('entraid', 'nonexistent@test.com');

      expect(result).toBeNull();
    });

    test('エラーが発生した場合はnullを返す', async () => {
      mockPrisma.userAlias.findFirst.mockRejectedValue(new Error('Database error'));

      const result = await findUserAliasByKey('entraid', 'test@hoge.onmicrosoft.com');

      expect(result).toBeNull();
    });
  });

  describe('findEntraIdUserAlias', () => {
    test('EntraIDユーザーをエイリアスキーで検索', async () => {
      const mockUserAlias = {
        userId: 1,
        authKey: ENTRAID_AUTH_KEY,
        aliasKey: 'test@hoge.onmicrosoft.com',
        aliasName: 'テストユーザー',
      };

      mockPrisma.userAlias.findFirst.mockResolvedValue(mockUserAlias);

      const result = await findEntraIdUserAlias('test@hoge.onmicrosoft.com');

      expect(result).toEqual(mockUserAlias);
      expect(mockPrisma.userAlias.findFirst).toHaveBeenCalledWith({
        where: {
          authKey: ENTRAID_AUTH_KEY,
          aliasKey: 'test@hoge.onmicrosoft.com',
          deleteFlag: 0,
        },
      });
    });
  });

  describe('findUserAliasesByUserId', () => {
    test('ユーザーIDでユーザーエイリアスを検索', async () => {
      const mockUserAliases = [
        {
          userId: 1,
          authKey: 'entraid',
          aliasKey: 'test@hoge.onmicrosoft.com',
          aliasName: 'テストユーザー',
        },
        {
          userId: 1,
          authKey: 'ldap1',
          aliasKey: 'test',
          aliasName: 'テストユーザー',
        },
      ];

      mockPrisma.userAlias.findMany.mockResolvedValue(mockUserAliases);

      const result = await findUserAliasesByUserId(1);

      expect(result).toEqual(mockUserAliases);
      expect(mockPrisma.userAlias.findMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          deleteFlag: 0,
        },
        orderBy: { authKey: 'asc' },
      });
    });

    test('認証キー指定でフィルタリング', async () => {
      const mockUserAliases = [
        {
          userId: 1,
          authKey: 'entraid',
          aliasKey: 'test@hoge.onmicrosoft.com',
          aliasName: 'テストユーザー',
        },
      ];

      mockPrisma.userAlias.findMany.mockResolvedValue(mockUserAliases);

      const result = await findUserAliasesByUserId(1, 'entraid');

      expect(result).toEqual(mockUserAliases);
      expect(mockPrisma.userAlias.findMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          authKey: 'entraid',
          deleteFlag: 0,
        },
        orderBy: { authKey: 'asc' },
      });
    });
  });

  describe('saveUserAlias', () => {
    test('ユーザーエイリアスを作成または更新', async () => {
      const userAlias: UserAlias = {
        userId: 1,
        authKey: 'entraid',
        aliasKey: 'test@hoge.onmicrosoft.com',
        aliasName: 'テストユーザー',
        aliasMail: 'test@hoge.onmicrosoft.com',
        userInfoUpdate: 1,
      };

      const mockSavedUserAlias = {
        ...userAlias,
        insertUser: 1,
        insertDatetime: new Date(),
        updateUser: 1,
        updateDatetime: new Date(),
        deleteFlag: 0,
      };

      mockPrisma.userAlias.upsert.mockResolvedValue(mockSavedUserAlias);

      const result = await saveUserAlias(userAlias);

      expect(result).toEqual(mockSavedUserAlias);
      expect(mockPrisma.userAlias.upsert).toHaveBeenCalledWith({
        where: {
          userId_authKey: {
            userId: 1,
            authKey: 'entraid',
          },
        },
        create: expect.objectContaining({
          userId: 1,
          authKey: 'entraid',
          aliasKey: 'test@hoge.onmicrosoft.com',
          aliasName: 'テストユーザー',
          aliasMail: 'test@hoge.onmicrosoft.com',
          deleteFlag: 0,
        }),
        update: expect.objectContaining({
          aliasKey: 'test@hoge.onmicrosoft.com',
          aliasName: 'テストユーザー',
          aliasMail: 'test@hoge.onmicrosoft.com',
        }),
      });
    });

    test('エラーが発生した場合は例外をスロー', async () => {
      const userAlias: UserAlias = {
        userId: 1,
        authKey: 'entraid',
        aliasKey: 'test@hoge.onmicrosoft.com',
        aliasName: 'テストユーザー',
      };

      mockPrisma.userAlias.upsert.mockRejectedValue(new Error('Database error'));

      await expect(saveUserAlias(userAlias)).rejects.toThrow('ユーザーエイリアスの保存に失敗しました');
    });
  });

  describe('createEntraIdUserAlias', () => {
    test('EntraIDユーザーエイリアスを作成', async () => {
      const mockSavedUserAlias = {
        userId: 1,
        authKey: ENTRAID_AUTH_KEY,
        aliasKey: 'test@hoge.onmicrosoft.com',
        aliasName: 'テストユーザー',
        aliasMail: 'test@hoge.onmicrosoft.com',
        userInfoUpdate: 1,
        deleteFlag: 0,
      };

      mockPrisma.userAlias.upsert.mockResolvedValue(mockSavedUserAlias);

      const result = await createEntraIdUserAlias(1, 'test@hoge.onmicrosoft.com', 'テストユーザー');

      expect(result).toEqual(mockSavedUserAlias);
      expect(mockPrisma.userAlias.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId_authKey: {
              userId: 1,
              authKey: ENTRAID_AUTH_KEY,
            },
          },
        })
      );
    });
  });

  describe('deleteUserAlias', () => {
    test('ユーザーエイリアスを論理削除', async () => {
      mockPrisma.userAlias.update.mockResolvedValue({});

      const result = await deleteUserAlias(1, 'entraid');

      expect(result).toBe(true);
      expect(mockPrisma.userAlias.update).toHaveBeenCalledWith({
        where: {
          userId_authKey: {
            userId: 1,
            authKey: 'entraid',
          },
        },
        data: {
          deleteFlag: 1,
          updateDatetime: expect.any(Date),
          updateUser: 1,
        },
      });
    });

    test('エラーが発生した場合はfalseを返す', async () => {
      mockPrisma.userAlias.update.mockRejectedValue(new Error('Database error'));

      const result = await deleteUserAlias(1, 'entraid');

      expect(result).toBe(false);
    });
  });
});