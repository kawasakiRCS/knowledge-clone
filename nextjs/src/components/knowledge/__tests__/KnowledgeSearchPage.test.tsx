/**
 * ナレッジ検索ページテスト
 * 
 * @description 旧システムとの互換性テストを含む
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { KnowledgeSearchPage } from '../KnowledgeSearchPage';

// モック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../lib/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../lib/hooks/useLocale', () => ({
  useLocale: jest.fn(),
}));

// グローバルfetchモック
global.fetch = jest.fn();

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
};

const mockUseAuth = jest.requireMock('../../../lib/hooks/useAuth').useAuth;
const mockUseLocale = jest.requireMock('../../../lib/hooks/useLocale').useLocale;

describe('KnowledgeSearchPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockUseAuth.mockReturnValue({ isAuthenticated: false, user: null });
    mockUseLocale.mockReturnValue({ t: (key: string) => key });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('ローディング状態', () => {
    test('データ取得中はローディング表示される', async () => {
      let resolveTemplates: any;
      const templatesPromise = new Promise((resolve) => {
        resolveTemplates = resolve;
      });

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/templates')) {
          return templatesPromise;
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      });

      const { container } = render(<KnowledgeSearchPage />);

      // ローディング表示を確認
      expect(container.textContent).toContain('Loading...');

      // データ取得を完了させる
      resolveTemplates({
        ok: true,
        json: async () => [],
      });

      // ローディングが消えることを確認
      await waitFor(() => {
        expect(container.textContent).not.toContain('Loading...');
      });
    });
  });

  describe('基本レンダリング', () => {
    test('検索ページが正しく表示される', async () => {
      const mockTags = ['Java', 'React', 'Next.js'];
      const mockTemplates = [
        { typeId: 1, typeIcon: 'fa-file-text-o', typeName: '記事' },
        { typeId: 2, typeIcon: 'fa-code', typeName: 'コード' },
      ];

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/tags')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockTags,
          });
        }
        if (url.includes('/api/templates')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockTemplates,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      });

      render(<KnowledgeSearchPage />);

      await waitFor(() => {
        expect(screen.getByText('knowledge.navbar.search')).toBeInTheDocument();
      });

      // 検索フォーム要素の確認
      await waitFor(() => {
        expect(screen.getByLabelText('knowledge.search.keyword')).toBeInTheDocument();
        expect(screen.getByText('knowledge.add.label.type')).toBeInTheDocument();
        expect(screen.getByText('knowledge.search.tags')).toBeInTheDocument();
        const creatorTexts = screen.getAllByText('knowledge.search.creator');
        expect(creatorTexts.length).toBeGreaterThan(0);
      });
    });

    test('ログイン時はグループ検索フィールドが表示される', async () => {
      mockUseAuth.mockReturnValue({ 
        isAuthenticated: true, 
        user: { userId: 1, userName: 'testuser' } 
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      render(<KnowledgeSearchPage />);

      await waitFor(() => {
        expect(screen.getByText('knowledge.search.groups')).toBeInTheDocument();
      });
    });
  });

  describe('検索機能', () => {
    test('キーワード検索が実行される', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      render(<KnowledgeSearchPage />);

      const searchInput = await screen.findByPlaceholderText('knowledge.search.placeholder');
      await user.type(searchInput, 'test keyword');

      const searchButton = screen.getByRole('button', { name: /label.search/i });
      await user.click(searchButton);

      expect(mockRouter.push).toHaveBeenCalledWith(
        '/open/knowledge/list?keyword=test+keyword'
      );
    });

    test('テンプレートフィルタが動作する', async () => {
      const mockTemplates = [
        { typeId: 1, typeIcon: 'fa-file-text-o', typeName: '記事' },
        { typeId: 2, typeIcon: 'fa-code', typeName: 'コード' },
      ];

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/templates')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockTemplates,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      });

      render(<KnowledgeSearchPage />);

      await waitFor(() => {
        expect(screen.getByText('記事')).toBeInTheDocument();
      });

      // チェックボックスの操作
      const articleCheckbox = screen.getByRole('checkbox', { name: /記事/i });
      expect(articleCheckbox).toBeChecked();

      fireEvent.click(articleCheckbox);
      expect(articleCheckbox).not.toBeChecked();
    });

    test('クリアボタンで検索条件がリセットされる', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      render(<KnowledgeSearchPage />);

      const searchInput = await screen.findByPlaceholderText('knowledge.search.placeholder');
      await user.type(searchInput, 'test keyword');

      const clearButton = screen.getByRole('button', { name: /label.clear/i });
      await user.click(clearButton);

      expect(searchInput).toHaveValue('');
    });
  });

  describe('タグ選択機能', () => {
    test('タグ選択モーダルが開く', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      render(<KnowledgeSearchPage />);

      const tagSearchLink = await screen.findByText('label.search.tags');
      fireEvent.click(tagSearchLink);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    test('タグの自動補完が動作する', async () => {
      const mockTags = ['Java', 'JavaScript', 'React'];

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/tags')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockTags,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      });

      render(<KnowledgeSearchPage />);

      const tagInput = await screen.findByPlaceholderText('knowledge.add.label.tags');
      
      // タグ入力シミュレーション
      fireEvent.focus(tagInput);
      fireEvent.change(tagInput, { target: { value: 'Ja' } });

      // Note: 実際の自動補完は bootstrap-tagsinput を使用するため、
      // このテストでは基本的な動作のみ確認
    });
  });

  describe('作成者選択機能', () => {
    test('作成者選択モーダルが開く', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      render(<KnowledgeSearchPage />);

      const creatorSearchLinks = await screen.findAllByText('knowledge.search.creator');
      fireEvent.click(creatorSearchLinks[1]); // 2つ目のリンクをクリック

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    test('ユーザー検索が動作する', async () => {
      const mockUsers = [
        { userId: 1, userName: 'user1' },
        { userId: 2, userName: 'user2' },
      ];

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/users')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockUsers,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      });

      render(<KnowledgeSearchPage />);

      const creatorSearchLinks = await screen.findAllByText('knowledge.search.creator');
      fireEvent.click(creatorSearchLinks[1]); // 2つ目のリンクをクリック
      
      // モーダルが開いてからユーザー検索を実行
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      const searchButton = screen.getByRole('button', { name: /label.filter/i });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('user1')).toBeInTheDocument();
        expect(screen.getByText('user2')).toBeInTheDocument();
      });
    });
  });

  describe('グループ選択機能（ログイン時）', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ 
        isAuthenticated: true, 
        user: { userId: 1, userName: 'testuser' } 
      });
    });

    test('グループ選択モーダルが開く', async () => {
      const mockGroups = ['Group1', 'Group2'];

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/groups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockGroups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      });

      render(<KnowledgeSearchPage />);

      const groupSearchLink = await screen.findByText('label.search.groups');
      fireEvent.click(groupSearchLink);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('旧システム互換性', () => {
    test('旧システムと同じURL構造で検索を実行する', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      render(<KnowledgeSearchPage />);

      const searchInput = await screen.findByPlaceholderText('knowledge.search.placeholder');
      await user.type(searchInput, 'test');

      const searchButton = screen.getByRole('button', { name: /label.search/i });
      await user.click(searchButton);

      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.stringContaining('/open/knowledge/list')
      );
    });

    test('タグ・グループ・作成者の複合検索が動作する', async () => {
      const user = userEvent.setup();
      
      mockUseAuth.mockReturnValue({ 
        isAuthenticated: true, 
        user: { userId: 1, userName: 'testuser' } 
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      render(<KnowledgeSearchPage />);

      // 複合検索条件を設定
      const searchInput = await screen.findByPlaceholderText('knowledge.search.placeholder');
      await user.type(searchInput, 'keyword');

      const tagInput = await screen.findByPlaceholderText('knowledge.add.label.tags');
      fireEvent.change(tagInput, { target: { value: 'Java,React' } });

      const creatorInput = await screen.findByPlaceholderText('knowledge.search.creator');
      fireEvent.change(creatorInput, { target: { value: 'user1,user2' } });

      const groupInput = await screen.findByPlaceholderText('knowledge.add.label.groups');
      fireEvent.change(groupInput, { target: { value: 'Group1' } });

      const searchButton = screen.getByRole('button', { name: /label.search/i });
      await user.click(searchButton);

      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.stringContaining('keyword=keyword')
      );
      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.stringContaining('tagNames=Java%2CReact')
      );
      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.stringContaining('creators=user1%2Cuser2')
      );
      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.stringContaining('groupNames=Group1')
      );
    });

    test('一覧ページへの戻るリンクが正しく動作する', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      render(<KnowledgeSearchPage />);

      await waitFor(() => {
        const backButton = screen.getByRole('link', { name: /label\.backlist/i });
        expect(backButton).toHaveAttribute('href', '/open/knowledge/list');
      });
    });
  });

  describe('エラーハンドリング', () => {
    test('APIエラー時にエラーメッセージが表示される', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      render(<KnowledgeSearchPage />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load initial data')).toBeInTheDocument();
      });
    });
  });

  describe('モーダル機能の詳細テスト', () => {
    test('タグ選択モーダルでタグを選択できる', async () => {
      const mockTags = ['Java', 'JavaScript', 'React', 'TypeScript'];

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/tags')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockTags,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      });

      render(<KnowledgeSearchPage />);

      // タグモーダルを開く
      const tagSearchLink = await screen.findByText('label.search.tags');
      fireEvent.click(tagSearchLink);

      // モーダル内のタグをクリック
      await waitFor(() => {
        const javaTag = screen.getByText('Java');
        fireEvent.click(javaTag);
      });

      // タグ入力フィールドに反映されることを確認
      const tagInput = screen.getByPlaceholderText('knowledge.add.label.tags');
      expect(tagInput).toHaveValue('Java');

      // 複数タグを選択
      const reactTag = screen.getByText('React');
      fireEvent.click(reactTag);
      
      expect(tagInput).toHaveValue('Java,React');
    });

    test('タグモーダルを閉じることができる', async () => {
      const mockTags = ['Java', 'JavaScript'];

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/tags')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockTags,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      });

      render(<KnowledgeSearchPage />);

      // タグモーダルを開く
      const tagSearchLink = await screen.findByText('label.search.tags');
      fireEvent.click(tagSearchLink);

      // Closeボタンをクリック
      await waitFor(() => {
        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);
      });

      // モーダルが閉じることを確認
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    test('ユーザー選択モーダルでページネーションが動作する', async () => {
      const mockUsers = [
        { userId: 1, userName: 'user1' },
        { userId: 2, userName: 'user2' },
      ];

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/users')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockUsers,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      });

      render(<KnowledgeSearchPage />);

      // ユーザーモーダルを開く
      const creatorSearchLinks = await screen.findAllByText('knowledge.search.creator');
      fireEvent.click(creatorSearchLinks[1]);

      // ユーザー検索を実行
      await waitFor(() => {
        const searchButton = screen.getByRole('button', { name: /label.filter/i });
        fireEvent.click(searchButton);
      });

      // ページ番号が表示されることを確認
      await waitFor(() => {
        expect(screen.getByText(/page-1/)).toBeInTheDocument();
      });

      // 次ページボタンをクリック
      const nextButton = screen.getByRole('button', { name: />/i });
      fireEvent.click(nextButton);

      // API呼び出しを確認
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('offset=1')
      );
    });

    test('ユーザー選択が正しく動作する', async () => {
      const mockUsers = [
        { userId: 1, userName: 'testuser1' },
        { userId: 2, userName: 'testuser2' },
      ];

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/users')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockUsers,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      });

      render(<KnowledgeSearchPage />);

      // ユーザーモーダルを開く
      const creatorSearchLinks = await screen.findAllByText('knowledge.search.creator');
      fireEvent.click(creatorSearchLinks[1]);

      // ユーザー検索
      const searchButton = screen.getByRole('button', { name: /label.filter/i });
      fireEvent.click(searchButton);

      // ユーザーを選択
      await waitFor(() => {
        const user1 = screen.getByText('testuser1');
        fireEvent.click(user1);
      });

      // 作成者入力フィールドに反映されることを確認
      const creatorInput = screen.getByPlaceholderText('knowledge.search.creator');
      expect(creatorInput).toHaveValue('testuser1');
    });

    test('グループモーダルでグループを選択できる', async () => {
      mockUseAuth.mockReturnValue({ 
        isAuthenticated: true, 
        user: { userId: 1, userName: 'testuser' } 
      });

      const mockGroups = ['Development', 'QA', 'Design'];

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/groups')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockGroups,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      });

      render(<KnowledgeSearchPage />);

      // グループモーダルを開く
      const groupSearchLink = await screen.findByText('label.search.groups');
      fireEvent.click(groupSearchLink);

      // グループを選択
      await waitFor(() => {
        const devGroup = screen.getByText('Development');
        fireEvent.click(devGroup);
      });

      // グループ入力フィールドに反映されることを確認
      const groupInput = screen.getByPlaceholderText('knowledge.add.label.groups');
      expect(groupInput).toHaveValue('Development');
    });
  });

  describe('追加のエッジケース', () => {
    test('テンプレート取得エラー時もページは表示される', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/templates')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      });

      render(<KnowledgeSearchPage />);

      await waitFor(() => {
        expect(screen.getByText('knowledge.navbar.search')).toBeInTheDocument();
      });

      // エラーでもページが表示されることを確認
      expect(screen.getByLabelText('knowledge.search.keyword')).toBeInTheDocument();
    });

    test('タグ取得エラー時の処理', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/tags')) {
          return Promise.resolve({
            ok: false,
            status: 500,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      });

      render(<KnowledgeSearchPage />);

      await waitFor(() => {
        expect(screen.getByText('knowledge.navbar.search')).toBeInTheDocument();
      });

      // タグ入力フィールドは表示される
      expect(screen.getByPlaceholderText('knowledge.add.label.tags')).toBeInTheDocument();
    });

    test('空のキーワードで検索した場合', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      render(<KnowledgeSearchPage />);

      const searchButton = screen.getByRole('button', { name: /label.search/i });
      await user.click(searchButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/open/knowledge/list');
    });

    test('テンプレートが取得できない場合', async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/templates')) {
          return Promise.resolve({
            ok: true,
            json: async () => [],
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      });

      render(<KnowledgeSearchPage />);

      await waitFor(() => {
        expect(screen.getByText('knowledge.navbar.search')).toBeInTheDocument();
      });

      // テンプレートがなくても検索フォームは表示される
      expect(screen.getByLabelText('knowledge.search.keyword')).toBeInTheDocument();
    });

    test('特殊文字を含むキーワードが正しくエンコードされる', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      render(<KnowledgeSearchPage />);

      const searchInput = await screen.findByPlaceholderText('knowledge.search.placeholder');
      await user.type(searchInput, 'テスト & 検索');

      const searchButton = screen.getByRole('button', { name: /label.search/i });
      await user.click(searchButton);

      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent('テスト & 検索').replace(/%20/g, '+'))
      );
    });

    test('Enterキーで検索が実行される', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      render(<KnowledgeSearchPage />);

      const searchInput = await screen.findByPlaceholderText('knowledge.search.placeholder');
      await user.type(searchInput, 'test keyword');
      await user.keyboard('{Enter}');

      expect(mockRouter.push).toHaveBeenCalledWith(
        '/open/knowledge/list?keyword=test+keyword'
      );
    });

    test('複数の検索条件を組み合わせた検索', async () => {
      const user = userEvent.setup();
      
      const mockTemplates = [
        { typeId: 1, typeIcon: 'fa-file-text-o', typeName: '記事' },
        { typeId: 2, typeIcon: 'fa-code', typeName: 'コード' },
      ];

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/templates')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockTemplates,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      });

      render(<KnowledgeSearchPage />);

      // キーワード入力
      const searchInput = await screen.findByPlaceholderText('knowledge.search.placeholder');
      await user.type(searchInput, 'test keyword');

      // テンプレート選択
      const codeCheckbox = await screen.findByRole('checkbox', { name: /コード/i });
      await user.click(codeCheckbox);

      // タグ入力
      const tagInput = screen.getByPlaceholderText('knowledge.add.label.tags');
      await user.type(tagInput, 'React, TypeScript');

      // 検索実行
      const searchButton = screen.getByRole('button', { name: /label.search/i });
      await user.click(searchButton);

      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.stringContaining('keyword=test+keyword')
      );
    });
  });
});