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
  });
});