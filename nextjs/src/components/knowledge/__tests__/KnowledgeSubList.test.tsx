/**
 * KnowledgeSubListテスト
 * 
 * @description ナレッジサブリストコンポーネントのテスト
 */
import { render, screen, waitFor } from '@testing-library/react';
import KnowledgeSubList from '../KnowledgeSubList';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLocale } from '@/lib/hooks/useLocale';

// モック
jest.mock('@/lib/hooks/useAuth');
jest.mock('@/lib/hooks/useLocale');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseLocale = useLocale as jest.Mock;

// モックデータ
const mockEvents = [
  {
    knowledgeId: 1,
    title: 'Tech Conference 2024',
    startDateTime: '2024-12-01 10:00'
  },
  {
    knowledgeId: 2,
    title: 'Workshop: React Best Practices',
    startDateTime: '2024-12-15 14:00'
  }
];

const mockGroups = [
  {
    groupId: 'group1',
    groupName: 'Development Team',
    groupDescription: 'Main development team'
  },
  {
    groupId: 'group2',
    groupName: 'QA Team'
  }
];

const mockTags = [
  {
    tagId: 1,
    tagName: 'React',
    knowledgeCount: 25
  },
  {
    tagId: 2,
    tagName: 'TypeScript',
    knowledgeCount: 18
  },
  {
    tagId: 3,
    tagName: 'Testing',
    knowledgeCount: 0
  }
];

describe('KnowledgeSubList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocale.mockReturnValue({
      locale: 'ja',
      t: (key: string) => key
    });
    
    // fetch のモック
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('未認証ユーザー', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null
      });

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url === '/api/events') {
          return Promise.resolve({
            ok: true,
            json: async () => mockEvents
          });
        }
        if (url === '/api/tags/popular') {
          return Promise.resolve({
            ok: true,
            json: async () => mockTags
          });
        }
        return Promise.resolve({ ok: false });
      });
    });

    test('イベントと人気タグが表示される（グループは表示されない）', async () => {
      render(<KnowledgeSubList />);

      await waitFor(() => {
        // イベント
        expect(screen.getByText('Events')).toBeInTheDocument();
        expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
        expect(screen.getByText('Workshop: React Best Practices')).toBeInTheDocument();
        expect(screen.getByText('2024-12-01 10:00')).toBeInTheDocument();
        expect(screen.getByText('2024-12-15 14:00')).toBeInTheDocument();

        // 人気タグ
        expect(screen.getByText('Popular Tags')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('(25)')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
        expect(screen.getByText('(18)')).toBeInTheDocument();
        expect(screen.getByText('Testing')).toBeInTheDocument();

        // グループは表示されない
        expect(screen.queryByText('Groups')).not.toBeInTheDocument();
      });
    });

    test('グループAPIは呼ばれない', async () => {
      render(<KnowledgeSubList />);

      await waitFor(() => {
        expect(screen.getByText('Events')).toBeInTheDocument();
      });

      expect(global.fetch).not.toHaveBeenCalledWith('/api/groups', expect.any(Object));
    });
  });

  describe('認証済みユーザー', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', name: 'Test User', email: 'test@example.com' },
        loading: false,
        error: null
      });

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url === '/api/events') {
          return Promise.resolve({
            ok: true,
            json: async () => mockEvents
          });
        }
        if (url === '/api/groups') {
          return Promise.resolve({
            ok: true,
            json: async () => mockGroups
          });
        }
        if (url === '/api/tags/popular') {
          return Promise.resolve({
            ok: true,
            json: async () => mockTags
          });
        }
        return Promise.resolve({ ok: false });
      });
    });

    test('イベント、グループ、人気タグがすべて表示される', async () => {
      render(<KnowledgeSubList />);

      await waitFor(() => {
        // イベント
        expect(screen.getByText('Events')).toBeInTheDocument();
        expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();

        // グループ
        expect(screen.getByText('Groups')).toBeInTheDocument();
        expect(screen.getByText('Development Team')).toBeInTheDocument();
        expect(screen.getByText('Main development team')).toBeInTheDocument();
        expect(screen.getByText('QA Team')).toBeInTheDocument();

        // 人気タグ
        expect(screen.getByText('Popular Tags')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
      });
    });

    test('正しいリンクが設定される', async () => {
      render(<KnowledgeSubList />);

      await waitFor(() => {
        // イベントリンク
        const eventLink = screen.getByText('Tech Conference 2024').closest('a');
        expect(eventLink).toHaveAttribute('href', '/open/knowledge/view/1');

        // グループリンク
        const groupLink = screen.getByText('Development Team').closest('a');
        expect(groupLink).toHaveAttribute('href', '/open/knowledge/list?group=group1');

        // タグリンク
        const tagLink = screen.getByText('React').closest('a');
        expect(tagLink).toHaveAttribute('href', '/open/knowledge/list?tag=1');
      });
    });

    test('グループ説明がない場合は説明が表示されない', async () => {
      render(<KnowledgeSubList />);

      await waitFor(() => {
        expect(screen.getByText('QA Team')).toBeInTheDocument();
        // QA Teamには説明がないので、説明要素が存在しない
        const qaTeamElement = screen.getByText('QA Team').parentElement;
        expect(qaTeamElement?.querySelector('.group_desc')).not.toBeInTheDocument();
      });
    });
  });

  describe('ローディング状態', () => {
    test('データ取得中はローディングアイコンが表示される', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null
      });

      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(() => {}) // 永遠に解決しない
      );

      render(<KnowledgeSubList />);

      expect(screen.getByRole('generic', { hidden: true })).toHaveClass('fa-spinner');
    });
  });

  describe('エラー処理', () => {
    test('APIエラー時は空のコンテンツが表示される', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null
      });

      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      render(<KnowledgeSubList />);

      await waitFor(() => {
        // エラーが発生してもクラッシュせず、セクションが表示されない
        expect(screen.queryByText('Events')).not.toBeInTheDocument();
        expect(screen.queryByText('Popular Tags')).not.toBeInTheDocument();
      });
    });

    test('一部のAPIがエラーでも他のセクションは表示される', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null
      });

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url === '/api/events') {
          return Promise.resolve({
            ok: true,
            json: async () => mockEvents
          });
        }
        if (url === '/api/tags/popular') {
          return Promise.reject(new Error('Tags API Error'));
        }
        return Promise.resolve({ ok: false });
      });

      render(<KnowledgeSubList />);

      await waitFor(() => {
        // イベントは表示される
        expect(screen.getByText('Events')).toBeInTheDocument();
        expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
        
        // タグは表示されない
        expect(screen.queryByText('Popular Tags')).not.toBeInTheDocument();
      });
    });
  });

  describe('空データの処理', () => {
    test('データが空の場合はセクションが表示されない', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', name: 'Test User', email: 'test@example.com' },
        loading: false,
        error: null
      });

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        return Promise.resolve({
          ok: true,
          json: async () => []
        });
      });

      render(<KnowledgeSubList />);

      await waitFor(() => {
        // すべてのセクションが表示されない
        expect(screen.queryByText('Events')).not.toBeInTheDocument();
        expect(screen.queryByText('Groups')).not.toBeInTheDocument();
        expect(screen.queryByText('Popular Tags')).not.toBeInTheDocument();
      });
    });
  });

  describe('国際化対応', () => {
    test('正しいロケールヘッダーが送信される', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null
      });

      mockUseLocale.mockReturnValue({
        locale: 'en',
        t: (key: string) => key
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => []
      });

      render(<KnowledgeSubList />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/events', {
          headers: { 'Accept-Language': 'en' }
        });
        expect(global.fetch).toHaveBeenCalledWith('/api/tags/popular', {
          headers: { 'Accept-Language': 'en' }
        });
      });
    });
  });

  describe('タグカウント表示', () => {
    test('カウントが0の場合はカウントが表示されない', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null
      });

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url === '/api/events') {
          return Promise.resolve({
            ok: true,
            json: async () => []
          });
        }
        if (url === '/api/tags/popular') {
          return Promise.resolve({
            ok: true,
            json: async () => mockTags
          });
        }
        return Promise.resolve({ ok: false });
      });

      render(<KnowledgeSubList />);

      await waitFor(() => {
        // Testingタグ（カウント0）にはカウントが表示されない
        expect(screen.getByText('Testing')).toBeInTheDocument();
        const testingTag = screen.getByText('Testing').closest('.tag');
        expect(testingTag).not.toHaveTextContent('(0)');
        
        // 他のタグにはカウントが表示される
        expect(screen.getByText('(25)')).toBeInTheDocument();
        expect(screen.getByText('(18)')).toBeInTheDocument();
      });
    });
  });
});