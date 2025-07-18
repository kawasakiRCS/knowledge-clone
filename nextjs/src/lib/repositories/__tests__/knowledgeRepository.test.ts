/**
 * ナレッジリポジトリテスト
 * 
 * @description knowledgeRepository.tsの包括的なテストカバレッジ
 */
import { KnowledgeRepository } from '../knowledgeRepository';
import { prisma } from '@/lib/db';

// Prismaのモック
jest.mock('@/lib/db', () => ({
  prisma: {
    knowledge: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('KnowledgeRepository', () => {
  let knowledgeRepository: KnowledgeRepository;
  const mockPrisma = prisma as jest.Mocked<typeof prisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    knowledgeRepository = new KnowledgeRepository();
  });

  describe('findById', () => {
    test('IDでナレッジを取得', async () => {
      const mockKnowledge = {
        knowledgeId: BigInt(1),
        title: 'Test Knowledge',
        content: 'Test content',
        publicFlag: 1,
        deleteFlag: 0,
      };

      mockPrisma.knowledge.findUnique.mockResolvedValue(mockKnowledge as any);

      const result = await knowledgeRepository.findById(BigInt(1));

      expect(mockPrisma.knowledge.findUnique).toHaveBeenCalledWith({
        where: {
          knowledgeId: BigInt(1),
          deleteFlag: 0,
        },
      });
      expect(result).toEqual(mockKnowledge);
    });

    test('存在しないIDの場合nullを返す', async () => {
      mockPrisma.knowledge.findUnique.mockResolvedValue(null);

      const result = await knowledgeRepository.findById(BigInt(999));

      expect(result).toBeNull();
    });

    test('削除済みのナレッジは取得しない', async () => {
      mockPrisma.knowledge.findUnique.mockResolvedValue(null);

      await knowledgeRepository.findById(BigInt(1));

      expect(mockPrisma.knowledge.findUnique).toHaveBeenCalledWith({
        where: {
          knowledgeId: BigInt(1),
          deleteFlag: 0,
        },
      });
    });
  });

  describe('findByIdWithUserInfo', () => {
    test('ユーザー情報付きでナレッジを取得', async () => {
      const mockKnowledgeWithUser = {
        knowledgeId: BigInt(1),
        title: 'Test Knowledge',
        content: 'Test content',
        publicFlag: 1,
        deleteFlag: 0,
        author: {
          userId: 1,
          userName: 'Test User',
          userKey: 'testuser',
        },
      };

      mockPrisma.knowledge.findUnique.mockResolvedValue(mockKnowledgeWithUser as any);

      const result = await knowledgeRepository.findByIdWithUserInfo(BigInt(1));

      expect(mockPrisma.knowledge.findUnique).toHaveBeenCalledWith({
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
      expect(result).toEqual(mockKnowledgeWithUser);
      expect(result?.author).toBeDefined();
    });

    test('作成者が削除されている場合', async () => {
      const mockKnowledgeNoUser = {
        knowledgeId: BigInt(1),
        title: 'Test Knowledge',
        content: 'Test content',
        publicFlag: 1,
        deleteFlag: 0,
        author: null,
      };

      mockPrisma.knowledge.findUnique.mockResolvedValue(mockKnowledgeNoUser as any);

      const result = await knowledgeRepository.findByIdWithUserInfo(BigInt(1));

      expect(result?.author).toBeNull();
    });
  });

  describe('searchPublicKnowledges', () => {
    test('公開ナレッジを検索（キーワードなし）', async () => {
      const mockKnowledges = [
        {
          knowledgeId: BigInt(1),
          title: 'Knowledge 1',
          content: 'Content 1',
          publicFlag: 1,
          deleteFlag: 0,
        },
        {
          knowledgeId: BigInt(2),
          title: 'Knowledge 2',
          content: 'Content 2',
          publicFlag: 1,
          deleteFlag: 0,
        },
      ];

      mockPrisma.knowledge.findMany.mockResolvedValue(mockKnowledges as any);

      const result = await knowledgeRepository.searchPublicKnowledges({
        limit: 10,
        offset: 0,
      });

      expect(mockPrisma.knowledge.findMany).toHaveBeenCalledWith({
        where: {
          deleteFlag: 0,
          publicFlag: 1,
        },
        orderBy: { updateDatetime: 'desc' },
        take: 10,
        skip: 0,
      });
      expect(result).toEqual(mockKnowledges);
    });

    test('公開ナレッジを検索（キーワードあり）', async () => {
      const mockKnowledges = [
        {
          knowledgeId: BigInt(1),
          title: 'React Tutorial',
          content: 'Learn React',
          publicFlag: 1,
          deleteFlag: 0,
        },
      ];

      mockPrisma.knowledge.findMany.mockResolvedValue(mockKnowledges as any);

      const result = await knowledgeRepository.searchPublicKnowledges({
        keyword: 'React',
        limit: 20,
        offset: 5,
      });

      expect(mockPrisma.knowledge.findMany).toHaveBeenCalledWith({
        where: {
          deleteFlag: 0,
          publicFlag: 1,
          OR: [
            { title: { contains: 'React', mode: 'insensitive' } },
            { content: { contains: 'React', mode: 'insensitive' } },
          ],
        },
        orderBy: { updateDatetime: 'desc' },
        take: 20,
        skip: 5,
      });
      expect(result).toEqual(mockKnowledges);
    });

    test('検索結果が空の場合', async () => {
      mockPrisma.knowledge.findMany.mockResolvedValue([]);

      const result = await knowledgeRepository.searchPublicKnowledges({
        keyword: 'NonExistent',
        limit: 10,
        offset: 0,
      });

      expect(result).toEqual([]);
    });
  });

  describe('updateViewCount', () => {
    test('閲覧数を更新', async () => {
      mockPrisma.knowledge.update.mockResolvedValue({} as any);

      await knowledgeRepository.updateViewCount(BigInt(1), BigInt(100));

      expect(mockPrisma.knowledge.update).toHaveBeenCalledWith({
        where: { knowledgeId: BigInt(1) },
        data: { viewCount: BigInt(100) },
      });
    });

    test('大きな閲覧数でも更新', async () => {
      mockPrisma.knowledge.update.mockResolvedValue({} as any);

      const largeCount = BigInt('9999999999');
      await knowledgeRepository.updateViewCount(BigInt(1), largeCount);

      expect(mockPrisma.knowledge.update).toHaveBeenCalledWith({
        where: { knowledgeId: BigInt(1) },
        data: { viewCount: largeCount },
      });
    });
  });

  describe('getPoint', () => {
    test('ポイントを取得', async () => {
      mockPrisma.knowledge.findUnique.mockResolvedValue({
        point: 50,
      } as any);

      const result = await knowledgeRepository.getPoint(BigInt(1));

      expect(mockPrisma.knowledge.findUnique).toHaveBeenCalledWith({
        where: { knowledgeId: BigInt(1) },
        select: { point: true },
      });
      expect(result).toBe(50);
    });

    test('ポイントがnullの場合0を返す', async () => {
      mockPrisma.knowledge.findUnique.mockResolvedValue({
        point: null,
      } as any);

      const result = await knowledgeRepository.getPoint(BigInt(1));

      expect(result).toBe(0);
    });

    test('ナレッジが存在しない場合0を返す', async () => {
      mockPrisma.knowledge.findUnique.mockResolvedValue(null);

      const result = await knowledgeRepository.getPoint(BigInt(999));

      expect(result).toBe(0);
    });
  });

  describe('updatePoint', () => {
    test('ポイントを更新', async () => {
      mockPrisma.knowledge.update.mockResolvedValue({} as any);

      await knowledgeRepository.updatePoint(BigInt(1), 75);

      expect(mockPrisma.knowledge.update).toHaveBeenCalledWith({
        where: { knowledgeId: BigInt(1) },
        data: { point: 75 },
      });
    });

    test('ポイントを0に更新', async () => {
      mockPrisma.knowledge.update.mockResolvedValue({} as any);

      await knowledgeRepository.updatePoint(BigInt(1), 0);

      expect(mockPrisma.knowledge.update).toHaveBeenCalledWith({
        where: { knowledgeId: BigInt(1) },
        data: { point: 0 },
      });
    });
  });

  describe('create', () => {
    test('ナレッジを新規作成', async () => {
      const createData = {
        title: 'New Knowledge',
        content: 'New content',
        publicFlag: 1,
        typeId: 1,
        insertUser: 1,
        insertDatetime: new Date('2024-01-01'),
        updateUser: 1,
        updateDatetime: new Date('2024-01-01'),
        deleteFlag: 0,
        viewCount: BigInt(0),
        point: 0,
      };

      const mockCreated = {
        knowledgeId: BigInt(100),
        ...createData,
      };

      mockPrisma.knowledge.create.mockResolvedValue(mockCreated as any);

      const result = await knowledgeRepository.create(createData);

      expect(mockPrisma.knowledge.create).toHaveBeenCalledWith({
        data: createData,
      });
      expect(result).toEqual(mockCreated);
    });

    test('非公開ナレッジを作成', async () => {
      const createData = {
        title: 'Private Knowledge',
        content: 'Private content',
        publicFlag: 3,
        typeId: 2,
        insertUser: 2,
        insertDatetime: new Date('2024-01-02'),
        updateUser: 2,
        updateDatetime: new Date('2024-01-02'),
        deleteFlag: 0,
        viewCount: BigInt(0),
        point: 0,
      };

      mockPrisma.knowledge.create.mockResolvedValue({
        knowledgeId: BigInt(101),
        ...createData,
      } as any);

      await knowledgeRepository.create(createData);

      expect(mockPrisma.knowledge.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          publicFlag: 3,
        }),
      });
    });
  });

  describe('update', () => {
    test('ナレッジを更新', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
        publicFlag: 2,
        updateUser: 1,
        updateDatetime: new Date('2024-01-10'),
      };

      const mockUpdated = {
        knowledgeId: BigInt(1),
        ...updateData,
      };

      mockPrisma.knowledge.update.mockResolvedValue(mockUpdated as any);

      const result = await knowledgeRepository.update(BigInt(1), updateData);

      expect(mockPrisma.knowledge.update).toHaveBeenCalledWith({
        where: { knowledgeId: BigInt(1) },
        data: updateData,
      });
      expect(result).toEqual(mockUpdated);
    });

    test('部分的な更新', async () => {
      const updateData = {
        title: 'Only Title Updated',
        updateUser: 2,
        updateDatetime: new Date('2024-01-15'),
      };

      mockPrisma.knowledge.update.mockResolvedValue({} as any);

      await knowledgeRepository.update(BigInt(1), updateData);

      expect(mockPrisma.knowledge.update).toHaveBeenCalledWith({
        where: { knowledgeId: BigInt(1) },
        data: updateData,
      });
    });
  });

  describe('softDelete', () => {
    test('ナレッジを論理削除', async () => {
      mockPrisma.knowledge.update.mockResolvedValue({} as any);

      await knowledgeRepository.softDelete(BigInt(1), 1);

      expect(mockPrisma.knowledge.update).toHaveBeenCalledWith({
        where: { knowledgeId: BigInt(1) },
        data: {
          deleteFlag: 1,
          updateUser: 1,
          updateDatetime: expect.any(Date),
        },
      });
    });

    test('別のユーザーが論理削除', async () => {
      mockPrisma.knowledge.update.mockResolvedValue({} as any);

      await knowledgeRepository.softDelete(BigInt(10), 5);

      expect(mockPrisma.knowledge.update).toHaveBeenCalledWith({
        where: { knowledgeId: BigInt(10) },
        data: {
          deleteFlag: 1,
          updateUser: 5,
          updateDatetime: expect.any(Date),
        },
      });
    });
  });

  describe('delete', () => {
    test('ナレッジを物理削除', async () => {
      mockPrisma.knowledge.delete.mockResolvedValue({} as any);

      await knowledgeRepository.delete(BigInt(1));

      expect(mockPrisma.knowledge.delete).toHaveBeenCalledWith({
        where: { knowledgeId: BigInt(1) },
      });
    });

    test('存在しないナレッジの物理削除', async () => {
      mockPrisma.knowledge.delete.mockRejectedValue(new Error('Record not found'));

      await expect(knowledgeRepository.delete(BigInt(999))).rejects.toThrow('Record not found');
    });
  });
});