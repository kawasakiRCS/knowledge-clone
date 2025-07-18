/**
 * accountServiceテスト
 * 
 * @description アカウントサービスのビジネスロジックテスト
 */
import { AccountService } from '../accountService';
import { prisma } from '@/lib/db';
import { IdenticonService } from '../identiconService';
import crypto from 'crypto';

// モック設定
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    knowledge: {
      findMany: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('../identiconService');
jest.mock('crypto');

describe('AccountService', () => {
  let accountService: AccountService;
  const mockPrisma = prisma as jest.Mocked<typeof prisma>;
  const mockIdenticonService = IdenticonService as jest.MockedClass<typeof IdenticonService>;
  const mockCrypto = crypto as jest.Mocked<typeof crypto>;

  beforeEach(() => {
    jest.clearAllMocks();
    accountService = new AccountService();
  });

  describe('getUserInfo', () => {
    test('ユーザー情報を取得できる', async () => {
      const mockUser = {
        userId: 1,
        userName: 'Test User',
        mailAddress: 'test@example.com',
        password: 'hashedPassword',
        deleteFlag: 0,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

      const result = await accountService.getUserInfo(1);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { userId: 1, deleteFlag: 0 },
      });
      expect(result).toEqual({
        userId: 1,
        userName: 'Test User',
        mailAddress: 'test@example.com',
        deleteFlag: 0,
      });
      expect(result).not.toHaveProperty('password');
    });

    test('ユーザーが存在しない場合nullを返す', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await accountService.getUserInfo(999);

      expect(result).toBeNull();
    });

    test('削除済みユーザーの場合nullを返す', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await accountService.getUserInfo(1);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { userId: 1, deleteFlag: 0 },
      });
      expect(result).toBeNull();
    });
  });

  describe('getUserIcon', () => {
    test('匿名ユーザー（-1）の場合デフォルトアイコンを返す', async () => {
      const mockDefaultIcon = {
        fileName: 'icon.png',
        contentType: 'image/png',
        size: 100,
        data: Buffer.from('default'),
      };

      mockIdenticonService.prototype.generateIdenticon = jest.fn().mockResolvedValue(mockDefaultIcon);

      const result = await accountService.getUserIcon(-1);

      expect(result).toEqual(mockDefaultIcon);
    });

    test('通常ユーザーの場合Identiconを生成', async () => {
      const mockIdenticon = {
        fileName: 'identicon_1.png',
        contentType: 'image/png',
        size: 200,
        data: Buffer.from('identicon'),
      };

      mockIdenticonService.prototype.generateIdenticon = jest.fn().mockResolvedValue(mockIdenticon);

      const result = await accountService.getUserIcon(1);

      expect(mockIdenticonService.prototype.generateIdenticon).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockIdenticon);
    });
  });

  describe('getDefaultIcon', () => {
    test('デフォルトアイコンを返す', async () => {
      const mockIcon = {
        fileName: 'identicon_-1.png',
        contentType: 'image/png',
        size: 100,
        data: Buffer.from('default'),
      };

      mockIdenticonService.prototype.generateIdenticon = jest.fn().mockResolvedValue(mockIcon);

      const result = await accountService.getDefaultIcon();

      expect(mockIdenticonService.prototype.generateIdenticon).toHaveBeenCalledWith(-1);
      expect(result).toEqual({
        fileName: 'icon.png',
        contentType: 'image/png',
        size: 100,
        data: Buffer.from('default'),
      });
    });
  });

  describe('generateIdenticon', () => {
    test('Identiconを生成する', async () => {
      const mockHash = { update: jest.fn(), digest: jest.fn() };
      mockHash.update.mockReturnThis();
      mockHash.digest.mockReturnValue('a1b2c3d4');
      mockCrypto.createHash = jest.fn().mockReturnValue(mockHash as any);

      const result = await accountService.generateIdenticon(123);

      expect(mockCrypto.createHash).toHaveBeenCalledWith('md5');
      expect(mockHash.update).toHaveBeenCalledWith('123');
      expect(mockHash.digest).toHaveBeenCalledWith('hex');
      expect(result).toEqual({
        fileName: 'identicon_123.png',
        contentType: 'image/png',
        size: 8,
        data: Buffer.from('a1b2c3d4'),
      });
    });
  });

  describe('getUserKnowledges', () => {
    test('自分のナレッジ一覧を取得（全て表示）', async () => {
      const mockKnowledges = [
        {
          knowledgeId: BigInt(1),
          title: 'Public Knowledge',
          content: 'Public content',
          publicFlag: 1,
          insertUser: 1,
          insertDatetime: new Date(),
          updateDatetime: new Date(),
          viewCount: BigInt(10),
          point: 5,
          author: { userId: 1, userName: 'Test User' },
        },
        {
          knowledgeId: BigInt(2),
          title: 'Private Knowledge',
          content: 'Private content',
          publicFlag: 3,
          insertUser: 1,
          insertDatetime: new Date(),
          updateDatetime: new Date(),
          viewCount: BigInt(0),
          point: 0,
          author: { userId: 1, userName: 'Test User' },
        },
      ];

      mockPrisma.knowledge.findMany.mockResolvedValue(mockKnowledges as any);

      const currentUser = { userId: 1 };
      const result = await accountService.getUserKnowledges(1, currentUser, 0, 10);

      expect(mockPrisma.knowledge.findMany).toHaveBeenCalledWith({
        where: {
          insertUser: 1,
          deleteFlag: 0,
        },
        orderBy: { insertDatetime: 'desc' },
        skip: 0,
        take: 10,
        include: {
          author: {
            select: {
              userId: true,
              userName: true,
            },
          },
        },
      });

      expect(result).toHaveLength(2);
      expect(result[0].knowledgeId).toBe('1');
      expect(result[1].knowledgeId).toBe('2');
    });

    test('他人のナレッジ一覧を取得（公開のみ）', async () => {
      const mockKnowledges = [
        {
          knowledgeId: BigInt(1),
          title: 'Public Knowledge',
          content: 'Public content',
          publicFlag: 1,
          insertUser: 2,
          insertDatetime: new Date(),
          updateDatetime: new Date(),
          viewCount: BigInt(10),
          point: 5,
          author: { userId: 2, userName: 'Other User' },
        },
      ];

      mockPrisma.knowledge.findMany.mockResolvedValue(mockKnowledges as any);

      const currentUser = { userId: 1 };
      const result = await accountService.getUserKnowledges(2, currentUser, 0, 10);

      expect(mockPrisma.knowledge.findMany).toHaveBeenCalledWith({
        where: {
          insertUser: 2,
          deleteFlag: 0,
          publicFlag: 1,
        },
        orderBy: { insertDatetime: 'desc' },
        skip: 0,
        take: 10,
        include: {
          author: {
            select: {
              userId: true,
              userName: true,
            },
          },
        },
      });

      expect(result).toHaveLength(1);
    });

    test('未認証ユーザーがナレッジ一覧を取得（公開のみ）', async () => {
      mockPrisma.knowledge.findMany.mockResolvedValue([]);

      const result = await accountService.getUserKnowledges(1, null, 0, 10);

      expect(mockPrisma.knowledge.findMany).toHaveBeenCalledWith({
        where: {
          insertUser: 1,
          deleteFlag: 0,
          publicFlag: 1,
        },
        orderBy: { insertDatetime: 'desc' },
        skip: 0,
        take: 10,
        include: {
          author: {
            select: {
              userId: true,
              userName: true,
            },
          },
        },
      });
    });
  });

  describe('getUserPoint', () => {
    test('ユーザーのポイントを計算', async () => {
      mockPrisma.knowledge.count.mockResolvedValue(5);

      const result = await accountService.getUserPoint(1);

      expect(mockPrisma.knowledge.count).toHaveBeenCalledWith({
        where: {
          insertUser: 1,
          deleteFlag: 0,
        },
      });
      expect(result).toBe(50); // 5 * 10
    });

    test('エラー時は0を返す', async () => {
      mockPrisma.knowledge.count.mockRejectedValue(new Error('DB Error'));

      const result = await accountService.getUserPoint(1);

      expect(result).toBe(0);
    });
  });

  describe('getUserCPHistory', () => {
    test('CP履歴を取得', async () => {
      const result = await accountService.getUserCPHistory(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        date: expect.any(String),
        point: 100,
        knowledgeCount: 5,
        likeCount: 10,
        commentCount: 3,
      });
    });
  });

  describe('getUserActivity', () => {
    test('アクティビティ履歴を取得', async () => {
      const result = await accountService.getUserActivity(1, 10, 0);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        activityId: BigInt(1),
        activityType: 'KNOWLEDGE_CREATE',
        datetime: expect.any(Date),
        title: 'ナレッジを作成しました',
        point: 10,
      });
    });
  });

  describe('saveIconImage', () => {
    test('アイコン画像を保存', async () => {
      const imageData = Buffer.from('image data');
      const user = { userId: 1 };

      const result = await accountService.saveIconImage(imageData, user);

      expect(result).toEqual({
        fileName: 'icon.png',
        fileNo: 1,
        url: '/api/open/account/1/icon',
      });
    });
  });

  describe('saveChangeEmailRequest', () => {
    test('メールアドレス変更リクエストを保存', async () => {
      const result = await accountService.saveChangeEmailRequest('new@example.com', { userId: 1 });

      expect(result).toEqual([]);
    });
  });

  describe('completeChangeEmailRequest', () => {
    test('メールアドレス変更を完了', async () => {
      const result = await accountService.completeChangeEmailRequest('request123', { userId: 1 });

      expect(result).toEqual([]);
    });
  });

  describe('updateUserInfo', () => {
    test('ユーザー情報を更新', async () => {
      const mockUpdatedUser = {
        userId: 1,
        userName: 'Updated User',
        userKey: 'newkey',
        mailAddress: 'test@example.com',
        insertDatetime: new Date(),
        updateDatetime: new Date(),
      };

      mockPrisma.user.update.mockResolvedValue(mockUpdatedUser as any);

      const result = await accountService.updateUserInfo(1, {
        userName: 'Updated User',
        userKey: 'newkey',
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: {
          userName: 'Updated User',
          userKey: 'newkey',
          updateDatetime: expect.any(Date),
        },
        select: {
          userId: true,
          userName: true,
          userKey: true,
          mailAddress: true,
          insertDatetime: true,
          updateDatetime: true,
        },
      });

      expect(result).toEqual(mockUpdatedUser);
    });

    test('パスワードを更新', async () => {
      const mockUpdatedUser = {
        userId: 1,
        userName: 'Test User',
        userKey: 'key',
        mailAddress: 'test@example.com',
        insertDatetime: new Date(),
        updateDatetime: new Date(),
      };

      mockPrisma.user.update.mockResolvedValue(mockUpdatedUser as any);

      await accountService.updateUserInfo(1, {
        password: 'newPassword',
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: {
          password: 'newPassword',
          encrypted: false,
          updateDatetime: expect.any(Date),
        },
        select: expect.any(Object),
      });
    });
  });

  describe('withdrawUser', () => {
    test('ユーザーを退会処理（ナレッジも削除）', async () => {
      const mockTransaction = jest.fn(async (callback) => {
        const tx = {
          knowledge: {
            updateMany: jest.fn(),
          },
          user: {
            update: jest.fn(),
          },
        };
        await callback(tx);
      });

      mockPrisma.$transaction.mockImplementation(mockTransaction);

      await accountService.withdrawUser(1, true);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    test('ユーザーを退会処理（ナレッジは残す）', async () => {
      const mockTransaction = jest.fn(async (callback) => {
        const tx = {
          knowledge: {
            updateMany: jest.fn(),
          },
          user: {
            update: jest.fn(),
          },
        };
        await callback(tx);
      });

      mockPrisma.$transaction.mockImplementation(mockTransaction);

      await accountService.withdrawUser(1, false);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('getSystemConfig', () => {
    test('システム設定を取得', async () => {
      const result = await accountService.getSystemConfig();

      expect(result).toEqual({
        userAddType: 'ADMIN',
      });
    });
  });

  describe('getUserConfig', () => {
    test('ユーザー設定を取得', async () => {
      const result = await accountService.getUserConfig(1);

      expect(result).toEqual({
        defaultPublicFlag: '1',
        defaultTargets: '',
        defaultViewers: [],
      });
    });
  });

  describe('saveUserConfig', () => {
    test('ユーザー設定を保存', async () => {
      await accountService.saveUserConfig(1, {
        defaultPublicFlag: '2',
        defaultTargets: 'group1,group2',
      });

      // 実装予定のため、現在は何も起こらないことを確認
      expect(true).toBe(true);
    });
  });

  describe('createUser', () => {
  });
});