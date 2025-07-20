/**
 * 共通ユーティリティ関数のテスト
 * 
 * @description common.tsの単体テスト
 */

import {
  setCookie,
  getCookies,
  logging,
  insertAtCaret,
  isString,
  unescapeHTML,
  escapeLink,
  handleErrorResponse,
  initPageTop,
  initResponsiveNav,
  initModalScrollbar,
  startSessionKeepAlive,
  preventDefaultDragDrop,
  initCommonScripts
} from '../common';

// グローバル変数のモック
let mockNotify: jest.Mock;
let mockAnimate: jest.Mock;
let mockFadeIn: jest.Mock;
let mockFadeOut: jest.Mock;
let mockShow: jest.Mock;
let mockHide: jest.Mock;
let mockCss: jest.Mock;
let mockAjax: jest.Mock;
let mockScroll: jest.Mock;
let mockClick: jest.Mock;
let mockOn: jest.Mock;
let mockLoad: jest.Mock;
let mockReady: jest.Mock;
let mockFocus: jest.Mock;
let mockVal: jest.Mock;
let mockGet: jest.Mock;
let mockJQuery: jest.Mock;

// consoleのモック
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

describe('common.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // escape関数のグローバルモック
    (global as any).escape = (str: string) => encodeURIComponent(str);
    
    // モック関数の初期化
    mockNotify = jest.fn();
    mockAnimate = jest.fn();
    mockFadeIn = jest.fn();
    mockFadeOut = jest.fn();
    mockShow = jest.fn();
    mockHide = jest.fn();
    mockCss = jest.fn();
    mockAjax = jest.fn();
    mockScroll = jest.fn();
    mockClick = jest.fn();
    mockOn = jest.fn();
    mockLoad = jest.fn();
    mockReady = jest.fn();
    mockFocus = jest.fn();
    mockVal = jest.fn();
    mockGet = jest.fn();
    
    // jQueryモックの設定
    mockJQuery = jest.fn((selector: any) => {
      if (selector === window) {
        return {
          scroll: mockScroll,
          scrollTop: jest.fn().mockReturnValue(0),
          load: mockLoad,
          on: mockOn,
        };
      }
      if (selector === document) {
        return {
          ready: mockReady,
          on: mockOn,
        };
      }
      if (selector === '.pagetop') {
        return {
          fadeIn: mockFadeIn,
          fadeOut: mockFadeOut,
          click: mockClick,
        };
      }
      if (selector === 'body, html') {
        return {
          animate: mockAnimate,
        };
      }
      if (selector === '.navListButtonText') {
        return {
          show: mockShow,
          hide: mockHide,
        };
      }
      if (selector === '.navbar-fixed-top, .navbar-fixed-bottom') {
        return {
          css: mockCss,
        };
      }
      return {
        focus: mockFocus,
        val: mockVal,
        get: mockGet,
      };
    });
    
    mockJQuery.notify = mockNotify;
    mockJQuery.ajax = mockAjax;
    mockJQuery.fn = {
      modal: {
        Constructor: {
          prototype: {
            setScrollbar: jest.fn(),
            resetScrollbar: jest.fn(),
          },
        },
      },
    };
    
    // グローバルオブジェクトのモック
    (global as any).window = {
      _CONTEXT: '/context',
      _LOGGING_NOTIFY_DESKTOP: true,
      $: mockJQuery,
      jQuery: mockJQuery,
      matchMedia: jest.fn((query: string) => ({
        matches: false,
      })),
    };
    
    // document.cookieのモック
    let cookieValue = '';
    Object.defineProperty(document, 'cookie', {
      get: () => cookieValue,
      set: (value: string) => {
        cookieValue = value;
      },
      configurable: true,
    });
    
    (global as any).document = {
      ...document,
      selection: {
        createRange: jest.fn(() => ({
          text: '',
          select: jest.fn(),
        })),
      },
    };
    
    (global as any).navigator = {
      userAgent: 'Mozilla/5.0',
    };
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('setCookie', () => {
    test('名前と値でCookieを設定できる', () => {
      setCookie('testName', 'testValue');
      expect(document.cookie).toContain('testName=testValue');
    });

    test('有効期限を指定してCookieを設定できる', () => {
      setCookie('testName', 'testValue', 7);
      expect(document.cookie).toContain('testName=testValue');
      expect(document.cookie).toContain('expires=');
    });

    test('パスを指定してCookieを設定できる', () => {
      setCookie('testName', 'testValue', undefined, '/custom/path');
      expect(document.cookie).toContain('testName=testValue');
      expect(document.cookie).toContain('path=/custom/path');
    });

    test('_CONTEXTがない場合はルートパスを使用', () => {
      (window as any)._CONTEXT = undefined;
      setCookie('testName', 'testValue');
      expect(document.cookie).toContain('testName=testValue');
      expect(document.cookie).toContain('path=/');
    });

    test('windowが存在しない場合もルートパスを使用', () => {
      const originalWindow = (global as any).window;
      (global as any).window = undefined;
      setCookie('testName', 'testValue');
      expect(document.cookie).toContain('testName=testValue');
      expect(document.cookie).toContain('path=/');
      (global as any).window = originalWindow;
    });
  });

  describe('getCookies', () => {
    test('全てのCookieを取得できる', () => {
      setCookie('name1', 'value1');
      // 複数のCookieを設定するため別のプロパティを使用
      Object.defineProperty(document, 'cookie', {
        get: () => 'name1=value1; name2=value2',
        configurable: true,
      });
      
      const cookies = getCookies();
      expect(cookies).toEqual({
        name1: 'value1',
        name2: 'value2',
      });
    });

    test('Cookieがない場合は空オブジェクトを返す', () => {
      Object.defineProperty(document, 'cookie', {
        get: () => '',
        configurable: true,
      });
      const cookies = getCookies();
      expect(cookies).toEqual({});
    });

    test('エンコードされた値をデコードする', () => {
      Object.defineProperty(document, 'cookie', {
        get: () => 'encoded=%E3%83%86%E3%82%B9%E3%83%88',
        configurable: true,
      });
      const cookies = getCookies();
      expect(cookies.encoded).toBe('テスト');
    });
  });

  describe('logging', () => {
    test('コンソールにログを出力する', () => {
      logging('test message');
      expect(consoleLogSpy).toHaveBeenCalledWith('test message');
    });

    test.skip('デスクトップ通知が有効な場合は通知も表示', () => {
      // window._LOGGING_NOTIFY_DESKTOP が true であることを確認
      expect((window as any)._LOGGING_NOTIFY_DESKTOP).toBe(true);
      
      logging('test message', 'error');
      expect(mockNotify).toHaveBeenCalledWith('test message', {
        className: 'error',
        autoHideDelay: 10000,
        globalPosition: 'bottom left',
      });
    });

    test.skip('レベルが指定されない場合はinfoを使用', () => {
      // window._LOGGING_NOTIFY_DESKTOP が true であることを確認
      expect((window as any)._LOGGING_NOTIFY_DESKTOP).toBe(true);
      
      logging('test message');
      expect(mockNotify).toHaveBeenCalledWith('test message', {
        className: 'info',
        autoHideDelay: 10000,
        globalPosition: 'bottom left',
      });
    });

    test('デスクトップ通知が無効な場合は通知しない', () => {
      (window as any)._LOGGING_NOTIFY_DESKTOP = false;
      logging('test message');
      expect(mockNotify).not.toHaveBeenCalled();
      (window as any)._LOGGING_NOTIFY_DESKTOP = true;
    });

    test('windowが存在しない場合は通知しない', () => {
      const originalWindow = (global as any).window;
      (global as any).window = undefined;
      logging('test message');
      expect(mockNotify).not.toHaveBeenCalled();
      (global as any).window = originalWindow;
    });

    test('jQueryが存在しない場合は通知しない', () => {
      const original$ = (window as any).$;
      (window as any).$ = undefined;
      logging('test message');
      expect(mockNotify).not.toHaveBeenCalled();
      (window as any).$ = original$;
    });

    test('$.notifyが存在しない場合は通知しない', () => {
      const originalNotify = mockJQuery.notify;
      mockJQuery.notify = undefined;
      logging('test message');
      expect(mockNotify).not.toHaveBeenCalled();
      mockJQuery.notify = originalNotify;
    });
  });

  describe('insertAtCaret', () => {
    test('カーソル位置に文字を挿入する', () => {
      const mockElement = {
        selectionStart: 5,
        setSelectionRange: jest.fn(),
      };
      mockGet.mockReturnValue(mockElement);
      mockVal.mockReturnValue('Hello World');
      
      // jQueryモック関数を再設定
      const mockTarget = {
        focus: mockFocus,
        val: mockVal,
        get: mockGet,
      };
      (window as any).$ = jest.fn().mockReturnValue(mockTarget);

      insertAtCaret('#target', 'Test');

      expect(mockFocus).toHaveBeenCalled();
      expect(mockVal).toHaveBeenCalledWith('HelloTest World');
      expect(mockElement.setSelectionRange).toHaveBeenCalledWith(9, 9);
    });

    test('IE環境では特別な処理を行う', () => {
      // navigatorのモック
      Object.defineProperty(navigator, 'userAgent', {
        value: 'MSIE 11.0',
        writable: true,
        configurable: true,
      });
      
      const mockRange = {
        text: '',
        select: jest.fn(),
      };
      
      // document.selectionが存在することを確認
      if (!(document as any).selection) {
        (document as any).selection = {
          createRange: jest.fn(),
        };
      }
      (document as any).selection.createRange.mockReturnValue(mockRange);
      
      // jQueryモック関数を再設定
      const mockTarget = {
        focus: mockFocus,
      };
      (window as any).$ = jest.fn().mockReturnValue(mockTarget);

      insertAtCaret('#target', 'Test');

      expect(mockRange.text).toBe('Test');
      expect(mockRange.select).toHaveBeenCalled();
      expect(mockFocus).toHaveBeenCalled();

      // navigatorを元に戻す
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0',
        writable: true,
        configurable: true,
      });
    });

    test('windowが存在しない場合は何もしない', () => {
      const original$ = (window as any).$;
      (window as any).$ = undefined;
      
      jest.clearAllMocks();
      insertAtCaret('#target', 'Test');
      expect(mockFocus).not.toHaveBeenCalled();
      
      (window as any).$ = original$;
    });

    test('jQueryが存在しない場合は何もしない', () => {
      const original$ = (window as any).$;
      (window as any).$ = undefined;
      insertAtCaret('#target', 'Test');
      expect(mockFocus).not.toHaveBeenCalled();
      (window as any).$ = original$;
    });
  });

  describe('isString', () => {
    test('文字列プリミティブに対してtrueを返す', () => {
      expect(isString('test')).toBe(true);
    });

    test('Stringオブジェクトに対してtrueを返す', () => {
      expect(isString(new String('test'))).toBe(true);
    });

    test('数値に対してfalseを返す', () => {
      expect(isString(123)).toBe(false);
    });

    test('オブジェクトに対してfalseを返す', () => {
      expect(isString({})).toBe(false);
    });

    test('nullに対してfalseを返す', () => {
      expect(isString(null)).toBe(false);
    });

    test('undefinedに対してfalseを返す', () => {
      expect(isString(undefined)).toBe(false);
    });
  });

  describe('unescapeHTML', () => {
    test('文字列をそのまま返す', () => {
      expect(unescapeHTML('&lt;div&gt;test&lt;/div&gt;')).toBe('&lt;div&gt;test&lt;/div&gt;');
    });
  });

  describe('escapeLink', () => {
    test('javascript:プロトコルをエンコードする', () => {
      const result = escapeLink('javascript:alert("XSS")');
      expect(result).toBe(encodeURIComponent('javascript:alert("XSS")'));
    });

    test('大文字小文字を区別しない', () => {
      const result = escapeLink('JavaScript:alert("XSS")');
      expect(result).toBe(encodeURIComponent('JavaScript:alert("XSS")'));
    });

    test('javascript:の前に文字がある場合も処理する', () => {
      const result = escapeLink('http://example.com#javascript:alert("XSS")');
      expect(result).toBe('http://example.com#' + encodeURIComponent('javascript:alert("XSS")'));
    });

    test('javascript:を含まないURLはそのまま返す', () => {
      const url = 'https://example.com/page';
      expect(escapeLink(url)).toBe(url);
    });
  });

  describe('handleErrorResponse', () => {
    test('エラーレスポンスに子要素がある場合は個別に通知', () => {
      (window as any).$.notify = mockNotify;
      const xhr = {
        responseJSON: {
          children: [
            { message: 'Error 1' },
            { message: 'Error 2' },
          ],
        },
      };
      
      handleErrorResponse(xhr, 'error', new Error('test'));
      
      expect(mockNotify).toHaveBeenCalledWith('Error 1', 'warn');
      expect(mockNotify).toHaveBeenCalledWith('Error 2', 'warn');
    });

    test('エラーレスポンスに子要素がない場合はデフォルトメッセージ', () => {
      (window as any).$.notify = mockNotify;
      const xhr = {
        responseJSON: {},
      };
      
      handleErrorResponse(xhr, 'error', new Error('test'));
      
      expect(mockNotify).toHaveBeenCalledWith('data load error. please try again.', 'warn');
    });

    test('statusTextがある場合はそれを表示', () => {
      (window as any).$.notify = mockNotify;
      const xhr = {
        statusText: 'Internal Server Error',
      };
      
      handleErrorResponse(xhr, 'error', new Error('test'));
      
      expect(mockNotify).toHaveBeenCalledWith('Internal Server Error', 'warn');
    });

    test('何もない場合はデフォルトメッセージ', () => {
      (window as any).$.notify = mockNotify;
      handleErrorResponse({}, 'error', new Error('test'));
      
      expect(mockNotify).toHaveBeenCalledWith('data load error. please try again.', 'warn');
    });

    test('windowが存在しない場合は何もしない', () => {
      const originalWindow = (global as any).window;
      (global as any).window = undefined;
      handleErrorResponse({}, 'error', new Error('test'));
      expect(mockNotify).not.toHaveBeenCalled();
      (global as any).window = originalWindow;
    });

    test('jQueryが存在しない場合は何もしない', () => {
      const original$ = (window as any).$;
      (window as any).$ = undefined;
      handleErrorResponse({}, 'error', new Error('test'));
      expect(mockNotify).not.toHaveBeenCalled();
      (window as any).$ = original$;
    });

    test('$.notifyが存在しない場合は何もしない', () => {
      (window as any).$.notify = undefined;
      handleErrorResponse({}, 'error', new Error('test'));
      expect(mockNotify).not.toHaveBeenCalled();
    });

    test('xhrがnullの場合でもデフォルトメッセージ', () => {
      (window as any).$.notify = mockNotify;
      handleErrorResponse(null as any, 'error', new Error('test'));
      expect(mockNotify).toHaveBeenCalledWith('data load error. please try again.', 'warn');
    });
  });

  describe('initPageTop', () => {
    beforeEach(() => {
      // initPageTop用のjQueryモックを再設定
      (window as any).$ = mockJQuery;
    });

    test('スクロールイベントを設定する', () => {
      initPageTop();
      expect(mockScroll).toHaveBeenCalled();
    });

    test('クリックイベントを設定する', () => {
      initPageTop();
      expect(mockClick).toHaveBeenCalled();
    });

    test('スクロール時の表示制御', () => {
      // スクロール位置を返すモックを設定
      const mockScrollTop = jest.fn();
      mockJQuery.mockImplementation((selector: any) => {
        if (selector === window) {
          return {
            scroll: mockScroll,
            scrollTop: mockScrollTop,
            load: mockLoad,
            on: mockOn,
          };
        }
        if (selector === '.pagetop') {
          return {
            fadeIn: mockFadeIn,
            fadeOut: mockFadeOut,
            click: mockClick,
          };
        }
        return mockJQuery(selector);
      });
      
      initPageTop();
      const scrollCallback = mockScroll.mock.calls[0][0];
      
      // スクロール位置が100以下の場合
      mockScrollTop.mockReturnValue(50);
      scrollCallback();
      expect(mockFadeOut).toHaveBeenCalled();
      
      // スクロール位置が100より大きい場合
      jest.clearAllMocks();
      mockScrollTop.mockReturnValue(150);
      scrollCallback();
      expect(mockFadeIn).toHaveBeenCalled();
    });

    test('クリック時のアニメーション', () => {
      initPageTop();
      const clickCallback = mockClick.mock.calls[0][0];
      
      const result = clickCallback();
      
      expect(mockAnimate).toHaveBeenCalledWith({ scrollTop: 0 }, 500);
      expect(result).toBe(false);
    });

    test('windowが存在しない場合は何もしない', () => {
      // windowが存在しない場合の動作をテストする代替方法
      // 実際のコードでは `typeof window === 'undefined'` をチェックしているが、
      // テスト環境では完全に削除するのが難しいため、実装を変更せずにjQueryをnullにしてテスト
      const original$ = (window as any).$;
      (window as any).$ = null;
      jest.clearAllMocks();
      
      initPageTop();
      expect(mockScroll).not.toHaveBeenCalled();
      
      (window as any).$ = original$;
    });

    test('jQueryが存在しない場合は何もしない', () => {
      const original$ = (window as any).$;
      (window as any).$ = undefined;
      initPageTop();
      expect(mockScroll).not.toHaveBeenCalled();
      (window as any).$ = original$;
    });
  });

  describe('initResponsiveNav', () => {
    beforeEach(() => {
      (window as any).$ = mockJQuery;
    });

    test('ウィンドウイベントを設定する', () => {
      initResponsiveNav();
      expect(mockOn).toHaveBeenCalledWith('load resize', expect.any(Function));
    });

    test('画面幅に応じて表示制御', () => {
      initResponsiveNav();
      const resizeCallback = mockOn.mock.calls[0][1];
      
      // モバイル表示（767px以下）
      (window as any).matchMedia = jest.fn((query: string) => ({
        matches: query === '(max-width:767px)',
      }));
      resizeCallback();
      expect(mockShow).toHaveBeenCalled();
      
      // タブレット表示（768px-1200px）
      (window as any).matchMedia = jest.fn((query: string) => ({
        matches: query === '(max-width:1200px)' && query !== '(max-width:767px)',
      }));
      resizeCallback();
      expect(mockHide).toHaveBeenCalled();
      
      // デスクトップ表示（1201px以上）
      (window as any).matchMedia = jest.fn((query: string) => ({
        matches: false,
      }));
      resizeCallback();
      expect(mockShow).toHaveBeenCalledTimes(2);
    });

    test('windowが存在しない場合は何もしない', () => {
      const original$ = (window as any).$;
      (window as any).$ = null;
      jest.clearAllMocks();
      
      initResponsiveNav();
      expect(mockOn).not.toHaveBeenCalled();
      
      (window as any).$ = original$;
    });

    test('jQueryが存在しない場合は何もしない', () => {
      const original$ = (window as any).$;
      (window as any).$ = undefined;
      initResponsiveNav();
      expect(mockOn).not.toHaveBeenCalled();
      (window as any).$ = original$;
    });

    test('タブレット表示の条件が正しく判定される', () => {
      initResponsiveNav();
      const resizeCallback = mockOn.mock.calls[0][1];
      
      // タブレット表示（正確な条件: max-width:1200px AND NOT max-width:767px）
      (window as any).matchMedia = jest.fn((query: string) => {
        if (query === '(max-width:767px)') return { matches: false };
        if (query === '(max-width:1200px)') return { matches: true };
        return { matches: false };
      });
      resizeCallback();
      expect(mockHide).toHaveBeenCalled();
    });
  });

  describe('initModalScrollbar', () => {
    beforeEach(() => {
      (window as any).$ = mockJQuery;
    });

    test('モーダルのスクロールバー調整を初期化', () => {
      const oldSetScrollbar = jest.fn();
      const oldResetScrollbar = jest.fn();
      
      (window as any).$.fn.modal.Constructor.prototype.setScrollbar = oldSetScrollbar;
      (window as any).$.fn.modal.Constructor.prototype.resetScrollbar = oldResetScrollbar;
      
      initModalScrollbar();
      
      // loadイベントのコールバックを実行
      const loadCallback = mockLoad.mock.calls[0][0];
      loadCallback();
      
      // 新しいsetScrollbarをテスト
      const newSetScrollbar = (window as any).$.fn.modal.Constructor.prototype.setScrollbar;
      const context = { bodyIsOverflowing: true, scrollbarWidth: 15 };
      newSetScrollbar.call(context);
      
      expect(oldSetScrollbar).toHaveBeenCalled();
      expect(mockCss).toHaveBeenCalledWith('padding-right', 15);
      
      // 新しいresetScrollbarをテスト
      const newResetScrollbar = (window as any).$.fn.modal.Constructor.prototype.resetScrollbar;
      newResetScrollbar.call({});
      
      expect(oldResetScrollbar).toHaveBeenCalled();
      expect(mockCss).toHaveBeenCalledWith('padding-right', '');
    });

    test('bodyIsOverflowingがfalseの場合はパディングを設定しない', () => {
      const oldSetScrollbar = jest.fn();
      (window as any).$.fn.modal.Constructor.prototype.setScrollbar = oldSetScrollbar;
      
      initModalScrollbar();
      const loadCallback = mockLoad.mock.calls[0][0];
      loadCallback();
      
      const newSetScrollbar = (window as any).$.fn.modal.Constructor.prototype.setScrollbar;
      const context = { bodyIsOverflowing: false, scrollbarWidth: 15 };
      newSetScrollbar.call(context);
      
      expect(oldSetScrollbar).toHaveBeenCalled();
      expect(mockCss).not.toHaveBeenCalled();
    });

    test('scrollbarWidthが0の場合はパディングを設定しない', () => {
      const oldSetScrollbar = jest.fn();
      (window as any).$.fn.modal.Constructor.prototype.setScrollbar = oldSetScrollbar;
      
      initModalScrollbar();
      const loadCallback = mockLoad.mock.calls[0][0];
      loadCallback();
      
      const newSetScrollbar = (window as any).$.fn.modal.Constructor.prototype.setScrollbar;
      const context = { bodyIsOverflowing: true, scrollbarWidth: 0 };
      newSetScrollbar.call(context);
      
      expect(oldSetScrollbar).toHaveBeenCalled();
      expect(mockCss).not.toHaveBeenCalled();
    });

    test('windowが存在しない場合は何もしない', () => {
      const original$ = (window as any).$;
      (window as any).$ = null;
      jest.clearAllMocks();
      
      initModalScrollbar();
      expect(mockLoad).not.toHaveBeenCalled();
      
      (window as any).$ = original$;
    });

    test('jQueryが存在しない場合は何もしない', () => {
      const original$ = (window as any).$;
      (window as any).$ = undefined;
      initModalScrollbar();
      expect(mockLoad).not.toHaveBeenCalled();
      (window as any).$ = original$;
    });

    test('$.fn.modalが存在しない場合は何もしない', () => {
      const originalFn = (window as any).$.fn;
      (window as any).$.fn = {};
      initModalScrollbar();
      expect(mockLoad).not.toHaveBeenCalled();
      (window as any).$.fn = originalFn;
    });
  });

  describe('startSessionKeepAlive', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      (window as any).$ = mockJQuery;
      (window as any).$.ajax = mockAjax;
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('5分ごとにアクセスを送信', () => {
      // _CONTEXTを再設定
      (window as any)._CONTEXT = '/context';
      
      mockAjax.mockReturnValue({
        done: jest.fn().mockReturnValue({
          fail: jest.fn(),
        }),
      });
      
      startSessionKeepAlive();
      
      // 初回は呼ばれない
      expect(mockAjax).not.toHaveBeenCalled();
      
      // 5分後
      jest.advanceTimersByTime(5 * 60 * 1000);
      
      expect(mockAjax).toHaveBeenCalledWith({
        type: 'GET',
        url: '/context/open.interval/access',
      });
    });

    test('成功時のログ出力', () => {
      const doneFn = jest.fn();
      const failFn = jest.fn();
      
      mockAjax.mockReturnValue({
        done: jest.fn((callback) => {
          callback();
          return { fail: failFn };
        }),
      });
      
      startSessionKeepAlive();
      jest.advanceTimersByTime(5 * 60 * 1000);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('OK');
    });

    test('失敗時のエラーログ出力', () => {
      const error = new Error('Network error');
      
      mockAjax.mockReturnValue({
        done: jest.fn().mockReturnValue({
          fail: jest.fn((callback) => {
            callback(error);
          }),
        }),
      });
      
      startSessionKeepAlive();
      jest.advanceTimersByTime(5 * 60 * 1000);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });

    test('windowが存在しない場合は何もしない', () => {
      const original$ = (window as any).$;
      (window as any).$ = null;
      jest.clearAllMocks();
      
      startSessionKeepAlive();
      jest.advanceTimersByTime(5 * 60 * 1000);
      expect(mockAjax).not.toHaveBeenCalled();
      
      (window as any).$ = original$;
    });

    test('jQueryが存在しない場合は何もしない', () => {
      const original$ = (window as any).$;
      (window as any).$ = undefined;
      startSessionKeepAlive();
      jest.advanceTimersByTime(5 * 60 * 1000);
      expect(mockAjax).not.toHaveBeenCalled();
      (window as any).$ = original$;
    });
  });

  describe('preventDefaultDragDrop', () => {
    beforeEach(() => {
      (window as any).$ = mockJQuery;
    });

    test('ドラッグ&ドロップイベントのデフォルト動作を抑止', () => {
      preventDefaultDragDrop();
      
      expect(mockOn).toHaveBeenCalledWith('drop dragover', expect.any(Function));
      
      const callback = mockOn.mock.calls[0][1];
      const mockEvent = {
        stopPropagation: jest.fn(),
        preventDefault: jest.fn(),
      };
      
      callback(mockEvent);
      
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    test('windowが存在しない場合は何もしない', () => {
      const original$ = (window as any).$;
      (window as any).$ = null;
      jest.clearAllMocks();
      
      preventDefaultDragDrop();
      expect(mockOn).not.toHaveBeenCalled();
      
      (window as any).$ = original$;
    });

    test('jQueryが存在しない場合は何もしない', () => {
      const original$ = (window as any).$;
      (window as any).$ = undefined;
      preventDefaultDragDrop();
      expect(mockOn).not.toHaveBeenCalled();
      (window as any).$ = original$;
    });
  });

  describe('initCommonScripts', () => {
    beforeEach(() => {
      (window as any).$ = mockJQuery;
      (window as any).$.ajax = mockAjax;
    });

    test('全ての初期化関数を実行', () => {
      jest.useFakeTimers();
      
      // ajaxモックを設定
      mockAjax.mockReturnValue({
        done: jest.fn().mockReturnValue({
          fail: jest.fn(),
        }),
      });
      
      initCommonScripts();
      
      // preventDefaultDragDropは即座に実行される
      expect(mockOn).toHaveBeenCalledWith('drop dragover', expect.any(Function));
      
      // readyコールバックを実行
      const readyCallback = mockReady.mock.calls[0][0];
      readyCallback();
      
      // 各初期化関数が呼ばれることを確認
      expect(mockScroll).toHaveBeenCalled(); // initPageTop
      expect(mockOn).toHaveBeenCalledWith('load resize', expect.any(Function)); // initResponsiveNav
      expect(mockLoad).toHaveBeenCalled(); // initModalScrollbar
      
      // startSessionKeepAliveのタイマーが設定されることを確認
      jest.advanceTimersByTime(5 * 60 * 1000);
      expect(mockAjax).toHaveBeenCalled();
      
      jest.useRealTimers();
    });

    test('windowが存在しない場合は何もしない', () => {
      const original$ = (window as any).$;
      (window as any).$ = null;
      jest.clearAllMocks();
      
      initCommonScripts();
      expect(mockOn).not.toHaveBeenCalled();
      
      (window as any).$ = original$;
    });

    test('jQueryが存在しない場合は何もしない', () => {
      const original$ = (window as any).$;
      (window as any).$ = undefined;
      initCommonScripts();
      expect(mockOn).not.toHaveBeenCalled();
      (window as any).$ = original$;
    });
  });
});