/**
 * KnowledgeService のテスト
 * 
 * @description 旧JavaシステムのKnowledgeLogicと互換性のあるサービスのテスト
 */
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { KnowledgeService } from '../knowledgeService';
import { prisma } from '@/lib/db/prisma';

describe('KnowledgeService', () => {
  let knowledgeService: KnowledgeService;

  beforeEach(() => {
    knowledgeService = new KnowledgeService();
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

  describe('getKnowledgeById', () => {
    test('公開ナレッジを取得できる', async () => {
      // テストデータを作成
      const testKnowledge = await prisma.knowledge.create({
        data: {
          title: 'テストナレッジサービス1',
          content: 'テスト内容',
          publicFlag: 1, // 公開
          typeId: 1,
          insertUser: 1,
          insertDatetime: new Date(),
        }
      });

      const result = await knowledgeService.getKnowledgeById(testKnowledge.knowledgeId);

      expect(result).not.toBeNull();
      expect(result?.knowledgeId).toBe(testKnowledge.knowledgeId);
      expect(result?.title).toBe('テストナレッジサービス1');
    });

    test('存在しないナレッジでnullを返す', async () => {
      const result = await knowledgeService.getKnowledgeById(BigInt(999999));
      expect(result).toBeNull();
    });

    test('削除されたナレッジでnullを返す', async () => {
      // 削除フラグが立っているテストデータを作成
      const deletedKnowledge = await prisma.knowledge.create({
        data: {
          title: 'テスト削除ナレッジサービス',
          content: 'テスト内容',
          publicFlag: 1,
          typeId: 1,
          insertUser: 1,
          insertDatetime: new Date(),
          deleteFlag: 1, // 削除フラグ
        }
      });

      const result = await knowledgeService.getKnowledgeById(deletedKnowledge.knowledgeId);
      expect(result).toBeNull();
    });
  });

  describe('canAccessKnowledge', () => {
    test('公開ナレッジはアクセス可能', async () => {
      const testKnowledge = await prisma.knowledge.create({
        data: {
          title: 'テスト公開ナレッジアクセス',
          content: 'テスト内容',
          publicFlag: 1, // 公開
          typeId: 1,
          insertUser: 1,
          insertDatetime: new Date(),
        }
      });

      const canAccess = await knowledgeService.canAccessKnowledge(testKnowledge.knowledgeId);
      expect(canAccess).toBe(true);
    });

    test('非公開ナレッジはアクセス不可（認証なし）', async () => {
      const testKnowledge = await prisma.knowledge.create({
        data: {
          title: 'テスト非公開ナレッジアクセス',
          content: 'テスト内容',
          publicFlag: 2, // 非公開
          typeId: 1,
          insertUser: 1,
          insertDatetime: new Date(),
        }
      });

      const canAccess = await knowledgeService.canAccessKnowledge(testKnowledge.knowledgeId);
      expect(canAccess).toBe(false);
    });

    test('存在しないナレッジはアクセス不可', async () => {
      const canAccess = await knowledgeService.canAccessKnowledge(BigInt(999999));
      expect(canAccess).toBe(false);
    });
  });

  describe('incrementViewCount', () => {
    test('閲覧数が正しく増加する', async () => {
      const testKnowledge = await prisma.knowledge.create({
        data: {
          title: 'テスト閲覧数増加',
          content: 'テスト内容',
          publicFlag: 1,
          typeId: 1,
          insertUser: 1,
          insertDatetime: new Date(),
          viewCount: BigInt(10), // 初期値
        }
      });

      await knowledgeService.incrementViewCount(testKnowledge.knowledgeId);

      // 増加後の値を確認
      const updated = await prisma.knowledge.findUnique({
        where: { knowledgeId: testKnowledge.knowledgeId }
      });

      expect(updated?.viewCount).toBe(BigInt(11));
    });

    test('存在しないナレッジでエラーにならない', async () => {
      // エラーが発生しないことを確認
      await expect(knowledgeService.incrementViewCount(BigInt(999999))).resolves.not.toThrow();
    });
  });
});