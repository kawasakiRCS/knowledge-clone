/**
 * ロケール管理フック
 * 
 * @description 多言語対応のためのロケール管理を提供
 */
import { useCallback } from 'react';

// 翻訳辞書
const translations: Record<string, Record<string, string>> = {
  ja: {
    'knowledge.list.kind.list': 'ナレッジ一覧',
    'knowledge.list.kind.popular': '人気',
    'knowledge.list.kind.stock': 'ストック',
    'knowledge.list.kind.history': '履歴',
    'knowledge.list.empty': 'ナレッジが登録されていません',
    'label.unread': '未読',
    'knowledge.view.info.insert': '%sが%sに登録',
    'knowledge.view.info.update': '(%sが%sに更新)',
    'knowledge.view.label.status.participation': '参加',
    'knowledge.view.label.status.wait.cansel': 'キャンセル待ち',
    'knowledge.list.event.datetime': '開催日時',
    'knowledge.popular.point': 'ポイント',
    'knowledge.popular.period': '期間',
    'knowledge.list.search': 'ナレッジを検索',
    'knowledge.list.search.keyword': 'キーワード',
    'knowledge.list.search.template': 'テンプレート',
    'knowledge.list.search.tag': 'タグ',
    'knowledge.list.search.creator': '作成者',
    'knowledge.list.search.group': 'グループ',
    'knowledge.list.search.clear': 'クリア',
    'knowledge.list.search.submit': '検索',
    'knowledge.list.back': '一覧に戻る',
    'knowledge.histories.title': '編集履歴',
    'knowledge.histories.empty': '編集履歴はありません',
    'knowledge.histories.back': '戻る',
    'knowledge.history.title': '履歴詳細',
    'knowledge.history.diff': '差分表示',
    'knowledge.history.content.at': '履歴時点のコンテンツ',
    'knowledge.history.content.current': '現在のコンテンツ',
    'knowledge.history.updated.by': '更新者',
    'knowledge.history.updated.at': '更新日時',
  },
  en: {
    'knowledge.list.kind.list': 'Knowledge List',
    'knowledge.list.kind.popular': 'Popular',
    'knowledge.list.kind.stock': 'Stock',
    'knowledge.list.kind.history': 'History',
    'knowledge.list.empty': 'No knowledge registered',
    'label.unread': 'Unread',
    'knowledge.view.info.insert': '%s registered on %s',
    'knowledge.view.info.update': '(%s updated on %s)',
    'knowledge.view.label.status.participation': 'Participating',
    'knowledge.view.label.status.wait.cansel': 'Waiting for cancellation',
    'knowledge.list.event.datetime': 'Event Date',
    'knowledge.popular.point': 'Points',
    'knowledge.popular.period': 'Period',
    'knowledge.list.search': 'Search Knowledge',
    'knowledge.list.search.keyword': 'Keyword',
    'knowledge.list.search.template': 'Template',
    'knowledge.list.search.tag': 'Tag',
    'knowledge.list.search.creator': 'Creator',
    'knowledge.list.search.group': 'Group',
    'knowledge.list.search.clear': 'Clear',
    'knowledge.list.search.submit': 'Search',
    'knowledge.list.back': 'Back to List',
    'knowledge.histories.title': 'Edit History',
    'knowledge.histories.empty': 'No edit history',
    'knowledge.histories.back': 'Back',
    'knowledge.history.title': 'History Detail',
    'knowledge.history.diff': 'Show Diff',
    'knowledge.history.content.at': 'Content at this point',
    'knowledge.history.content.current': 'Current Content',
    'knowledge.history.updated.by': 'Updated by',
    'knowledge.history.updated.at': 'Updated at',
  }
};

interface UseLocaleReturn {
  locale: string;
  t: (key: string, ...args: (string | number)[]) => string;
}

export function useLocale(): UseLocaleReturn {
  // デフォルトは日本語
  const locale = 'ja';
  
  // 翻訳関数
  const t = useCallback((key: string, ...args: (string | number)[]): string => {
    let translation = translations[locale]?.[key] || translations['en']?.[key] || key;
    
    // パラメータの置換
    if (args.length > 0) {
      args.forEach((arg) => {
        translation = translation.replace('%s', String(arg));
      });
    }
    
    return translation;
  }, [locale]);
  
  return {
    locale,
    t,
  };
}