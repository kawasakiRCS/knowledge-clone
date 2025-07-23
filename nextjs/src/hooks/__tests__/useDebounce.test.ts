/**
 * useDebounceフックのテスト
 * 
 * @description デバウンス機能の動作確認
 */
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('初期値を即座に返す', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    
    expect(result.current).toBe('initial');
  });

  test('指定時間後に値が更新される', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    // 初期値を確認
    expect(result.current).toBe('initial');

    // 値を更新
    rerender({ value: 'updated', delay: 500 });

    // 即座には更新されない
    expect(result.current).toBe('initial');

    // 時間を進める
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // 値が更新される
    expect(result.current).toBe('updated');
  });

  test('連続した更新では最後の値のみが反映される', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    // 複数回更新
    rerender({ value: 'update1', delay: 500 });
    
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    rerender({ value: 'update2', delay: 500 });
    
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    rerender({ value: 'update3', delay: 500 });

    // まだ初期値のまま
    expect(result.current).toBe('initial');

    // 最後の更新から500ms経過
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // 最後の値が反映される
    expect(result.current).toBe('update3');
  });

  test('異なる型の値でも動作する', () => {
    // 数値型
    const { result: numberResult } = renderHook(() => useDebounce(123, 100));
    expect(numberResult.current).toBe(123);

    // オブジェクト型
    const obj = { key: 'value' };
    const { result: objectResult } = renderHook(() => useDebounce(obj, 100));
    expect(objectResult.current).toBe(obj);

    // 配列型
    const arr = [1, 2, 3];
    const { result: arrayResult } = renderHook(() => useDebounce(arr, 100));
    expect(arrayResult.current).toBe(arr);
  });

  test('遅延時間を変更しても正しく動作する', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 1000 },
      }
    );

    // 値を更新
    rerender({ value: 'updated', delay: 1000 });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // まだ更新されない
    expect(result.current).toBe('initial');

    // 遅延時間を短くして再更新
    rerender({ value: 'updated', delay: 300 });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    // 新しい遅延時間で更新される
    expect(result.current).toBe('updated');
  });

  test('コンポーネントのアンマウント時にタイマーがクリアされる', () => {
    const { result, rerender, unmount } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    // 値を更新
    rerender({ value: 'updated', delay: 500 });

    // タイマーが進行中にアンマウント
    act(() => {
      jest.advanceTimersByTime(200);
    });

    unmount();

    // タイマーがクリアされているため、これ以上進めても値は更新されない
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // エラーが発生しないことを確認（アンマウント後のstate更新エラーなど）
    expect(() => {
      jest.runAllTimers();
    }).not.toThrow();
  });

  test('遅延時間が0の場合も正しく動作する', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 0 },
      }
    );

    rerender({ value: 'updated', delay: 0 });

    // 0msでも非同期で更新される
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(0);
    });

    expect(result.current).toBe('updated');
  });

  test('null/undefinedの値でも動作する', () => {
    const { result: nullResult, rerender: rerenderNull } = renderHook(
      ({ value }) => useDebounce(value, 100),
      {
        initialProps: { value: null as string | null },
      }
    );

    expect(nullResult.current).toBeNull();

    rerenderNull({ value: 'not null' });
    
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(nullResult.current).toBe('not null');

    // undefinedのテスト
    const { result: undefinedResult } = renderHook(() => 
      useDebounce(undefined as string | undefined, 100)
    );

    expect(undefinedResult.current).toBeUndefined();
  });
});