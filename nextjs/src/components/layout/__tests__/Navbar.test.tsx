/**
 * Navbarテスト
 * 
 * @description ナビゲーションバーコンポーネントのテスト
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSession, signOut } from 'next-auth/react';
import { Navbar } from '../Navbar';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn()
}));
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

const mockUseSession = useSession as jest.Mock;
const mockSignOut = signOut as jest.Mock;

// window.location.hrefをモック
let mockHref = 'http://localhost/';
const mockLocationAssign = jest.fn();

beforeAll(() => {
  delete (window as any).location;
  window.location = {
    get href() {
      return mockHref;
    },
    set href(url: string) {
      mockHref = url;
      mockLocationAssign(url);
    },
    assign: mockLocationAssign,
    replace: jest.fn(),
    reload: jest.fn(),
    origin: 'http://localhost',
    protocol: 'http:',
    host: 'localhost',
    hostname: 'localhost',
    port: '',
    pathname: '/',
    search: '',
    hash: ''
  } as any;
});

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocationAssign.mockClear();
    mockHref = 'http://localhost/';
  });

  describe('未認証ユーザー', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn()
      });
    });

    test('基本要素が表示される', () => {
      render(<Navbar />);
      
      // ブランドロゴ
      expect(screen.getByText('Knowledge')).toBeInTheDocument();
      
      // 検索フォーム（デスクトップ）
      expect(screen.getByPlaceholderText('ナレッジを検索...')).toBeInTheDocument();
      
      // ユーザーアイコン
      // ドロップダウントリガーボタンを確認（アイコンボタンなので具体的なテキストはない）
      const dropdownTriggers = screen.getAllByRole('button');
      expect(dropdownTriggers.length).toBeGreaterThan(0);
    });

    test('ユーザーメニューに未認証項目が表示される', async () => {
      const user = userEvent.setup();
      render(<Navbar />);
      
      // ドロップダウントリガーボタンをクリック（最後のボタンがユーザーメニュー）
      const buttons = screen.getAllByRole('button');
      const userButton = buttons[buttons.length - 1];
      await user.click(userButton);
      
      expect(screen.getByText('ナレッジ一覧')).toBeInTheDocument();
      expect(screen.getByText('検索')).toBeInTheDocument();
      expect(screen.getByText('サインイン')).toBeInTheDocument();
      
      // 認証が必要な項目は表示されない
      expect(screen.queryByText('通知')).not.toBeInTheDocument();
      expect(screen.queryByText('設定')).not.toBeInTheDocument();
      expect(screen.queryByText('サインアウト')).not.toBeInTheDocument();
    });

    test('追加ボタンとストックボタンが表示されない', () => {
      render(<Navbar />);
      
      expect(screen.queryByText('追加')).not.toBeInTheDocument();
      expect(screen.queryByText('ストック')).not.toBeInTheDocument();
    });
  });

  describe('認証済みユーザー', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            image: '/test-avatar.png'
          },
          expires: '2024-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      });
    });

    test('認証済みユーザー向けの要素が表示される', () => {
      render(<Navbar />);
      
      // 追加ボタン
      expect(screen.getByRole('button', { name: /追加/i })).toBeInTheDocument();
      
      // ストックボタン
      expect(screen.getByRole('link', { name: /ストック/i })).toBeInTheDocument();
      
      // ユーザーアバター
      const avatar = screen.getByAltText('User Icon');
      expect(avatar).toHaveAttribute('src', '/test-avatar.png');
    });

    test('追加メニューが正しく動作する', async () => {
      const user = userEvent.setup();
      render(<Navbar />);
      
      const addButton = screen.getByRole('button', { name: /追加/i });
      await user.click(addButton);
      
      expect(screen.getByText('ナレッジ追加')).toBeInTheDocument();
      expect(screen.getByText('下書き一覧')).toBeInTheDocument();
    });

    test('ユーザーメニューに認証済み項目が表示される', async () => {
      const user = userEvent.setup();
      render(<Navbar />);
      
      const userAvatar = screen.getByAltText('User Icon').closest('button');
      await user.click(userAvatar!);
      
      expect(screen.getByText('ナレッジ一覧')).toBeInTheDocument();
      expect(screen.getByText('通知')).toBeInTheDocument();
      expect(screen.getByText('検索')).toBeInTheDocument();
      expect(screen.getByText('設定')).toBeInTheDocument();
      expect(screen.getByText('サインアウト')).toBeInTheDocument();
    });

    test('サインアウトが正しく動作する', async () => {
      const user = userEvent.setup();
      render(<Navbar />);
      
      const userAvatar = screen.getByAltText('User Icon').closest('button');
      await user.click(userAvatar!);
      
      const signOutButton = screen.getByText('サインアウト');
      await user.click(signOutButton);
      
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('検索機能', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn()
      });
    });

    test('検索キーワードを入力して検索できる', async () => {
      const user = userEvent.setup();
      render(<Navbar />);
      
      const searchInput = screen.getByPlaceholderText('ナレッジを検索...');
      await user.type(searchInput, 'テストキーワード');
      
      const searchButton = screen.getAllByRole('button')[1]; // 検索ボタン
      await user.click(searchButton);
      
      expect(mockLocationAssign).toHaveBeenCalledWith('/knowledge/list?keyword=%E3%83%86%E3%82%B9%E3%83%88%E3%82%AD%E3%83%BC%E3%83%AF%E3%83%BC%E3%83%89');
    });

    test('空の検索キーワードでは検索されない', async () => {
      const user = userEvent.setup();
      render(<Navbar />);
      
      const searchButton = screen.getAllByRole('button')[1]; // 検索ボタン
      await user.click(searchButton);
      
      expect(mockLocationAssign).not.toHaveBeenCalled();
    });

    test('Enterキーで検索できる', async () => {
      const user = userEvent.setup();
      render(<Navbar />);
      
      const searchInput = screen.getByPlaceholderText('ナレッジを検索...');
      await user.type(searchInput, 'テストキーワード{Enter}');
      
      expect(mockLocationAssign).toHaveBeenCalledWith('/knowledge/list?keyword=%E3%83%86%E3%82%B9%E3%83%88%E3%82%AD%E3%83%BC%E3%83%AF%E3%83%BC%E3%83%89');
    });
  });

  describe('レスポンシブ対応', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn()
      });
    });

    test('モバイルメニューボタンをクリックするとモバイル検索フォームが表示される', async () => {
      const user = userEvent.setup();
      render(<Navbar />);
      
      // モバイルメニューボタンをクリック
      const menuButton = screen.getAllByRole('button')[0]; // 最初のボタンがメニューボタン
      await user.click(menuButton);
      
      // モバイル検索フォームが表示される
      const searchInputs = screen.getAllByPlaceholderText('ナレッジを検索...');
      expect(searchInputs).toHaveLength(2); // デスクトップとモバイル
    });

    test('モバイル検索フォームから検索できる', async () => {
      const user = userEvent.setup();
      render(<Navbar />);
      
      // モバイルメニューを開く
      const menuButton = screen.getAllByRole('button')[0];
      await user.click(menuButton);
      
      // モバイル検索フォームに入力
      const searchInputs = screen.getAllByPlaceholderText('ナレッジを検索...');
      await user.type(searchInputs[1], 'モバイル検索');
      
      // モバイル検索ボタンをクリック
      const searchButtons = screen.getAllByRole('button');
      const mobileSearchButton = searchButtons[searchButtons.length - 1]; // 最後のボタンがモバイル検索ボタン
      await user.click(mobileSearchButton);
      
      expect(mockLocationAssign).toHaveBeenCalledWith('/knowledge/list?keyword=%E3%83%A2%E3%83%90%E3%82%A4%E3%83%AB%E6%A4%9C%E7%B4%A2');
    });
  });

  describe('管理者メニュー', () => {
    test('管理者メニューは現在非表示（TODO実装待ち）', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'Admin User',
            email: 'admin@example.com',
            image: '/admin-avatar.png'
          },
          expires: '2024-12-31'
        },
        status: 'authenticated',
        update: jest.fn()
      });

      const user = userEvent.setup();
      render(<Navbar />);
      
      const userAvatar = screen.getByAltText('User Icon').closest('button');
      await user.click(userAvatar!);
      
      // システム設定メニューは表示されない（TODO: 管理者判定ロジック実装後に変更）
      expect(screen.queryByText('システム設定')).not.toBeInTheDocument();
    });
  });
});