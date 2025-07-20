/**
 * ユーザーエイリアスリポジトリテスト
 * 
 * @description userAliasRepositoryのテストケース
 */

// Prismaクライアントのモックをjest.mockの前に定義
jest.mock('@/lib/db');

// テスト対象のインポート
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
import { prisma } from '@/lib/db';

// 型付きモック
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('userAliasRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findUserAliasByKey', () => {
    test('認証キーとエイリアスキーでユーザーエイリアスを検索できる', async () => {
      const mockAlias = {
        userId: 1,
        authKey: 'google',
        aliasKey: 'test@gmail.com',
        aliasName: 'Test User',
        aliasMail: 'test@gmail.com',
        userInfoUpdate: 1,
        insertUser: 1,
        insertDatetime: new Date(),
        updateUser: 1,
        updateDatetime: new Date(),
        deleteFlag: 0,
      };

      (mockPrisma.userAlias.findFirst as jest.Mock).mockResolvedValue(mockAlias);

      const result = await findUserAliasByKey('google', 'TEST@GMAIL.COM');

      expect(result).toEqual(mockAlias);
      expect(mockPrisma.userAlias.findFirst).toHaveBeenCalledWith({
        where: {
          authKey: 'google',
          aliasKey: 'test@gmail.com', // 小文字に変換される
          deleteFlag: 0,
        },
      });
    });

    test('存在しない場合はnullを返す', async () => {
      (mockPrisma.userAlias.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await findUserAliasByKey('google', 'nonexistent@gmail.com');

      expect(result).toBeNull();
    });

    test('エラーが発生した場合はnullを返す', async () => {
      (mockPrisma.userAlias.findFirst as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await findUserAliasByKey('google', 'error@gmail.com');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error finding user alias by key:', expect.any(Error));
    });
  });

  describe('findEntraIdUserAlias', () => {
    test('EntraIDユーザーをメールアドレスで検索できる', async () => {
      const mockAlias = {
        userId: 1,
        authKey: ENTRAID_AUTH_KEY,
        aliasKey: 'user@contoso.com',
        aliasName: 'Contoso User',
        aliasMail: 'user@contoso.com',
        userInfoUpdate: 1,
        deleteFlag: 0,
      };

      (mockPrisma.userAlias.findFirst as jest.Mock).mockResolvedValue(mockAlias);

      const result = await findEntraIdUserAlias('user@contoso.com');

      expect(result).toEqual(mockAlias);
      expect(mockPrisma.userAlias.findFirst).toHaveBeenCalledWith({
        where: {
          authKey: ENTRAID_AUTH_KEY,
          aliasKey: 'user@contoso.com',
          deleteFlag: 0,
        },
      });
    });
  });

  describe('findUserAliasesByUserId', () => {
    test('ユーザーIDで全ての認証エイリアスを取得できる', async () => {
      const mockAliases = [
        {
          userId: 1,
          authKey: 'google',
          aliasKey: 'test@gmail.com',
          aliasName: 'Google User',
          deleteFlag: 0,
        },
        {
          userId: 1,
          authKey: ENTRAID_AUTH_KEY,
          aliasKey: 'test@contoso.com',
          aliasName: 'EntraID User',
          deleteFlag: 0,
        },
      ];

      (mockPrisma.userAlias.findMany as jest.Mock).mockResolvedValue(mockAliases);

      const result = await findUserAliasesByUserId(1);

      expect(result).toEqual(mockAliases);
      expect(mockPrisma.userAlias.findMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          deleteFlag: 0,
        },
        orderBy: { authKey: 'asc' },
      });
    });

    test('特定の認証キーのエイリアスのみ取得できる', async () => {
      const mockAliases = [
        {
          userId: 1,
          authKey: 'google',
          aliasKey: 'test@gmail.com',
          aliasName: 'Google User',
          deleteFlag: 0,
        },
      ];

      (mockPrisma.userAlias.findMany as jest.Mock).mockResolvedValue(mockAliases);

      const result = await findUserAliasesByUserId(1, 'google');

      expect(result).toEqual(mockAliases);
      expect(mockPrisma.userAlias.findMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          authKey: 'google',
          deleteFlag: 0,
        },
        orderBy: { authKey: 'asc' },
      });
    });

    test('エラーが発生した場合は空配列を返す', async () => {
      (mockPrisma.userAlias.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await findUserAliasesByUserId(1);

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error finding user aliases by user ID:', expect.any(Error));
    });
  });

  describe('saveUserAlias', () => {
    test('新規ユーザーエイリアスを作成できる', async () => {
      const userAlias: UserAlias = {
        userId: 1,
        authKey: 'google',
        aliasKey: 'TEST@GMAIL.COM',
        aliasName: 'Test User',
        aliasMail: 'test@gmail.com',
      };

      const mockResult = {
        ...userAlias,
        aliasKey: 'test@gmail.com',
        userInfoUpdate: 1,
        insertUser: 1,
        insertDatetime: new Date(),
        updateUser: 1,
        updateDatetime: new Date(),
        deleteFlag: 0,
      };

      (mockPrisma.userAlias.upsert as jest.Mock).mockResolvedValue(mockResult);

      const result = await saveUserAlias(userAlias);

      expect(result).toEqual(mockResult);
      expect(mockPrisma.userAlias.upsert).toHaveBeenCalledWith({
        where: {
          userId_authKey: {
            userId: 1,
            authKey: 'google',
          },
        },
        create: {
          userId: 1,
          authKey: 'google',
          aliasKey: 'test@gmail.com',
          aliasName: 'Test User',
          aliasMail: 'test@gmail.com',
          userInfoUpdate: 1,
          updateUser: 1,
          updateDatetime: expect.any(Date),
          insertUser: 1,
          insertDatetime: expect.any(Date),
          deleteFlag: 0,
        },
        update: {
          aliasKey: 'test@gmail.com',
          aliasName: 'Test User',
          aliasMail: 'test@gmail.com',
          userInfoUpdate: 1,
          updateUser: 1,
          updateDatetime: expect.any(Date),
        },
      });
    });

    test('既存のユーザーエイリアスを更新できる', async () => {
      const userAlias: UserAlias = {
        userId: 1,
        authKey: 'google',
        aliasKey: 'test@gmail.com',
        aliasName: 'Updated User',
        aliasMail: 'test@gmail.com',
        updateUser: 2,
      };

      const mockResult = {
        ...userAlias,
        userInfoUpdate: 1,
        updateDatetime: new Date(),
      };

      (mockPrisma.userAlias.upsert as jest.Mock).mockResolvedValue(mockResult);

      const result = await saveUserAlias(userAlias);

      expect(result).toEqual(mockResult);
    });

    test('エラーが発生した場合は例外をスローする', async () => {
      const userAlias: UserAlias = {
        userId: 1,
        authKey: 'google',
        aliasKey: 'test@gmail.com',
        aliasName: 'Test User',
      };

      (mockPrisma.userAlias.upsert as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(saveUserAlias(userAlias)).rejects.toThrow('ユーザーエイリアスの保存に失敗しました');
      expect(console.error).toHaveBeenCalledWith('Error saving user alias:', expect.any(Error));
    });
  });

  describe('createEntraIdUserAlias', () => {
    test('EntraIDユーザーエイリアスを作成できる', async () => {
      const mockResult = {
        userId: 1,
        authKey: ENTRAID_AUTH_KEY,
        aliasKey: 'user@contoso.com',
        aliasName: 'Contoso User',
        aliasMail: 'user@contoso.com',
        userInfoUpdate: 1,
        insertUser: 1,
        insertDatetime: new Date(),
        updateUser: 1,
        updateDatetime: new Date(),
        deleteFlag: 0,
      };

      (mockPrisma.userAlias.upsert as jest.Mock).mockResolvedValue(mockResult);

      const result = await createEntraIdUserAlias(1, 'user@contoso.com', 'Contoso User');

      expect(result).toEqual(mockResult);
      expect(mockPrisma.userAlias.upsert).toHaveBeenCalledWith({
        where: {
          userId_authKey: {
            userId: 1,
            authKey: ENTRAID_AUTH_KEY,
          },
        },
        create: expect.objectContaining({
          userId: 1,
          authKey: ENTRAID_AUTH_KEY,
          aliasKey: 'user@contoso.com',
          aliasName: 'Contoso User',
          aliasMail: 'user@contoso.com',
          userInfoUpdate: 1,
        }),
        update: expect.objectContaining({
          aliasKey: 'user@contoso.com',
          aliasName: 'Contoso User',
          aliasMail: 'user@contoso.com',
          userInfoUpdate: 1,
        }),
      });
    });
  });

  describe('deleteUserAlias', () => {
    test('ユーザーエイリアスを論理削除できる', async () => {
      (mockPrisma.userAlias.update as jest.Mock).mockResolvedValue({});

      const result = await deleteUserAlias(1, 'google');

      expect(result).toBe(true);
      expect(mockPrisma.userAlias.update).toHaveBeenCalledWith({
        where: {
          userId_authKey: {
            userId: 1,
            authKey: 'google',
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
      (mockPrisma.userAlias.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await deleteUserAlias(1, 'google');

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error deleting user alias:', expect.any(Error));
    });

    test('存在しないエイリアスの削除を試みた場合もfalseを返す', async () => {
      (mockPrisma.userAlias.update as jest.Mock).mockRejectedValue(new Error('Record not found'));

      const result = await deleteUserAlias(999, 'nonexistent');

      expect(result).toBe(false);
    });
  });
});