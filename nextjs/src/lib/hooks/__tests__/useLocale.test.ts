/**
 * useLocaleフックテスト
 * 
 * @description label関数を含むuseLocaleフックの動作テスト
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLocale } from '../useLocale';

// 翻訳ファイルのモック
jest.mock('../../locales/ja.json', () => ({
  default: {
    label: {
      previous: '前へ',
      next: '次へ'
    },
    knowledge: {
      list: {
        kind: {
          list: '一覧'
        }
      },
      view: {
        info: {
          insert: 'が投稿'
        }
      },
      navbar: {
        config: {
          group: 'グループ'
        }
      }
    }
  }
}), { virtual: true });

jest.mock('../../locales/en.json', () => ({
  default: {
    label: {
      previous: 'Previous',
      next: 'Next'
    },
    knowledge: {
      list: {
        kind: {
          list: 'List'
        }
      },
      view: {
        info: {
          insert: 'posted'
        }
      },
      navbar: {
        config: {
          group: 'Group'
        }
      }
    }
  }
}), { virtual: true });

// LocalStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// navigatorのモック
Object.defineProperty(window, 'navigator', {
  value: {
    language: 'ja-JP'
  },
  writable: true
});

describe('useLocale', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // navigatorのlanguageをリセット
    Object.defineProperty(window.navigator, 'language', {
      value: 'ja-JP',
      writable: true
    });
  });

  describe('基本動作', () => {
    test('初期状態で日本語ロケールが設定される', () => {
      const { result } = renderHook(() => useLocale());
      
      expect(result.current.locale).toBe('ja');
      expect(result.current.displayName).toBe('日本語');
    });

    test('ロケール変更が正常に動作する', () => {
      const { result } = renderHook(() => useLocale());
      
      act(() => {
        result.current.updateLocale('en');
      });
      
      expect(result.current.locale).toBe('en');
      expect(result.current.displayName).toBe('English');
    });

    test('LocalStorageに保存されたロケールが読み込まれる', () => {
      localStorageMock.setItem('knowledge_locale', 'en');
      
      const { result } = renderHook(() => useLocale());
      
      expect(result.current.locale).toBe('en');
      expect(result.current.displayName).toBe('English');
    });

    test('ブラウザの言語設定が使用される', () => {
      Object.defineProperty(window.navigator, 'language', {
        value: 'en-US',
        writable: true
      });
      
      const { result } = renderHook(() => useLocale());
      
      expect(result.current.locale).toBe('en');
    });

    test('サポートされていない言語の場合は日本語にフォールバック', () => {
      Object.defineProperty(window.navigator, 'language', {
        value: 'fr-FR',
        writable: true
      });
      
      const { result } = renderHook(() => useLocale());
      
      expect(result.current.locale).toBe('ja');
    });

    test('updateLocaleがlocalStorageに保存する', () => {
      const { result } = renderHook(() => useLocale());
      
      act(() => {
        result.current.updateLocale('en');
      });
      
      expect(localStorageMock.getItem('knowledge_locale')).toBe('en');
    });

    test('flagIconが正しく設定される', () => {
      const { result } = renderHook(() => useLocale());
      
      expect(result.current.flagIcon).toBe('jp');
      
      act(() => {
        result.current.updateLocale('en');
      });
      
      expect(result.current.flagIcon).toBe('us');
    });

    test('availableLocalesが正しく返される', () => {
      const { result } = renderHook(() => useLocale());
      
      expect(result.current.availableLocales).toEqual([
        { code: 'ja', displayName: '日本語', flagIcon: 'jp' },
        { code: 'en', displayName: 'English', flagIcon: 'us' },
      ]);
    });
  });

  describe('label関数', () => {
    test('日本語ロケールで正しい翻訳を返す', async () => {
      const { result } = renderHook(() => useLocale());
      
      // 翻訳データの読み込みを待機
      await waitFor(() => {
        expect(result.current.label('label.previous')).toBe('前へ');
      });
      
      expect(result.current.label('label.next')).toBe('次へ');
      expect(result.current.label('knowledge.list.kind.list')).toBe('一覧');
    });

    test('英語ロケールで正しい翻訳を返す', async () => {
      const { result } = renderHook(() => useLocale());
      
      act(() => {
        result.current.updateLocale('en');
      });
      
      // 翻訳データの読み込みを待機
      await waitFor(() => {
        expect(result.current.label('label.previous')).toBe('Previous');
      });
      
      expect(result.current.label('label.next')).toBe('Next');
      expect(result.current.label('knowledge.list.kind.list')).toBe('List');
    });

    test('存在しないキーはキー自体を返す', () => {
      const { result } = renderHook(() => useLocale());
      
      expect(result.current.label('non.existent.key')).toBe('non.existent.key');
    });

    test('ネストされたキーが正しく処理される', async () => {
      const { result } = renderHook(() => useLocale());
      
      // 翻訳データの読み込みを待機
      await waitFor(() => {
        expect(result.current.label('knowledge.view.info.insert')).toBe('が投稿');
      });
      
      expect(result.current.label('knowledge.navbar.config.group')).toBe('グループ');
    });
  });

  describe('エラーハンドリング', () => {
    test('無効なロケールは日本語にフォールバックする', () => {
      const { result } = renderHook(() => useLocale());
      
      act(() => {
        result.current.updateLocale('invalid-locale');
      });
      
      expect(result.current.locale).toBe('ja');
    });

    test('空の文字列キーは空文字列を返す', () => {
      const { result } = renderHook(() => useLocale());
      
      expect(result.current.label('')).toBe('');
    });

    test('翻訳ファイルの読み込みエラー時のフォールバック', async () => {
      // 翻訳ファイルの読み込みをエラーにする
      jest.doMock('../../locales/fr.json', () => {
        throw new Error('File not found');
      }, { virtual: true });

      const { result } = renderHook(() => useLocale());
      
      act(() => {
        result.current.updateLocale('fr');
      });
      
      // ロケールは日本語にフォールバック
      expect(result.current.locale).toBe('ja');
    });

    test('label関数で非文字列値が返された場合はキーを返す', async () => {
      // 数値を含む翻訳データのモック
      jest.doMock('../../locales/test.json', () => ({
        default: {
          number: 123,
          object: { nested: 'value' }
        }
      }), { virtual: true });

      const { result } = renderHook(() => useLocale());
      
      // 翻訳データを数値を含むものに変更
      await act(async () => {
        result.current.updateLocale('test');
      });
      
      // 翻訳データの読み込みを待機
      await waitFor(() => {
        // 数値の場合はキーを返す
        expect(result.current.label('number')).toBe('number');
      });
    });

    test('ネストされたオブジェクトの中間パスへのアクセス', async () => {
      const { result } = renderHook(() => useLocale());
      
      await waitFor(() => {
        // 中間のオブジェクトパスはキーを返す
        expect(result.current.label('knowledge.list')).toBe('knowledge.list');
      });
    });
  });

  describe('翻訳ファイルの動的インポート', () => {
    test('console.warnが呼ばれる（存在しないロケール）', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // 存在しないロケールファイルをモック
      jest.doMock('../../locales/xx.json', () => {
        throw new Error('File not found');
      }, { virtual: true });

      const { result } = renderHook(() => useLocale());
      
      await act(async () => {
        result.current.updateLocale('xx');
      });
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to load translations for locale: ja');
      });
      
      consoleSpy.mockRestore();
    });

    test('日本語フォールバックも失敗した場合', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // 両方のファイルをエラーにする
      jest.doMock('../../locales/zz.json', () => {
        throw new Error('File not found');
      }, { virtual: true });
      
      // 日本語ファイルも一時的にエラーにする
      jest.resetModules();
      jest.doMock('../../locales/ja.json', () => {
        throw new Error('File not found');
      }, { virtual: true });

      const { useLocale: useLocaleNew } = require('../useLocale');
      const { result } = renderHook(() => useLocaleNew());
      
      await act(async () => {
        result.current.updateLocale('zz');
      });
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to load fallback translations');
      });
      
      // label関数は空オブジェクトからキーを返す
      expect(result.current.label('any.key')).toBe('any.key');
      
      consoleSpy.mockRestore();
    });
  });
});