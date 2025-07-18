/**
 * KnowledgeServiceテスト
 * 
 * @description ナレッジサービスの単体テスト
 */
import { KnowledgeService } from '../knowledgeService';
import { KnowledgeRepository } from '@/lib/repositories/knowledgeRepository';
import { Knowledge } from '@prisma/client';

// モック
jest.mock('@/lib/repositories/knowledgeRepository');

describe('KnowledgeService', () => {
  let service: KnowledgeService;
  let mockKnowledgeRepo: jest.Mocked<KnowledgeRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new KnowledgeService();
    mockKnowledgeRepo = (service as any).knowledgeRepo as jest.Mocked<KnowledgeRepository>;
  });

  describe('getKnowledgeById', () => {
    test('ナレッジをIDで取得できる', async () => {
      const mockKnowledge: Knowledge = {
        knowledgeId: BigInt(1),
        title: 'テストナレッジ',
        content: 'テスト内容',
        publicFlag: 1,
        typeId: BigInt(1),
        likeCount: BigInt(0),
        commentCount: BigInt(0),
        viewCount: BigInt(0),
        insertUser: 1,
        insertDatetime: new Date(),
        updateUser: 1,
        updateDatetime: new Date(),
        deleteFlag: 0,
        notifyStatus: 0,
        point: 0,
      };

      mockKnowledgeRepo.findById.mockResolvedValue(mockKnowledge);

      const result = await service.getKnowledgeById(BigInt(1));

      expect(mockKnowledgeRepo.findById).toHaveBeenCalledWith(BigInt(1));
      expect(result).toEqual(mockKnowledge);
    });

    test('存在しないIDの場合nullを返す', async () => {
      mockKnowledgeRepo.findById.mockResolvedValue(null);

      const result = await service.getKnowledgeById(BigInt(999));

      expect(mockKnowledgeRepo.findById).toHaveBeenCalledWith(BigInt(999));
      expect(result).toBeNull();
    });
  });

  describe('getKnowledgeWithAuthor', () => {
    test('ユーザー情報付きでナレッジを取得できる', async () => {
      const mockKnowledgeWithAuthor = {
        knowledgeId: BigInt(1),
        title: 'テストナレッジ',
        content: 'テスト内容',
        publicFlag: 1,
        typeId: BigInt(1),
        likeCount: BigInt(0),
        commentCount: BigInt(0),
        viewCount: BigInt(0),
        insertUser: 1,
        insertDatetime: new Date(),
        updateUser: 1,
        updateDatetime: new Date(),
        deleteFlag: 0,
        notifyStatus: 0,
        point: 0,
        user: {
          userId: 1,
          userName: 'Test User',
        },
      };

      mockKnowledgeRepo.findByIdWithAuthor.mockResolvedValue(mockKnowledgeWithAuthor);

      const result = await service.getKnowledgeWithAuthor(BigInt(1));

      expect(mockKnowledgeRepo.findByIdWithAuthor).toHaveBeenCalledWith(BigInt(1));
      expect(result).toEqual(mockKnowledgeWithAuthor);
    });
  });

  describe('searchKnowledges', () => {
    test('検索条件に従ってナレッジを検索できる', async () => {
      const mockResults = {
        knowledges: [],
        total: 0,
      };

      mockKnowledgeRepo.search.mockResolvedValue(mockResults);

      const searchParams = {
        keyword: 'test',
        tagNames: ['tag1', 'tag2'],
        offset: 0,
        limit: 10,
      };

      const result = await service.searchKnowledges(searchParams);

      expect(mockKnowledgeRepo.search).toHaveBeenCalledWith(searchParams);
      expect(result).toEqual(mockResults);
    });

    test('ユーザー情報を含めて検索できる', async () => {
      const mockResults = {
        knowledges: [],
        total: 0,
      };

      mockKnowledgeRepo.search.mockResolvedValue(mockResults);

      const searchParams = {
        keyword: 'test',
        userId: 1,
        offset: 0,
        limit: 10,
      };

      const user = { userId: 1 };

      const result = await service.searchKnowledges(searchParams, user);

      expect(mockKnowledgeRepo.search).toHaveBeenCalledWith({
        ...searchParams,
        userId: 1,
      });
      expect(result).toEqual(mockResults);
    });
  });

  describe('createKnowledge', () => {
    test('ナレッジを作成できる', async () => {
      const input = {
        title: '新規ナレッジ',
        content: '新規内容',
        publicFlag: 1,
        typeId: 1,
        tags: ['tag1', 'tag2'],
        groups: [1, 2],
        editors: [1, 2],
      };

      const user = { userId: 1 };

      const mockCreatedKnowledge = {
        knowledgeId: BigInt(1),
        ...input,
        typeId: BigInt(input.typeId),
        likeCount: BigInt(0),
        commentCount: BigInt(0),
        viewCount: BigInt(0),
        insertUser: 1,
        insertDatetime: new Date(),
        updateUser: 1,
        updateDatetime: new Date(),
        deleteFlag: 0,
        notifyStatus: 0,
        point: 0,
      };

      mockKnowledgeRepo.create.mockResolvedValue(mockCreatedKnowledge);

      const result = await service.createKnowledge(input, user);

      expect(mockKnowledgeRepo.create).toHaveBeenCalledWith({
        title: input.title,
        content: input.content,
        publicFlag: input.publicFlag,
        typeId: BigInt(input.typeId),
        insertUser: user.userId,
        updateUser: user.userId,
      });
      expect(result).toEqual(mockCreatedKnowledge);
    });
  });

  describe('updateKnowledge', () => {
    test('ナレッジを更新できる', async () => {
      const input = {
        knowledgeId: BigInt(1),
        title: '更新ナレッジ',
        content: '更新内容',
        publicFlag: 1,
        typeId: 1,
        tags: ['tag1', 'tag2'],
        groups: [1, 2],
        editors: [1, 2],
      };

      const user = { userId: 1 };

      const mockUpdatedKnowledge = {
        ...input,
        typeId: BigInt(input.typeId),
        likeCount: BigInt(0),
        commentCount: BigInt(0),
        viewCount: BigInt(0),
        insertUser: 1,
        insertDatetime: new Date(),
        updateUser: 1,
        updateDatetime: new Date(),
        deleteFlag: 0,
        notifyStatus: 0,
        point: 0,
      };

      mockKnowledgeRepo.update.mockResolvedValue(mockUpdatedKnowledge);

      const result = await service.updateKnowledge(input, user);

      expect(mockKnowledgeRepo.update).toHaveBeenCalledWith(input.knowledgeId, {
        title: input.title,
        content: input.content,
        publicFlag: input.publicFlag,
        typeId: BigInt(input.typeId),
        updateUser: user.userId,
      });
      expect(result).toEqual(mockUpdatedKnowledge);
    });
  });

  describe('deleteKnowledge', () => {
    test('ナレッジを削除できる', async () => {
      mockKnowledgeRepo.delete.mockResolvedValue(true);

      const result = await service.deleteKnowledge(BigInt(1));

      expect(mockKnowledgeRepo.delete).toHaveBeenCalledWith(BigInt(1));
      expect(result).toBe(true);
    });
  });

  describe('canUserViewKnowledge', () => {
    test('公開ナレッジは誰でも閲覧可能', async () => {
      const knowledge = {
        knowledgeId: BigInt(1),
        publicFlag: 1,
        insertUser: 2,
      } as Knowledge;

      const user = { userId: 1 };

      const result = await service.canUserViewKnowledge(knowledge, user);

      expect(result).toBe(true);
    });

    test('非公開ナレッジは作成者のみ閲覧可能', async () => {
      const knowledge = {
        knowledgeId: BigInt(1),
        publicFlag: 0,
        insertUser: 1,
      } as Knowledge;

      const user = { userId: 1 };

      const result = await service.canUserViewKnowledge(knowledge, user);

      expect(result).toBe(true);
    });

    test('非公開ナレッジは他ユーザーは閲覧不可', async () => {
      const knowledge = {
        knowledgeId: BigInt(1),
        publicFlag: 0,
        insertUser: 2,
      } as Knowledge;

      const user = { userId: 1 };

      const result = await service.canUserViewKnowledge(knowledge, user);

      expect(result).toBe(false);
    });

    test('ログインしていない場合は公開ナレッジのみ閲覧可能', async () => {
      const publicKnowledge = {
        knowledgeId: BigInt(1),
        publicFlag: 1,
        insertUser: 2,
      } as Knowledge;

      const privateKnowledge = {
        knowledgeId: BigInt(2),
        publicFlag: 0,
        insertUser: 2,
      } as Knowledge;

      const publicResult = await service.canUserViewKnowledge(publicKnowledge, null);
      const privateResult = await service.canUserViewKnowledge(privateKnowledge, null);

      expect(publicResult).toBe(true);
      expect(privateResult).toBe(false);
    });
  });

  describe('canUserEditKnowledge', () => {
    test('作成者は編集可能', async () => {
      const knowledge = {
        knowledgeId: BigInt(1),
        insertUser: 1,
      } as Knowledge;

      const user = { userId: 1 };

      const result = await service.canUserEditKnowledge(knowledge, user);

      expect(result).toBe(true);
    });

    test('管理者は編集可能', async () => {
      const knowledge = {
        knowledgeId: BigInt(1),
        insertUser: 2,
      } as Knowledge;

      const user = { userId: 1, isAdmin: true };

      const result = await service.canUserEditKnowledge(knowledge, user);

      expect(result).toBe(true);
    });

    test('他ユーザーは編集不可', async () => {
      const knowledge = {
        knowledgeId: BigInt(1),
        insertUser: 2,
      } as Knowledge;

      const user = { userId: 1 };

      const result = await service.canUserEditKnowledge(knowledge, user);

      expect(result).toBe(false);
    });

    test('ログインしていない場合は編集不可', async () => {
      const knowledge = {
        knowledgeId: BigInt(1),
        insertUser: 1,
      } as Knowledge;

      const result = await service.canUserEditKnowledge(knowledge, null);

      expect(result).toBe(false);
    });
  });

  describe('incrementViewCount', () => {
    test('閲覧数を増やせる', async () => {
      mockKnowledgeRepo.incrementViewCount.mockResolvedValue(true);

      const result = await service.incrementViewCount(BigInt(1));

      expect(mockKnowledgeRepo.incrementViewCount).toHaveBeenCalledWith(BigInt(1));
      expect(result).toBe(true);
    });
  });

  describe('getPopularKnowledges', () => {
    test('人気ナレッジ一覧を取得できる', async () => {
      const mockKnowledges = [
        { knowledgeId: BigInt(1), viewCount: BigInt(100) },
        { knowledgeId: BigInt(2), viewCount: BigInt(50) },
      ];

      mockKnowledgeRepo.findPopular.mockResolvedValue(mockKnowledges as any);

      const result = await service.getPopularKnowledges(10);

      expect(mockKnowledgeRepo.findPopular).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockKnowledges);
    });
  });

  describe('getRecentKnowledges', () => {
    test('最新ナレッジ一覧を取得できる', async () => {
      const mockKnowledges = [
        { knowledgeId: BigInt(1), insertDatetime: new Date() },
        { knowledgeId: BigInt(2), insertDatetime: new Date() },
      ];

      mockKnowledgeRepo.findRecent.mockResolvedValue(mockKnowledges as any);

      const result = await service.getRecentKnowledges(10);

      expect(mockKnowledgeRepo.findRecent).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockKnowledges);
    });
  });

  describe('getUserKnowledges', () => {
    test('ユーザーのナレッジ一覧を取得できる', async () => {
      const mockKnowledges = [
        { knowledgeId: BigInt(1), insertUser: 1 },
        { knowledgeId: BigInt(2), insertUser: 1 },
      ];

      mockKnowledgeRepo.findByUserId.mockResolvedValue(mockKnowledges as any);

      const result = await service.getUserKnowledges(1, 0, 10);

      expect(mockKnowledgeRepo.findByUserId).toHaveBeenCalledWith(1, 0, 10);
      expect(result).toEqual(mockKnowledges);
    });
  });

  describe('getDraftKnowledges', () => {
    test('ユーザーの下書き一覧を取得できる', async () => {
      const mockKnowledges = [
        { knowledgeId: BigInt(1), publicFlag: 0, typeId: BigInt(99) },
        { knowledgeId: BigInt(2), publicFlag: 0, typeId: BigInt(99) },
      ];

      mockKnowledgeRepo.findDraftsByUserId.mockResolvedValue(mockKnowledges as any);

      const result = await service.getDraftKnowledges(1, 0, 10);

      expect(mockKnowledgeRepo.findDraftsByUserId).toHaveBeenCalledWith(1, 0, 10);
      expect(result).toEqual(mockKnowledges);
    });
  });
});