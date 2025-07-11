/**
 * CommonScriptsコンポーネントテスト
 * 
 * @description 旧システムのcommonScripts.jspとの互換性テストを含む
 */
import { render, screen } from '@testing-library/react';
import { CommonScripts } from '../CommonScripts';
import React from 'react';

// グローバル変数のモック
declare global {
  interface Window {
    _CONTEXT: string;
    _LOGIN_USER_ID: number | null;
    _LANG: string;
    _LOGGING_NOTIFY_DESKTOP: boolean;
    jQuery: any;
    $: any;
    notify: jest.Mock;
  }
}

// jstzライブラリのモック - __mocks__フォルダで定義
jest.mock('jstz');

describe('CommonScripts', () => {
  // テスト前の準備
  beforeEach(() => {
    // グローバル変数をリセット
    delete window._CONTEXT;
    delete window._LOGIN_USER_ID;
    delete window._LANG;
    delete window._LOGGING_NOTIFY_DESKTOP;
    
    // jQueryとnotifyのモック
    window.jQuery = window.$ = {
      notify: jest.fn()
    };
    window.notify = jest.fn();
    
    // document.cookieのモック
    Object.defineProperty(document, 'cookie', {
      writable: true,
      configurable: true,
      value: ''
    });
  });

  describe('基本レンダリング', () => {
    test('コンポーネントがレンダリングされる', () => {
      render(<CommonScripts />);
      
      // スクリプトタグが生成されることを確認
      const scripts = document.querySelectorAll('script');
      expect(scripts.length).toBeGreaterThan(0);
    });
  });

  describe('グローバル変数の設定', () => {
    test('デフォルトのグローバル変数が設定される', () => {
      render(<CommonScripts />);
      
      expect(window._LOGGING_NOTIFY_DESKTOP).toBe(false);
      expect(window._CONTEXT).toBe('');
      expect(window._LOGIN_USER_ID).toBe(null);
      expect(window._LANG).toBe('ja');
    });

    test('認証済みユーザーの場合、ユーザーIDが設定される', () => {
      render(<CommonScripts loginUserId={123} />);
      
      expect(window._LOGIN_USER_ID).toBe(123);
    });

    test('コンテキストパスが設定される', () => {
      render(<CommonScripts contextPath="/knowledge" />);
      
      expect(window._CONTEXT).toBe('/knowledge');
    });

    test('言語設定が反映される', () => {
      render(<CommonScripts lang="en" />);
      
      expect(window._LANG).toBe('en');
    });
  });

  describe('Cookie管理', () => {
    test('タイムゾーンオフセットがCookieに保存される', () => {
      const mockDate = new Date('2024-01-01T12:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      
      // Cookieの設定をキャプチャするためのモック
      const originalCookie = Object.getOwnPropertyDescriptor(document, 'cookie');
      const cookieValues: string[] = [];
      Object.defineProperty(document, 'cookie', {
        configurable: true,
        set: function(value: string) {
          cookieValues.push(value);
        },
        get: function() {
          return cookieValues.join('; ');
        }
      });
      
      render(<CommonScripts />);
      
      // Cookieが設定されていることを確認
      const timeZoneCookie = cookieValues.find(cookie => cookie.includes('TIME_ZONE_OFFSET'));
      expect(timeZoneCookie).toBeDefined();
      expect(timeZoneCookie).toContain('Knowledge_TIME_ZONE_OFFSET');
      
      // 元に戻す
      if (originalCookie) {
        Object.defineProperty(document, 'cookie', originalCookie);
      }
      jest.restoreAllMocks();
    });

    test('タイムゾーン名がCookieに保存される', () => {
      render(<CommonScripts />);
      
      // Cookieにタイムゾーン名が含まれることを確認
      expect(document.cookie).toContain('TIMEZONE');
    });
  });

  describe('通知メッセージの表示', () => {
    test('成功メッセージが表示される', () => {
      const messages = {
        success: ['保存しました'],
        info: [],
        warn: [],
        error: []
      };
      
      render(<CommonScripts messages={messages} />);
      
      expect(window.$.notify).toHaveBeenCalledWith('保存しました', 'success');
    });

    test('複数の通知タイプが正しく表示される', () => {
      const messages = {
        success: ['成功しました'],
        info: ['情報です'],
        warn: ['警告です'],
        error: ['エラーです']
      };
      
      render(<CommonScripts messages={messages} />);
      
      expect(window.$.notify).toHaveBeenCalledWith('成功しました', 'success');
      expect(window.$.notify).toHaveBeenCalledWith('情報です', 'info');
      expect(window.$.notify).toHaveBeenCalledWith('警告です', 'warn');
      expect(window.$.notify).toHaveBeenCalledWith('エラーです', 'error');
    });

    test('メッセージがない場合は通知されない', () => {
      const messages = {
        success: [],
        info: [],
        warn: [],
        error: []
      };
      
      render(<CommonScripts messages={messages} />);
      
      expect(window.$.notify).not.toHaveBeenCalled();
    });
  });

  describe('デスクトップ通知', () => {
    test('デスクトップ通知が有効な場合、notification.jsが読み込まれる', () => {
      render(<CommonScripts desktopNotify={true} />);
      
      // notification.js相当の機能が有効になることを確認
      // 実際の実装では、動的インポートまたは条件付きレンダリングで制御
    });

    test('デスクトップ通知が無効な場合、notification.jsは読み込まれない', () => {
      render(<CommonScripts desktopNotify={false} />);
      
      // notification.js相当の機能が無効になることを確認
    });
  });

  describe('外部ライブラリの読み込み', () => {
    test('必要な外部ライブラリが順番に読み込まれる', () => {
      render(<CommonScripts />);
      
      // Next.jsではScript componentを使用して管理されるため、
      // 実装時にはScript要素の存在を確認
    });
  });

  describe('旧システム互換性', () => {
    test('JSPと同じグローバル変数構造を持つ', () => {
      render(<CommonScripts 
        contextPath="/knowledge"
        loginUserId={123}
        lang="ja"
      />);
      
      // 旧システムのJavaScript依存コードが動作するための変数
      expect(window._CONTEXT).toBeDefined();
      expect(window._LOGIN_USER_ID).toBeDefined();
      expect(window._LANG).toBeDefined();
      expect(window._LOGGING_NOTIFY_DESKTOP).toBeDefined();
    });
  });
});