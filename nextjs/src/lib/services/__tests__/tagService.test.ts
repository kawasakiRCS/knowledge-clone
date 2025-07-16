/**
 * TagService テスト
 * 
 * @description タグサービスのテストケース
 */
import { describe, test, expect, beforeEach } from '@jest/globals';
import { TagService } from '../tagService';

// Prisma クライアントのモック
const mockQueryRawUnsafe = jest.fn();
const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $queryRawUnsafe: mockQueryRawUnsafe,
    tags: {
      findMany: mockFindMany,
      findUnique: mockFindUnique,
    },
  })),
}));

describe('TagService', () => {
  let tagService: TagService;

  beforeEach(() => {
    jest.clearAllMocks();
    tagService = new TagService();
  });

  describe('getTagsWithCount', () => {
    test('認証済みユーザーでタグ一覧を取得できる', async () => {
      const mockUser = { userId: 1, userName: 'test' };
      const mockResult = [
        {
          tag_id: 1,
          tag_name: 'JavaScript',
          knowledge_count: 5,
        },
        {
          tag_id: 2,
          tag_name: 'React',
          knowledge_count: 3,
        },
      ];

      mockQueryRawUnsafe.mockResolvedValue(mockResult);

      const result = await tagService.getTagsWithCount(mockUser, 0, 10);

      expect(result).toEqual([
        {
          tagId: 1,
          tagName: 'JavaScript',
          knowledgeCount: 5,
        },
        {
          tagId: 2,
          tagName: 'React',
          knowledgeCount: 3,
        },
      ]);
      expect(mockQueryRawUnsafe).toHaveBeenCalledWith(
        expect.any(String),
        1,
        0,
        10
      );
    });

    test('未認証ユーザーでもタグ一覧を取得できる', async () => {
      const mockResult = [
        {
          tag_id: 1,
          tag_name: 'JavaScript',
          knowledge_count: 3,
        },
      ];

      mockQueryRawUnsafe.mockResolvedValue(mockResult);

      const result = await tagService.getTagsWithCount(null, 0, 10);

      expect(result).toEqual([
        {
          tagId: 1,
          tagName: 'JavaScript',
          knowledgeCount: 3,
        },
      ]);
      expect(mockQueryRawUnsafe).toHaveBeenCalledWith(
        expect.any(String),
        -1,
        0,
        10
      );
    });

    test('エラー時に空配列を返す', async () => {
      mockQueryRawUnsafe.mockRejectedValue(new Error('Database error'));

      const result = await tagService.getTagsWithCount(null, 0, 10);

      expect(result).toEqual([]);
    });

    test('空の結果を適切に処理する', async () => {
      mockQueryRawUnsafe.mockResolvedValue([]);

      const result = await tagService.getTagsWithCount(null, 0, 10);

      expect(result).toEqual([]);
    });

    test('オフセットとリミットが正しく適用される', async () => {
      const mockResult = [
        {
          tag_id: 3,
          tag_name: 'Node.js',
          knowledge_count: 2,
        },
      ];

      mockQueryRawUnsafe.mockResolvedValue(mockResult);

      const result = await tagService.getTagsWithCount(null, 10, 5);

      expect(result).toEqual([
        {
          tagId: 3,
          tagName: 'Node.js',
          knowledgeCount: 2,
        },
      ]);
      expect(mockQueryRawUnsafe).toHaveBeenCalledWith(
        expect.any(String),
        -1,
        10,
        5
      );
    });

    test('数値変換が正しく行われる', async () => {
      const mockResult = [
        {
          tag_id: '1',
          tag_name: 'TypeScript',
          knowledge_count: '10',
        },
      ];

      mockQueryRawUnsafe.mockResolvedValue(mockResult);

      const result = await tagService.getTagsWithCount(null, 0, 10);

      expect(result).toEqual([
        {
          tagId: 1,
          tagName: 'TypeScript',
          knowledgeCount: 10,
        },
      ]);
    });
  });

  describe('getTagsWithKeyword', () => {
    test('キーワード検索でタグを取得できる', async () => {
      const mockResult = [
        {
          tag_id: 1,
          tag_name: 'JavaScript',
          knowledge_count: 5,
        },
      ];

      mockQueryRawUnsafe.mockResolvedValue(mockResult);

      const result = await tagService.getTagsWithKeyword('java', 0, 10);

      expect(result).toEqual([
        {
          tagId: 1,
          tagName: 'JavaScript',
          knowledgeCount: 5,
        },
      ]);
      expect(mockQueryRawUnsafe).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('java'),
        0,
        10
      );
    });

    test('空のキーワードでも検索できる', async () => {
      const mockResult = [];

      mockQueryRawUnsafe.mockResolvedValue(mockResult);

      const result = await tagService.getTagsWithKeyword('', 0, 10);

      expect(result).toEqual([]);
      expect(mockQueryRawUnsafe).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        0,
        10
      );
    });

    test('エラー時に空配列を返す', async () => {
      mockQueryRawUnsafe.mockRejectedValue(new Error('Database error'));

      const result = await tagService.getTagsWithKeyword('test', 0, 10);

      expect(result).toEqual([]);
    });

    test('特殊文字がサニタイズされる', async () => {
      const mockResult = [];

      mockQueryRawUnsafe.mockResolvedValue(mockResult);

      const result = await tagService.getTagsWithKeyword('test%_', 0, 10);

      expect(result).toEqual([]);
      expect(mockQueryRawUnsafe).toHaveBeenCalledWith(
        expect.any(String),
        expect.not.stringContaining('%'),
        0,
        10
      );
    });
  });

  describe('getTagById', () => {
    test('存在するタグIDでタグを取得できる', async () => {
      const mockTag = {
        tagId: 1,
        tagName: 'JavaScript',
        deleteFlag: false,
      };

      mockFindUnique.mockResolvedValue(mockTag);

      const result = await tagService.getTagById(1);

      expect(result).toEqual({
        tagId: 1,
        tagName: 'JavaScript',
        knowledgeCount: 0,
      });
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { tagId: 1 },
      });
    });

    test('存在しないタグIDでnullを返す', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await tagService.getTagById(999);

      expect(result).toBeNull();
    });

    test('削除フラグが立っているタグでnullを返す', async () => {
      const mockTag = {
        tagId: 1,
        tagName: 'JavaScript',
        deleteFlag: true,
      };

      mockFindUnique.mockResolvedValue(mockTag);

      const result = await tagService.getTagById(1);

      expect(result).toBeNull();
    });

    test('エラー時にnullを返す', async () => {
      mockFindUnique.mockRejectedValue(new Error('Database error'));

      const result = await tagService.getTagById(1);

      expect(result).toBeNull();
    });
  });

  describe('getPopularTags', () => {
    test('人気タグ一覧を取得できる', async () => {
      const mockResult = [
        {
          tag_id: 1,
          tag_name: 'JavaScript',
          knowledge_count: 10,
        },
        {
          tag_id: 2,
          tag_name: 'React',
          knowledge_count: 8,
        },
      ];

      mockQueryRawUnsafe.mockResolvedValue(mockResult);

      const result = await tagService.getPopularTags(5);

      expect(result).toEqual([
        {
          tagId: 1,
          tagName: 'JavaScript',
          knowledgeCount: 10,
        },
        {
          tagId: 2,
          tagName: 'React',
          knowledgeCount: 8,
        },
      ]);
      expect(mockQueryRawUnsafe).toHaveBeenCalledWith(
        expect.any(String),
        5
      );
    });

    test('エラー時に空配列を返す', async () => {
      mockQueryRawUnsafe.mockRejectedValue(new Error('Database error'));

      const result = await tagService.getPopularTags(5);

      expect(result).toEqual([]);
    });

    test('デフォルト件数制限が適用される', async () => {
      const mockResult = [];

      mockQueryRawUnsafe.mockResolvedValue(mockResult);

      const result = await tagService.getPopularTags();

      expect(result).toEqual([]);
      expect(mockQueryRawUnsafe).toHaveBeenCalledWith(
        expect.any(String),
        10
      );
    });
  });
});