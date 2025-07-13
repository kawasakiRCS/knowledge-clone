/**
 * 共通スクリプトコンポーネント
 * 
 * @description 旧システムのcommonScripts.jspを移植
 * グローバル変数の設定、外部ライブラリの読み込み、通知システムの初期化を行う
 */

'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';

// グローバル変数の型定義
declare global {
  interface Window {
    _CONTEXT: string;
    _LOGIN_USER_ID: number | null;
    _LANG: string;
    _LOGGING_NOTIFY_DESKTOP: boolean;
    jQuery: any;
    $: any;
    notify: (message: string, type?: string) => void;
    jstz?: {
      determine: () => {
        name: () => string;
      };
    };
  }
}

interface CommonScriptsProps {
  contextPath?: string;
  loginUserId?: number | null;
  lang?: string;
  desktopNotify?: boolean;
  messages?: {
    success: string[];
    info: string[];
    warn: string[];
    error: string[];
  };
}

export const CommonScripts: React.FC<CommonScriptsProps> = ({
  contextPath = '',
  loginUserId = null,
  lang = 'ja',
  desktopNotify = false,
  messages = {
    success: [],
    info: [],
    warn: [],
    error: []
  }
}) => {
  // グローバル変数の設定
  useEffect(() => {
    window._LOGGING_NOTIFY_DESKTOP = false;
    window._CONTEXT = contextPath;
    window._LOGIN_USER_ID = loginUserId;
    window._LANG = lang;
  }, [contextPath, loginUserId, lang]);

  // Cookie設定
  useEffect(() => {
    const setCookie = (name: string, value: string, days: number) => {
      const expires = new Date();
      expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
      document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=${contextPath || '/'};`;
    };

    // タイムゾーンオフセットの設定
    setCookie('Knowledge_TIME_ZONE_OFFSET', new Date().getTimezoneOffset().toString(), 60);

    // タイムゾーン名の設定（テスト環境ではjstzモックを使用）
    if (typeof window !== 'undefined') {
      // テスト環境でjstzモックをインポート
      if (process.env.NODE_ENV === 'test') {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const jstz = require('jstz');
        window.jstz = jstz;
      }
      
      if (window.jstz) {
        setCookie('Knowledge_TIMEZONE', window.jstz.determine().name(), 60);
      }
    }
  }, [contextPath]);

  // 通知メッセージの表示
  useEffect(() => {
    if (typeof window !== 'undefined' && window.$ && window.$.notify) {
      // 成功メッセージ
      messages.success.forEach(msg => {
        window.$.notify(msg, 'success');
      });

      // 情報メッセージ
      messages.info.forEach(msg => {
        window.$.notify(msg, 'info');
      });

      // 警告メッセージ
      messages.warn.forEach(msg => {
        window.$.notify(msg, 'warn');
      });

      // エラーメッセージ
      messages.error.forEach(msg => {
        window.$.notify(msg, 'error');
      });
    }
  }, [messages]);

  return (
    <>
      {/* jQuery */}
      <Script
        src={`${contextPath}/bower/jquery/dist/jquery.min.js`}
        strategy="afterInteractive"
      />

      {/* Bootstrap JS */}
      <Script
        src={`${contextPath}/bower/bootstrap/dist/js/bootstrap.min.js`}
        strategy="afterInteractive"
      />

      {/* Bluebird Promise Library */}
      <Script
        src={`${contextPath}/bower/bluebird/js/browser/bluebird.min.js`}
        strategy="afterInteractive"
      />

      {/* Bootbox - Bootstrap dialogs */}
      <Script
        src={`${contextPath}/bower/bootbox/bootbox.js`}
        strategy="afterInteractive"
      />

      {/* NotifyJS */}
      <Script
        src={`${contextPath}/bower/notifyjs/dist/notify.min.js`}
        strategy="afterInteractive"
      />
      <Script
        src={`${contextPath}/bower/notifyjs/dist/notify-combined.min.js`}
        strategy="afterInteractive"
      />
      <Script
        src={`${contextPath}/bower/notifyjs/dist/styles/bootstrap/notify-bootstrap.js`}
        strategy="afterInteractive"
      />

      {/* HighlightJS */}
      <Script
        src={`${contextPath}/bower/highlightjs/highlight.pack.js`}
        strategy="afterInteractive"
      />

      {/* jQuery oEmbed */}
      <Script
        src={`${contextPath}/bower/jquery-oembed-all/jquery.oembed.js`}
        strategy="afterInteractive"
      />

      {/* jstzdetect - Timezone detection */}
      <Script
        src={`${contextPath}/bower/jstzdetect/jstz.min.js`}
        strategy="afterInteractive"
        onLoad={() => {
          // jstzがロードされたらタイムゾーンCookieを設定
          if (window.jstz) {
            const setCookie = (name: string, value: string, days: number) => {
              const expires = new Date();
              expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
              document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=${contextPath || '/'};`;
            };
            setCookie('Knowledge_TIMEZONE', window.jstz.determine().name(), 60);
          }
        }}
      />

      {/* Common scripts */}
      <Script
        src={`${contextPath}/js/common.js`}
        strategy="afterInteractive"
      />

      {/* Notification scripts (条件付き) */}
      {desktopNotify && (
        <Script
          src={`${contextPath}/js/notification.js`}
          strategy="afterInteractive"
        />
      )}

      {/* インラインスクリプト for initial setup */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // グローバル変数の初期設定
            window._LOGGING_NOTIFY_DESKTOP = false;
            window._CONTEXT = '${contextPath}';
            window._LOGIN_USER_ID = ${loginUserId || 'null'};
            window._LANG = '${lang}';
          `
        }}
      />
    </>
  );
};