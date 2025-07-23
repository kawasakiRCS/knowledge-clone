/**
 * useLocaleフックのテスト
 * 
 * @description ロケール管理と翻訳機能のテスト
 */
import { renderHook } from '@testing-library/react';
import { useLocale } from '../useLocale';

describe('useLocale', () => {
  test('デフォルトロケールは日本語', () => {
    const { result } = renderHook(() => useLocale());
    
    expect(result.current.locale).toBe('ja');
  });

  test('日本語の翻訳を返す', () => {
    const { result } = renderHook(() => useLocale());
    const { t } = result.current;
    
    expect(t('knowledge.list.kind.list')).toBe('ナレッジ一覧');
    expect(t('knowledge.list.kind.popular')).toBe('人気');
    expect(t('knowledge.list.kind.stock')).toBe('ストック');
    expect(t('knowledge.list.kind.history')).toBe('履歴');
  });

  test('存在しないキーの場合はキーそのものを返す', () => {
    const { result } = renderHook(() => useLocale());
    const { t } = result.current;
    
    expect(t('non.existent.key')).toBe('non.existent.key');
  });

  test('パラメータ付き翻訳を正しく処理する', () => {
    const { result } = renderHook(() => useLocale());
    const { t } = result.current;
    
    // 2つのパラメータを持つ翻訳
    expect(t('knowledge.view.info.insert', 'ユーザー名', '2024年1月1日')).toBe(
      'ユーザー名が2024年1月1日に登録'
    );
    
    expect(t('knowledge.view.info.update', '管理者', '2024年1月2日')).toBe(
      '(管理者が2024年1月2日に更新)'
    );
  });

  test('数値パラメータも文字列に変換される', () => {
    const { result } = renderHook(() => useLocale());
    const { t } = result.current;
    
    // カスタムキーでテスト（実際の翻訳には%sが含まれていないため）
    const customTranslations = {
      ja: {
        'test.number': 'ポイント: %s',
      },
    };
    
    // モックを使用してテストするか、実際の翻訳キーを使用
    // ここでは実際のキーを使用してテスト
    expect(t('knowledge.view.info.insert', 123, 456)).toBe(
      '123が456に登録'
    );
  });

  test('複数のパラメータが順番に置換される', () => {
    const { result } = renderHook(() => useLocale());
    const { t } = result.current;
    
    // 複数の%sが含まれる翻訳のテスト
    expect(t('knowledge.view.info.insert', 'ユーザー1', '2024/01/01')).toBe(
      'ユーザー1が2024/01/01に登録'
    );
  });

  test('パラメータが不足している場合でも%sが残る', () => {
    const { result } = renderHook(() => useLocale());
    const { t } = result.current;
    
    // 1つのパラメータしか渡さない場合
    expect(t('knowledge.view.info.insert', 'ユーザー名')).toBe(
      'ユーザー名が%sに登録'
    );
  });

  test('全ての日本語翻訳キーが存在する', () => {
    const { result } = renderHook(() => useLocale());
    const { t } = result.current;
    
    const keys = [
      'knowledge.list.kind.list',
      'knowledge.list.kind.popular',
      'knowledge.list.kind.stock',
      'knowledge.list.kind.history',
      'knowledge.list.empty',
      'label.unread',
      'knowledge.view.info.insert',
      'knowledge.view.info.update',
      'knowledge.view.label.status.participation',
      'knowledge.view.label.status.wait.cansel',
      'knowledge.list.event.datetime',
      'knowledge.popular.point',
      'knowledge.popular.period',
      'knowledge.list.search',
      'knowledge.list.search.keyword',
      'knowledge.list.search.template',
      'knowledge.list.search.tag',
      'knowledge.list.search.creator',
      'knowledge.list.search.group',
      'knowledge.list.search.clear',
      'knowledge.list.search.submit',
      'knowledge.list.back',
      'knowledge.histories.title',
      'knowledge.histories.empty',
      'knowledge.histories.back',
      'knowledge.history.title',
      'knowledge.history.diff',
      'knowledge.history.content.at',
      'knowledge.history.content.current',
      'knowledge.history.updated.by',
      'knowledge.history.updated.at',
    ];
    
    keys.forEach(key => {
      const translation = t(key);
      expect(translation).not.toBe(key);
      expect(translation).toBeTruthy();
    });
  });

  test('t関数は再レンダリング時も同じ参照を保つ', () => {
    const { result, rerender } = renderHook(() => useLocale());
    
    const firstT = result.current.t;
    
    rerender();
    
    const secondT = result.current.t;
    
    expect(firstT).toBe(secondT);
  });

  test('特殊文字を含むパラメータも正しく処理される', () => {
    const { result } = renderHook(() => useLocale());
    const { t } = result.current;
    
    expect(t('knowledge.view.info.insert', '<script>alert("XSS")</script>', '2024')).toBe(
      '<script>alert("XSS")</script>が2024に登録'
    );
  });

  test('空文字列パラメータも処理される', () => {
    const { result } = renderHook(() => useLocale());
    const { t } = result.current;
    
    expect(t('knowledge.view.info.insert', '', '')).toBe(
      'がに登録'
    );
  });

  test('nullやundefinedのパラメータは文字列に変換される', () => {
    const { result } = renderHook(() => useLocale());
    const { t } = result.current;
    
    expect(t('knowledge.view.info.insert', null as any, undefined as any)).toBe(
      'nullがundefinedに登録'
    );
  });
});