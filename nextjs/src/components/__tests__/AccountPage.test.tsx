/**
 * AccountPageテスト
 * 
 * @description アカウントページコンポーネントのテスト
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountPage } from '../AccountPage';
import { useLocale } from '@/lib/hooks/useLocale';

// モックデータ
const mockAccountInfo = {
  userId: 1,
  userName: 'Test User',
  knowledgeCount: 10,
  likeCount: 25,
  stockCount: 5,
  point: 100,
  knowledges: [
    {
      knowledgeId: 1,
      title: 'Test Knowledge 1',
      content: 'Test content 1',
      publicFlag: 1,
      likeCount: 10,
      commentCount: 3,
      viewCount: 100,
      stockId: 101,
      stockedUser: { userId: 1, userName: 'Test User' },
      insertUser: 1,
      insertDatetime: '2024-01-01T00:00:00Z',
      updateDatetime: '2024-01-01T00:00:00Z'
    },
    {
      knowledgeId: 2,
      title: 'Test Knowledge 2',
      content: 'Test content 2',
      publicFlag: 1,
      likeCount: 5,
      commentCount: 1,
      viewCount: 50,
      stockId: 102,
      stockedUser: { userId: 1, userName: 'Test User' },
      insertUser: 1,
      insertDatetime: '2024-01-02T00:00:00Z',
      updateDatetime: '2024-01-02T00:00:00Z'
    }
  ]
};

const mockCPData = [
  { date: '2024-01-01', point: 10 },
  { date: '2024-01-02', point: 20 },
  { date: '2024-01-03', point: 15 }
];

const mockActivities = [
  { msg: 'ナレッジを投稿しました', dispDate: '2024-01-01 10:00' },
  { msg: 'いいねしました', dispDate: '2024-01-01 12:00' },
  { msg: 'コメントしました', dispDate: '2024-01-01 14:00' }
];

// モック
jest.mock('@/hooks/useLocale');
jest.mock('../partials/CommonKnowledgeList', () => ({
  CommonKnowledgeList: ({ knowledges }: any) => (
    <div data-testid="common-knowledge-list">
      {knowledges.map((k: any) => (
        <div key={k.knowledgeId}>{k.title}</div>
      ))}
    </div>
  )
}));
jest.mock('../partials/CPChart', () => ({
  CPChart: ({ data }: any) => (
    <div data-testid="cp-chart-mock">
      CP Chart: {data.length} data points
    </div>
  )
}));
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

const mockT = (key: string) => {
  const translations: { [key: string]: string } = {
    'knowledge.account.label.cp': 'Contribution Points',
    'knowledge.account.label.knowledge.count': 'Knowledge Count',
    'knowledge.account.label.like.count': 'Like Count',
    'knowledge.account.label.stock.count': 'Stock Count',
    'knowledge.account.label.knowledges': 'Knowledges',
    'knowledge.account.label.activity': 'Activity',
    'label.previous': 'Previous',
    'label.next': 'Next'
  };
  return translations[key] || key;
};

describe('AccountPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocale as jest.Mock).mockReturnValue({ t: mockT });
    
    // fetch のモック
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('正常系', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAccountInfo
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCPData
        });
    });

    test('アカウント情報が正しく表示される', async () => {
      render(<AccountPage userId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
      
      // アカウント統計情報
      expect(screen.getByText('100')).toBeInTheDocument(); // CP
      expect(screen.getByText('10')).toBeInTheDocument(); // Knowledge Count
      expect(screen.getByText('25')).toBeInTheDocument(); // Like Count
      expect(screen.getByText('5')).toBeInTheDocument(); // Stock Count
      
      // アイコン
      const icon = screen.getByAltText('icon');
      expect(icon).toHaveAttribute('src', '/api/open/account/icon/1');
    });

    test('ナレッジ一覧が表示される', async () => {
      render(<AccountPage userId={1} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('common-knowledge-list')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Test Knowledge 1')).toBeInTheDocument();
      expect(screen.getByText('Test Knowledge 2')).toBeInTheDocument();
    });

    test('CPチャートが表示される', async () => {
      render(<AccountPage userId={1} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('cp-chart-mock')).toBeInTheDocument();
      });
      
      expect(screen.getByText('CP Chart: 3 data points')).toBeInTheDocument();
    });

    test('タブ切り替えが正しく動作する', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAccountInfo
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCPData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockActivities
        });

      const user = userEvent.setup();
      render(<AccountPage userId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
      
      // 初期状態：ナレッジタブがアクティブ
      expect(screen.getByTestId('knowledges-area')).toHaveStyle({ display: 'block' });
      expect(screen.getByTestId('activity-area')).toHaveStyle({ display: 'none' });
      
      // アクティビティタブをクリック
      const activityTab = screen.getByText('Activity');
      await user.click(activityTab);
      
      // アクティビティエリアが表示される
      expect(screen.getByTestId('knowledges-area')).toHaveStyle({ display: 'none' });
      expect(screen.getByTestId('activity-area')).toHaveStyle({ display: 'block' });
      
      // アクティビティが表示される
      await waitFor(() => {
        expect(screen.getByText('ナレッジを投稿しました')).toBeInTheDocument();
        expect(screen.getByText('いいねしました')).toBeInTheDocument();
        expect(screen.getByText('コメントしました')).toBeInTheDocument();
      });
    });

    test('ページネーションリンクが正しく設定される', async () => {
      render(<AccountPage userId={1} offset={5} />);
      
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
      
      const prevLink = screen.getByText('Previous').closest('a');
      const nextLink = screen.getByText('Next').closest('a');
      
      expect(prevLink).toHaveAttribute('href', '/open/account/info/1?offset=4');
      expect(nextLink).toHaveAttribute('href', '/open/account/info/1?offset=6');
    });

    test('offset=0の場合も正しく動作する', async () => {
      render(<AccountPage userId={1} offset={0} />);
      
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
      
      const prevLink = screen.getByText('Previous').closest('a');
      expect(prevLink).toHaveAttribute('href', '/open/account/info/1?offset=0');
    });
  });

  describe('エラー処理', () => {
    test('ユーザーが見つからない場合エラーメッセージが表示される', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      render(<AccountPage userId={999} />);
      
      await waitFor(() => {
        expect(screen.getByText('ユーザーが見つかりません')).toBeInTheDocument();
      });
    });

    test('サーバーエラーの場合エラーメッセージが表示される', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      render(<AccountPage userId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
      });
    });

    test('ネットワークエラーの場合エラーメッセージが表示される', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<AccountPage userId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
      });
    });

    test('CPデータ取得エラーでも他の情報は表示される', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAccountInfo
        })
        .mockRejectedValueOnce(new Error('CP data error'));

      render(<AccountPage userId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
      
      // CPチャートは空データで表示される
      expect(screen.getByTestId('cp-chart-mock')).toBeInTheDocument();
      expect(screen.getByText('CP Chart: 0 data points')).toBeInTheDocument();
    });

    test('アクティビティ取得エラーでも他の情報は表示される', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAccountInfo
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCPData
        })
        .mockRejectedValueOnce(new Error('Activity error'));

      const user = userEvent.setup();
      render(<AccountPage userId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
      
      // アクティビティタブに切り替え
      await user.click(screen.getByText('Activity'));
      
      // アクティビティエリアは表示されるが中身は空
      expect(screen.getByTestId('activity-area')).toHaveStyle({ display: 'block' });
      expect(screen.queryByText('ナレッジを投稿しました')).not.toBeInTheDocument();
    });
  });

  describe('ローディング状態', () => {
    test('データ取得中はローディング表示される', () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(() => {}) // 永遠に解決しない
      );

      render(<AccountPage userId={1} />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('隠しフィールド', () => {
    test('隠しフィールドが正しく設定される', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAccountInfo
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCPData
        });

      render(<AccountPage userId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
      
      const userIdInput = document.getElementById('userId') as HTMLInputElement;
      const pointInput = document.getElementById('point') as HTMLInputElement;
      
      expect(userIdInput.value).toBe('1');
      expect(pointInput.value).toBe('100');
    });
  });
});