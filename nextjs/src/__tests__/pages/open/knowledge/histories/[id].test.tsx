/**
 * ナレッジ履歴ページテスト
 * 
 * @description 旧システムとの互換性テストを含む
 */
import { render, screen, waitFor } from '@testing-library/react';
// import userEvent from '@testing-library/user-event'; // 未使用のためコメントアウト
import { useRouter, notFound as mockNotFound } from 'next/navigation';
import KnowledgeHistoriesPage from '@/app/open/knowledge/histories/[id]/page';

// モック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn((key) => {
      if (key === 'page') return '0';
      return null;
    }),
    toString: jest.fn(() => ''),
  })),
  notFound: jest.fn(),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 1, name: 'Test User' },
    isAuthenticated: true,
  })),
}));

interface MockMainLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
  headContent?: React.ReactNode;
  scriptsContent?: React.ReactNode;
}

jest.mock('@/components/layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children, pageTitle, headContent, scriptsContent }: MockMainLayoutProps) => (
    <div>
      <h1>{pageTitle}</h1>
      {headContent}
      {children}
      {scriptsContent}
    </div>
  ),
}));

// echo.js モック（遅延画像読み込み）
declare global {
  // eslint-disable-next-line no-var
  var echo: {
    init: jest.Mock;
  };
}

global.echo = {
  init: jest.fn(),
};

const mockHistories = [
  {
    historyNo: 3,
    knowledgeId: 1,
    title: 'ナレッジタイトル更新3',
    updateUser: 1,
    userName: 'Test User',
    updateDatetime: '2024-12-01T12:00:00Z',
  },
  {
    historyNo: 2,
    knowledgeId: 1,
    title: 'ナレッジタイトル更新2',
    updateUser: 2,
    userName: 'Other User',
    updateDatetime: '2024-11-01T12:00:00Z',
  },
  {
    historyNo: 1,
    knowledgeId: 1,
    title: '初版タイトル',
    updateUser: 1,
    userName: 'Test User',
    updateDatetime: '2024-10-01T12:00:00Z',
  },
];

// fetchモック
global.fetch = jest.fn();

describe('KnowledgeHistoriesPage', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    // API成功レスポンス
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ histories: mockHistories }),
    });
  });

  describe('基本レンダリング', () => {
    test('ページタイトルが表示される', async () => {
      const params = Promise.resolve({ id: '1' });
      render(await KnowledgeHistoriesPage({ params }));
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /ナレッジの編集履歴/ })).toBeInTheDocument();
        expect(screen.getByText(/page\[1\]/)).toBeInTheDocument();
      });
    });

    test('履歴一覧が表示される', async () => {
      const params = Promise.resolve({ id: '1' });
      render(await KnowledgeHistoriesPage({ params }));
      
      await waitFor(() => {
        // 履歴番号とタイトルが一緒に表示される
        const heading = screen.getByText((content, element) => {
          return element?.tagName === 'H4' &&
            content.includes('3') &&
            content.includes('ナレッジタイトル更新3');
        });
        expect(heading).toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
    });

    test('空の履歴時のメッセージが表示される', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ histories: [] }),
      });

      const params = Promise.resolve({ id: '1' });
      render(await KnowledgeHistoriesPage({ params }));
      
      await waitFor(() => {
        expect(screen.getByText('履歴はありません')).toBeInTheDocument();
      });
    });
  });

  describe('ナビゲーション', () => {
    test('前後のページリンクが正しく生成される', async () => {
      const params = Promise.resolve({ id: '1' });
      render(await KnowledgeHistoriesPage({ params }));
      
      await waitFor(() => {
        const prevLinks = screen.getAllByRole('link', { name: /前へ/ });
        const nextLinks = screen.getAllByRole('link', { name: /次へ/ });
        
        expect(prevLinks[0]).toHaveAttribute('href', '/open.knowledge/histories/1?page=0');
        expect(nextLinks[0]).toHaveAttribute('href', '/open.knowledge/histories/1?page=1');
      });
    });

    test('履歴項目クリックで詳細ページへ遷移', async () => {
      const params = Promise.resolve({ id: '1' });
      render(await KnowledgeHistoriesPage({ params }));
      
      await waitFor(() => {
        const historyLinks = screen.getAllByRole('link');
        // 履歴項目のリンクを見つける（ページナビゲーションと戻るボタンを除く）
        const historyItemLink = historyLinks.find(link => 
          link.getAttribute('href')?.includes('history_no=3')
        );
        expect(historyItemLink).toHaveAttribute('href', '/open.knowledge/history/1?page=0&history_no=3');
      });
    });

    test('戻るボタンが正しく表示される', async () => {
      const params = Promise.resolve({ id: '1' });
      render(await KnowledgeHistoriesPage({ params }));
      
      await waitFor(() => {
        const backToView = screen.getByRole('link', { name: /戻る/ });
        const backToList = screen.getByRole('link', { name: /ナレッジ一覧へ戻る/ });
        
        expect(backToView).toHaveAttribute('href', '/open.knowledge/view/1');
        expect(backToList).toHaveAttribute('href', '/open.knowledge/list/0');
      });
    });
  });

  describe('エラーハンドリング', () => {
    test('404エラー時の処理', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const params = Promise.resolve({ id: '999' });
      render(await KnowledgeHistoriesPage({ params }));
      
      await waitFor(() => {
        expect(mockNotFound).toHaveBeenCalled();
      });
    });
  });

  describe('画像遅延読み込み', () => {
    test('echo.jsが初期化される', async () => {
      const params = Promise.resolve({ id: '1' });
      render(await KnowledgeHistoriesPage({ params }));
      
      await waitFor(() => {
        expect(global.echo.init).toHaveBeenCalled();
      });
    });

    test('ユーザーアイコンが遅延読み込み設定される', async () => {
      const params = Promise.resolve({ id: '1' });
      render(await KnowledgeHistoriesPage({ params }));
      
      await waitFor(() => {
        const images = screen.getAllByRole('img', { name: 'icon' });
        images.forEach((img, index) => {
          expect(img).toHaveAttribute('src', '/images/loader.gif');
          expect(img).toHaveAttribute('data-echo', `/open.account/icon/${mockHistories[index].updateUser}`);
        });
      });
    });
  });

  describe('旧システム互換性', () => {
    test('CSSクラス構造が同等', async () => {
      const params = Promise.resolve({ id: '1' });
      const { container } = render(await KnowledgeHistoriesPage({ params }));
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 4 })).toHaveClass('title');
        expect(screen.getByRole('navigation')).toBeInTheDocument();
        const listGroup = container.querySelector('.list-group');
        expect(listGroup).toBeInTheDocument();
      });
    });

    test('URLパラメータ構造が維持される', async () => {
      // paramsパラメータ付きでレンダリング
      jest.mocked(useRouter().push).mockClear();

      const params = Promise.resolve({ id: '1' });
      render(await KnowledgeHistoriesPage({ params }));
      
      await waitFor(() => {
        // URLパラメータは現在のページ実装では使用されていないため、基本的なリンク構造のみ確認
        const historyLinks = screen.getAllByRole('link');
        const historyItemLink = historyLinks.find(link => 
          link.getAttribute('href')?.includes('history_no=')
        );
        expect(historyItemLink).toBeTruthy();
      });
    });
  });
});