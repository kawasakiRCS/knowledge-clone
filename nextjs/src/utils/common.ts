/**
 * 共通ユーティリティ関数
 * 
 * @description 旧システムのcommon.jsを移植
 */

// グローバル変数の型定義
declare global {
  interface Window {
    _CONTEXT: string;
    _LOGGING_NOTIFY_DESKTOP: boolean;
    $: any;
    jQuery: any;
  }
}

/**
 * Cookieを設定する
 */
export function setCookie(name: string, value: string, expireDays?: number, path?: string): void {
  const extime = new Date().getTime();
  const cltime = new Date(extime + (60 * 60 * 24 * 1000 * (expireDays || 0)));
  const exdate = cltime.toUTCString();
  
  let cookieString = `${name}=${escape(value)}`;
  
  if (expireDays) {
    cookieString += `; expires=${exdate}`;
  }
  
  if (path) {
    cookieString += `; path=${path}`;
  } else if (typeof window !== 'undefined' && window._CONTEXT) {
    cookieString += `; path=${window._CONTEXT}/`;
  } else {
    cookieString += '; path=/';
  }
  
  document.cookie = cookieString;
}

/**
 * 全てのCookieを取得する
 */
export function getCookies(): Record<string, string> {
  const result: Record<string, string> = {};
  const allCookies = document.cookie;
  
  if (allCookies !== '') {
    const cookies = allCookies.split('; ');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].split('=');
      result[cookie[0]] = decodeURIComponent(cookie[1]);
    }
  }
  
  return result;
}

/**
 * ログを出力する
 */
export function logging(str: string, level?: string): void {
  console.log(str);
  
  if (typeof window !== 'undefined' && window._LOGGING_NOTIFY_DESKTOP && window.$ && window.$.notify) {
    const options = {
      className: level || 'info',
      autoHideDelay: 10000,
      globalPosition: 'bottom left'
    };
    window.$.notify(str, options);
  }
}

/**
 * テキストエリアのカーソル位置に文字を挿入する
 */
export function insertAtCaret(target: string, str: string): void {
  if (typeof window === 'undefined' || !window.$) return;
  
  const obj = window.$(target);
  obj.focus();
  
  if (navigator.userAgent.match(/MSIE/)) {
    // IE対応
    const r = (document as any).selection.createRange();
    r.text = str;
    r.select();
  } else {
    const element = obj.get(0);
    const s = obj.val();
    const p = element.selectionStart;
    const np = p + str.length;
    obj.val(s.substr(0, p) + str + s.substr(p));
    element.setSelectionRange(np, np);
  }
}

/**
 * オブジェクトが文字列かどうかを判定する
 */
export function isString(obj: any): boolean {
  return typeof obj === 'string' || obj instanceof String;
}

/**
 * HTMLをアンエスケープする（現在の実装では何もしない）
 */
export function unescapeHTML(str: string): string {
  // エスケープしない
  return str;
}

/**
 * JavaScriptプロトコルを含むリンクをエスケープする
 */
export function escapeLink(url: string): string {
  const lowerUrl = url.toLowerCase();
  const jsIndex = lowerUrl.indexOf('javascript:');
  
  if (jsIndex !== -1) {
    let conv = '';
    // javascript:より前の部分
    conv += url.substring(0, jsIndex);
    // javascript:以降をエンコード
    const jsProtocol = url.substring(jsIndex);
    conv += encodeURIComponent(jsProtocol);
    return conv;
  } else {
    return url;
  }
}

/**
 * AJAXエラーレスポンスを処理する
 */
export function handleErrorResponse(xhr: any, textStatus: string, error: Error): void {
  console.log(error);
  console.log(xhr);
  
  if (typeof window === 'undefined' || !window.$ || !window.$.notify) return;
  
  if (xhr && xhr.responseJSON) {
    const msg = xhr.responseJSON;
    if (msg.children) {
      for (let i = 0; i < msg.children.length; i++) {
        const child = msg.children[i];
        console.log(child);
        window.$.notify(child.message, 'warn');
      }
    } else {
      window.$.notify('data load error. please try again.', 'warn');
    }
  } else {
    if (xhr && xhr.statusText) {
      window.$.notify(xhr.statusText, 'warn');
    } else {
      window.$.notify('data load error. please try again.', 'warn');
    }
  }
}

/**
 * ページトップボタンの制御を初期化
 */
export function initPageTop(): void {
  if (typeof window === 'undefined' || !window.$) return;
  
  const pagetop = window.$('.pagetop');
  window.$(window).scroll(function() {
    if (window.$(this).scrollTop() > 100) {
      pagetop.fadeIn();
    } else {
      pagetop.fadeOut();
    }
  });
  
  pagetop.click(function() {
    window.$('body, html').animate({
      scrollTop: 0
    }, 500);
    return false;
  });
}

/**
 * レスポンシブナビゲーションテキストの表示制御を初期化
 */
export function initResponsiveNav(): void {
  if (typeof window === 'undefined' || !window.$) return;
  
  const $win = window.$(window);
  $win.on('load resize', function() {
    if (window.matchMedia('(max-width:767px)').matches) {
      window.$('.navListButtonText').show();
    } else if (window.matchMedia('(max-width:1200px)').matches) {
      window.$('.navListButtonText').hide();
    } else {
      window.$('.navListButtonText').show();
    }
  });
}

/**
 * Modalのスクロールバー調整を初期化
 */
export function initModalScrollbar(): void {
  if (typeof window === 'undefined' || !window.$ || !window.$.fn || !window.$.fn.modal) return;
  
  window.$(window).load(function() {
    const oldSSB = window.$.fn.modal.Constructor.prototype.setScrollbar;
    window.$.fn.modal.Constructor.prototype.setScrollbar = function(this: any) {
      oldSSB.apply(this);
      if (this.bodyIsOverflowing && this.scrollbarWidth) {
        window.$('.navbar-fixed-top, .navbar-fixed-bottom').css('padding-right', this.scrollbarWidth);
      }
    };
    
    const oldRSB = window.$.fn.modal.Constructor.prototype.resetScrollbar;
    window.$.fn.modal.Constructor.prototype.resetScrollbar = function(this: any) {
      oldRSB.apply(this);
      window.$('.navbar-fixed-top, .navbar-fixed-bottom').css('padding-right', '');
    };
  });
}

/**
 * セッション維持のための定期アクセスを開始
 */
export function startSessionKeepAlive(): void {
  if (typeof window === 'undefined' || !window.$) return;
  
  setInterval(function() {
    const url = window._CONTEXT + '/open.interval/access';
    window.$.ajax({
      type: 'GET',
      url: url
    }).done(function(result: any, textStatus: string, xhr: any) {
      console.log('OK');
    }).fail(function(xhr: any, textStatus: string, error: any) {
      console.error(error);
    });
  }, 1000 * 60 * 5); // 5分ごと
}

/**
 * ドラッグ&ドロップのデフォルト動作を抑止
 */
export function preventDefaultDragDrop(): void {
  if (typeof window === 'undefined' || !window.$) return;
  
  window.$(document).on('drop dragover', function(e: any) {
    e.stopPropagation();
    e.preventDefault();
  });
}

/**
 * common.jsの全機能を初期化
 */
export function initCommonScripts(): void {
  if (typeof window === 'undefined' || !window.$) return;
  
  window.$(document).ready(function() {
    initPageTop();
    initResponsiveNav();
    initModalScrollbar();
    startSessionKeepAlive();
  });
  
  preventDefaultDragDrop();
}