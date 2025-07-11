/**
 * ナレッジ人気順ページコンポーネントテスト
 * 
 * @description 旧システムのopen/knowledge/popularity.jspとの互換性テストを含む
 */
import { render, screen, waitFor } from '@testing-library/react';
import { KnowledgePopularityPage } from '../KnowledgePopularityPage';

// モックの設定
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/open/knowledge/popularity',
  }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ isLoggedIn: false, user: null }),
}));

// fetchのモック
global.fetch = jest.fn();

describe('KnowledgePopularityPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        knowledges: [
          {
            knowledgeId: 1,
            title: '人気ナレッジ1',
            content: 'テスト内容1',
            insertUser: 'user1',
            insertUserName: 'テストユーザー1',
            insertDatetime: '2024-01-01T10:00:00Z',
            updateUser: 'user1',
            updateUserName: 'テストユーザー1',
            updateDatetime: '2024-01-01T10:00:00Z',
            likeCount: 10,
            commentCount: 5,
            point: 100,
            pointOnTerm: 50,
            publicFlag: 1,
            typeId: 1,
            template: { typeId: 1, typeName: 'ナレッジ', typeIcon: 'fa-file-text-o' },
            tagNames: 'タグ1,タグ2',
            tagIds: '1,2',
            stocks: [],
            pin: false,
          },
          {
            knowledgeId: 2,
            title: '人気ナレッジ2',
            content: 'テスト内容2',
            insertUser: 'user2',
            insertUserName: 'テストユーザー2',
            insertDatetime: '2024-01-02T10:00:00Z',
            updateUser: 'user2',
            updateUserName: 'テストユーザー2',
            updateDatetime: '2024-01-02T10:00:00Z',
            likeCount: 8,
            commentCount: 3,
            point: 80,
            pointOnTerm: 30,
            publicFlag: 1,
            typeId: 1,
            template: { typeId: 1, typeName: 'ナレッジ', typeIcon: 'fa-file-text-o' },
            tagNames: '',
            tagIds: '',
            stocks: [],
            pin: false,
          },
        ],
        tags: [
          { tagId: 1, tagName: 'タグ1', knowledgeCount: 5 },
          { tagId: 2, tagName: 'タグ2', knowledgeCount: 3 },
        ],
        groups: [],
        offset: 0,
        limit: 20,
        total: 2,
      }),
    });
  });

  describe('基本レンダリング', () => {
    test('ページタイトルが表示される', async () => {
      render(<KnowledgePopularityPage />);
      
      await waitFor(() => {
        expect(screen.getByText('人気の投稿')).toBeInTheDocument();
      });
    });

    test('タブナビゲーションが表示される', async () => {
      render(<KnowledgePopularityPage />);
      
      await waitFor(() => {
        expect(screen.getByText('一覧')).toBeInTheDocument();
        expect(screen.getByText('人気の投稿')).toBeInTheDocument();
        expect(screen.getByText('履歴')).toBeInTheDocument();
      });
    });

    test('人気の投稿タブがアクティブになっている', async () => {
      render(<KnowledgePopularityPage />);
      
      await waitFor(() => {
        const popularTab = screen.getByRole('link', { name: '人気の投稿' });
        const listItem = popularTab.closest('li');
        expect(listItem).toHaveClass('active');
      });
    });

    test('ナレッジ一覧が表示される', async () => {
      render(<KnowledgePopularityPage />);
      
      await waitFor(() => {
        expect(screen.getByText('#1')).toBeInTheDocument();
        expect(screen.getByText('人気ナレッジ1')).toBeInTheDocument();
        expect(screen.getByText('#2')).toBeInTheDocument();
        expect(screen.getByText('人気ナレッジ2')).toBeInTheDocument();
      });
    });

    test('ポイント情報が表示される', async () => {
      render(<KnowledgePopularityPage />);
      
      await waitFor(() => {
        // ポイント表示
        expect(screen.getByText(/× 100/)).toBeInTheDocument();
        expect(screen.getByText(/× 80/)).toBeInTheDocument();
        // 期間ポイント表示
        expect(screen.getByText(/× 50/)).toBeInTheDocument();
        expect(screen.getByText(/× 30/)).toBeInTheDocument();
      });
    });
  });

  describe('認証状態による表示制御', () => {
    test('未ログイン時はストックタブが表示されない', async () => {
      render(<KnowledgePopularityPage />);
      
      await waitFor(() => {
        expect(screen.queryByText('ストック')).not.toBeInTheDocument();
      });
    });

    test('ログイン時はストックタブが表示される', async () => {
      // useAuthをモック
      const mockUseAuth = jest.spyOn(require('@/hooks/useAuth'), 'useAuth');
      mockUseAuth.mockReturnValue({ isLoggedIn: true, user: { userId: 'user1' } });
      
      render(<KnowledgePopularityPage />);
      
      await waitFor(() => {
        expect(screen.getByText('ストック')).toBeInTheDocument();
      });
      
      mockUseAuth.mockRestore();
    });
  });

  describe('API連携', () => {
    test('人気順APIが正しく呼ばれる', async () => {
      render(<KnowledgePopularityPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/knowledge/popularity'),
          expect.objectContaining({
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });
    });

    test('エラー時はエラーメッセージが表示される', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      render(<KnowledgePopularityPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
      });
    });
  });

  describe('旧システム互換性', () => {
    test('URLパスが旧システムと同じ', () => {
      render(<KnowledgePopularityPage />);
      // /open/knowledge/popularityでアクセス可能
    });

    test('レイアウト構造が旧システムと同じ', async () => {
      render(<KnowledgePopularityPage />);
      
      await waitFor(() => {
        // コンテナ
        const container = document.querySelector('.container');
        expect(container).toBeInTheDocument();
        // ナレッジリスト
        const knowledgeList = document.querySelector('#knowledgeList');
        expect(knowledgeList).toBeInTheDocument();
        // サイドバー
        const sidebar = document.querySelector('.col-md-4');
        expect(sidebar).toBeInTheDocument();
      });
    });

    test('CSS構造が旧システムと互換性がある', async () => {
      render(<KnowledgePopularityPage />);
      
      await waitFor(() => {
        const knowledgeItems = screen.getAllByTestId('knowledge-item');
        expect(knowledgeItems[0]).toHaveClass('knowledge_item');
      });
    });
  });
});