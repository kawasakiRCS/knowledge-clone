/**
 * KnowledgeRepository のテスト
 * 
 * @description 旧Javaシステムと互換性のあるナレッジリポジトリのテスト（モック使用）
 */
import { describe, test, expect, beforeEach } from '@jest/globals';
import { KnowledgeRepository } from '../knowledgeRepository';

// Prisma クライアントのモック
const mockFindUnique = jest.fn();
const mockFindMany = jest.fn();
const mockCount = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    knowledge: {
      findUnique: mockFindUnique,
      findMany: mockFindMany,
      count: mockCount,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    },
  },
}));

describe('KnowledgeRepository', () => {
  let knowledgeRepo: KnowledgeRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    knowledgeRepo = new KnowledgeRepository();
  });

  describe('findById', () => {
    test('存在するナレッジIDでナレッジを取得できる', async () => {
      const mockKnowledge = {
        knowledgeId: BigInt(1),
        title: 'テストナレッジ1',
        content: 'テスト内容',
        publicFlag: 1,
        typeId: 1,
        insertUser: 1,
        insertDatetime: new Date(),
        deleteFlag: 0,
      };

      mockFindUnique.mockResolvedValue(mockKnowledge);

      const result = await knowledgeRepo.findById(BigInt(1));

      expect(result).not.toBeNull();
      expect(result?.knowledgeId).toBe(BigInt(1));
      expect(result?.title).toBe('テストナレッジ1');
      expect(result?.content).toBe('テスト内容');
      expect(result?.publicFlag).toBe(1);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { knowledgeId: BigInt(1) },
      });
    });

    test('存在しないナレッジIDでnullを返す', async () => {
      const result = await knowledgeRepo.findById(BigInt(999999));
      expect(result).toBeNull();
    });

    test('削除フラグが立っているナレッジは取得できない', async () => {
      // 削除フラグが立っているテストデータを作成
      const deletedKnowledge = await prisma.knowledge.create({
        data: {
          title: 'テスト削除ナレッジ',
          content: 'テスト内容',
          publicFlag: 1,
          typeId: 1,
          insertUser: 1,
          insertDatetime: new Date(),
          deleteFlag: 1, // 削除フラグ
        }
      });

      const result = await knowledgeRepo.findById(deletedKnowledge.knowledgeId);
      expect(result).toBeNull();
    });
  });

  describe('findByIdWithUserInfo', () => {
    test('ユーザー情報も含めてナレッジを取得できる', async () => {
      const mockKnowledgeWithUser = {
        knowledgeId: BigInt(1),
        title: 'テストナレッジ',
        content: 'テスト内容',
        publicFlag: 1,
        typeId: 1,
        insertUser: 1,
        insertDatetime: new Date(),
        deleteFlag: 0,
        author: {
          userId: 1,
          userName: 'テストユーザー',
          userKey: 'test_user_key',
        },
      };

      mockFindUnique.mockResolvedValue(mockKnowledgeWithUser);

      const result = await knowledgeRepo.findByIdWithUserInfo(BigInt(1));

      expect(result).not.toBeNull();
      expect(result?.knowledgeId).toBe(BigInt(1));
      expect(result?.author?.userName).toBe('テストユーザー');
    });
  });

  describe('findMany', () => {
    test('ナレッジ一覧を取得できる', async () => {
      const mockKnowledges = [
        {
          knowledgeId: BigInt(1),
          title: 'テストナレッジ1',
          content: 'テスト内容1',
          publicFlag: 1,
          deleteFlag: 0,
        },
        {
          knowledgeId: BigInt(2),
          title: 'テストナレッジ2',
          content: 'テスト内容2',
          publicFlag: 1,
          deleteFlag: 0,
        },
      ];

      mockFindMany.mockResolvedValue(mockKnowledges);

      const result = await knowledgeRepo.findMany({ publicFlag: 1 });
      
      expect(result).toHaveLength(2);
      expect(result[0]?.knowledgeId).toBe(BigInt(1));
      expect(result[1]?.knowledgeId).toBe(BigInt(2));
    });

    test('空の結果を適切に処理する', async () => {
      mockFindMany.mockResolvedValue([]);

      const result = await knowledgeRepo.findMany({ publicFlag: 1 });
      
      expect(result).toHaveLength(0);
    });

    test('エラー時に空配列を返す', async () => {
      mockFindMany.mockRejectedValue(new Error('Database error'));

      const result = await knowledgeRepo.findMany({ publicFlag: 1 });
      
      expect(result).toHaveLength(0);
    });
  });

  describe('count', () => {
    test('ナレッジ件数を取得できる', async () => {
      mockCount.mockResolvedValue(5);

      const result = await knowledgeRepo.count({ publicFlag: 1 });
      
      expect(result).toBe(5);
    });

    test('エラー時に0を返す', async () => {
      mockCount.mockRejectedValue(new Error('Database error'));

      const result = await knowledgeRepo.count({ publicFlag: 1 });
      
      expect(result).toBe(0);
    });
  });
});