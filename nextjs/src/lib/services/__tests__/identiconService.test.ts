/**
 * IdenticonService テスト
 * 
 * @description 旧JavaシステムのIdenticonLogic.javaと同等の機能をテスト
 * - MD5ハッシュベースのIdenticon生成
 * - 5x5ピクセルパターンの20x20拡大
 * - 水平対称パターン
 * - ユーザーIDから一意の色とパターン生成
 */
import { IdenticonService } from '../identiconService';

describe('IdenticonService', () => {
  let identiconService: IdenticonService;

  beforeEach(() => {
    identiconService = new IdenticonService();
  });

  describe('generateIdenticon', () => {
    test('should generate a PNG image for valid user ID', async () => {
      // Red: IdenticonServiceは存在しないので失敗するはず
      const userId = 5;
      const result = await identiconService.generateIdenticon(userId);

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Buffer);
      expect(result.contentType).toBe('image/png');
      expect(result.fileName).toBe(`identicon_${userId}.png`);
      expect(result.size).toBeGreaterThan(0);
    });

    test('should generate different icons for different user IDs', async () => {
      // Red: 異なるユーザーIDで異なるアイコンが生成されることをテスト
      const result1 = await identiconService.generateIdenticon(1);
      const result2 = await identiconService.generateIdenticon(2);

      expect(result1.data).not.toEqual(result2.data);
      expect(result1.fileName).toBe('identicon_1.png');
      expect(result2.fileName).toBe('identicon_2.png');
    });

    test('should generate same icon for same user ID (deterministic)', async () => {
      // Red: 同一ユーザーIDで常に同じアイコンが生成されることをテスト
      const userId = 10;
      const result1 = await identiconService.generateIdenticon(userId);
      const result2 = await identiconService.generateIdenticon(userId);

      expect(result1.data).toEqual(result2.data);
      expect(result1.size).toBe(result2.size);
    });

    test('should generate 20x20 pixel PNG images', async () => {
      // Red: 20x20ピクセルの画像が生成されることをテスト
      const result = await identiconService.generateIdenticon(5);
      
      // PNG画像のサイズをテスト（実際のPNG解析は実装後に詳細化）
      expect(result.data.length).toBeGreaterThan(100); // 最小PNG size
      expect(result.data.length).toBeLessThan(2000); // 20x20なので小さいはず
    });

    test('should handle edge case user IDs', async () => {
      // Red: エッジケースのテスト
      const edgeCases = [0, -1, 999999];
      
      for (const userId of edgeCases) {
        const result = await identiconService.generateIdenticon(userId);
        expect(result).toBeDefined();
        expect(result.data).toBeInstanceOf(Buffer);
        expect(result.contentType).toBe('image/png');
      }
    });
  });

  describe('generateMD5Hash', () => {
    test('should generate consistent MD5 hash for same input', () => {
      // Red: MD5ハッシュ生成の一貫性テスト
      const userId = 5;
      const hash1 = identiconService.generateMD5Hash(userId);
      const hash2 = identiconService.generateMD5Hash(userId);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(32); // MD5は32文字のhex string
    });

    test('should generate different hashes for different inputs', () => {
      // Red: 異なる入力で異なるハッシュが生成されることをテスト
      const hash1 = identiconService.generateMD5Hash(1);
      const hash2 = identiconService.generateMD5Hash(2);

      expect(hash1).not.toBe(hash2);
      expect(hash1).toHaveLength(32);
      expect(hash2).toHaveLength(32);
    });
  });

  describe('generatePattern', () => {
    test('should generate 5x5 boolean pattern array', () => {
      // Red: 5x5のパターン配列生成テスト
      const hash = 'e4da3b7fbbce2345d7772b0674a318d5'; // MD5 of "5"
      const pattern = identiconService.generatePattern(hash);

      expect(pattern).toHaveLength(5); // 5行
      expect(pattern[0]).toHaveLength(5); // 5列
      expect(pattern.every(row => row.every(cell => typeof cell === 'boolean'))).toBe(true);
    });

    test('should generate horizontally symmetric pattern', () => {
      // Red: 水平対称パターンのテスト
      const hash = 'e4da3b7fbbce2345d7772b0674a318d5';
      const pattern = identiconService.generatePattern(hash);

      // 水平対称性をチェック（左右対称）
      for (let i = 0; i < 5; i++) {
        expect(pattern[i][0]).toBe(pattern[i][4]); // 1列目と5列目
        expect(pattern[i][1]).toBe(pattern[i][3]); // 2列目と4列目
        // 3列目（中央）は対称性の制約なし
      }
    });
  });

  describe('extractColor', () => {
    test('should extract RGB color from MD5 hash', () => {
      // Red: MD5ハッシュからRGB色抽出テスト
      const hash = 'e4da3b7fbbce2345d7772b0674a318d5';
      const color = identiconService.extractColor(hash);

      expect(color).toHaveProperty('r');
      expect(color).toHaveProperty('g');
      expect(color).toHaveProperty('b');
      expect(color.r).toBeGreaterThanOrEqual(0);
      expect(color.r).toBeLessThanOrEqual(255);
      expect(color.g).toBeGreaterThanOrEqual(0);
      expect(color.g).toBeLessThanOrEqual(255);
      expect(color.b).toBeGreaterThanOrEqual(0);
      expect(color.b).toBeLessThanOrEqual(255);
    });
  });
});