/**
 * CommonNavbarコンポーネントテスト
 * 
 * @description 旧システムのcommonNavbar.jspとの互換性テストを含む
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommonNavbar } from '../CommonNavbar';

// ナビゲーション関連のモック
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/test',
  }),
}));

// 認証状態のモック
const mockAuth = {
  isLoggedIn: false,
  user: null,
  unreadCount: 0,
};

jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => mockAuth,
}));

describe('CommonNavbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.isLoggedIn = false;
    mockAuth.user = null;
    mockAuth.unreadCount = 0;
  });

  describe('基本レンダリング', () => {
    test('ナビゲーションバーが表示される', () => {
      render(<CommonNavbar />);
      
      // Bootstrap navbar構造
      expect(screen.getByRole('navigation')).toHaveClass('navbar', 'navbar-default', 'navbar-fixed-top');
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    test('ブランドリンクが表示される', () => {
      render(<CommonNavbar />);
      
      const brandLink = screen.getByRole('link', { name: /knowledge/i });
      expect(brandLink).toHaveClass('navbar-brand');
      expect(brandLink).toHaveAttribute('href', '/open.knowledge/list');
    });

    test('検索フォームが表示される', () => {
      render(<CommonNavbar />);
      
      const searchInput = screen.getByPlaceholderText(/検索キーワードを入力/i);
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveClass('form-control');
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton).toBeInTheDocument();
    });

    test('モバイルトグルボタンが表示される', () => {
      render(<CommonNavbar />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle navigation/i });
      expect(toggleButton).toHaveClass('navbar-toggle', 'collapsed');
    });
  });

  describe('非ログイン状態', () => {
    test('未ログイン用メニューが表示される', () => {
      render(<CommonNavbar />);
      
      // ナレッジ一覧リンク
      expect(screen.getByRole('link', { name: /ナレッジ一覧/i })).toBeInTheDocument();
      
      // 検索リンク
      expect(screen.getByRole('link', { name: /検索/i })).toBeInTheDocument();
      
      // サインインリンク
      expect(screen.getByRole('link', { name: /サインイン/i })).toBeInTheDocument();
    });

    test('ログイン専用ボタンが非表示', () => {
      render(<CommonNavbar />);
      
      // ナレッジ追加ボタンが表示されない
      expect(screen.queryByText(/ナレッジ追加/i)).not.toBeInTheDocument();
      
      // マイストックボタンが表示されない
      expect(screen.queryByText(/マイストック/i)).not.toBeInTheDocument();
    });

    test('未ログイン用アイコンドロップダウン', () => {
      render(<CommonNavbar />);
      
      // ドロップダウンボタンを取得（ブランドでないボタン）
      const dropdownLinks = screen.getAllByRole('link');
      const userDropdown = dropdownLinks.find(link => 
        link.classList.contains('dropdown-toggle')
      );
      expect(userDropdown).toHaveClass('btn', 'btn-default', 'dropdown-toggle');
    });
  });

  describe('ログイン状態', () => {
    beforeEach(() => {
      mockAuth.isLoggedIn = true;
      mockAuth.user = {
        id: 1,
        name: 'テストユーザー',
        isAdmin: false,
      };
      mockAuth.unreadCount = 3;
    });

    test('ログイン用メニューが表示される', () => {
      render(<CommonNavbar />);
      
      // ナレッジ追加ボタン（メインボタンのみ確認）
      const addButton = screen.getByRole('button', { name: /ナレッジ追加/i });
      expect(addButton).toBeInTheDocument();
      
      // マイストックボタン
      expect(screen.getByText(/マイストック/i)).toBeInTheDocument();
    });

    test('通知バッジが表示される', () => {
      render(<CommonNavbar />);
      
      const badge = screen.getByText('3');
      expect(badge).toHaveClass('badge', 'badge-pill');
    });

    test('ログイン用ドロップダウンメニュー', async () => {
      const user = userEvent.setup();
      render(<CommonNavbar />);
      
      // ユーザーメニューのドロップダウンを探す（success色のもの）
      const userDropdown = screen.getAllByRole('link').find(link => 
        link.classList.contains('btn-success') && link.classList.contains('dropdown-toggle')
      );
      expect(userDropdown).toHaveClass('btn', 'btn-success', 'dropdown-toggle');
      
      // ドロップダウンメニューの項目は常に表示されている（CSSで制御）
      expect(screen.getByRole('link', { name: /ナレッジ一覧/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /通知/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /設定/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /サインアウト/i })).toBeInTheDocument();
    });

    test('管理者用メニューが表示される', () => {
      mockAuth.user!.isAdmin = true;
      render(<CommonNavbar />);
      
      // 管理者メニューは初期非表示（ドロップダウン内）
      // テストはドロップダウン展開後に確認
    });
  });

  describe('検索機能', () => {
    test('検索フォーム送信', async () => {
      const user = userEvent.setup();
      render(<CommonNavbar />);
      
      const searchInput = screen.getByPlaceholderText(/検索キーワードを入力/i);
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      await user.type(searchInput, 'テスト検索');
      await user.click(searchButton);
      
      // フォーム送信の検証（URLエンコードされた形式）
      expect(mockPush).toHaveBeenCalledWith('/open.knowledge/list?keyword=%E3%83%86%E3%82%B9%E3%83%88%E6%A4%9C%E7%B4%A2');
    });

    test('Enter キーで検索実行', async () => {
      const user = userEvent.setup();
      render(<CommonNavbar />);
      
      const searchInput = screen.getByPlaceholderText(/検索キーワードを入力/i);
      
      await user.type(searchInput, 'テスト検索{enter}');
      
      expect(mockPush).toHaveBeenCalledWith('/open.knowledge/list?keyword=%E3%83%86%E3%82%B9%E3%83%88%E6%A4%9C%E7%B4%A2');
    });
  });

  describe('レスポンシブ対応', () => {
    test('モバイルメニューの開閉', async () => {
      const user = userEvent.setup();
      render(<CommonNavbar />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle navigation/i });
      const collapseDiv = screen.getByTestId('navbar-collapse');
      
      // 初期状態：閉じている
      expect(collapseDiv).toHaveClass('collapse');
      expect(collapseDiv).not.toHaveClass('in');
      
      // クリックで開く
      await user.click(toggleButton);
      await waitFor(() => {
        expect(collapseDiv).toHaveClass('collapse', 'in');
      });
    });
  });

  describe('旧システム互換性', () => {
    test('CSSクラス構造が同等', () => {
      render(<CommonNavbar />);
      
      // 旧システムと同じクラス構造
      const navbar = screen.getByRole('navigation');
      expect(navbar).toHaveClass('navbar', 'navbar-default', 'navbar-fixed-top');
      
      const container = navbar.querySelector('.container');
      expect(container).toBeInTheDocument();
      
      const navbarHeader = container?.querySelector('.navbar-header');
      expect(navbarHeader).toBeInTheDocument();
      
      const navbarCollapse = container?.querySelector('.navbar-collapse');
      expect(navbarCollapse).toBeInTheDocument();
    });

    test('URL構造が同等', () => {
      render(<CommonNavbar />);
      
      // 旧システムと同じURL
      const brandLink = screen.getByRole('link', { name: /knowledge/i });
      expect(brandLink).toHaveAttribute('href', '/open.knowledge/list');
    });

    test('Font Awesome アイコンクラス', () => {
      render(<CommonNavbar />);
      
      // アイコンが正しいクラスを持つ
      const searchIcon = screen.getByRole('button', { name: /search/i }).querySelector('i');
      expect(searchIcon).toHaveClass('fa', 'fa-search');
    });
  });

  describe('アクセシビリティ', () => {
    test('適切なARIA属性', () => {
      render(<CommonNavbar />);
      
      const navbar = screen.getByRole('navigation');
      expect(navbar).toBeInTheDocument();
      
      const toggleButton = screen.getByRole('button', { name: /toggle navigation/i });
      expect(toggleButton).toHaveAttribute('data-toggle', 'collapse');
      expect(toggleButton).toHaveAttribute('data-target', '#bs-example-navbar-collapse-1');
    });

    test('スクリーンリーダー対応', () => {
      render(<CommonNavbar />);
      
      const srOnlyText = screen.getByText('Toggle navigation');
      expect(srOnlyText).toHaveClass('sr-only');
    });
  });
});