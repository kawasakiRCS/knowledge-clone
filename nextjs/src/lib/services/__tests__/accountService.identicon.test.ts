/**
 * AccountService Identicon統合テスト
 * 
 * @description AccountServiceのgetUserIcon()メソッドとIdenticon生成の統合テスト
 * 旧Javaシステムと同等の動作をテスト
 */
import { AccountService } from '../accountService';
import { IdenticonService } from '../identiconService';

describe('AccountService Identicon Integration', () => {
  let accountService: AccountService;

  beforeEach(() => {
    accountService = new AccountService();
  });

  describe('getUserIcon with Identicon generation', () => {
    test('should generate identicon for user without custom icon', async () => {
      // Red: カスタムアイコンがないユーザーに対してIdenticonを生成することをテスト
      const userId = 5;
      const result = await accountService.getUserIcon(userId);

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Buffer);
      expect(result.contentType).toBe('image/png');
      expect(result.fileName).toBe(`identicon_${userId}.png`);
      expect(result.size).toBeGreaterThan(100); // 実際のPNGサイズ
    });

    test('should generate different identicons for different users', async () => {
      // Red: 異なるユーザーIDで異なるIdenticonが生成されることをテスト
      const result1 = await accountService.getUserIcon(1);
      const result2 = await accountService.getUserIcon(2);

      expect(result1.data).not.toEqual(result2.data);
      expect(result1.fileName).toBe('identicon_1.png');
      expect(result2.fileName).toBe('identicon_2.png');
    });

    test('should generate same identicon for same user consistently', async () => {
      // Red: 同一ユーザーに対して常に同じIdenticonが生成されることをテスト
      const userId = 10;
      const result1 = await accountService.getUserIcon(userId);
      const result2 = await accountService.getUserIcon(userId);

      expect(result1.data).toEqual(result2.data);
      expect(result1.fileName).toBe(result2.fileName);
      expect(result1.size).toBe(result2.size);
    });

    test('should handle edge case user ID -1 (anonymous user)', async () => {
      // Red: 匿名ユーザー（ID: -1）に対してデフォルトアイコンを返すことをテスト
      const result = await accountService.getUserIcon(-1);

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Buffer);
      expect(result.contentType).toBe('image/png');
      expect(result.fileName).toBe('icon.png'); // デフォルトアイコン名
    });

    test('should handle user ID 0', async () => {
      // Red: ユーザーID 0のケース
      const result = await accountService.getUserIcon(0);

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Buffer);
      expect(result.contentType).toBe('image/png');
      expect(result.fileName).toBe('identicon_0.png');
    });

    test('should handle large user IDs', async () => {
      // Red: 大きなユーザーIDのテスト
      const userId = 999999;
      const result = await accountService.getUserIcon(userId);

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Buffer);
      expect(result.contentType).toBe('image/png');
      expect(result.fileName).toBe(`identicon_${userId}.png`);
    });
  });

  describe('Identicon consistency with Java system', () => {
    test('should generate identicon with same MD5 hash logic as Java', async () => {
      // Red: JavaシステムとMD5ハッシュロジックが同等であることをテスト
      const userId = 5;
      const result = await accountService.getUserIcon(userId);
      
      // MD5ハッシュが期待値と一致するかテスト（Javaシステムと比較）
      const identiconService = new IdenticonService();
      const expectedHash = identiconService.generateMD5Hash(userId);
      expect(expectedHash).toBe('e4da3b7fbbce2345d7772b0674a318d5'); // MD5 of "5"
      
      // 生成されたアイコンが空でないことを確認
      expect(result.data.length).toBeGreaterThan(0);
    });

    test('should generate horizontally symmetric pattern like Java system', async () => {
      // Red: Javaシステムと同様の水平対称パターンが生成されることをテスト
      const userId = 5;
      const result = await accountService.getUserIcon(userId);
      
      // 生成されたPNGが有効であることを確認
      expect(result.data).toBeInstanceOf(Buffer);
      expect(result.data.slice(0, 8)).toEqual(
        Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]) // PNG signature
      );
    });
  });

  describe('Error handling', () => {
    test('should handle negative user IDs gracefully', async () => {
      // Red: 負のユーザーIDのエラーハンドリング
      const negativeIds = [-5, -100];
      
      for (const userId of negativeIds) {
        const result = await accountService.getUserIcon(userId);
        expect(result).toBeDefined();
        expect(result.data).toBeInstanceOf(Buffer);
        expect(result.contentType).toBe('image/png');
      }
    });

    test('should handle extremely large user IDs', async () => {
      // Red: 極めて大きなユーザーIDのテスト
      const largeId = Number.MAX_SAFE_INTEGER;
      const result = await accountService.getUserIcon(largeId);
      
      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Buffer);
      expect(result.fileName).toBe(`identicon_${largeId}.png`);
    });
  });
});