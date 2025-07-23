/**
 * タグサービステスト
 * 
 * @description tagService.tsの包括的なテストカバレッジ
 */
import { TagService } from '../tagService';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedUser } from '@/lib/auth/middleware';

// Prismaのモック
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $queryRawUnsafe: jest.fn(),
    tag: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    knowledgeTag: {
      updateMany: jest.fn(),
      create: jest.fn(),
    },
  })),
}));

describe('TagService', () => {
  let tagService: TagService;
  let mockPrisma: any;
  
  const mockUser: AuthenticatedUser = {
    userId: 1,
    email: 'test@example.com',
    userInfoName: 'Test User',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient();
    tagService = new TagService(mockPrisma);
  });

  describe('getTagsWithCount', () => {
    test('認証ユーザーでタグ一覧取得', async () => {
      const mockTags = [
        { tag_id: BigInt(1), tag_name: 'React', knowledge_count: BigInt(10) },
        { tag_id: BigInt(2), tag_name: 'TypeScript', knowledge_count: BigInt(5) },
      ];

      mockPrisma.$queryRawUnsafe.mockResolvedValue(mockTags);

      const result = await tagService.getTagsWithCount(mockUser, 0, 10);

      expect(result).toEqual([
        { tagId: 1, tagName: 'React', knowledgeCount: 10 },
        { tagId: 2, tagName: 'TypeScript', knowledgeCount: 5 },
      ]);

      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.any(String),
        1,
        0,
        10
      );
    });

    test('未認証ユーザーでタグ一覧取得', async () => {
      const mockTags = [
        { tag_id: BigInt(3), tag_name: 'JavaScript', knowledge_count: BigInt(8) },
      ];

      mockPrisma.$queryRawUnsafe.mockResolvedValue(mockTags);

      const result = await tagService.getTagsWithCount(null, 0, 20);

      expect(result).toEqual([
        { tagId: 3, tagName: 'JavaScript', knowledgeCount: 8 },
      ]);

      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.any(String),
        -1, // 未認証ユーザーのID
        0,
        20
      );
    });

    test('空の結果', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([]);

      const result = await tagService.getTagsWithCount(mockUser, 0, 10);

      expect(result).toEqual([]);
    });

    test('エラー処理', async () => {
      mockPrisma.$queryRawUnsafe.mockRejectedValue(new Error('DB Error'));

      const result = await tagService.getTagsWithCount(mockUser, 0, 10);

      expect(result).toEqual([]);
    });
  });

  describe('getTagsWithKeyword', () => {
    test('キーワード検索成功', async () => {
      const mockTags = [
        { tag_id: BigInt(1), tag_name: 'React', knowledge_count: BigInt(10) },
        { tag_id: BigInt(2), tag_name: 'React Native', knowledge_count: BigInt(3) },
      ];

      mockPrisma.$queryRawUnsafe.mockResolvedValue(mockTags);

      const result = await tagService.getTagsWithKeyword('React', 0, 10);

      expect(result).toEqual([
        { tagId: 1, tagName: 'React', knowledgeCount: 10 },
        { tagId: 2, tagName: 'React Native', knowledgeCount: 3 },
      ]);

      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.any(String),
        '%React%',
        0,
        10
      );
    });

    test('特殊文字を含むキーワードのサニタイズ', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([]);

      await tagService.getTagsWithKeyword('React%_<script>', 0, 10);

      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.any(String),
        '%React\\%\\_script%',
        0,
        10
      );
    });

    test('空のキーワード', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([]);

      const result = await tagService.getTagsWithKeyword('', 0, 10);

      expect(result).toEqual([]);
      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.any(String),
        '%%',
        0,
        10
      );
    });

    test('長いキーワードの切り詰め', async () => {
      const longKeyword = 'a'.repeat(150);
      mockPrisma.$queryRawUnsafe.mockResolvedValue([]);

      await tagService.getTagsWithKeyword(longKeyword, 0, 10);

      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.any(String),
        '%' + 'a'.repeat(100) + '%',
        0,
        10
      );
    });

    test('エラー処理', async () => {
      mockPrisma.$queryRawUnsafe.mockRejectedValue(new Error('DB Error'));

      const result = await tagService.getTagsWithKeyword('React', 0, 10);

      expect(result).toEqual([]);
    });
  });

  describe('createTag', () => {
    test('新規タグ作成成功', async () => {
      mockPrisma.tag.findFirst.mockResolvedValue(null);
      mockPrisma.tag.create.mockResolvedValue({
        tagId: 100,
        tagName: 'NewTag',
        insertUser: 1,
        insertDatetime: new Date(),
        updateUser: 1,
        updateDatetime: new Date(),
        deleteFlag: 0,
      });

      const result = await tagService.createTag('NewTag', 1);

      expect(result).toEqual({
        tagId: 100,
        tagName: 'NewTag',
        knowledgeCount: 0,
      });

      expect(mockPrisma.tag.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tagName: 'NewTag',
          insertUser: 1,
          deleteFlag: 0,
        }),
      });
    });

    test('既存タグが存在する場合', async () => {
      const existingTag = {
        tagId: 50,
        tagName: 'ExistingTag',
        deleteFlag: 0,
      };

      mockPrisma.tag.findFirst.mockResolvedValue(existingTag);

      const result = await tagService.createTag('ExistingTag', 1);

      expect(result).toEqual({
        tagId: 50,
        tagName: 'ExistingTag',
        knowledgeCount: 0,
      });

      expect(mockPrisma.tag.create).not.toHaveBeenCalled();
    });

    test('エラー処理', async () => {
      mockPrisma.tag.findFirst.mockRejectedValue(new Error('DB Error'));

      const result = await tagService.createTag('ErrorTag', 1);

      expect(result).toBeNull();
    });
  });

  describe('deleteTag', () => {
    test('タグ削除成功', async () => {
      const mockTag = {
        tagId: 10,
        tagName: 'DeleteMe',
        deleteFlag: 0,
      };

      mockPrisma.tag.findUnique.mockResolvedValue(mockTag);
      mockPrisma.tag.update.mockResolvedValue({
        ...mockTag,
        deleteFlag: 1,
      });

      const result = await tagService.deleteTag(10, 1);

      expect(result).toBe(true);
      expect(mockPrisma.tag.update).toHaveBeenCalledWith({
        where: { tagId: 10 },
        data: {
          deleteFlag: 1,
          updateUser: 1,
          updateDatetime: expect.any(Date),
        },
      });
    });

    test('タグが存在しない場合', async () => {
      mockPrisma.tag.findUnique.mockResolvedValue(null);

      const result = await tagService.deleteTag(999, 1);

      expect(result).toBe(false);
      expect(mockPrisma.tag.update).not.toHaveBeenCalled();
    });

    test('既に削除済みの場合', async () => {
      const deletedTag = {
        tagId: 10,
        tagName: 'Deleted',
        deleteFlag: 1,
      };

      mockPrisma.tag.findUnique.mockResolvedValue(deletedTag);

      const result = await tagService.deleteTag(10, 1);

      expect(result).toBe(false);
      expect(mockPrisma.tag.update).not.toHaveBeenCalled();
    });

    test('エラー処理', async () => {
      mockPrisma.tag.findUnique.mockRejectedValue(new Error('DB Error'));

      const result = await tagService.deleteTag(10, 1);

      expect(result).toBe(false);
    });
  });

  describe('attachTagsToKnowledge', () => {
    test('タグ紐づけ成功', async () => {
      mockPrisma.knowledgeTag.updateMany.mockResolvedValue({ count: 2 });
      mockPrisma.knowledgeTag.create.mockResolvedValue({});

      const result = await tagService.attachTagsToKnowledge(1, [10, 20, 30], 1);

      expect(result).toBe(true);

      // 既存の紐づけを削除
      expect(mockPrisma.knowledgeTag.updateMany).toHaveBeenCalledWith({
        where: {
          knowledgeId: BigInt(1),
          deleteFlag: 0,
        },
        data: {
          deleteFlag: 1,
          updateUser: 1,
          updateDatetime: expect.any(Date),
        },
      });

      // 新しい紐づけを作成（3回呼ばれる）
      expect(mockPrisma.knowledgeTag.create).toHaveBeenCalledTimes(3);
      expect(mockPrisma.knowledgeTag.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          knowledgeId: BigInt(1),
          tagId: 10,
          insertUser: 1,
          deleteFlag: 0,
        }),
      });
    });

    test('空のタグID配列', async () => {
      mockPrisma.knowledgeTag.updateMany.mockResolvedValue({ count: 1 });

      const result = await tagService.attachTagsToKnowledge(1, [], 1);

      expect(result).toBe(true);
      expect(mockPrisma.knowledgeTag.updateMany).toHaveBeenCalled();
      expect(mockPrisma.knowledgeTag.create).not.toHaveBeenCalled();
    });

    test('エラー処理', async () => {
      mockPrisma.knowledgeTag.updateMany.mockRejectedValue(new Error('DB Error'));

      const result = await tagService.attachTagsToKnowledge(1, [10], 1);

      expect(result).toBe(false);
    });
  });

  describe('sanitizeKeyword', () => {
    test('通常のキーワード', () => {
      const result = (tagService as any).sanitizeKeyword('React');
      expect(result).toBe('React');
    });

    test('LIKE演算子のエスケープ', () => {
      const result = (tagService as any).sanitizeKeyword('React%Test_');
      expect(result).toBe('React\\%Test\\_');
    });

    test('HTMLタグの除去', () => {
      const result = (tagService as any).sanitizeKeyword('<script>alert()</script>');
      expect(result).toBe('scriptalert()/script');
    });

    test('SQLインジェクション対策', () => {
      const result = (tagService as any).sanitizeKeyword('React\'; DROP TABLE--;');
      expect(result).toBe('React DROP TABLE--');
    });

    test('空文字列', () => {
      const result = (tagService as any).sanitizeKeyword('');
      expect(result).toBe('');
    });

    test('null/undefined', () => {
      const result1 = (tagService as any).sanitizeKeyword(null);
      expect(result1).toBe('');

      const result2 = (tagService as any).sanitizeKeyword(undefined);
      expect(result2).toBe('');
    });

    test('長い文字列の切り詰め', () => {
      const longString = 'a'.repeat(150);
      const result = (tagService as any).sanitizeKeyword(longString);
      expect(result).toBe('a'.repeat(100));
    });
  });

  describe('validateOffset', () => {
    test('有効な数値', () => {
      expect(tagService.validateOffset(10)).toBe(10);
      expect(tagService.validateOffset('20')).toBe(20);
      expect(tagService.validateOffset(0)).toBe(0);
    });

    test('負の数値', () => {
      expect(tagService.validateOffset(-10)).toBe(0);
      expect(tagService.validateOffset('-5')).toBe(0);
    });

    test('上限値超過', () => {
      expect(tagService.validateOffset(15000)).toBe(10000);
      expect(tagService.validateOffset('20000')).toBe(10000);
    });

    test('無効な値', () => {
      expect(tagService.validateOffset('abc')).toBe(0);
      expect(tagService.validateOffset(null)).toBe(0);
      expect(tagService.validateOffset(undefined)).toBe(0);
      expect(tagService.validateOffset(NaN)).toBe(0);
    });
  });

  describe('getTagsByKnowledgeId', () => {
    test('ナレッジIDでタグ取得成功', async () => {
      const mockResult = [
        { 
          knowledgeId: BigInt(1), 
          tagId: 10,
          tag: {
            tagId: 10,
            tagName: 'JavaScript',
            insertUser: 1,
            insertDatetime: new Date(),
            updateUser: 1,
            updateDatetime: new Date(),
            deleteFlag: 0
          }
        },
        { 
          knowledgeId: BigInt(1), 
          tagId: 20,
          tag: {
            tagId: 20,
            tagName: 'React',
            insertUser: 1,
            insertDatetime: new Date(),
            updateUser: 1,
            updateDatetime: new Date(),
            deleteFlag: 0
          }
        }
      ];

      mockPrisma.knowledgeTag = {
        findMany: jest.fn().mockResolvedValue(mockResult)
      };

      const result = await tagService.getTagsByKnowledgeId(BigInt(1));

      expect(result).toEqual([
        { tagId: 10, tagName: 'JavaScript', knowledgeCount: 0 },
        { tagId: 20, tagName: 'React', knowledgeCount: 0 }
      ]);

      expect(mockPrisma.knowledgeTag.findMany).toHaveBeenCalledWith({
        where: {
          knowledgeId: BigInt(1),
          deleteFlag: 0
        },
        include: {
          tag: {
            where: {
              deleteFlag: 0
            }
          }
        }
      });
    });

    test('tagがnullの場合除外される', async () => {
      const mockResult = [
        { 
          knowledgeId: BigInt(1), 
          tagId: 10,
          tag: null
        },
        { 
          knowledgeId: BigInt(1), 
          tagId: 20,
          tag: {
            tagId: 20,
            tagName: 'React',
            insertUser: 1,
            insertDatetime: new Date(),
            updateUser: 1,
            updateDatetime: new Date(),
            deleteFlag: 0
          }
        }
      ];

      mockPrisma.knowledgeTag = {
        findMany: jest.fn().mockResolvedValue(mockResult)
      };

      const result = await tagService.getTagsByKnowledgeId(BigInt(1));

      expect(result).toEqual([
        { tagId: 20, tagName: 'React', knowledgeCount: 0 }
      ]);
    });

    test('エラー時は空配列を返す', async () => {
      mockPrisma.knowledgeTag = {
        findMany: jest.fn().mockRejectedValue(new Error('DB Error'))
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await tagService.getTagsByKnowledgeId(BigInt(1));

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('TagService.getTagsByKnowledgeId error:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('updateKnowledgeTags', () => {
    test('ナレッジのタグ更新成功', async () => {
      mockPrisma.knowledgeTag = {
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
        create: jest.fn().mockResolvedValue({})
      };

      mockPrisma.tag = {
        findFirst: jest.fn()
          .mockResolvedValueOnce({ // 既存タグ
            tagId: 10,
            tagName: 'JavaScript',
            deleteFlag: 0
          })
          .mockResolvedValueOnce(null) // 新規タグ
          .mockResolvedValueOnce({ // もう一つの既存タグ
            tagId: 30,
            tagName: 'Node.js',
            deleteFlag: 0
          }),
        create: jest.fn().mockResolvedValue({
          tagId: 20,
          tagName: 'TypeScript',
          insertUser: 'test@example.com',
          insertDatetime: new Date(),
          updateUser: 'test@example.com',
          updateDatetime: new Date(),
          deleteFlag: 0
        })
      };

      const result = await tagService.updateKnowledgeTags(
        BigInt(1),
        ['JavaScript', 'TypeScript', 'Node.js'],
        mockUser
      );

      expect(result).toBe(true);

      // 既存タグの削除
      expect(mockPrisma.knowledgeTag.updateMany).toHaveBeenCalledWith({
        where: {
          knowledgeId: BigInt(1),
          deleteFlag: 0
        },
        data: {
          deleteFlag: 1,
          updateUser: 'test@example.com',
          updateDatetime: expect.any(Date)
        }
      });

      // 新規タグの作成
      expect(mockPrisma.tag.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.tag.create).toHaveBeenCalledWith({
        data: {
          tagName: 'TypeScript',
          insertUser: 'test@example.com',
          insertDatetime: expect.any(Date),
          updateUser: 'test@example.com',
          updateDatetime: expect.any(Date),
          deleteFlag: 0
        }
      });

      // タグの紐付け
      expect(mockPrisma.knowledgeTag.create).toHaveBeenCalledTimes(3);
    });

    test('空のタグ名は無視される', async () => {
      mockPrisma.knowledgeTag = {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        create: jest.fn().mockResolvedValue({})
      };

      mockPrisma.tag = {
        findFirst: jest.fn().mockResolvedValue({
          tagId: 10,
          tagName: 'ValidTag',
          deleteFlag: 0
        }),
        create: jest.fn()
      };

      const result = await tagService.updateKnowledgeTags(
        BigInt(1),
        ['', '  ', 'ValidTag'],
        mockUser
      );

      expect(result).toBe(true);
      expect(mockPrisma.tag.findFirst).toHaveBeenCalledTimes(1); // ValidTagのみ
      expect(mockPrisma.knowledgeTag.create).toHaveBeenCalledTimes(1);
    });

    test('エラー時はfalseを返す', async () => {
      mockPrisma.knowledgeTag = {
        updateMany: jest.fn().mockRejectedValue(new Error('DB Error'))
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await tagService.updateKnowledgeTags(
        BigInt(1),
        ['tag1'],
        mockUser
      );

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('TagService.updateKnowledgeTags error:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });
});