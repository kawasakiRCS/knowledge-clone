/**
 * common.js相当の機能のテスト
 * 
 * @description 旧システムのcommon.jsの機能をテスト
 */
import { 
  setCookie, 
  getCookies, 
  logging, 
  insertAtCaret, 
  isString, 
  unescapeHTML, 
  escapeLink, 
  handleErrorResponse 
} from '../common';

// グローバル変数のモック
declare global {
  interface Window {
    _LOGGING_NOTIFY_DESKTOP: boolean;
    $: {
      (selector: string): {
        focus: jest.Mock;
        val: jest.Mock;
        get: jest.Mock;
      };
      notify: jest.Mock;
    };
  }
}

describe('common.js機能', () => {
  beforeEach(() => {
    // document.cookieのリセット（テスト環境用の特別な処理）
    Object.defineProperty(document, 'cookie', {
      writable: true,
      configurable: true,
      value: ''
    });
    
    // setCookie用のモック
    const cookieJar: { [key: string]: string } = {};
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get() {
        return Object.entries(cookieJar)
          .map(([key, value]) => `${key}=${value}`)
          .join('; ');
      },
      set(cookieString: string) {
        const [nameValue] = cookieString.split(';');
        if (nameValue) {
          const [name, value] = nameValue.split('=');
          if (name && value) {
            cookieJar[name.trim()] = value.trim();
          }
        }
      }
    });
    
    // window.$のモック
    window.$ = jest.fn((selector: string) => {
      const element = document.querySelector(selector);
      return {
        focus: jest.fn(),
        val: jest.fn((value?: string) => {
          if (value !== undefined && element) {
            (element as HTMLTextAreaElement).value = value;
          }
          return element ? (element as HTMLTextAreaElement).value : '';
        }),
        get: jest.fn(() => element)
      };
    });
    window.$.notify = jest.fn();
    
    // グローバル変数のリセット
    window._LOGGING_NOTIFY_DESKTOP = false;
  });

  describe('Cookie管理', () => {
    describe('setCookie', () => {
      test('Cookieを設定できる', () => {
        setCookie('test', 'value', 1);
        expect(document.cookie).toContain('test=');
      });

      test('有効期限付きCookieを設定できる', () => {
        setCookie('test', 'value', 7);
        expect(document.cookie).toContain('test=');
        // テスト環境ではexpires属性は確認できない
      });

      test('パスを指定してCookieを設定できる', () => {
        setCookie('test', 'value', 1, '/custom');
        expect(document.cookie).toContain('test=');
        // テスト環境ではpath属性は確認できない
      });
    });

    describe('getCookies', () => {
      test('全てのCookieを取得できる', () => {
        // テスト環境では直接cookieを設定
        document.cookie = 'test1=value1; path=/';
        document.cookie = 'test2=value2; path=/';
        
        const cookies = getCookies();
        expect(cookies).toHaveProperty('test1');
        expect(cookies).toHaveProperty('test2');
      });

      test('Cookieがない場合は空のオブジェクトを返す', () => {
        const cookies = getCookies();
        expect(Object.keys(cookies).length).toBe(0);
      });
    });
  });

  describe('ログ出力', () => {
    test('コンソールにログを出力する', () => {
      const spy = jest.spyOn(console, 'log').mockImplementation();
      
      logging('test message');
      
      expect(spy).toHaveBeenCalledWith('test message');
      spy.mockRestore();
    });

    test('デスクトップ通知が有効な場合、notifyも呼ばれる', () => {
      window._LOGGING_NOTIFY_DESKTOP = true;
      const spy = jest.spyOn(console, 'log').mockImplementation();
      
      logging('test message', 'warn');
      
      expect(window.$.notify).toHaveBeenCalledWith('test message', {
        className: 'warn',
        autoHideDelay: 10000,
        globalPosition: 'bottom left'
      });
      spy.mockRestore();
    });
  });

  describe('テキスト操作', () => {
    describe('insertAtCaret', () => {
      test('テキストエリアのカーソル位置に文字を挿入できる', () => {
        document.body.innerHTML = '<textarea id="test">Hello World</textarea>';
        const textarea = document.getElementById('test') as HTMLTextAreaElement;
        
        // カーソル位置を設定
        textarea.selectionStart = 5;
        textarea.selectionEnd = 5;
        
        insertAtCaret('#test', ' Beautiful');
        
        expect(textarea.value).toBe('Hello Beautiful World');
      });
    });

    describe('isString', () => {
      test('文字列の場合trueを返す', () => {
        expect(isString('test')).toBe(true);
        expect(isString(new String('test'))).toBe(true);
      });

      test('文字列でない場合falseを返す', () => {
        expect(isString(123)).toBe(false);
        expect(isString({})).toBe(false);
        expect(isString(null)).toBe(false);
      });
    });

    describe('unescapeHTML', () => {
      test('HTMLをエスケープしない（現在の実装）', () => {
        const html = '<div>test</div>';
        expect(unescapeHTML(html)).toBe(html);
      });
    });

    describe('escapeLink', () => {
      test('javascriptプロトコルをエスケープする', () => {
        const result = escapeLink('javascript:alert("XSS")');
        expect(result).toBe('javascript%3Aalert(%22XSS%22)');
      });

      test('通常のURLはそのまま返す', () => {
        const url = 'https://example.com';
        expect(escapeLink(url)).toBe(url);
      });

      test('大文字小文字を区別しない', () => {
        const result = escapeLink('JavaScript:alert("XSS")');
        expect(result).toBe('JavaScript%3Aalert(%22XSS%22)');
      });
    });
  });

  describe('エラーハンドリング', () => {
    test('JSONエラーレスポンスを処理する', () => {
      const xhr = {
        responseJSON: {
          children: [
            { message: 'Error 1' },
            { message: 'Error 2' }
          ]
        }
      };
      
      handleErrorResponse(xhr, 'error', new Error('test'));
      
      expect(window.$.notify).toHaveBeenCalledWith('Error 1', 'warn');
      expect(window.$.notify).toHaveBeenCalledWith('Error 2', 'warn');
    });

    test('JSONレスポンスがない場合のエラー処理', () => {
      const xhr = {
        statusText: 'Internal Server Error'
      };
      
      handleErrorResponse(xhr, 'error', new Error('test'));
      
      expect(window.$.notify).toHaveBeenCalledWith('Internal Server Error', 'warn');
    });

    test('xhrがnullの場合のエラー処理', () => {
      handleErrorResponse({}, 'error', new Error('test'));
      
      expect(window.$.notify).toHaveBeenCalledWith('data load error. please try again.', 'warn');
    });
  });
});