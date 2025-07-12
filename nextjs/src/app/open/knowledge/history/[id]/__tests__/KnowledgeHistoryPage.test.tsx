/**
 * ナレッジ履歴詳細ページテスト
 * 
 * @description 旧システムとの互換性テストを含む
 */
import { render, screen, waitFor } from '@testing-library/react';
import KnowledgeHistoryPage from '../page';
import { notFound } from 'next/navigation';

// モック設定
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  useSearchParams: () => new URLSearchParams(),
}));

// グローバルfetchのモック
global.fetch = jest.fn();

describe('KnowledgeHistoryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本レンダリング', () => {
    test('履歴詳細が表示される', async () => {
      const mockHistory = {
        historyNo: 1,
        knowledgeId: 1,
        updateUser: '1',
        userName: 'テストユーザー',
        updateDatetime: '2024-01-01T10:00:00Z',
        content: '# 履歴のコンテンツ\n\n古いバージョンです。',
      };
      
      const mockCurrent = {
        knowledgeId: 1,
        title: 'テストナレッジ',
        content: '# 現在のコンテンツ\n\n新しいバージョンです。',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockHistory,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCurrent,
        });

      render(await KnowledgeHistoryPage({ params: { id: '1' }, searchParams: { history_no: '1' } }));

      await waitFor(() => {
        expect(screen.getByText('編集履歴詳細')).toBeInTheDocument();
        expect(screen.getByText('テストユーザー')).toBeInTheDocument();
      });
    });

    test('差分表示エリアが存在する', async () => {
      const mockHistory = {
        historyNo: 1,
        knowledgeId: 1,
        updateUser: '1',
        userName: 'テストユーザー',
        updateDatetime: '2024-01-01T10:00:00Z',
        content: '古いコンテンツ',
      };
      
      const mockCurrent = {
        knowledgeId: 1,
        title: 'テストナレッジ',
        content: '新しいコンテンツ',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockHistory,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCurrent,
        });

      render(await KnowledgeHistoryPage({ params: { id: '1' }, searchParams: { history_no: '1' } }));

      await waitFor(() => {
        expect(screen.getByTestId('content-diff')).toBeInTheDocument();
        expect(screen.getByText('差分')).toBeInTheDocument();
      });
    });
  });

  describe('データ表示', () => {
    test('更新者情報が正しく表示される', async () => {
      const mockHistory = {
        historyNo: 1,
        knowledgeId: 1,
        updateUser: '1',
        userName: 'テストユーザー',
        updateDatetime: '2024-01-01T10:00:00Z',
        content: 'コンテンツ',
      };
      
      const mockCurrent = {
        knowledgeId: 1,
        title: 'テストナレッジ',
        content: 'コンテンツ',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockHistory,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCurrent,
        });

      render(await KnowledgeHistoryPage({ params: { id: '1' }, searchParams: { history_no: '1' } }));

      await waitFor(() => {
        expect(screen.getByAltText('icon')).toHaveAttribute(
          'data-src',
          '/open.account/icon/1'
        );
        expect(screen.getByText('テストユーザー')).toBeInTheDocument();
        expect(screen.getByText(/2024-01-01/)).toBeInTheDocument();
      });
    });

    test('履歴コンテンツと現在のコンテンツが表示される', async () => {
      const mockHistory = {
        historyNo: 1,
        knowledgeId: 1,
        updateUser: '1',
        userName: 'テストユーザー',
        updateDatetime: '2024-01-01T10:00:00Z',
        content: '# 履歴のコンテンツ',
      };
      
      const mockCurrent = {
        knowledgeId: 1,
        title: 'テストナレッジ',
        content: '# 現在のコンテンツ',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockHistory,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCurrent,
        });

      render(await KnowledgeHistoryPage({ params: { id: '1' }, searchParams: { history_no: '1' } }));

      await waitFor(() => {
        expect(screen.getByLabelText('履歴時点の内容')).toHaveValue('# 履歴のコンテンツ');
        expect(screen.getByLabelText('現在の内容')).toHaveValue('# 現在のコンテンツ');
      });
    });
  });

  describe('エラーハンドリング', () => {
    test('履歴が見つからない場合404を表示', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      render(await KnowledgeHistoryPage({ params: { id: '1' }, searchParams: { history_no: '1' } }));

      expect(notFound).toHaveBeenCalled();
    });

    test('アクセス権限がない場合403エラーを表示', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      render(await KnowledgeHistoryPage({ params: { id: '1' }, searchParams: { history_no: '1' } }));

      await waitFor(() => {
        expect(screen.getByText('アクセスが拒否されました')).toBeInTheDocument();
      });
    });
  });

  describe('ナビゲーション', () => {
    test('戻るボタンが正しいリンクを持つ', async () => {
      const mockHistory = {
        historyNo: 1,
        knowledgeId: 1,
        updateUser: '1',
        userName: 'テストユーザー',
        updateDatetime: '2024-01-01T10:00:00Z',
        content: 'コンテンツ',
      };
      
      const mockCurrent = {
        knowledgeId: 1,
        title: 'テストナレッジ',
        content: 'コンテンツ',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockHistory,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCurrent,
        });

      render(await KnowledgeHistoryPage({ params: { id: '1' }, searchParams: { history_no: '1', page: '2' } }));

      await waitFor(() => {
        const backButton = screen.getByRole('link', { name: /戻る/ });
        expect(backButton).toHaveAttribute('href', '/open/knowledge/histories/1?page=2');
      });
    });
  });

  describe('旧システム互換性', () => {
    test('CSSクラス構造が同等', async () => {
      const mockHistory = {
        historyNo: 1,
        knowledgeId: 1,
        updateUser: '1',
        userName: 'テストユーザー',
        updateDatetime: '2024-01-01T10:00:00Z',
        content: 'コンテンツ',
      };
      
      const mockCurrent = {
        knowledgeId: 1,
        title: 'テストナレッジ',
        content: 'コンテンツ',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockHistory,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCurrent,
        });

      render(await KnowledgeHistoryPage({ params: { id: '1' }, searchParams: { history_no: '1' } }));

      await waitFor(() => {
        expect(screen.getByText('編集履歴詳細')).toHaveClass('title');
        expect(screen.getByText('差分')).toHaveClass('sub_title');
        expect(screen.getByText('履歴時点')).toHaveClass('sub_title');
        expect(screen.getByText('現在')).toHaveClass('sub_title');
      });
    });

    test('テキストエリアが読み取り専用', async () => {
      const mockHistory = {
        historyNo: 1,
        knowledgeId: 1,
        updateUser: '1',
        userName: 'テストユーザー',
        updateDatetime: '2024-01-01T10:00:00Z',
        content: 'コンテンツ',
      };
      
      const mockCurrent = {
        knowledgeId: 1,
        title: 'テストナレッジ',
        content: 'コンテンツ',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockHistory,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCurrent,
        });

      render(await KnowledgeHistoryPage({ params: { id: '1' }, searchParams: { history_no: '1' } }));

      await waitFor(() => {
        expect(screen.getByLabelText('履歴時点の内容')).toHaveAttribute('readOnly');
        expect(screen.getByLabelText('現在の内容')).toHaveAttribute('readOnly');
      });
    });
  });
});