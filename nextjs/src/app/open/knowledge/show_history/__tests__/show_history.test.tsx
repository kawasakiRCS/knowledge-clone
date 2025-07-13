/**
 * 閲覧履歴表示ページテスト
 * 
 * @description 旧システムのshow_history.jspとの互換性テスト
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/hooks/useLocale';
import KnowledgeShowHistoryPage from '../page';

// モック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: jest.fn(),
}));

// API応答のモック
const mockHistoryKnowledges = [
  {
    knowledgeId: 3,
    title: 'React Best Practices',
    content: 'React開発のベストプラクティス',
    publicFlag: 1,
    typeId: 1,
    template: { id: 1, name: 'Markdown' },
    insertUser: '1',
    insertUserName: 'Admin User',
    insertDatetime: '2024-01-03T10:00:00Z',
    updateUser: '1', 
    updateUserName: 'Admin User',
    updateDatetime: '2024-01-03T15:00:00Z',
    likeCount: 8,
    commentCount: 3,
    point: 25,
    periodPoint: 25,
    viewCount: 80,
    viewed: false,
    tags: [
      { tagId: 1, tagName: 'React' },
      { tagId: 2, tagName: 'JavaScript' }
    ],
    stocks: []
  },
  {
    knowledgeId: 2,
    title: 'TypeScript入門',
    content: 'TypeScriptの基本を学ぶ',
    publicFlag: 1,
    typeId: 1,
    template: { id: 1, name: 'Markdown' },
    insertUser: '2',
    insertUserName: 'Test User',
    insertDatetime: '2024-01-02T09:00:00Z',
    updateUser: '2',
    updateUserName: 'Test User',
    updateDatetime: '2024-01-02T09:00:00Z',
    likeCount: 5,
    commentCount: 2,
    point: 15,
    periodPoint: 15,
    viewCount: 50,
    viewed: true,
    tags: [
      { tagId: 3, tagName: 'TypeScript' }
    ],
    stocks: []
  },
  {
    knowledgeId: 1,
    title: '初めての投稿',
    content: '最初の記事です',
    publicFlag: 1,
    typeId: 1,
    template: { id: 1, name: 'Markdown' },
    insertUser: '1',
    insertUserName: 'Admin User',
    insertDatetime: '2024-01-01T08:00:00Z',
    updateUser: '1',
    updateUserName: 'Admin User', 
    updateDatetime: '2024-01-01T08:00:00Z',
    likeCount: 3,
    commentCount: 1,
    point: 10,
    periodPoint: 10,
    viewCount: 30,
    viewed: true,
    tags: [],
    stocks: []
  }
];

// APIモックのセットアップ
const setupFetchMock = (data: typeof mockHistoryKnowledges = mockHistoryKnowledges) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
    })
  ) as jest.Mock;
};

describe('KnowledgeShowHistoryPage', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };
  
  const mockT = (key: string) => {
    const translations: Record<string, string> = {
      'knowledge.list.kind.list': 'ナレッジ一覧',
      'knowledge.list.kind.popular': '人気',
      'knowledge.list.kind.stock': 'ストック',
      'knowledge.list.kind.history': '履歴',
      'knowledge.list.empty': 'ナレッジが登録されていません',
      'label.unread': '未読',
      'knowledge.view.info.insert': '%sが%sに登録',
      'knowledge.view.info.update': '(%sが%sに更新)',
    };
    return translations[key] || key;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    (useLocale as jest.Mock).mockReturnValue({ t: mockT, locale: 'ja' });
    
    // localStorageのモック
    const localStorageMock = {
      getItem: jest.fn((key) => key === 'knowledge_history' ? '3,2,1' : null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    
    // Cookieのモック
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'KNOWLEDGE_HISTORY=3,2,1',
    });
  });

  describe('基本レンダリング', () => {
    test('ページコンポーネントが表示される', async () => {
      setupFetchMock();
      render(<KnowledgeShowHistoryPage />);
      
      await waitFor(() => {
        expect(screen.getByText('履歴')).toBeInTheDocument();
      });
    });

    test('タブナビゲーションが正しく表示される', async () => {
      setupFetchMock();
      render(<KnowledgeShowHistoryPage />);
      
      await waitFor(() => {
        expect(screen.getByText('ナレッジ一覧')).toBeInTheDocument();
        expect(screen.getByText('人気')).toBeInTheDocument();
        expect(screen.getByText('履歴')).toBeInTheDocument();
      });
      
      // 履歴タブがアクティブ
      const historyTab = screen.getByRole('tab', { name: '履歴' });
      expect(historyTab.parentElement).toHaveClass('active');
    });

    test('ログイン時はストックタブも表示される', async () => {
      (useAuth as jest.Mock).mockReturnValue({ user: { id: '1', name: 'Test User' } });
      setupFetchMock();
      
      render(<KnowledgeShowHistoryPage />);
      
      await waitFor(() => {
        expect(screen.getByText('ストック')).toBeInTheDocument();
      });
    });
  });

  describe('履歴データ表示', () => {
    test('Cookie/localStorageから履歴IDを取得して表示する', async () => {
      setupFetchMock();
      render(<KnowledgeShowHistoryPage />);
      
      await waitFor(() => {
        // APIが正しいIDで呼ばれることを確認
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/knowledge/show-history?ids=3,2,1'),
          expect.any(Object)
        );
        
        // ナレッジが表示される
        expect(screen.getByText('#3')).toBeInTheDocument();
        expect(screen.getAllByText('React Best Practices')[0]).toBeInTheDocument();
        expect(screen.getByText('#2')).toBeInTheDocument();
        expect(screen.getByText('TypeScript入門')).toBeInTheDocument();
        expect(screen.getByText('#1')).toBeInTheDocument();
        expect(screen.getByText('初めての投稿')).toBeInTheDocument();
      });
    });

    test('未読マークが正しく表示される', async () => {
      setupFetchMock();
      render(<KnowledgeShowHistoryPage />);
      
      await waitFor(() => {
        // 未読の記事に未読ラベルが表示される
        const unreadItems = screen.getAllByText('[未読]');
        expect(unreadItems).toHaveLength(1); // knowledgeId: 3のみ未読
      });
    });

    test('履歴がない場合は空のメッセージが表示される', async () => {
      // localStorageとCookieを空にする
      window.localStorage.getItem = jest.fn(() => null);
      document.cookie = '';
      
      setupFetchMock([]);
      render(<KnowledgeShowHistoryPage />);
      
      await waitFor(() => {
        expect(screen.getByText('ナレッジが登録されていません')).toBeInTheDocument();
      });
    });
  });

  describe('履歴の順序', () => {
    test('履歴は閲覧順（新しい順）で表示される', async () => {
      setupFetchMock();
      render(<KnowledgeShowHistoryPage />);
      
      await waitFor(() => {
        const knowledgeIds = screen.getAllByText(/#\d+/);
        expect(knowledgeIds[0]).toHaveTextContent('#3');
        expect(knowledgeIds[1]).toHaveTextContent('#2');
        expect(knowledgeIds[2]).toHaveTextContent('#1');
      });
    });
  });

  describe('サイドバー', () => {
    test('サイドバーが表示される', async () => {
      setupFetchMock();
      
      // サイドバーAPIのモック
      global.fetch = jest.fn((url) => {
        if (url.includes('/api/groups')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          });
        }
        if (url.includes('/api/tags/popular')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          });
        }
        if (url.includes('/api/events')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          });
        }
        if (url.includes('/api/knowledge/show-history')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockHistoryKnowledges),
          });
        }
        return Promise.reject(new Error('Unknown API'));
      }) as jest.Mock;
      
      render(<KnowledgeShowHistoryPage />);
      
      await waitFor(() => {
        // サイドバーセクションが存在することを確認
        expect(document.querySelector('.knowledge_list')).toBeInTheDocument();
        expect(document.querySelector('.sub_list')).toBeInTheDocument();
      });
    });
  });

  describe('レスポンシブ対応', () => {
    test('モバイルとデスクトップで正しくレイアウトされる', async () => {
      setupFetchMock();
      render(<KnowledgeShowHistoryPage />);
      
      await waitFor(() => {
        const mainContent = document.querySelector('.knowledge_list');
        expect(mainContent).toHaveClass('col-sm-12', 'col-md-8');
        
        const sidebar = document.querySelector('.sub_list');
        expect(sidebar).toHaveClass('col-sm-12', 'col-md-4');
      });
    });
  });

  describe('エラーハンドリング', () => {
    test('APIエラー時はエラーメッセージが表示される', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
        })
      ) as jest.Mock;
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      render(<KnowledgeShowHistoryPage />);
      
      await waitFor(() => {
        // エラーがコンソールに出力される
        expect(consoleSpy).toHaveBeenCalled();
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('ナビゲーション', () => {
    test('他のタブをクリックすると適切なページに遷移する', async () => {
      setupFetchMock();
      render(<KnowledgeShowHistoryPage />);
      
      await waitFor(() => {
        expect(screen.getByText('ナレッジ一覧')).toBeInTheDocument();
      });
      
      const user = userEvent.setup();
      
      // 一覧タブクリック
      await user.click(screen.getByText('ナレッジ一覧'));
      expect(mockRouter.push).toHaveBeenCalledWith('/open/knowledge/list');
      
      // 人気タブクリック
      await user.click(screen.getByText('人気'));
      expect(mockRouter.push).toHaveBeenCalledWith('/open/knowledge/popularity');
    });
  });

  describe('Cookie/LocalStorage連携', () => {
    test('CookieとLocalStorage両方から履歴を読み取る', async () => {
      // Cookieのみの場合
      document.cookie = 'KNOWLEDGE_HISTORY=5,4';
      window.localStorage.getItem = jest.fn(() => null);
      
      setupFetchMock();
      const { rerender } = render(<KnowledgeShowHistoryPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/knowledge/show-history?ids=5,4'),
          expect.any(Object)
        );
      });
      
      // LocalStorageのみの場合
      document.cookie = '';
      window.localStorage.getItem = jest.fn((key) => key === 'knowledge_history' ? '7,6' : null);
      
      jest.clearAllMocks();
      setupFetchMock();
      rerender(<KnowledgeShowHistoryPage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/knowledge/show-history?ids=7,6'),
          expect.any(Object)
        );
      });
    });
  });
});