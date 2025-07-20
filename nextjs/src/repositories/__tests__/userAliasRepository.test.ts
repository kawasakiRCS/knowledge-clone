/**
 * ユーザーエイリアスリポジトリテスト
 * 
 * @description userAliasRepositoryのテストケース
 */
import { describe, test, expect, beforeEach } from '@jest/globals';
import type { UserAlias } from '../userAliasRepository';

// userAliasRepositoryの実装をテスト
describe('userAliasRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('型とインターフェース', () => {
    test('UserAlias型が正しく定義されている', () => {
      const userAlias: UserAlias = {
        userId: 1,
        authKey: 'oauth',
        aliasKey: 'user@example.com',
        aliasName: 'Test User',
      };

      expect(userAlias.userId).toBe(1);
      expect(userAlias.authKey).toBe('oauth');
      expect(userAlias.aliasKey).toBe('user@example.com');
      expect(userAlias.aliasName).toBe('Test User');
    });

    test('ENTRAID_AUTH_KEY定数が定義されている', async () => {
      const { ENTRAID_AUTH_KEY } = await import('../userAliasRepository');
      expect(ENTRAID_AUTH_KEY).toBe('entraid');
    });
  });

  // 注: 実際のDB操作テストは統合テストで実施
  // ユニットテストでは型とインターフェースの確認のみ
});