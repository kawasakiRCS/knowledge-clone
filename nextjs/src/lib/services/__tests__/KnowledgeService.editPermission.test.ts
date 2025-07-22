/**
 * KnowledgeService編集権限チェックテスト
 * 
 * @description 旧システムのisEditorメソッドと同等の権限チェック機能のテスト
 */
import { KnowledgeService } from '@/lib/services/knowledgeService';
import { prisma } from '@/lib/db';

// モックの設定
jest.mock('@/lib/db', () => ({
  prisma: {
    $queryRaw: jest.fn()
  }
}));

describe('KnowledgeService.isEditor', () => {
  let knowledgeService: KnowledgeService;
  const mockQueryRaw = prisma.$queryRaw as jest.Mock;

  beforeEach(() => {
    knowledgeService = new KnowledgeService();
    jest.clearAllMocks();
  });

  describe('編集権限チェック', () => {
    const baseKnowledge = {
      knowledgeId: 1,
      insertUser: 100,
      publicFlag: 1,
      title: 'テスト記事',
      content: 'テスト内容'
    };

    test('作成者は編集権限を持つ', async () => {
      const loginUserId = 100; // 作成者と同じID
      const result = await knowledgeService.isEditor(loginUserId, baseKnowledge, []);
      
      expect(result).toBe(true);
    });

    test('共同編集者は編集権限を持つ', async () => {
      const loginUserId = 200; // 作成者ではない
      const editors = [
        { userId: 200, userName: 'Editor1' },
        { userId: 300, userName: 'Editor2' }
      ];
      
      const result = await knowledgeService.isEditor(loginUserId, baseKnowledge, editors);
      
      expect(result).toBe(true);
    });

    test('作成者でも共同編集者でもない場合は編集権限なし', async () => {
      const loginUserId = 999; // 無関係のユーザー
      const editors = [
        { userId: 200, userName: 'Editor1' },
        { userId: 300, userName: 'Editor2' }
      ];
      
      const result = await knowledgeService.isEditor(loginUserId, baseKnowledge, editors);
      
      expect(result).toBe(false);
    });

    test('未ログインユーザーは編集権限なし', async () => {
      const loginUserId = null;
      const result = await knowledgeService.isEditor(loginUserId, baseKnowledge, []);
      
      expect(result).toBe(false);
    });

    test('公開区分が保護されている場合の権限チェック', async () => {
      const protectedKnowledge = {
        ...baseKnowledge,
        publicFlag: 2 // 保護されたナレッジ
      };
      
      // 作成者は編集可能
      let result = await knowledgeService.isEditor(100, protectedKnowledge, []);
      expect(result).toBe(true);
      
      // 共同編集者も編集可能
      result = await knowledgeService.isEditor(200, protectedKnowledge, [{ userId: 200, userName: 'Editor' }]);
      expect(result).toBe(true);
      
      // その他のユーザーは編集不可
      result = await knowledgeService.isEditor(999, protectedKnowledge, []);
      expect(result).toBe(false);
    });

    test('非公開ナレッジの権限チェック', async () => {
      const privateKnowledge = {
        ...baseKnowledge,
        publicFlag: 0 // 非公開ナレッジ
      };
      
      // 作成者のみ編集可能
      let result = await knowledgeService.isEditor(100, privateKnowledge, []);
      expect(result).toBe(true);
      
      // 共同編集者も編集可能
      result = await knowledgeService.isEditor(200, privateKnowledge, [{ userId: 200, userName: 'Editor' }]);
      expect(result).toBe(true);
      
      // その他のユーザーは編集不可
      result = await knowledgeService.isEditor(999, privateKnowledge, []);
      expect(result).toBe(false);
    });
  });

  describe('編集者リスト取得', () => {
    test('ナレッジIDから編集者リストを取得', async () => {
      const knowledgeId = 1;
      const mockEditors = [
        { user_id: 200, user_name: 'Editor1' },
        { user_id: 300, user_name: 'Editor2' }
      ];

      mockQueryRaw.mockResolvedValueOnce(mockEditors);

      const result = await knowledgeService.getEditors(knowledgeId);

      expect(mockQueryRaw).toHaveBeenCalled();
      expect(result).toEqual([
        { userId: 200, userName: 'Editor1' },
        { userId: 300, userName: 'Editor2' }
      ]);
    });

    test('編集者がいない場合は空配列を返す', async () => {
      const knowledgeId = 1;

      mockQueryRaw.mockResolvedValueOnce([]);

      const result = await knowledgeService.getEditors(knowledgeId);

      expect(result).toEqual([]);
    });
  });
});