/**
 * テーマフック
 * 
 * @description テーマとハイライト設定を管理するフック
 * @since 1.0.0
 */

'use client';

import { useState, useEffect } from 'react';

export interface Theme {
  name: string;
  displayName: string;
}

export interface HighlightTheme {
  name: string;
  displayName: string;
}

// 利用可能なテーマ（旧システムのBootswatchテーマ）
export const availableThemes: Theme[] = [
  { name: 'flatly', displayName: 'Flatly' },
  { name: 'cerulean', displayName: 'Cerulean' },
  { name: 'cosmo', displayName: 'Cosmo' },
  { name: 'cyborg', displayName: 'Cyborg' },
  { name: 'darkly', displayName: 'Darkly' },
  { name: 'journal', displayName: 'Journal' },
  { name: 'lumen', displayName: 'Lumen' },
  { name: 'paper', displayName: 'Paper' },
  { name: 'readable', displayName: 'Readable' },
  { name: 'sandstone', displayName: 'Sandstone' },
  { name: 'simplex', displayName: 'Simplex' },
  { name: 'slate', displayName: 'Slate' },
  { name: 'solar', displayName: 'Solar' },
  { name: 'spacelab', displayName: 'Spacelab' },
  { name: 'superhero', displayName: 'Superhero' },
  { name: 'united', displayName: 'United' },
  { name: 'yeti', displayName: 'Yeti' },
];

// 利用可能なハイライトテーマ
export const availableHighlightThemes: HighlightTheme[] = [
  { name: 'darkula', displayName: 'Darkula' },
  { name: 'github', displayName: 'GitHub' },
  { name: 'monokai', displayName: 'Monokai' },
  { name: 'vs', displayName: 'Visual Studio' },
  { name: 'atom-one-dark', displayName: 'Atom One Dark' },
  { name: 'atom-one-light', displayName: 'Atom One Light' },
];

export function useTheme() {
  const [theme, setTheme] = useState<string>('flatly');
  const [highlightTheme, setHighlightTheme] = useState<string>('darkula');

  useEffect(() => {
    // クッキーまたはローカルストレージからテーマを読み込み
    const savedTheme = localStorage.getItem('knowledge_theme') || 'flatly';
    const savedHighlightTheme = localStorage.getItem('knowledge_highlight') || 'darkula';
    
    setTheme(savedTheme);
    setHighlightTheme(savedHighlightTheme);
  }, []);

  const updateTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('knowledge_theme', newTheme);
    
    // CSSファイルを動的に変更
    const themeLink = document.getElementById('theme-css') as HTMLLinkElement;
    if (themeLink) {
      themeLink.href = `/css/themes/${newTheme}.css`;
    }
  };

  const updateHighlightTheme = (newHighlightTheme: string) => {
    setHighlightTheme(newHighlightTheme);
    localStorage.setItem('knowledge_highlight', newHighlightTheme);
    
    // ハイライトCSSファイルを動的に変更
    const highlightLink = document.getElementById('highlight-css') as HTMLLinkElement;
    if (highlightLink) {
      highlightLink.href = `/css/highlight/${newHighlightTheme}.css`;
    }
  };

  return {
    theme,
    highlightTheme,
    updateTheme,
    updateHighlightTheme,
    availableThemes,
    availableHighlightThemes,
  };
}