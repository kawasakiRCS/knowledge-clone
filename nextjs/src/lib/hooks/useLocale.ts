/**
 * ロケールフック
 * 
 * @description 言語・地域設定を管理するフック
 * @since 1.0.0
 */

'use client';

import { useState, useEffect } from 'react';

// 翻訳データの型定義
type TranslationData = Record<string, any>;

// 翻訳ファイルの動的インポート
async function loadTranslations(locale: string): Promise<TranslationData> {
  try {
    const translations = await import(`../../locales/${locale}.json`);
    return translations.default || translations;
  } catch (error) {
    console.warn(`Failed to load translations for locale: ${locale}`);
    // フォールバック：日本語を読み込み
    if (locale !== 'ja') {
      try {
        const fallback = await import('../../locales/ja.json');
        return fallback.default || fallback;
      } catch (fallbackError) {
        console.error('Failed to load fallback translations');
        return {};
      }
    }
    return {};
  }
}

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
  const [translations, setTranslations] = useState<TranslationData>({});

  useEffect(() => {
    // ブラウザの言語設定またはクッキーから読み込み
    const savedLocale = localStorage.getItem('knowledge_locale') || 
                       navigator.language.split('-')[0] || 'ja';
    
    // サポートされている言語かチェック
    const supportedLocale = availableLocales.find(l => l.code === savedLocale)?.code || 'ja';
    setLocale(supportedLocale);
  }, []);

  // 翻訳データを読み込み
  useEffect(() => {
    loadTranslations(locale).then(setTranslations);
  }, [locale]);

  const updateLocale = (newLocale: string) => {
    // サポートされている言語かチェック
    const supportedLocale = availableLocales.find(l => l.code === newLocale)?.code || 'ja';
    setLocale(supportedLocale);
    localStorage.setItem('knowledge_locale', supportedLocale);
    
    // ページリロードで言語を適用（Next.js i18nを使用する場合は不要）
    // window.location.reload();
  };

  // 翻訳キーから翻訳テキストを取得する関数
  const label = (key: string): string => {
    if (!key) return '';
    
    // ドット記法でネストされたオブジェクトにアクセス
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // キーが見つからない場合はキー自体を返す
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  const currentLocale = availableLocales.find(l => l.code === locale) || availableLocales[0];

  return {
    locale,
    displayName: currentLocale.displayName,
    flagIcon: currentLocale.flagIcon,
    updateLocale,
    availableLocales,
    label,
  };
}