/**
 * 共通ユーティリティ関数のテスト
 * 
 * @description common.tsの各関数のテストケース
 */
import { 
  setCookie, 
  getCookie, 
  deleteCookie,
  isDisplayTypeList,
  isDisplayTypeBox,
  unescapeHtml,
  escapeURL,
  insertAtCaret,
  notifyDesktop,
  notifyMessage,
  generateFileDownloadUrl
} from '../common';

// ブラウザAPIのモック
Object.defineProperty(window, 'location', {
  value: {
    protocol: 'http:',
    host: 'localhost:3000',
    pathname: '/',
  },
  writable: true,
});

Object.defineProperty(window.document, 'cookie', {
  writable: true,
  value: '',
});

describe('Cookie関連関数', () => {
  beforeEach(() => {
    // Cookieをクリア
    document.cookie = '';
  });

  describe('setCookie', () => {
    test('基本的なCookie設定', () => {
      setCookie('testCookie', 'testValue');
      expect(document.cookie).toContain('testCookie=testValue');
    });

    test('有効期限付きCookie設定', () => {
      setCookie('testCookie', 'testValue', 7);
      expect(document.cookie).toContain('testCookie=testValue');
      expect(document.cookie).toContain('expires=');
    });

    test('パス指定付きCookie設定', () => {
      setCookie('testCookie', 'testValue', undefined, '/custom/path');
      expect(document.cookie).toContain('testCookie=testValue');
    });

    test('グローバルコンテキスト付きCookie設定', () => {
      window._CONTEXT = '/app';
      setCookie('testCookie', 'testValue');
      expect(document.cookie).toContain('testCookie=testValue');
      delete window._CONTEXT;
    });

    test('日本語を含む値のエスケープ', () => {
      setCookie('testCookie', 'テスト値');
      expect(document.cookie).toContain('testCookie=%u30C6%u30B9%u30C8%u5024');
    });
  });

  describe('getCookie', () => {
    test('存在するCookieの取得', () => {
      document.cookie = 'testCookie=testValue';
      expect(getCookie('testCookie')).toBe('testValue');
    });

    test('存在しないCookieの取得', () => {
      expect(getCookie('nonExistent')).toBe('');
    });

    test('複数のCookieから特定のCookieを取得', () => {
      document.cookie = 'cookie1=value1; cookie2=value2; cookie3=value3';
      expect(getCookie('cookie2')).toBe('value2');
    });

    test('エスケープされた値のデコード', () => {
      document.cookie = 'testCookie=%u30C6%u30B9%u30C8%u5024';
      expect(getCookie('testCookie')).toBe('テスト値');
    });

    test('空文字のCookie', () => {
      document.cookie = 'emptyCookie=';
      expect(getCookie('emptyCookie')).toBe('');
    });
  });

  describe('deleteCookie', () => {
    test('Cookieの削除', () => {
      document.cookie = 'testCookie=testValue';
      deleteCookie('testCookie');
      expect(getCookie('testCookie')).toBe('');
    });

    test('パス指定付きCookieの削除', () => {
      setCookie('testCookie', 'testValue', undefined, '/custom/path');
      deleteCookie('testCookie', '/custom/path');
      expect(getCookie('testCookie')).toBe('');
    });

    test('存在しないCookieの削除（エラーなし）', () => {
      expect(() => {
        deleteCookie('nonExistent');
      }).not.toThrow();
    });
  });
});

describe('表示タイプ判定関数', () => {
  test('isDisplayTypeList - リスト表示の判定', () => {
    expect(isDisplayTypeList()).toBe(true); // デフォルト
    
    setCookie('displayType', 'list');
    expect(isDisplayTypeList()).toBe(true);
    
    setCookie('displayType', 'box');
    expect(isDisplayTypeList()).toBe(false);
    
    deleteCookie('displayType');
  });

  test('isDisplayTypeBox - ボックス表示の判定', () => {
    expect(isDisplayTypeBox()).toBe(false); // デフォルト
    
    setCookie('displayType', 'box');
    expect(isDisplayTypeBox()).toBe(true);
    
    setCookie('displayType', 'list');
    expect(isDisplayTypeBox()).toBe(false);
    
    deleteCookie('displayType');
  });
});

describe('HTML/URL処理関数', () => {
  describe('unescapeHtml', () => {
    test('基本的なHTMLエンティティのアンエスケープ', () => {
      expect(unescapeHtml('&lt;div&gt;')).toBe('<div>');
      expect(unescapeHtml('&amp;')).toBe('&');
      expect(unescapeHtml('&quot;')).toBe('"');
      expect(unescapeHtml('&#39;')).toBe("'");
    });

    test('複数のエンティティを含む文字列', () => {
      expect(unescapeHtml('&lt;p&gt;Hello &amp; &quot;World&quot;&lt;/p&gt;')).toBe('<p>Hello & "World"</p>');
    });

    test('エンティティがない場合', () => {
      expect(unescapeHtml('Hello World')).toBe('Hello World');
    });

    test('空文字列', () => {
      expect(unescapeHtml('')).toBe('');
    });
  });

  describe('escapeURL', () => {
    test('基本的なURLのエスケープ', () => {
      expect(escapeURL('http://example.com?param=value&other=test')).toBe('http://example.com?param=value&amp;other=test');
    });

    test('複数の&を含むURL', () => {
      expect(escapeURL('a=1&b=2&c=3')).toBe('a=1&amp;b=2&amp;c=3');
    });

    test('既にエスケープされている場合', () => {
      expect(escapeURL('a=1&amp;b=2')).toBe('a=1&amp;b=2');
    });

    test('&がない場合', () => {
      expect(escapeURL('http://example.com')).toBe('http://example.com');
    });
  });
});

describe('DOM操作関数', () => {
  describe('insertAtCaret', () => {
    let textarea: HTMLTextAreaElement;

    beforeEach(() => {
      textarea = document.createElement('textarea');
      textarea.id = 'testTextarea';
      textarea.value = 'Hello World';
      document.body.appendChild(textarea);
    });

    afterEach(() => {
      document.body.removeChild(textarea);
    });

    test('カーソル位置に文字列を挿入', () => {
      textarea.setSelectionRange(5, 5);
      insertAtCaret('testTextarea', ' Beautiful');
      expect(textarea.value).toBe('Hello Beautiful World');
    });

    test('選択範囲を置換', () => {
      textarea.setSelectionRange(6, 11);
      insertAtCaret('testTextarea', 'Universe');
      expect(textarea.value).toBe('Hello Universe');
    });

    test('存在しない要素IDの場合', () => {
      expect(() => {
        insertAtCaret('nonExistent', 'test');
      }).not.toThrow();
    });

    test('textarea以外の要素の場合', () => {
      const div = document.createElement('div');
      div.id = 'testDiv';
      document.body.appendChild(div);
      
      expect(() => {
        insertAtCaret('testDiv', 'test');
      }).not.toThrow();
      
      document.body.removeChild(div);
    });
  });
});

describe('通知関数', () => {
  describe('notifyDesktop', () => {
    let originalNotification: any;

    beforeEach(() => {
      originalNotification = window.Notification;
      window._LOGGING_NOTIFY_DESKTOP = true;
    });

    afterEach(() => {
      window.Notification = originalNotification;
      delete window._LOGGING_NOTIFY_DESKTOP;
    });

    test('通知権限が許可されている場合', () => {
      const mockNotification = jest.fn();
      window.Notification = mockNotification as any;
      window.Notification.permission = 'granted';

      notifyDesktop('Test Message');

      expect(mockNotification).toHaveBeenCalledWith('Notification', {
        body: 'Test Message',
        tag: 'notification-knowledge',
        icon: '/img/icon.png',
      });
    });

    test('通知権限がない場合', () => {
      const mockNotification = jest.fn();
      const mockRequestPermission = jest.fn().mockResolvedValue('granted');
      window.Notification = mockNotification as any;
      window.Notification.permission = 'default';
      window.Notification.requestPermission = mockRequestPermission;

      notifyDesktop('Test Message');

      expect(mockRequestPermission).toHaveBeenCalled();
    });

    test('通知が無効の場合', () => {
      window._LOGGING_NOTIFY_DESKTOP = false;
      const mockNotification = jest.fn();
      window.Notification = mockNotification as any;

      notifyDesktop('Test Message');

      expect(mockNotification).not.toHaveBeenCalled();
    });

    test('Notification APIが存在しない場合', () => {
      delete (window as any).Notification;
      
      expect(() => {
        notifyDesktop('Test Message');
      }).not.toThrow();
    });
  });

  describe('notifyMessage', () => {
    let mockNotify: jest.Mock;

    beforeEach(() => {
      mockNotify = jest.fn();
      window.$ = {
        notify: mockNotify,
      };
    });

    afterEach(() => {
      delete window.$;
    });

    test('通常メッセージの表示', () => {
      notifyMessage('Test Message');
      expect(mockNotify).toHaveBeenCalledWith('Test Message', 'success');
    });

    test('エラーメッセージの表示', () => {
      notifyMessage('Error Message', 'error');
      expect(mockNotify).toHaveBeenCalledWith('Error Message', 'error');
    });

    test('jQueryが存在しない場合', () => {
      delete window.$;
      
      expect(() => {
        notifyMessage('Test Message');
      }).not.toThrow();
    });
  });
});

describe('ファイルダウンロードURL生成', () => {
  beforeEach(() => {
    window.location = {
      protocol: 'https:',
      host: 'example.com',
      pathname: '/',
    } as any;
  });

  test('基本的なダウンロードURL生成', () => {
    const url = generateFileDownloadUrl(123);
    expect(url).toBe('https://example.com/files/download/123');
  });

  test('ファイル名付きURL生成', () => {
    const url = generateFileDownloadUrl(123, 'test.pdf');
    expect(url).toBe('https://example.com/files/download/123/test.pdf');
  });

  test('特殊文字を含むファイル名', () => {
    const url = generateFileDownloadUrl(123, 'test file (2024).pdf');
    expect(url).toBe('https://example.com/files/download/123/test%20file%20(2024).pdf');
  });

  test('コンテキストパス付きの場合', () => {
    window._CONTEXT = '/app';
    const url = generateFileDownloadUrl(123);
    expect(url).toBe('https://example.com/app/files/download/123');
    delete window._CONTEXT;
  });

  test('HTTPプロトコルの場合', () => {
    window.location.protocol = 'http:';
    const url = generateFileDownloadUrl(123);
    expect(url).toBe('http://example.com/files/download/123');
  });
});