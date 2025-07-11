/**
 * ストックしたナレッジ一覧ページテスト
 * 
 * @description 旧システムとの互換性テストを含む
 */
import { render, screen, waitFor } from '@testing-library/react';
import KnowledgeStocksPage from '../page';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

// モック
jest.mock('@/hooks/useAuth');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/layout/MainLayout', () => {
  return function MockMainLayout({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  };
});

jest.mock('@/components/knowledge/KnowledgeListItem', () => {
  return {
    KnowledgeListItem: function MockKnowledgeListItem({ knowledge }: any) {
      return (
        <div>
          <h3>{knowledge.title}</h3>
          <p>{knowledge.insertUserName}</p>
        </div>
      );
    }
  };
});

jest.mock('@/components/knowledge/KnowledgeSubList', () => {
  return {
    KnowledgeSubList: function MockKnowledgeSubList() {
      return <div>SubList</div>;
    }
  };
});

// fetch APIのモック
global.fetch = jest.fn();

describe('KnowledgeStocksPage', () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter as any);
    mockUseAuth.mockReturnValue({ isAuthenticated: true, user: { id: 1, name: 'Test User' } });
  });

  describe('基本レンダリング', () => {
    test('ページタイトルが表示される', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          stocks: [],
          stock: null,
          pagination: { offset: 0, limit: 20, total: 0 },
        }),
      } as Response);

      render(<KnowledgeStocksPage searchParams={{}} />);

      await waitFor(() => {
        const tabs = screen.getByRole('tablist');
        expect(tabs).toBeInTheDocument();
        
        // ストックタブがアクティブ
        const stockTab = screen.getByRole('tab', { name: /ストック一覧/i });
        expect(stockTab.parentElement).toHaveClass('active');
      });
    });

    test('未ログインの場合、ストックタブが表示されない', async () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false, user: null });
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          stocks: [],
          stock: null,
          pagination: { offset: 0, limit: 20, total: 0 },
        }),
      } as Response);

      render(<KnowledgeStocksPage searchParams={{}} />);

      await waitFor(() => {
        const stockTab = screen.queryByRole('tab', { name: /ストック一覧/i });
        expect(stockTab).not.toBeInTheDocument();
      });
    });
  });

  describe('ストック一覧表示', () => {
    test('ストックしたナレッジが表示される', async () => {
      const mockStocks = [
        {
          knowledgeId: 1,
          title: 'ストックされたナレッジ1',
          content: 'テスト内容1',
          publicFlag: 1,
          viewCount: 10,
          likeCount: 5,
          commentCount: 3,
          point: 15,
          insertUser: 1,
          insertUserName: 'User1',
          insertDatetime: '2024-01-01T00:00:00Z',
          updateDatetime: '2024-01-02T00:00:00Z',
          tagNames: ['tag1', 'tag2'],
          stocks: [{ stockId: 1, stockName: 'お気に入り' }],
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          stocks: mockStocks,
          stock: null,
          pagination: { offset: 0, limit: 20, total: 1 },
        }),
      } as Response);

      render(<KnowledgeStocksPage searchParams={{}} />);

      await waitFor(() => {
        expect(screen.getByText('ストックされたナレッジ1')).toBeInTheDocument();
        expect(screen.getByText('User1')).toBeInTheDocument();
      });
    });

    test('特定のストックでフィルタリングできる', async () => {
      const mockStock = { stockId: 2, stockName: 'プロジェクトA' };
      const mockStocks = [
        {
          knowledgeId: 2,
          title: 'プロジェクトAのナレッジ',
          content: 'プロジェクト関連',
          publicFlag: 1,
          viewCount: 5,
          likeCount: 2,
          commentCount: 1,
          point: 8,
          insertUser: 1,
          insertUserName: 'User1',
          insertDatetime: '2024-01-01T00:00:00Z',
          updateDatetime: '2024-01-02T00:00:00Z',
          tagNames: [],
          stocks: [mockStock],
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          stocks: mockStocks,
          stock: mockStock,
          pagination: { offset: 0, limit: 20, total: 1 },
        }),
      } as Response);

      render(<KnowledgeStocksPage searchParams={{ stockid: '2' }} />);

      await waitFor(() => {
        // ストック名が表示される
        expect(screen.getByText('プロジェクトA')).toBeInTheDocument();
        expect(screen.getByText('プロジェクトAのナレッジ')).toBeInTheDocument();
      });
    });
  });

  describe('ストック管理リンク', () => {
    test('ストック管理へのリンクが表示される', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          stocks: [],
          stock: null,
          pagination: { offset: 0, limit: 20, total: 0 },
        }),
      } as Response);

      render(<KnowledgeStocksPage searchParams={{}} />);

      await waitFor(() => {
        const link = screen.getByRole('link', { name: /ストック管理/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/protect/stock/mylist');
      });
    });
  });

  describe('ページネーション', () => {
    test('ページネーションが表示される', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          stocks: Array(20).fill({
            knowledgeId: 1,
            title: 'テスト',
            content: 'テスト',
            publicFlag: 1,
            viewCount: 0,
            likeCount: 0,
            commentCount: 0,
            point: 0,
            insertUser: 1,
            insertUserName: 'User1',
            insertDatetime: '2024-01-01T00:00:00Z',
            updateDatetime: '2024-01-02T00:00:00Z',
            tagNames: [],
            stocks: [],
          }),
          stock: null,
          pagination: { offset: 1, limit: 20, total: 50 },
        }),
      } as Response);

      render(<KnowledgeStocksPage searchParams={{ offset: '1' }} />);

      await waitFor(() => {
        const prevLink = screen.getByRole('link', { name: /前へ/i });
        const nextLink = screen.getByRole('link', { name: /次へ/i });
        
        expect(prevLink).toBeInTheDocument();
        expect(nextLink).toBeInTheDocument();
        expect(prevLink).toHaveAttribute('href', '/open/knowledge/stocks/0');
        expect(nextLink).toHaveAttribute('href', '/open/knowledge/stocks/2');
      });
    });

    test('ストックIDがある場合、ページネーションにパラメータが含まれる', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          stocks: Array(20).fill({
            knowledgeId: 1,
            title: 'テスト',
            content: 'テスト',
            publicFlag: 1,
            viewCount: 0,
            likeCount: 0,
            commentCount: 0,
            point: 0,
            insertUser: 1,
            insertUserName: 'User1',
            insertDatetime: '2024-01-01T00:00:00Z',
            updateDatetime: '2024-01-02T00:00:00Z',
            tagNames: [],
            stocks: [],
          }),
          stock: { stockId: 3, stockName: 'テストストック' },
          pagination: { offset: 1, limit: 20, total: 50 },
        }),
      } as Response);

      render(<KnowledgeStocksPage searchParams={{ offset: '1', stockid: '3' }} />);

      await waitFor(() => {
        const prevLink = screen.getByRole('link', { name: /前へ/i });
        const nextLink = screen.getByRole('link', { name: /次へ/i });
        
        expect(prevLink).toHaveAttribute('href', '/open/knowledge/stocks/0?stockid=3');
        expect(nextLink).toHaveAttribute('href', '/open/knowledge/stocks/2?stockid=3');
      });
    });
  });

  describe('エラーハンドリング', () => {
    test('APIエラー時にエラーメッセージが表示される', async () => {
      mockFetch.mockRejectedValue(new Error('API Error'));

      render(<KnowledgeStocksPage searchParams={{}} />);

      await waitFor(() => {
        expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
      });
    });

    test('無効なストックIDの場合、ストック情報が表示されない', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          stocks: [],
          stock: null,  // 無効なストックID
          pagination: { offset: 0, limit: 20, total: 0 },
        }),
      } as Response);

      render(<KnowledgeStocksPage searchParams={{ stockid: '999' }} />);

      await waitFor(() => {
        // ストック名は表示されない
        const stockName = screen.queryByText(/fa-star-o/i);
        expect(stockName).not.toBeInTheDocument();
      });
    });
  });

  describe('旧システム互換性', () => {
    test('CSSクラス構造が旧システムと同等', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          stocks: [],
          stock: null,
          pagination: { offset: 0, limit: 20, total: 0 },
        }),
      } as Response);

      const { container } = render(<KnowledgeStocksPage searchParams={{}} />);

      await waitFor(() => {
        expect(container.querySelector('.selected_tag')).toBeInTheDocument();
        expect(container.querySelector('#knowledgeList')).toBeInTheDocument();
        // データがないときはpagerは表示されない
        expect(container.querySelector('.pager')).not.toBeInTheDocument();
      });
    });
  });
});