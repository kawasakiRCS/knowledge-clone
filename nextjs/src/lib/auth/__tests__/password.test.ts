/**
 * パスワード処理ユーティリティテスト
 * 
 * @description パスワードのハッシュ化と検証のテストケース
 */
import { describe, test, expect } from '@jest/globals';
import { hashPassword, verifyPassword, generateSalt } from '../password';

describe('password utilities', () => {
  describe('hashPassword', () => {
    test('新規パスワードのハッシュ化（bcrypt使用）', async () => {
      const result = await hashPassword('password123');

      expect(result.hash).toBeDefined();
      expect(result.salt).toBeDefined();
      expect(result.hash).toMatch(/^\$2[aby]\$/); // bcryptハッシュ形式
      expect(result.salt).toMatch(/^\$2[aby]\$/); // bcryptソルト形式
    });

    test('既存ソルトでのハッシュ化（SHA-256使用）', async () => {
      const result = await hashPassword('password123', 'existingsalt');

      expect(result.hash).toBeDefined();
      expect(result.salt).toBe('existingsalt');
      expect(result.hash).toMatch(/^[a-f0-9]{64}$/); // SHA-256形式（64文字の16進数）
    });
  });

  describe('verifyPassword', () => {
    test('bcryptハッシュの検証', async () => {
      // 実際にbcryptでハッシュ化してから検証
      const { hash } = await hashPassword('password123');
      const result = await verifyPassword('password123', hash, 'salt');

      expect(result).toBe(true);
    });

    test('SHA-256ハッシュの検証（旧システム互換）', async () => {
      // 実際にSHA-256でハッシュ化してから検証
      const { hash } = await hashPassword('password123', 'testsalt');
      const result = await verifyPassword('password123', hash, 'testsalt');

      expect(result).toBe(true);
    });

    test('パスワード不一致の場合false', async () => {
      const { hash } = await hashPassword('password123');
      const result = await verifyPassword('wrongpassword', hash, 'salt');

      expect(result).toBe(false);
    });

    test('SHA-256ハッシュ不一致の場合false', async () => {
      const { hash } = await hashPassword('password123', 'testsalt');
      const result = await verifyPassword('wrongpassword', hash, 'testsalt');

      expect(result).toBe(false);
    });
  });

  describe('generateSalt', () => {
    test('ランダムソルトの生成', () => {
      const result = generateSalt();

      expect(result).toBeDefined();
      expect(result).toMatch(/^[a-f0-9]{64}$/); // 64文字の16進数文字列
      
      // 複数回呼び出しても異なる値が生成される
      const result2 = generateSalt();
      expect(result).not.toBe(result2);
    });
  });
});