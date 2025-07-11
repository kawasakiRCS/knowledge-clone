/**
 * AccountPageコンポーネントのテスト
 * 
 * @description 旧システムのopen/account/account.jspとの互換性テストを含む
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountPage } from '@/components/AccountPage';
import { useRouter } from 'next/router';

// useRouterのモック
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// useLocaleのモック
jest.mock('@/lib/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => key,  // キーをそのまま返す
    locale: 'ja',
  }),
}));

// CPChartのモック
jest.mock('@/components/partials/CPChart', () => ({
  CPChart: () => <div data-testid="mock-cp-chart">Mock CP Chart</div>,
}));

// CommonKnowledgeListのモック
jest.mock('@/components/partials/CommonKnowledgeList', () => ({
  CommonKnowledgeList: ({ knowledges }: { knowledges: Array<{ knowledgeId: number; title: string }> }) => (
    <div className="knowledge-list">
      {knowledges.map((k) => (
        <div key={k.knowledgeId} className="knowledge-item">
          <h4>{k.title}</h4>
        </div>
      ))}
    </div>
  ),
}));

// モックデータ
const mockAccountInfo = {
  userId: 1,
  userName: 'テストユーザー',
  knowledgeCount: 10,
  likeCount: 25,
  stockCount: 5,
  point: 100,
};

const mockKnowledges = [
  {
    knowledgeId: 1,
    title: 'テストナレッジ1',
    content: 'テスト内容1',
    createUser: { userId: 1, userName: 'テストユーザー' },
    createDatetime: '2025-01-10 10:00:00',
    likeCount: 5,
    commentCount: 3,
    publicFlag: 1,
    tags: [{ tagName: 'test' }],
    viewers: [],
    stocks: [],
  },
];

const mockCPData = [
  { date: '2025-01-01', point: 10 },
  { date: '2025-01-02', point: 15 },
  { date: '2025-01-03', point: 20 },
];

const mockActivities = [
  {
    msg: '<i class="fa fa-book"></i> ナレッジを投稿しました',
    dispDate: '2025-01-10 10:00',
  },
  {
    msg: '<i class="fa fa-thumbs-o-up"></i> いいねしました',
    dispDate: '2025-01-09 15:30',
  },
];

// APIモック関数
global.fetch = jest.fn();

const mockFetch = (url: string) => {
  if (url.includes('/api/open/account/info/')) {
    return Promise.resolve({
      ok: true,
      json: async () => ({
        ...mockAccountInfo,
        knowledges: mockKnowledges,
      }),
    });
  }
  if (url.includes('/api/open/account/cp/')) {
    return Promise.resolve({
      ok: true,
      json: async () => mockCPData,
    });
  }
  if (url.includes('/api/open/account/activity/')) {
    return Promise.resolve({
      ok: true,
      json: async () => mockActivities,
    });
  }
  if (url.includes('/api/open/account/knowledge/')) {
    return Promise.resolve({
      ok: true,
      json: async () => mockKnowledges,
    });
  }
  return Promise.reject(new Error('Unknown API'));
};

describe('AccountPage', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      query: { userId: '1' },
      pathname: '/open/account/1',
    });
    (global.fetch as jest.Mock).mockImplementation(mockFetch);
  });

  describe('基本レンダリング', () => {
    test('コンポーネントが表示される', async () => {
      render(<AccountPage userId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('テストユーザー')).toBeInTheDocument();
      });
    });

    test('ユーザーアイコンが表示される', async () => {
      render(<AccountPage userId={1} />);
      
      await waitFor(() => {
        const icon = screen.getByRole('img', { name: /icon/i });
        expect(icon).toHaveAttribute('src', '/api/open/account/icon/1');
        expect(icon).toHaveAttribute('width', '64');
        expect(icon).toHaveAttribute('height', '64');
      });
    });

    test('ユーザー統計情報が表示される', async () => {
      const { container } = render(<AccountPage userId={1} />);
      
      await waitFor(() => {
        // CP（コントリビューションポイント）
        expect(screen.getByText('knowledge.account.label.cp')).toBeInTheDocument();
        const cpRow = container.querySelector('.fa-heart-o')?.parentElement?.parentElement;
        expect(cpRow?.textContent).toContain('100');
        
        // ナレッジ数
        expect(screen.getByText('knowledge.account.label.knowledge.count')).toBeInTheDocument();
        const knowledgeRow = container.querySelector('.fa-book')?.parentElement?.parentElement;
        expect(knowledgeRow?.textContent).toContain('10');
        
        // いいね数
        expect(screen.getByText('knowledge.account.label.like.count')).toBeInTheDocument();
        const likeRow = container.querySelector('.fa-thumbs-o-up')?.parentElement?.parentElement;
        expect(likeRow?.textContent).toContain('25');
        
        // ストック数
        expect(screen.getByText('knowledge.account.label.stock.count')).toBeInTheDocument();
        const stockRow = container.querySelector('.fa-star-o')?.parentElement?.parentElement;
        expect(stockRow?.textContent).toContain('5');
      });
    });

    test('CPチャートが表示される', async () => {
      render(<AccountPage userId={1} />);
      
      await waitFor(() => {
        const canvas = screen.getByTestId('cp-chart');
        expect(canvas).toBeInTheDocument();
      });
    });
  });

  describe('タブ切り替え', () => {
    test('デフォルトでナレッジタブがアクティブ', async () => {
      render(<AccountPage userId={1} />);
      
      await waitFor(() => {
        const knowledgeTab = screen.getByRole('tab', { name: /knowledge.account.label.knowledges/i });
        expect(knowledgeTab.parentElement).toHaveClass('active');
      });
    });

    test('アクティビティタブをクリックすると切り替わる', async () => {
      const user = userEvent.setup();
      render(<AccountPage userId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('テストユーザー')).toBeInTheDocument();
      });

      const activityTab = screen.getByText('knowledge.account.label.activity');
      await user.click(activityTab);

      await waitFor(() => {
        const activityArea = screen.getByTestId('activity-area');
        const knowledgesArea = screen.getByTestId('knowledges-area');
        
        // タブのリストアイテムを確認
        const activityTabItem = activityTab.closest('li');
        expect(activityTabItem).toHaveClass('active');
        
        // 表示状態を確認
        expect(activityArea).toHaveStyle({ display: 'block' });
        expect(knowledgesArea).toHaveStyle({ display: 'none' });
      });
    });
  });

  describe('ナレッジ一覧表示', () => {
    test('ナレッジリストが表示される', async () => {
      render(<AccountPage userId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('テストナレッジ1')).toBeInTheDocument();
      });
    });

    test('ページネーションが表示される', async () => {
      render(<AccountPage userId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('label.previous')).toBeInTheDocument();
        expect(screen.getByText('label.next')).toBeInTheDocument();
      });
    });

    test('ページネーションリンクが正しい', async () => {
      render(<AccountPage userId={1} offset={1} />);
      
      await waitFor(() => {
        const prevLink = screen.getByRole('link', { name: /label.previous/i });
        const nextLink = screen.getByRole('link', { name: /label.next/i });
        
        expect(prevLink).toHaveAttribute('href', '/open/account/info/1?offset=0');
        expect(nextLink).toHaveAttribute('href', '/open/account/info/1?offset=2');
      });
    });
  });

  describe('アクティビティ表示', () => {
    test('アクティビティ一覧が表示される', async () => {
      const user = userEvent.setup();
      render(<AccountPage userId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('テストユーザー')).toBeInTheDocument();
      });

      const activityTab = screen.getByText('knowledge.account.label.activity');
      await user.click(activityTab);

      await waitFor(() => {
        const activityList = screen.getByTestId('activity-area');
        expect(activityList).toHaveTextContent('ナレッジを投稿しました');
        expect(activityList).toHaveTextContent('いいねしました');
        expect(activityList).toHaveTextContent('2025-01-10 10:00');
        expect(activityList).toHaveTextContent('2025-01-09 15:30');
      });
    });
  });

  describe('旧システム互換性', () => {
    test('旧システムと同じURL構造', async () => {
      render(<AccountPage userId={1} />);
      
      await waitFor(() => {
        const icon = screen.getByRole('img', { name: /icon/i });
        expect(icon).toHaveAttribute('src', '/api/open/account/icon/1');
      });
    });

    test('旧システムと同じCSSクラス構造', async () => {
      const { container } = render(<AccountPage userId={1} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('knowledges-area')).toBeInTheDocument();
        expect(screen.getByTestId('activity-area')).toBeInTheDocument();
        
        // タブエリアのクラス確認
        const tabArea = container.querySelector('#tabArea');
        expect(tabArea).toHaveClass('row');
        
        // ナビゲーションタブの確認
        expect(container.querySelector('.nav.nav-tabs')).toBeInTheDocument();
      });
    });

    test('Bootstrap 3.3.7のグリッドシステムを使用', async () => {
      const { container } = render(<AccountPage userId={1} />);
      
      await waitFor(() => {
        const cols = container.querySelectorAll('.col-sm-6.col-md-6');
        expect(cols).toHaveLength(2);
        
        const colXs6 = container.querySelectorAll('.col-xs-6');
        expect(colXs6.length).toBeGreaterThan(0);
      });
    });
  });

  describe('エラーハンドリング', () => {
    test('ユーザーが見つからない場合404エラー', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        })
      );

      render(<AccountPage userId={999} />);
      
      await waitFor(() => {
        expect(screen.getByText('ユーザーが見つかりません')).toBeInTheDocument();
      });
    });

    test('APIエラー時にエラーメッセージ表示', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.reject(new Error('Network error'))
      );

      render(<AccountPage userId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
      });
    });
  });
});