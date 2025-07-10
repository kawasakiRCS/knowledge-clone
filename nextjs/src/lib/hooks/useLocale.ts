/**
 * ロケールフック
 * 
 * @description 言語・地域設定を管理するフック
 * @since 1.0.0
 */

'use client';

import { useState, useEffect } from 'react';

export interface Locale {
  code: string;
  displayName: string;
  flagIcon: string;
}

// 利用可能なロケール
export const availableLocales: Locale[] = [
  { code: 'ja', displayName: '日本語', flagIcon: 'jp' },
  { code: 'en', displayName: 'English', flagIcon: 'us' },
];

export function useLocale() {
  const [locale, setLocale] = useState<string>('ja');

  useEffect(() => {
    // ブラウザの言語設定またはクッキーから読み込み
    const savedLocale = localStorage.getItem('knowledge_locale') || 
                       navigator.language.split('-')[0] || 'ja';
    
    // サポートされている言語かチェック
    const supportedLocale = availableLocales.find(l => l.code === savedLocale)?.code || 'ja';
    setLocale(supportedLocale);
  }, []);

  const updateLocale = (newLocale: string) => {
    setLocale(newLocale);
    localStorage.setItem('knowledge_locale', newLocale);
    
    // ページリロードで言語を適用（Next.js i18nを使用する場合は不要）
    // window.location.reload();
  };

  const currentLocale = availableLocales.find(l => l.code === locale) || availableLocales[0];

  return {
    locale,
    displayName: currentLocale.displayName,
    flagIcon: currentLocale.flagIcon,
    updateLocale,
    availableLocales,
  };
}