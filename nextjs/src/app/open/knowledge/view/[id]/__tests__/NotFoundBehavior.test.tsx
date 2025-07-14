/**
 * ナレッジ表示ページの404エラーテスト
 * 
 * @description 存在しないIDアクセス時の404エラー表示テスト
 */
import { render, screen, waitFor } from '@testing-library/react';
import KnowledgeViewPage from '../page';

// APIモックの設定
global.fetch = jest.fn();

describe('KnowledgeViewPage 404エラーテスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('存在しないIDアクセス時に404エラーページが表示される', async () => {
    // 404レスポンスをモック
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Knowledge not found' })
    });

    // Promise型のparamsをモック
    const mockParams = Promise.resolve({ id: '999' });

    render(<KnowledgeViewPage params={mockParams} />);

    // 読み込み中の表示確認
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();

    // 404エラーページの表示を待機 - テキストマッチャーを柔軟にする
    await waitFor(() => {
      expect(screen.getByText(/お探しのページが見つかりませんでした/)).toBeInTheDocument();
    });

    // APIが正しいエンドポイントでコールされることを確認
    expect(fetch).toHaveBeenCalledWith('/api/knowledge/999');
  });

  test('正常なIDアクセス時にナレッジが表示される', async () => {
    const mockKnowledge = {
      knowledgeId: 672,
      title: 'テストナレッジ',
      content: '<p>テストコンテンツ</p>',
      publicFlag: 1,
      insertUserName: 'テストユーザー',
      insertDatetime: '2024-01-01T00:00:00',
      updateUserName: 'テストユーザー',
      updateDatetime: '2024-01-01T00:00:00',
      tags: [],
      stocks: [],
      comments: [],
      files: []
    };

    // 正常レスポンスをモック
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockKnowledge
    });

    const mockParams = Promise.resolve({ id: '672' });

    render(<KnowledgeViewPage params={mockParams} />);

    // ナレッジタイトルの表示を待機
    await waitFor(() => {
      expect(screen.getByText('テストナレッジ')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith('/api/knowledge/672');
  });

  test('サーバーエラー時にエラーページが表示される', async () => {
    // 500エラーをモック
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' })
    });

    const mockParams = Promise.resolve({ id: '1' });

    render(<KnowledgeViewPage params={mockParams} />);

    await waitFor(() => {
      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    });
  });
});