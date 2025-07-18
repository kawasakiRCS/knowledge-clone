/**
 * システム設定管理テスト
 * 
 * @description systemConfig.tsの単体テスト
 */
import {
  SystemExposeType,
  isSystemClosed,
  getSystemExposeType,
  setCloseMode,
  initializeSystemConfig,
} from '../systemConfig';

describe('systemConfig', () => {
  // 環境変数のバックアップ
  const originalEnv = process.env;

  beforeEach(() => {
    // 環境変数をリセット
    process.env = { ...originalEnv };
    // システム設定を初期状態にリセット
    setCloseMode(false);
  });

  afterAll(() => {
    // 環境変数を復元
    process.env = originalEnv;
  });

  describe('初期状態', () => {
    test('デフォルトはオープンモード', () => {
      expect(isSystemClosed()).toBe(false);
      expect(getSystemExposeType()).toBe(SystemExposeType.OPEN);
    });
  });

  describe('isSystemClosed', () => {
    test('閉鎖モードの状態を正しく返す', () => {
      setCloseMode(false);
      expect(isSystemClosed()).toBe(false);

      setCloseMode(true);
      expect(isSystemClosed()).toBe(true);
    });
  });

  describe('getSystemExposeType', () => {
    test('公開タイプを正しく返す', () => {
      setCloseMode(false);
      expect(getSystemExposeType()).toBe(SystemExposeType.OPEN);

      setCloseMode(true);
      expect(getSystemExposeType()).toBe(SystemExposeType.CLOSE);
    });
  });

  describe('setCloseMode', () => {
    test('閉鎖モードを設定できる', () => {
      setCloseMode(true);
      expect(isSystemClosed()).toBe(true);
      expect(getSystemExposeType()).toBe(SystemExposeType.CLOSE);
    });

    test('オープンモードを設定できる', () => {
      setCloseMode(true); // 一度閉鎖モードに
      setCloseMode(false); // オープンモードに戻す
      expect(isSystemClosed()).toBe(false);
      expect(getSystemExposeType()).toBe(SystemExposeType.OPEN);
    });
  });

  describe('initializeSystemConfig', () => {
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    test('環境変数CLOSEで閉鎖モードに初期化', () => {
      process.env.SYSTEM_EXPOSE_TYPE = 'CLOSE';
      
      initializeSystemConfig();
      
      expect(isSystemClosed()).toBe(true);
      expect(getSystemExposeType()).toBe(SystemExposeType.CLOSE);
      expect(consoleLogSpy).toHaveBeenCalledWith('System initialized with expose type: CLOSE');
    });

    test('環境変数OPENでオープンモードに初期化', () => {
      process.env.SYSTEM_EXPOSE_TYPE = 'OPEN';
      
      initializeSystemConfig();
      
      expect(isSystemClosed()).toBe(false);
      expect(getSystemExposeType()).toBe(SystemExposeType.OPEN);
      expect(consoleLogSpy).toHaveBeenCalledWith('System initialized with expose type: OPEN');
    });

    test('環境変数未設定でオープンモードに初期化', () => {
      delete process.env.SYSTEM_EXPOSE_TYPE;
      
      initializeSystemConfig();
      
      expect(isSystemClosed()).toBe(false);
      expect(getSystemExposeType()).toBe(SystemExposeType.OPEN);
      expect(consoleLogSpy).toHaveBeenCalledWith('System initialized with expose type: OPEN');
    });

    test('無効な環境変数でオープンモードに初期化', () => {
      process.env.SYSTEM_EXPOSE_TYPE = 'INVALID';
      
      initializeSystemConfig();
      
      expect(isSystemClosed()).toBe(false);
      expect(getSystemExposeType()).toBe(SystemExposeType.OPEN);
      expect(consoleLogSpy).toHaveBeenCalledWith('System initialized with expose type: OPEN');
    });
  });

  describe('SystemExposeType enum', () => {
    test('正しい値を持つ', () => {
      expect(SystemExposeType.OPEN).toBe('OPEN');
      expect(SystemExposeType.CLOSE).toBe('CLOSE');
    });
  });
});