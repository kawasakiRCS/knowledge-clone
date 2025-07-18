/**
 * ナレッジリポジトリテスト
 * 
 * @description knowledgeRepository.tsの単体テスト
 */
import { KnowledgeRepository } from '../knowledgeRepository';
import { prisma } from '@/lib/db';

// Prismaのモック
jest.mock('@/lib/db', () => ({
  prisma: {
    knowledge: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    knowledgeLike: {
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    knowledgeComment: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    knowledgeHistory: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}));

describe('KnowledgeRepository', () => {
  let repository: KnowledgeRepository;
  
  beforeEach(() => {
    jest.clearAllMocks();
    repository = new KnowledgeRepository();
  });

  describe('findById', () => {
    test('IDでナレッジを取得', async () => {
      const mockKnowledge = {
        knowledgeId: BigInt(1),
        title: 'テストナレッジ',
        content: 'テスト内容',
        publicFlag: 1,
        deleteFlag: 0,
      };

      (prisma.knowledge.findUnique as jest.Mock).mockResolvedValue(mockKnowledge);

      const result = await repository.findById(BigInt(1));

      expect(result).toEqual(mockKnowledge);
      expect(prisma.knowledge.findUnique).toHaveBeenCalledWith({
        where: {
          knowledgeId: BigInt(1),
          deleteFlag: 0,
        },
      });
    });

    test('存在しないナレッジはnullを返す', async () => {
      (prisma.knowledge.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById(BigInt(999));

      expect(result).toBeNull();
    });
  });

  describe('findByIdWithUserInfo', () => {
    test('ユーザー情報付きでナレッジを取得', async () => {
      const mockKnowledgeWithAuthor = {
        knowledgeId: BigInt(1),
        title: 'テストナレッジ',
        content: 'テスト内容',
        author: {
          userId: 1,
          userName: 'testuser',
          userKey: 'test@example.com',
        },
      };

      (prisma.knowledge.findUnique as jest.Mock).mockResolvedValue(mockKnowledgeWithAuthor);

      const result = await repository.findByIdWithUserInfo(BigInt(1));

      expect(result).toEqual(mockKnowledgeWithAuthor);
      expect(prisma.knowledge.findUnique).toHaveBeenCalledWith({
        where: {
          knowledgeId: BigInt(1),
          deleteFlag: 0,
        },
        include: {
          author: {
            select: {
              userId: true,
              userName: true,
              userKey: true,
            },
          },
        },
      });
    });
  });

  describe('searchPublicKnowledges', () => {
    test('公開ナレッジを検索', async () => {
      const mockKnowledges = [
        {
          knowledgeId: BigInt(1),
          title: 'テストナレッジ1',
          publicFlag: 1,
        },
        {
          knowledgeId: BigInt(2),
          title: 'テストナレッジ2',
          publicFlag: 1,
        },
      ];

      (prisma.knowledge.findMany as jest.Mock).mockResolvedValue(mockKnowledges);

      const result = await repository.searchPublicKnowledges({
        keyword: 'テスト',
        limit: 10,
        offset: 0,
      });

      expect(result).toEqual(mockKnowledges);
      expect(prisma.knowledge.findMany).toHaveBeenCalledWith({
        where: {
          deleteFlag: 0,
          publicFlag: 1,
          OR: [
            { title: { contains: 'テスト', mode: 'insensitive' } },
            { content: { contains: 'テスト', mode: 'insensitive' } },
          ],
        },
        orderBy: { updateDatetime: 'desc' },
        take: 10,
        skip: 0,
      });
    });

    test('キーワードなしで全件検索', async () => {
      const mockKnowledges = [
        { knowledgeId: BigInt(1), title: 'ナレッジ1' },
        { knowledgeId: BigInt(2), title: 'ナレッジ2' },
      ];

      (prisma.knowledge.findMany as jest.Mock).mockResolvedValue(mockKnowledges);

      const result = await repository.searchPublicKnowledges({
        limit: 20,
        offset: 0,
      });

      expect(result).toEqual(mockKnowledges);
      expect(prisma.knowledge.findMany).toHaveBeenCalledWith({
        where: {
          deleteFlag: 0,
          publicFlag: 1,
        },
        orderBy: { updateDatetime: 'desc' },
        take: 20,
        skip: 0,
      });
    });
  });

  describe('updateViewCount', () => {
    test('閲覧数を更新', async () => {
      await repository.updateViewCount(BigInt(1), BigInt(100));

      expect(prisma.knowledge.update).toHaveBeenCalledWith({
        where: { knowledgeId: BigInt(1) },
        data: { viewCount: BigInt(100) },
      });
    });
  });

  describe('createKnowledge', () => {
    test('新規ナレッジを作成', async () => {
      const createData = {
        title: '新規ナレッジ',
        content: '内容',
        publicFlag: 1,
        typeId: 1,
        insertUser: BigInt(1),
      };

      const mockCreated = {
        knowledgeId: BigInt(1),
        ...createData,
      };

      (prisma.knowledge.create as jest.Mock).mockResolvedValue(mockCreated);

      const result = await repository.createKnowledge(createData);

      expect(result).toEqual(mockCreated);
      expect(prisma.knowledge.create).toHaveBeenCalledWith({
        data: expect.objectContaining(createData),
      });
    });
  });

  describe('updateKnowledge', () => {
    test('ナレッジを更新', async () => {
      const updateData = {
        title: '更新後タイトル',
        content: '更新後内容',
        publicFlag: 0,
        updateUser: BigInt(1),
        updateDatetime: new Date(),
      };

      await repository.updateKnowledge(BigInt(1), updateData);

      expect(prisma.knowledge.update).toHaveBeenCalledWith({
        where: { knowledgeId: BigInt(1) },
        data: updateData,
      });
    });
  });

  describe('deleteKnowledge', () => {
    test('ナレッジを論理削除', async () => {
      const deleteData = {
        deleteFlag: 1,
        deleteUser: BigInt(1),
        deleteDatetime: expect.any(Date),
      };

      await repository.deleteKnowledge(BigInt(1), BigInt(1));

      expect(prisma.knowledge.update).toHaveBeenCalledWith({
        where: { knowledgeId: BigInt(1) },
        data: expect.objectContaining({
          deleteFlag: 1,
          deleteUser: BigInt(1),
        }),
      });
    });
  });

  describe('addLike', () => {
    test('いいねを追加', async () => {
      const mockLike = {
        no: BigInt(1),
        knowledgeId: BigInt(1),
        insertUser: BigInt(1),
      };

      (prisma.knowledgeLike.create as jest.Mock).mockResolvedValue(mockLike);

      const result = await repository.addLike(BigInt(1), BigInt(1));

      expect(result).toBe(true);
      expect(prisma.knowledgeLike.create).toHaveBeenCalledWith({
        data: {
          knowledgeId: BigInt(1),
          insertUser: BigInt(1),
          insertDatetime: expect.any(Date),
        },
      });
    });

    test('エラー時はfalseを返す', async () => {
      (prisma.knowledgeLike.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      const result = await repository.addLike(BigInt(1), BigInt(1));

      expect(result).toBe(false);
    });
  });

  describe('removeLike', () => {
    test('いいねを削除', async () => {
      (prisma.knowledgeLike.delete as jest.Mock).mockResolvedValue({});

      const result = await repository.removeLike(BigInt(1), BigInt(1));

      expect(result).toBe(true);
      expect(prisma.knowledgeLike.delete).toHaveBeenCalledWith({
        where: {
          knowledgeId_insertUser: {
            knowledgeId: BigInt(1),
            insertUser: BigInt(1),
          },
        },
      });
    });

    test('エラー時はfalseを返す', async () => {
      (prisma.knowledgeLike.delete as jest.Mock).mockRejectedValue(new Error('Not found'));

      const result = await repository.removeLike(BigInt(1), BigInt(1));

      expect(result).toBe(false);
    });
  });

  describe('hasUserLiked', () => {
    test('ユーザーがいいね済みの場合trueを返す', async () => {
      (prisma.knowledgeLike.findUnique as jest.Mock).mockResolvedValue({
        no: BigInt(1),
        knowledgeId: BigInt(1),
        insertUser: BigInt(1),
      });

      const result = await repository.hasUserLiked(BigInt(1), BigInt(1));

      expect(result).toBe(true);
    });

    test('ユーザーがいいねしていない場合falseを返す', async () => {
      (prisma.knowledgeLike.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.hasUserLiked(BigInt(1), BigInt(1));

      expect(result).toBe(false);
    });
  });

  describe('getLikeCount', () => {
    test('いいね数を取得', async () => {
      (prisma.knowledgeLike.count as jest.Mock).mockResolvedValue(5);

      const result = await repository.getLikeCount(BigInt(1));

      expect(result).toBe(5);
      expect(prisma.knowledgeLike.count).toHaveBeenCalledWith({
        where: { knowledgeId: BigInt(1) },
      });
    });
  });

  describe('addComment', () => {
    test('コメントを追加', async () => {
      const mockComment = {
        commentNo: BigInt(1),
        knowledgeId: BigInt(1),
        comment: 'テストコメント',
        insertUser: BigInt(1),
      };

      (prisma.knowledgeComment.create as jest.Mock).mockResolvedValue(mockComment);

      const result = await repository.addComment({
        knowledgeId: BigInt(1),
        comment: 'テストコメント',
        insertUser: BigInt(1),
      });

      expect(result).toEqual(mockComment);
      expect(prisma.knowledgeComment.create).toHaveBeenCalledWith({
        data: {
          knowledgeId: BigInt(1),
          comment: 'テストコメント',
          insertUser: BigInt(1),
          insertDatetime: expect.any(Date),
          deleteFlag: 0,
        },
      });
    });
  });

  describe('getComments', () => {
    test('コメント一覧を取得', async () => {
      const mockComments = [
        {
          commentNo: BigInt(1),
          comment: 'コメント1',
          insertUser: BigInt(1),
          insertDatetime: new Date(),
        },
        {
          commentNo: BigInt(2),
          comment: 'コメント2',
          insertUser: BigInt(2),
          insertDatetime: new Date(),
        },
      ];

      (prisma.knowledgeComment.findMany as jest.Mock).mockResolvedValue(mockComments);

      const result = await repository.getComments(BigInt(1));

      expect(result).toEqual(mockComments);
      expect(prisma.knowledgeComment.findMany).toHaveBeenCalledWith({
        where: {
          knowledgeId: BigInt(1),
          deleteFlag: 0,
        },
        orderBy: { insertDatetime: 'asc' },
      });
    });
  });

  describe('updateComment', () => {
    test('コメントを更新', async () => {
      await repository.updateComment(BigInt(1), BigInt(1), '更新後コメント', BigInt(1));

      expect(prisma.knowledgeComment.update).toHaveBeenCalledWith({
        where: { commentNo: BigInt(1) },
        data: {
          comment: '更新後コメント',
          updateUser: BigInt(1),
          updateDatetime: expect.any(Date),
        },
      });
    });
  });

  describe('deleteComment', () => {
    test('コメントを論理削除', async () => {
      await repository.deleteComment(BigInt(1), BigInt(1));

      expect(prisma.knowledgeComment.update).toHaveBeenCalledWith({
        where: { commentNo: BigInt(1) },
        data: {
          deleteFlag: 1,
          deleteUser: BigInt(1),
          deleteDatetime: expect.any(Date),
        },
      });
    });
  });

  describe('createHistory', () => {
    test('履歴を作成', async () => {
      const historyData = {
        knowledgeId: BigInt(1),
        title: '履歴タイトル',
        content: '履歴内容',
        publicFlag: 1,
        updateUser: BigInt(1),
      };

      await repository.createHistory(historyData);

      expect(prisma.knowledgeHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...historyData,
          updateDatetime: expect.any(Date),
        }),
      });
    });
  });

  describe('getHistories', () => {
    test('履歴一覧を取得', async () => {
      const mockHistories = [
        {
          historyNo: BigInt(2),
          knowledgeId: BigInt(1),
          updateDatetime: new Date('2024-01-02'),
        },
        {
          historyNo: BigInt(1),
          knowledgeId: BigInt(1),
          updateDatetime: new Date('2024-01-01'),
        },
      ];

      (prisma.knowledgeHistory.findMany as jest.Mock).mockResolvedValue(mockHistories);

      const result = await repository.getHistories(BigInt(1));

      expect(result).toEqual(mockHistories);
      expect(prisma.knowledgeHistory.findMany).toHaveBeenCalledWith({
        where: { knowledgeId: BigInt(1) },
        orderBy: { updateDatetime: 'desc' },
      });
    });
  });

  describe('getHistory', () => {
    test('特定の履歴を取得', async () => {
      const mockHistory = {
        historyNo: BigInt(1),
        knowledgeId: BigInt(1),
        title: '履歴タイトル',
        content: '履歴内容',
        updateDatetime: new Date(),
      };

      (prisma.knowledgeHistory.findFirst as jest.Mock).mockResolvedValue(mockHistory);

      const result = await repository.getHistory(BigInt(1), BigInt(1));

      expect(result).toEqual(mockHistory);
      expect(prisma.knowledgeHistory.findFirst).toHaveBeenCalledWith({
        where: {
          knowledgeId: BigInt(1),
          historyNo: BigInt(1),
        },
      });
    });
  });
});