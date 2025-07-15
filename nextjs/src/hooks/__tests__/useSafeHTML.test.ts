/**
 * useSafeHTMLフックのテスト
 * 
 * @description HTMLサニタイズ機能のテスト
 */
import { renderHook } from '@testing-library/react';
import { useSafeHTML, useSafeHTMLProps } from '../useSafeHTML';

describe('useSafeHTML', () => {
  describe('基本的なサニタイズ', () => {
    test('通常のテキストはそのまま返される', () => {
      const { result } = renderHook(() => useSafeHTML('Hello World'));
      expect(result.current).toBe('Hello World');
    });

    test('空文字列は空文字列を返す', () => {
      const { result } = renderHook(() => useSafeHTML(''));
      expect(result.current).toBe('');
    });

    test('基本的なHTMLタグが適切にエスケープされる', () => {
      const { result } = renderHook(() => useSafeHTML('<p>Hello</p>'));
      // テスト環境では基本的なエスケープのみ実行
      expect(result.current).toBe('&lt;p&gt;Hello&lt;/p&gt;');
    });

    test('危険なscriptタグがエスケープされる', () => {
      const { result } = renderHook(() => useSafeHTML('<script>alert("XSS")</script>'));
      expect(result.current).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });

    test('イベントハンドラーがエスケープされる', () => {
      const { result } = renderHook(() => useSafeHTML('<div onclick="alert(1)">Click me</div>'));
      expect(result.current).toBe('&lt;div onclick=&quot;alert(1)&quot;&gt;Click me&lt;/div&gt;');
    });
  });

  describe('特殊文字のエスケープ', () => {
    test('アンパサンドが適切にエスケープされる', () => {
      const { result } = renderHook(() => useSafeHTML('A & B'));
      expect(result.current).toBe('A &amp; B');
    });

    test('クォートが適切にエスケープされる', () => {
      const { result } = renderHook(() => useSafeHTML('"Hello" and \'World\''));
      expect(result.current).toBe('&quot;Hello&quot; and &#x27;World&#x27;');
    });

    test('不等号が適切にエスケープされる', () => {
      const { result } = renderHook(() => useSafeHTML('1 < 2 > 0'));
      expect(result.current).toBe('1 &lt; 2 &gt; 0');
    });
  });

  describe('useSafeHTMLProps', () => {
    test('dangerouslySetInnerHTML用のpropsが生成される', () => {
      const { result } = renderHook(() => useSafeHTMLProps('<p>Hello</p>'));
      expect(result.current).toEqual({
        __html: '&lt;p&gt;Hello&lt;/p&gt;'
      });
    });

    test('空文字列の場合も適切に処理される', () => {
      const { result } = renderHook(() => useSafeHTMLProps(''));
      expect(result.current).toEqual({
        __html: ''
      });
    });
  });

  describe('メモ化', () => {
    test('同じ入力に対して同じ結果が返される', () => {
      const { result, rerender } = renderHook(
        (props) => useSafeHTML(props.html),
        { initialProps: { html: '<p>Test</p>' } }
      );
      
      const firstResult = result.current;
      
      // 同じ入力で再レンダリング
      rerender({ html: '<p>Test</p>' });
      
      expect(result.current).toBe(firstResult);
    });

    test('異なる入力に対して異なる結果が返される', () => {
      const { result, rerender } = renderHook(
        (props) => useSafeHTML(props.html),
        { initialProps: { html: '<p>Test1</p>' } }
      );
      
      const firstResult = result.current;
      
      // 異なる入力で再レンダリング
      rerender({ html: '<p>Test2</p>' });
      
      expect(result.current).not.toBe(firstResult);
    });
  });
});