/**
 * 開発環境専用認証バイパス機能テスト
 * 
 * @description 開発環境での認証バイパス機能の動作確認
 */
import {
  isDevelopmentAuthBypassEnabled,
  DEVELOPMENT_USERS,
  isValidDevelopmentUserType,
  getDevelopmentUser,
  generateDevelopmentTokenPayload
} from '../devBypass';

describe('devBypass.ts - 開発環境認証バイパス', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('isDevelopmentAuthBypassEnabled', () => {
    test('開発環境でバイパスが有効な場合trueを返す', () => {
      process.env.NODE_ENV = 'development';
      process.env.DEVELOPMENT_AUTH_BYPASS = 'true';

      expect(isDevelopmentAuthBypassEnabled()).toBe(true);
    });

    test('開発環境でバイパスが無効な場合falseを返す', () => {
      process.env.NODE_ENV = 'development';
      process.env.DEVELOPMENT_AUTH_BYPASS = 'false';

      expect(isDevelopmentAuthBypassEnabled()).toBe(false);
    });

    test('本番環境ではfalseを返す', () => {
      process.env.NODE_ENV = 'production';
      process.env.DEVELOPMENT_AUTH_BYPASS = 'true';

      expect(isDevelopmentAuthBypassEnabled()).toBe(false);
    });

    test('環境変数が未設定の場合falseを返す', () => {
      delete process.env.NODE_ENV;
      delete process.env.DEVELOPMENT_AUTH_BYPASS;

      expect(isDevelopmentAuthBypassEnabled()).toBe(false);
    });
  });

  describe('DEVELOPMENT_USERS', () => {
    test('adminユーザーの情報が正しく定義されている', () => {
      expect(DEVELOPMENT_USERS.admin).toEqual({
        userId: 12,
        userName: 'Knowledge test (Dev Admin)',
        userKey: 'kbtest',
        role: 'admin',
        unreadCount: 0,
      });
    });

    test('userユーザーの情報が正しく定義されている', () => {
      expect(DEVELOPMENT_USERS.user).toEqual({
        userId: 7,
        userName: '山田 テスト (Dev User)',
        userKey: 'yamada01',
        role: 'user',
        unreadCount: 0,
      });
    });
  });

  describe('isValidDevelopmentUserType', () => {
    test('有効なユーザータイプの場合trueを返す', () => {
      expect(isValidDevelopmentUserType('admin')).toBe(true);
      expect(isValidDevelopmentUserType('user')).toBe(true);
    });

    test('無効なユーザータイプの場合falseを返す', () => {
      expect(isValidDevelopmentUserType('invalid')).toBe(false);
      expect(isValidDevelopmentUserType('')).toBe(false);
      expect(isValidDevelopmentUserType('guest')).toBe(false);
    });
  });

  describe('getDevelopmentUser', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      process.env.DEVELOPMENT_AUTH_BYPASS = 'true';
    });

    test('adminユーザー情報を正しく取得できる', () => {
      const user = getDevelopmentUser('admin');

      expect(user).toEqual({
        userId: 12,
        userName: 'Knowledge test (Dev Admin)',
        userKey: 'kbtest',
        role: 'admin',
        unreadCount: 0,
      });
    });

    test('userユーザー情報を正しく取得できる', () => {
      const user = getDevelopmentUser('user');

      expect(user).toEqual({
        userId: 7,
        userName: '山田 テスト (Dev User)',
        userKey: 'yamada01',
        role: 'user',
        unreadCount: 0,
      });
    });

    test('バイパスが無効な場合エラーをスローする', () => {
      process.env.DEVELOPMENT_AUTH_BYPASS = 'false';

      expect(() => getDevelopmentUser('admin')).toThrow('Development auth bypass is not enabled');
    });
  });

  describe('generateDevelopmentTokenPayload', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      process.env.DEVELOPMENT_AUTH_BYPASS = 'true';
      // 時間をモック
      jest.spyOn(Date, 'now').mockReturnValue(1000000);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('adminユーザーのトークンペイロードを生成できる', () => {
      const payload = generateDevelopmentTokenPayload('admin');

      expect(payload).toEqual({
        userId: 12,
        userName: 'Knowledge test (Dev Admin)',
        userKey: 'kbtest',
        role: 'admin',
        unreadCount: 0,
        isDevelopmentBypass: true,
        exp: 1000 + (24 * 60 * 60), // 現在時刻 + 24時間
      });
    });

    test('userユーザーのトークンペイロードを生成できる', () => {
      const payload = generateDevelopmentTokenPayload('user');

      expect(payload).toEqual({
        userId: 7,
        userName: '山田 テスト (Dev User)',
        userKey: 'yamada01',
        role: 'user',
        unreadCount: 0,
        isDevelopmentBypass: true,
        exp: 1000 + (24 * 60 * 60),
      });
    });

    test('バイパスが無効な場合エラーをスローする', () => {
      process.env.DEVELOPMENT_AUTH_BYPASS = 'false';

      expect(() => generateDevelopmentTokenPayload('admin')).toThrow('Development auth bypass is not enabled');
    });
  });
});