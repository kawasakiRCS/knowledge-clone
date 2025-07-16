/**
 * ドメインマッピングユーティリティテスト
 * 
 * @description ドメイン変換ロジックのテストケース
 */
import { describe, test, expect } from '@jest/globals';
import {
  convertLegacyToEntraId,
  convertEntraIdToLegacy,
  getDomainMapping,
  isMappedDomain,
  convertUserKeyToEmail,
} from '../domainMapping';

describe('domainMapping', () => {
  describe('convertLegacyToEntraId', () => {
    test('旧システムドメインをEntraIDドメインに変換', () => {
      const result = convertLegacyToEntraId('foobar@example.local');
      expect(result).toBe('foobar@hoge.onmicrosoft.com');
    });

    test('未定義ドメインはそのまま返す', () => {
      const result = convertLegacyToEntraId('user@unknown.com');
      expect(result).toBe('user@unknown.com');
    });

    test('メールアドレス以外の文字列はそのまま返す', () => {
      expect(convertLegacyToEntraId('foobar')).toBe('foobar');
      expect(convertLegacyToEntraId('')).toBe('');
    });

    test('複数のドメインマッピング', () => {
      expect(convertLegacyToEntraId('user@company.local')).toBe('user@company.onmicrosoft.com');
    });
  });

  describe('convertEntraIdToLegacy', () => {
    test('EntraIDドメインを旧システムドメインに逆変換', () => {
      const result = convertEntraIdToLegacy('foobar@hoge.onmicrosoft.com');
      expect(result).toBe('foobar@example.local');
    });

    test('未定義ドメインはそのまま返す', () => {
      const result = convertEntraIdToLegacy('user@unknown.onmicrosoft.com');
      expect(result).toBe('user@unknown.onmicrosoft.com');
    });

    test('メールアドレス以外の文字列はそのまま返す', () => {
      expect(convertEntraIdToLegacy('foobar')).toBe('foobar');
      expect(convertEntraIdToLegacy('')).toBe('');
    });
  });

  describe('getDomainMapping', () => {
    test('ドメインマッピング設定を取得', () => {
      const mapping = getDomainMapping();
      expect(Object.prototype.hasOwnProperty.call(mapping, 'example.local')).toBe(true);
      expect(mapping['example.local']).toBe('hoge.onmicrosoft.com');
    });

    test('返されるオブジェクトは元のオブジェクトと独立している', () => {
      const mapping1 = getDomainMapping();
      const mapping2 = getDomainMapping();
      
      mapping1['test.local'] = 'test.onmicrosoft.com';
      expect(mapping2).not.toHaveProperty('test.local');
    });
  });

  describe('isMappedDomain', () => {
    test('マッピング対象ドメインの判定', () => {
      expect(isMappedDomain('example.local')).toBe(true);
      expect(isMappedDomain('company.local')).toBe(true);
      expect(isMappedDomain('unknown.local')).toBe(false);
    });
  });

  describe('convertUserKeyToEmail', () => {
    test('ユーザーキーをメールアドレス形式に変換', () => {
      const result = convertUserKeyToEmail('foobar', 'example.local');
      expect(result).toBe('foobar@example.local');
    });

    test('既にメールアドレス形式の場合はそのまま返す', () => {
      const result = convertUserKeyToEmail('foobar@test.com', 'example.local');
      expect(result).toBe('foobar@test.com');
    });

    test('デフォルトドメインを使用', () => {
      const result = convertUserKeyToEmail('foobar');
      expect(result).toBe('foobar@example.local');
    });

    test('空文字列の場合はそのまま返す', () => {
      const result = convertUserKeyToEmail('');
      expect(result).toBe('');
    });
  });
});