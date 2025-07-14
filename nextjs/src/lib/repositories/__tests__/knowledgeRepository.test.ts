/**
 * KnowledgeRepository のテスト
 * 
 * @description 旧Javaシステムと互換性のあるナレッジリポジトリのテスト
 */
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { KnowledgeRepository } from '../knowledgeRepository';
import { prisma } from '@/lib/db';

describe('KnowledgeRepository', () => {
  let knowledgeRepo: KnowledgeRepository;

  beforeEach(() => {
    knowledgeRepo = new KnowledgeRepository();
  });

  afterEach(async () => {
    // テストデータのクリーンアップ
    await prisma.knowledge.deleteMany({
      where: { 
        title: { 
          startsWith: 'テスト' 
        } 
      }
    });
  });

  describe('findById', () => {
    test('存在するナレッジIDでナレッジを取得できる', async () => {
      // テストデータを作成
      const testKnowledge = await prisma.knowledge.create({
        data: {
          title: 'テストナレッジ1',
          content: 'テスト内容',
          publicFlag: 1,
          typeId: 1,
          insertUser: 1,
          insertDatetime: new Date(),
        }
      });

      const result = await knowledgeRepo.findById(testKnowledge.knowledgeId);

      expect(result).not.toBeNull();
      expect(result?.knowledgeId).toBe(testKnowledge.knowledgeId);
      expect(result?.title).toBe('テストナレッジ1');
      expect(result?.content).toBe('テスト内容');
      expect(result?.publicFlag).toBe(1);
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
      // まずユーザーを作成
      const testUser = await prisma.user.create({
        data: {
          userKey: 'test_user_key',
          userName: 'テストユーザー',
          password: 'test_password',
          insertDatetime: new Date(),
        }
      });

      // ナレッジを作成
      const testKnowledge = await prisma.knowledge.create({
        data: {
          title: 'テストナレッジ2',
          content: 'テスト内容',
          publicFlag: 1,
          typeId: 1,
          insertUser: testUser.userId,
          insertDatetime: new Date(),
        }
      });

      const result = await knowledgeRepo.findByIdWithUserInfo(testKnowledge.knowledgeId);

      expect(result).not.toBeNull();
      expect(result?.knowledgeId).toBe(testKnowledge.knowledgeId);
      expect(result?.author?.userName).toBe('テストユーザー');

      // テストユーザーもクリーンアップ
      await prisma.user.delete({
        where: { userId: testUser.userId }
      });
    });
  });

  describe('searchPublicKnowledges', () => {
    test('公開ナレッジの検索ができる', async () => {
      // 公開ナレッジを作成
      await prisma.knowledge.create({
        data: {
          title: 'テスト公開ナレッジ',
          content: 'テスト内容',
          publicFlag: 1, // 公開
          typeId: 1,
          insertUser: 1,
          insertDatetime: new Date(),
        }
      });

      // 非公開ナレッジを作成
      await prisma.knowledge.create({
        data: {
          title: 'テスト非公開ナレッジ',
          content: 'テスト内容',
          publicFlag: 2, // 非公開
          typeId: 1,
          insertUser: 1,
          insertDatetime: new Date(),
        }
      });

      const result = await knowledgeRepo.searchPublicKnowledges({
        keyword: 'テスト',
        limit: 10,
        offset: 0
      });

      expect(result.length).toBeGreaterThan(0);
      // 公開ナレッジのみが返されることを確認
      result.forEach(knowledge => {
        expect(knowledge.publicFlag).toBe(1);
      });
    });
  });
});