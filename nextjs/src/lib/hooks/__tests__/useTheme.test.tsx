/**
 * useThemeフックのテスト
 * 
 * @description テーマとハイライト設定管理フックの包括的なテスト
 */

import { renderHook, act } from '@testing-library/react';
import { useTheme, availableThemes, availableHighlightThemes } from '../useTheme';

// localStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// documentのモック
const createMockElement = (id: string) => ({
  id,
  href: '',
});

describe('useTheme', () => {
  let mockThemeElement: ReturnType<typeof createMockElement>;
  let mockHighlightElement: ReturnType<typeof createMockElement>;

  beforeEach(() => {
    // localStorageのモックを設定
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
    jest.clearAllMocks();

    // DOM要素のモック
    mockThemeElement = createMockElement('theme-css');
    mockHighlightElement = createMockElement('highlight-css');
    
    jest.spyOn(document, 'getElementById').mockImplementation((id: string) => {
      if (id === 'theme-css') return mockThemeElement as unknown as HTMLElement;
      if (id === 'highlight-css') return mockHighlightElement as unknown as HTMLElement;
      return null;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('初期化', () => {
    test('デフォルト値でテーマが初期化される', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('flatly');
      expect(result.current.highlightTheme).toBe('darkula');
    });

    test('保存されたテーマ設定を読み込む', () => {
      localStorageMock.setItem('knowledge_theme', 'darkly');
      localStorageMock.setItem('knowledge_highlight', 'monokai');

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('darkly');
      expect(result.current.highlightTheme).toBe('monokai');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('knowledge_theme');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('knowledge_highlight');
    });

    test('利用可能なテーマリストを返す', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.availableThemes).toEqual(availableThemes);
      expect(result.current.availableHighlightThemes).toEqual(availableHighlightThemes);
    });
  });

  describe('テーマ更新', () => {
    test('テーマを更新してlocalStorageに保存する', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.updateTheme('cyborg');
      });

      expect(result.current.theme).toBe('cyborg');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('knowledge_theme', 'cyborg');
    });

    test('テーマ更新時にCSSリンクを変更する', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.updateTheme('slate');
      });

      expect(mockThemeElement.href).toBe('/css/themes/slate.css');
    });

    test('テーマCSS要素が存在しない場合もエラーにならない', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null);
      const { result } = renderHook(() => useTheme());

      expect(() => {
        act(() => {
          result.current.updateTheme('slate');
        });
      }).not.toThrow();

      expect(result.current.theme).toBe('slate');
    });
  });

  describe('ハイライトテーマ更新', () => {
    test('ハイライトテーマを更新してlocalStorageに保存する', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.updateHighlightTheme('github');
      });

      expect(result.current.highlightTheme).toBe('github');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('knowledge_highlight', 'github');
    });

    test('ハイライトテーマ更新時にCSSリンクを変更する', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.updateHighlightTheme('vs');
      });

      expect(mockHighlightElement.href).toBe('/css/highlight/vs.css');
    });

    test('ハイライトCSS要素が存在しない場合もエラーにならない', () => {
      jest.spyOn(document, 'getElementById').mockImplementation((id: string) => {
        if (id === 'theme-css') return mockThemeElement as unknown as HTMLElement;
        return null;
      });
      
      const { result } = renderHook(() => useTheme());

      expect(() => {
        act(() => {
          result.current.updateHighlightTheme('vs');
        });
      }).not.toThrow();

      expect(result.current.highlightTheme).toBe('vs');
    });
  });

  describe('複数回の更新', () => {
    test('連続して異なるテーマに更新できる', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.updateTheme('darkly');
      });
      expect(result.current.theme).toBe('darkly');
      expect(mockThemeElement.href).toBe('/css/themes/darkly.css');

      act(() => {
        result.current.updateTheme('lumen');
      });
      expect(result.current.theme).toBe('lumen');
      expect(mockThemeElement.href).toBe('/css/themes/lumen.css');

      act(() => {
        result.current.updateHighlightTheme('atom-one-dark');
      });
      expect(result.current.highlightTheme).toBe('atom-one-dark');
      expect(mockHighlightElement.href).toBe('/css/highlight/atom-one-dark.css');
    });
  });

  describe('エッジケース', () => {
    test('空のテーマ名を設定できる', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.updateTheme('');
      });

      expect(result.current.theme).toBe('');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('knowledge_theme', '');
    });

    test('利用可能なテーマの定数が正しく設定されている', () => {
      expect(availableThemes).toHaveLength(17);
      expect(availableThemes[0]).toEqual({ name: 'flatly', displayName: 'Flatly' });
      expect(availableHighlightThemes).toHaveLength(6);
      expect(availableHighlightThemes[0]).toEqual({ name: 'darkula', displayName: 'Darkula' });
    });
  });
});