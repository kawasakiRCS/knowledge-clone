/**
 * 安全なHTMLレンダリングのためのカスタムフック
 * 
 * @description DOMPurifyを使用してHTMLをサニタイズし、XSS攻撃を防ぐ
 */
import { useMemo } from 'react';

// DOMPurifyの条件付きインポート（テスト環境対応）
let DOMPurify: any = null;

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
  try {
    DOMPurify = require('dompurify');
  } catch (error) {
    console.warn('Failed to load DOMPurify:', error);
  }
}

/**
 * HTMLをサニタイズして安全な形で返す
 * 
 * @param html サニタイズするHTML文字列
 * @returns サニタイズされたHTML文字列
 */
export function useSafeHTML(html: string): string {
  return useMemo(() => {
    if (!html) return '';
    
    // テスト環境またはDOMPurifyが利用できない場合は、基本的なエスケープのみ
    if (!DOMPurify || process.env.NODE_ENV === 'test') {
      return html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    }
    
    // DOMPurifyを使用してサニタイズ
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'i', 'b', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id'],
      ALLOW_DATA_ATTR: false,
      FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input', 'button'],
      FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'],
    });
  }, [html]);
}

/**
 * 安全なHTMLレンダリング用のpropsを生成
 * 
 * @param html レンダリングするHTML文字列
 * @returns dangerouslySetInnerHTML用のprops
 */
export function useSafeHTMLProps(html: string): { __html: string } {
  const safeHTML = useSafeHTML(html);
  return { __html: safeHTML };
}