/**
 * Knowledge Detail API のテスト
 * 
 * @description ナレッジ詳細取得APIのテスト（モック使用）
 */
import { describe, test, expect, beforeEach } from '@jest/globals';
import { GET } from '../route';

// KnowledgeServiceのモック
const mockCanAccessKnowledge = jest.fn();
const mockGetKnowledgeById = jest.fn();
const mockGetKnowledgeByIdWithUser = jest.fn();
const mockIncrementViewCount = jest.fn();

jest.mock('@/lib/services/knowledgeService', () => ({
  KnowledgeService: jest.fn().mockImplementation(() => ({
    canAccessKnowledge: mockCanAccessKnowledge,
    getKnowledgeById: mockGetKnowledgeById,
    getKnowledgeByIdWithUser: mockGetKnowledgeByIdWithUser,
    incrementViewCount: mockIncrementViewCount,
  })),
}));

describe('/api/knowledge/[id]', () => {
  let testKnowledgeId: bigint;

  beforeEach(() => {
    // モックのリセット
    jest.clearAllMocks();
    mockIncrementViewCount.mockResolvedValue(undefined);
    
    testKnowledgeId = BigInt(1);
  });

  describe('GET /api/knowledge/[id]', () => {
    test('存在する公開ナレッジを取得できる', async () => {
      // モックの設定
      const mockKnowledge = {
        knowledgeId: testKnowledgeId,
        title: 'テストAPIナレッジ',
        content: '<h2>テスト内容</h2><p>API経由でのテストです。</p>',
        publicFlag: 1,
        typeId: 1,
        insertUser: 1,
        insertDatetime: new Date('2024-01-01T00:00:00Z'),
        updateDatetime: new Date('2024-01-02T00:00:00Z'),
        point: 100,
        likeCount: BigInt(5),
        commentCount: 3,
        viewCount: BigInt(50),
        author: {
          userId: 1,
          userName: 'テストユーザー',
        },
      };
      
      mockCanAccessKnowledge.mockResolvedValue(true);
      mockGetKnowledgeByIdWithUser.mockResolvedValue(mockKnowledge as any);
      
      const request = new global.Request(`http://localhost:3000/api/knowledge/${testKnowledgeId}`);
      const params = Promise.resolve({ id: testKnowledgeId.toString() });
      
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.knowledgeId).toBe(testKnowledgeId.toString());
      expect(data.title).toBe('テストAPIナレッジ');
      expect(data.content).toBe('<h2>テスト内容</h2><p>API経由でのテストです。</p>');
      expect(data.publicFlag).toBe(1);
      expect(data.point).toBe(100);
      expect(mockIncrementViewCount).toHaveBeenCalledWith(testKnowledgeId);
    });

    test('存在しないナレッジで404を返す', async () => {
      mockCanAccessKnowledge.mockResolvedValue(false);
      mockGetKnowledgeById.mockResolvedValue(null);
      
      const request = new global.Request('http://localhost:3000/api/knowledge/999999');
      const params = Promise.resolve({ id: '999999' });
      
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Knowledge not found');
    });

    test('非公開ナレッジで403を返す', async () => {
      const privateKnowledge = {
        knowledgeId: BigInt(2),
        publicFlag: 2,
      };
      
      mockCanAccessKnowledge.mockResolvedValue(false);
      mockGetKnowledgeById.mockResolvedValue(privateKnowledge as any);

      const request = new global.Request(`http://localhost:3000/api/knowledge/${privateKnowledge.knowledgeId}`);
      const params = Promise.resolve({ id: privateKnowledge.knowledgeId.toString() });
      
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Access denied');
    });

    test('削除されたナレッジで404を返す', async () => {
      mockCanAccessKnowledge.mockResolvedValue(false);
      mockGetKnowledgeById.mockResolvedValue(null);

      const request = new global.Request(`http://localhost:3000/api/knowledge/${testKnowledgeId}`);
      const params = Promise.resolve({ id: testKnowledgeId.toString() });
      
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Knowledge not found');
    });

    test('無効なIDフォーマットで400を返す', async () => {
      const request = new global.Request('http://localhost:3000/api/knowledge/invalid');
      const params = Promise.resolve({ id: 'invalid' });
      
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid knowledge ID');
    });
  });
});