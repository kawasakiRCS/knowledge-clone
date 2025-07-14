/**
 * Knowledge Detail API のテスト
 * 
 * @description ナレッジ詳細取得APIのテスト（実データベース使用）
 */
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { GET } from '../route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

describe('/api/knowledge/[id]', () => {
  let testKnowledgeId: bigint;

  beforeEach(async () => {
    // テストデータを作成
    const testKnowledge = await prisma.knowledge.create({
      data: {
        title: 'テストAPIナレッジ',
        content: '<h2>テスト内容</h2><p>API経由でのテストです。</p>',
        publicFlag: 1, // 公開
        typeId: 1,
        insertUser: 1,
        insertDatetime: new Date(),
        point: 100,
        likeCount: BigInt(5),
        commentCount: 3,
        viewCount: BigInt(50),
      }
    });
    testKnowledgeId = testKnowledge.knowledgeId;
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

  describe('GET /api/knowledge/[id]', () => {
    test('存在する公開ナレッジを取得できる', async () => {
      const request = new NextRequest(`http://localhost:3000/api/knowledge/${testKnowledgeId}`);
      const params = Promise.resolve({ id: testKnowledgeId.toString() });
      
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.knowledgeId).toBe(testKnowledgeId.toString());
      expect(data.title).toBe('テストAPIナレッジ');
      expect(data.content).toBe('<h2>テスト内容</h2><p>API経由でのテストです。</p>');
      expect(data.publicFlag).toBe(1);
      expect(data.point).toBe(100);
    });

    test('存在しないナレッジで404を返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/knowledge/999999');
      const params = Promise.resolve({ id: '999999' });
      
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Knowledge not found');
    });

    test('非公開ナレッジで403を返す', async () => {
      // 非公開ナレッジを作成
      const privateKnowledge = await prisma.knowledge.create({
        data: {
          title: 'テスト非公開ナレッジ',
          content: 'テスト内容',
          publicFlag: 2, // 非公開
          typeId: 1,
          insertUser: 1,
          insertDatetime: new Date(),
        }
      });

      const request = new NextRequest(`http://localhost:3000/api/knowledge/${privateKnowledge.knowledgeId}`);
      const params = Promise.resolve({ id: privateKnowledge.knowledgeId.toString() });
      
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Access denied');
    });

    test('削除されたナレッジで404を返す', async () => {
      // 削除フラグを立てる
      await prisma.knowledge.update({
        where: { knowledgeId: testKnowledgeId },
        data: { deleteFlag: 1 }
      });

      const request = new NextRequest(`http://localhost:3000/api/knowledge/${testKnowledgeId}`);
      const params = Promise.resolve({ id: testKnowledgeId.toString() });
      
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Knowledge not found');
    });

    test('無効なIDフォーマットで400を返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/knowledge/invalid');
      const params = Promise.resolve({ id: 'invalid' });
      
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid knowledge ID');
    });
  });
});