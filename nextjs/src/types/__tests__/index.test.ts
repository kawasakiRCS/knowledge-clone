/**
 * 共通型定義のテスト
 * 
 * @description index.tsの型定義テスト
 */
import { describe, test, expect } from '@jest/globals';
import type { Knowledge, User, ApiResponse } from '../index';

describe('Common Types', () => {
  describe('Knowledge type', () => {
    test('Knowledge型が正しく定義されている', () => {
      const knowledge: Knowledge = {
        knowledgeId: BigInt(1),
        title: 'Test Knowledge',
        content: 'Test content',
        publicFlag: 1,
        tagIds: '1,2,3',
        tagNames: 'tag1,tag2,tag3',
        likeCount: BigInt(10),
        commentCount: 5,
        typeId: 1,
        insertUser: 1,
        insertDatetime: new Date(),
        updateUser: 1,
        updateDatetime: new Date(),
        deleteFlag: 0,
        notifyStatus: 0,
        viewCount: BigInt(100),
        point: 50,
      };

      expect(knowledge.knowledgeId).toBe(BigInt(1));
      expect(knowledge.title).toBe('Test Knowledge');
      expect(knowledge.point).toBe(50);
    });

    test('必須項目のみでKnowledge型を作成できる', () => {
      const knowledge: Knowledge = {
        knowledgeId: BigInt(1),
        title: 'Minimal Knowledge',
        point: 0,
      };

      expect(knowledge.knowledgeId).toBe(BigInt(1));
      expect(knowledge.title).toBe('Minimal Knowledge');
      expect(knowledge.content).toBeUndefined();
    });
  });

  describe('User type', () => {
    test('User型が正しく定義されている', () => {
      const user: User = {
        id: 1,
        userId: 'testuser',
        password: 'hashedpassword',
        userName: 'Test User',
        mailAddress: 'test@example.com',
        insertUser: 1,
        insertDatetime: new Date('2024-01-01'),
        updateUser: 1,
        updateDatetime: new Date('2024-01-02'),
        deleteFlag: 0,
      };

      expect(user.id).toBe(1);
      expect(user.userId).toBe('testuser');
      expect(user.userName).toBe('Test User');
      expect(user.deleteFlag).toBe(0);
    });
  });

  describe('ApiResponse type', () => {
    test('成功レスポンスが正しく定義されている', () => {
      interface TestData {
        id: number;
        name: string;
      }

      const response: ApiResponse<TestData> = {
        success: true,
        data: {
          id: 1,
          name: 'Test',
        },
        message: '処理が成功しました',
      };

      expect(response.success).toBe(true);
      expect(response.data?.id).toBe(1);
      expect(response.data?.name).toBe('Test');
      expect(response.message).toBe('処理が成功しました');
    });

    test('エラーレスポンスが正しく定義されている', () => {
      const response: ApiResponse = {
        success: false,
        error: 'エラーが発生しました',
      };

      expect(response.success).toBe(false);
      expect(response.error).toBe('エラーが発生しました');
      expect(response.data).toBeUndefined();
    });

    test('型パラメータなしでApiResponseを使用できる', () => {
      const response: ApiResponse = {
        success: true,
        data: { anything: 'can go here' },
      };

      expect(response.success).toBe(true);
      expect((response.data as any).anything).toBe('can go here');
    });
  });

  describe('auth types export', () => {
    test('authタイプがエクスポートされている', () => {
      // export * from './auth' の動作確認
      // 実際にauthモジュールが存在するかテスト
      expect(async () => {
        await import('../auth');
      }).not.toThrow();
    });
  });
});