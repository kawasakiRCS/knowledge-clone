/**
 * いいねしたユーザー一覧ページテスト
 * 
 * @description 旧システムとの互換性テストを含む
 */
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import KnowledgeLikesPage from '../../../../app/knowledge/likes/[id]/page';

// モック設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  useAuth: jest.fn(),
}));

// エラーページのモック
jest.mock('@/components/error/NotFoundPage', () => ({
  NotFoundPage: () => <div>404<br />ページが見つかりません</div>,
}));
jest.mock('@/components/error/ForbiddenPage', () => ({
  ForbiddenPage: () => <div>403<br />アクセスが拒否されました</div>,
}));
jest.mock('@/components/error/ServerErrorPage', () => ({
  ServerErrorPage: () => <div>500<br />内部サーバーエラー</div>,
}));

// fetchのモック
global.fetch = jest.fn();

describe('KnowledgeLikesPage', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  const mockAuth = {
    isAuthenticated: false,
    user: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue(mockAuth);
  });

  describe('基本レンダリング', () => {
    test('ページタイトルが表示される', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          knowledgeId: 1,
          likes: [],
          page: 0,
          previous: -1,
          next: -1,
        }),
      });

      render(<KnowledgeLikesPage params={{ id: '1' }} searchParams={{}} />);

      await waitFor(() => {
        expect(screen.getByText('「いいね！」を押してくれたユーザ一覧')).toBeInTheDocument();
      });
    });

    test('ローディング中はローディング表示', () => {
      (fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));

      render(<KnowledgeLikesPage params={{ id: '1' }} searchParams={{}} />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('ユーザー一覧表示', () => {
    test('いいねしたユーザーが表示される', async () => {
      const mockLikes = [
        {
          no: 1,
          knowledgeId: 1,
          insertUser: 1,
          userName: 'テストユーザー1',
          insertDatetime: '2025-01-11T10:00:00',
        },
        {
          no: 2,
          knowledgeId: 1,
          insertUser: 2,
          userName: 'テストユーザー2',
          insertDatetime: '2025-01-11T11:00:00',
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          knowledgeId: 1,
          likes: mockLikes,
          page: 0,
          previous: -1,
          next: -1,
        }),
      });

      render(<KnowledgeLikesPage params={{ id: '1' }} searchParams={{}} />);

      await waitFor(() => {
        expect(screen.getByText('テストユーザー1')).toBeInTheDocument();
        expect(screen.getByText('テストユーザー2')).toBeInTheDocument();
      });
    });

    test('匿名ユーザーはAnonymousと表示される', async () => {
      const mockLikes = [
        {
          no: 1,
          knowledgeId: 1,
          insertUser: -1,
          userName: null,
          insertDatetime: '2025-01-11T10:00:00',
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          knowledgeId: 1,
          likes: mockLikes,
          page: 0,
          previous: -1,
          next: -1,
        }),
      });

      render(<KnowledgeLikesPage params={{ id: '1' }} searchParams={{}} />);

      await waitFor(() => {
        expect(screen.getByText('Anonymous')).toBeInTheDocument();
      });
    });

    test('日時が正しくフォーマットされる', async () => {
      const mockLikes = [
        {
          no: 1,
          knowledgeId: 1,
          insertUser: 1,
          userName: 'テストユーザー',
          insertDatetime: '2025-01-11T10:30:45',
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          knowledgeId: 1,
          likes: mockLikes,
          page: 0,
          previous: -1,
          next: -1,
        }),
      });

      render(<KnowledgeLikesPage params={{ id: '1' }} searchParams={{}} />);

      await waitFor(() => {
        expect(screen.getByText(/2025-01-11 10:30:45/)).toBeInTheDocument();
      });
    });
  });

  describe('ページネーション', () => {
    test('次ページへのリンクが表示される', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          knowledgeId: 1,
          likes: Array(50).fill({
            no: 1,
            knowledgeId: 1,
            insertUser: 1,
            userName: 'ユーザー',
            insertDatetime: '2025-01-11T10:00:00',
          }),
          page: 0,
          previous: -1,
          next: 1,
        }),
      });

      render(<KnowledgeLikesPage params={{ id: '1' }} searchParams={{}} />);

      await waitFor(() => {
        const nextLinks = screen.getAllByLabelText('Next');
        expect(nextLinks).toHaveLength(2); // 上下に配置
        expect(nextLinks[0]).toHaveAttribute('href', '/knowledge/likes/1?page=1');
      });
    });

    test('前ページへのリンクが表示される', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          knowledgeId: 1,
          likes: [],
          page: 2,
          previous: 1,
          next: -1,
        }),
      });

      render(<KnowledgeLikesPage params={{ id: '1' }} searchParams={{ page: '2' }} />);

      await waitFor(() => {
        const prevLinks = screen.getAllByLabelText('Previous');
        expect(prevLinks).toHaveLength(2); // 上下に配置
        expect(prevLinks[0]).toHaveAttribute('href', '/knowledge/likes/1?page=1');
      });
    });

    test('既存のクエリパラメータが保持される', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          knowledgeId: 1,
          likes: [],
          page: 0,
          previous: -1,
          next: 1,
        }),
      });

      render(
        <KnowledgeLikesPage 
          params={{ id: '1' }} 
          searchParams={{ page: '0', foo: 'bar' }} 
        />
      );

      await waitFor(() => {
        const nextLink = screen.getAllByLabelText('Next')[0];
        expect(nextLink).toHaveAttribute('href', '/knowledge/likes/1?foo=bar&page=1');
      });
    });
  });

  describe('戻るボタン', () => {
    test('ナレッジ詳細へ戻るボタンが表示される', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          knowledgeId: 1,
          likes: [],
          page: 0,
          previous: -1,
          next: -1,
        }),
      });

      render(<KnowledgeLikesPage params={{ id: '1' }} searchParams={{}} />);

      await waitFor(() => {
        const backButton = screen.getByText('← 戻る');
        expect(backButton).toBeInTheDocument();
        expect(backButton.closest('a')).toHaveAttribute('href', '/knowledge/view/1');
      });
    });

    test('一覧へ戻るボタンが表示される', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          knowledgeId: 1,
          likes: [],
          page: 0,
          previous: -1,
          next: -1,
        }),
      });

      render(<KnowledgeLikesPage params={{ id: '1' }} searchParams={{}} />);

      await waitFor(() => {
        const listButton = screen.getByText('ナレッジ一覧へ');
        expect(listButton).toBeInTheDocument();
        expect(listButton.closest('a')).toHaveAttribute('href', '/knowledge/list');
      });
    });
  });

  describe('エラーハンドリング', () => {
    test('ナレッジが存在しない場合404エラー', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Knowledge not found' }),
      });

      render(<KnowledgeLikesPage params={{ id: '999' }} searchParams={{}} />);

      await waitFor(() => {
        expect(screen.getByText(/404/)).toBeInTheDocument();
        expect(screen.getByText(/ページが見つかりません/)).toBeInTheDocument();
      });
    });

    test('アクセス権限がない場合403エラー', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Access denied' }),
      });

      render(<KnowledgeLikesPage params={{ id: '1' }} searchParams={{}} />);

      await waitFor(() => {
        expect(screen.getByText(/403/)).toBeInTheDocument();
        expect(screen.getByText(/アクセスが拒否されました/)).toBeInTheDocument();
      });
    });

    test('その他のエラーの場合500エラー', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });

      render(<KnowledgeLikesPage params={{ id: '1' }} searchParams={{}} />);

      await waitFor(() => {
        expect(screen.getByText(/500/)).toBeInTheDocument();
        expect(screen.getByText(/内部サーバーエラー/)).toBeInTheDocument();
      });
    });
  });

  describe('旧システム互換性', () => {
    test('CSSクラス構造が同等', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          knowledgeId: 1,
          likes: [
            {
              no: 1,
              knowledgeId: 1,
              insertUser: 1,
              userName: 'テストユーザー',
              insertDatetime: '2025-01-11T10:00:00',
            },
          ],
          page: 0,
          previous: -1,
          next: -1,
        }),
      });

      render(<KnowledgeLikesPage params={{ id: '1' }} searchParams={{}} />);

      await waitFor(() => {
        expect(screen.getByText('「いいね！」を押してくれたユーザ一覧').closest('h4')).toHaveClass('title');
        const listGroups = screen.getAllByRole('list');
        const listGroup = listGroups.find(el => el.classList.contains('list-group'));
        expect(listGroup).toBeDefined();
        const listItem = screen.getByText('テストユーザー').closest('div');
        expect(listItem).toHaveClass('list-group-item');
      });
    });

    test('FontAwesomeアイコンが正しく表示される', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          knowledgeId: 1,
          likes: [
            {
              no: 1,
              knowledgeId: 1,
              insertUser: 1,
              userName: 'テストユーザー',
              insertDatetime: '2025-01-11T10:00:00',
            },
          ],
          page: 0,
          previous: -1,
          next: -1,
        }),
      });

      render(<KnowledgeLikesPage params={{ id: '1' }} searchParams={{}} />);

      await waitFor(() => {
        // FontAwesomeアイコンが存在することを確認
        const userIcons = document.querySelectorAll('.fa-user');
        expect(userIcons.length).toBeGreaterThan(0);
        const calendarIcons = document.querySelectorAll('.fa-calendar');
        expect(calendarIcons.length).toBeGreaterThan(0);
      });
    });
  });
});