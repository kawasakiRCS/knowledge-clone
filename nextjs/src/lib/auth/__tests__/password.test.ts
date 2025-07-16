/**
 * パスワード処理ユーティリティテスト
 * 
 * @description パスワードのハッシュ化と検証のテストケース
 */
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { hashPassword, verifyPassword, generateSalt } from '../password';

// bcryptのモック
const mockBcrypt = {
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
};

jest.doMock('bcryptjs', () => mockBcrypt);

// cryptoのモック
const mockCrypto = {
  createHash: jest.fn(),
  randomBytes: jest.fn(),
};

jest.doMock('crypto', () => mockCrypto);

describe('password utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    test('新規パスワードのハッシュ化（bcrypt使用）', async () => {
      const mockSalt = '$2b$10$abcdefghijklmnopqrstuv';
      const mockHash = '$2b$10$abcdefghijklmnopqrstuv.hashedpassword';

      mockBcrypt.genSalt.mockResolvedValue(mockSalt);
      mockBcrypt.hash.mockResolvedValue(mockHash);

      const result = await hashPassword('password123');

      expect(result).toEqual({
        hash: mockHash,
        salt: mockSalt,
      });
      expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', mockSalt);
    });

    test('既存ソルトでのハッシュ化（SHA-256使用）', async () => {
      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('sha256hashedpassword'),
      };
      mockCrypto.createHash.mockReturnValue(mockHash);

      const result = await hashPassword('password123', 'existingsalt');

      expect(result).toEqual({
        hash: 'sha256hashedpassword',
        salt: 'existingsalt',
      });
      expect(mockCrypto.createHash).toHaveBeenCalledWith('sha256');
      expect(mockHash.update).toHaveBeenCalledWith('password123existingsalt');
      expect(mockHash.digest).toHaveBeenCalledWith('hex');
    });
  });

  describe('verifyPassword', () => {
    test('bcryptハッシュの検証', async () => {
      const bcryptHash = '$2b$10$abcdefghijklmnopqrstuv.hashedpassword';
      mockBcrypt.compare.mockResolvedValue(true);

      const result = await verifyPassword('password123', bcryptHash, 'salt');

      expect(result).toBe(true);
      expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', bcryptHash);
    });

    test('SHA-256ハッシュの検証（旧システム互換）', async () => {
      const sha256Hash = 'sha256hashedpassword';
      const mockHashResult = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('sha256hashedpassword'),
      };
      mockCrypto.createHash.mockReturnValue(mockHashResult);

      const result = await verifyPassword('password123', sha256Hash, 'testsalt');

      expect(result).toBe(true);
      expect(mockCrypto.createHash).toHaveBeenCalledWith('sha256');
      expect(mockHashResult.update).toHaveBeenCalledWith('password123testsalt');
    });

    test('パスワード不一致の場合false', async () => {
      const bcryptHash = '$2b$10$abcdefghijklmnopqrstuv.hashedpassword';
      mockBcrypt.compare.mockResolvedValue(false);

      const result = await verifyPassword('wrongpassword', bcryptHash, 'salt');

      expect(result).toBe(false);
    });

    test('SHA-256ハッシュ不一致の場合false', async () => {
      const sha256Hash = 'differenthash';
      const mockHashResult = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('sha256hashedpassword'),
      };
      mockCrypto.createHash.mockReturnValue(mockHashResult);

      const result = await verifyPassword('password123', sha256Hash, 'testsalt');

      expect(result).toBe(false);
    });
  });

  describe('generateSalt', () => {
    test('ランダムソルトの生成', () => {
      const mockBuffer = Buffer.from('randomdata');
      mockCrypto.randomBytes.mockReturnValue(mockBuffer);
      mockBuffer.toString = jest.fn().mockReturnValue('randomsalt');

      const result = generateSalt();

      expect(result).toBe('randomsalt');
      expect(mockCrypto.randomBytes).toHaveBeenCalledWith(32);
    });
  });
});