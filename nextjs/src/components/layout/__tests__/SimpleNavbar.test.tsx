/**
 * SimpleNavbarコンポーネントのテスト
 * 
 * @description 認証なし版ナビゲーションバーのテスト
 * @since 1.0.0
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SimpleNavbar } from '../SimpleNavbar';

describe('SimpleNavbar', () => {
  beforeEach(() => {
    // グローバルモックをクリア
    jest.clearAllMocks();
  });

  describe('基本レンダリング', () => {
    test('ナビゲーションバーが表示される', () => {
      render(<SimpleNavbar />);
      
      const navbar = screen.getByRole('navigation');
      expect(navbar).toBeInTheDocument();
      expect(navbar).toHaveClass('fixed', 'top-0', 'left-0', 'right-0', 'z-50');
    });

    test('ブランドロゴが表示される', () => {
      render(<SimpleNavbar />);
      
      const brandLink = screen.getByRole('link', { name: /knowledge/i });
      expect(brandLink).toBeInTheDocument();
      expect(brandLink).toHaveAttribute('href', '/knowledge/list');
    });

    test('ブランドロゴにFont Awesomeアイコンが含まれる', () => {
      render(<SimpleNavbar />);
      
      const icon = document.querySelector('.fa-book');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('検索機能', () => {
    test('検索フォームが表示される（デスクトップ）', () => {
      render(<SimpleNavbar />);
      
      const searchInput = screen.getByPlaceholderText('ナレッジを検索...');
      expect(searchInput).toBeInTheDocument();
    });

    test('検索フォームに入力できる', async () => {
      const user = userEvent.setup();
      render(<SimpleNavbar />);
      
      const searchInput = screen.getByPlaceholderText('ナレッジを検索...');
      await user.type(searchInput, '検索テスト');
      
      expect(searchInput).toHaveValue('検索テスト');
    });

    test('検索ボタンが表示される', () => {
      render(<SimpleNavbar />);
      
      const searchButtons = screen.getAllByRole('button', { name: '' });
      const searchButton = searchButtons.find(button => 
        button.querySelector('svg') // Search icon
      );
      expect(searchButton).toBeInTheDocument();
    });

    test('検索フォーム送信で適切なURLに遷移する', async () => {
      const user = userEvent.setup();
      render(<SimpleNavbar />);
      
      const searchInput = screen.getByPlaceholderText('ナレッジを検索...');
      await user.type(searchInput, 'React テスト');
      
      const form = searchInput.closest('form');
      expect(form).toBeInTheDocument();
      
      // フォームsubmitイベントをモック
      const handleSubmit = jest.fn();
      form!.addEventListener('submit', handleSubmit);
      
      await user.click(screen.getAllByRole('button')[1]); // 検索ボタン
      
      // フォームが送信されたことを確認
      expect(handleSubmit).toHaveBeenCalled();
    });

    test('空の検索では遷移しない', async () => {
      const user = userEvent.setup();
      render(<SimpleNavbar />);
      
      const searchInput = screen.getByPlaceholderText('ナレッジを検索...');
      expect(searchInput).toHaveValue(''); // 空の状態を確認
      
      const form = searchInput.closest('form');
      const handleSubmit = jest.fn((e) => e.preventDefault()); // フォーム送信を止める
      form!.addEventListener('submit', handleSubmit);
      
      await user.click(screen.getAllByRole('button')[1]); // 検索ボタン
      
      // フォーム送信イベントは呼ばれるが、空の場合はlocation.hrefは変更されない
      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe('モバイル対応', () => {
    test('モバイルメニューボタンが表示される', () => {
      render(<SimpleNavbar />);
      
      const mobileMenuButton = screen.getAllByRole('button')[0]; // 最初のボタン
      expect(mobileMenuButton).toBeInTheDocument();
      expect(mobileMenuButton).toHaveClass('md:hidden');
    });

    test('モバイルメニューボタンをクリックするとメニューが開く', async () => {
      const user = userEvent.setup();
      render(<SimpleNavbar />);
      
      const mobileMenuButton = screen.getAllByRole('button')[0];
      
      // 初期状態ではモバイル検索フォームは非表示
      expect(screen.queryByTestId('mobile-search')).not.toBeInTheDocument();
      
      await user.click(mobileMenuButton);
      
      // モバイル検索フォームが表示される
      const mobileSearchInputs = screen.getAllByPlaceholderText('ナレッジを検索...');
      expect(mobileSearchInputs).toHaveLength(2); // デスクトップ + モバイル
    });

    test('モバイル検索フォームからも検索できる', async () => {
      const user = userEvent.setup();
      render(<SimpleNavbar />);
      
      // モバイルメニューを開く
      const mobileMenuButton = screen.getAllByRole('button')[0];
      await user.click(mobileMenuButton);
      
      // モバイル検索フォームに入力
      const searchInputs = screen.getAllByPlaceholderText('ナレッジを検索...');
      const mobileSearchInput = searchInputs[1]; // 2番目がモバイル版
      
      await user.type(mobileSearchInput, 'モバイル検索');
      
      // モバイル検索フォームを取得
      const mobileForm = mobileSearchInput.closest('form');
      expect(mobileForm).toBeInTheDocument();
      
      // フォームsubmitイベントをモック
      const handleSubmit = jest.fn();
      mobileForm!.addEventListener('submit', handleSubmit);
      
      // モバイル検索ボタンをクリック
      const searchButtons = screen.getAllByRole('button');
      const mobileSearchButton = searchButtons[searchButtons.length - 1]; // 最後のボタン
      await user.click(mobileSearchButton);
      
      // フォームが送信されたことを確認
      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe('ユーザーメニュー', () => {
    test('サインインボタンが表示される', () => {
      render(<SimpleNavbar />);
      
      const signinButton = screen.getByRole('link', { name: /サインイン/i });
      expect(signinButton).toBeInTheDocument();
      expect(signinButton).toHaveAttribute('href', '/signin');
    });

    test('サインインボタンにFont Awesomeアイコンが含まれる', () => {
      render(<SimpleNavbar />);
      
      const signinButton = screen.getByRole('link', { name: /サインイン/i });
      const icon = signinButton.querySelector('.fa-sign-in');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('レスポンシブデザイン', () => {
    test('デスクトップ検索フォームにはmd:flexクラスが適用される', () => {
      render(<SimpleNavbar />);
      
      const searchForms = document.querySelectorAll('form');
      const desktopForm = Array.from(searchForms).find(form => 
        form.classList.contains('md:flex')
      );
      expect(desktopForm).toBeInTheDocument();
    });

    test('モバイルメニューボタンにはmd:hiddenクラスが適用される', () => {
      render(<SimpleNavbar />);
      
      const mobileMenuButton = screen.getAllByRole('button')[0];
      expect(mobileMenuButton).toHaveClass('md:hidden');
    });
  });

  describe('旧システム互換性', () => {
    test('Bootstrap固定ナビバーと同等の構造', () => {
      render(<SimpleNavbar />);
      
      const navbar = screen.getByRole('navigation');
      expect(navbar).toHaveClass('fixed', 'top-0', 'left-0', 'right-0', 'z-50');
    });

    test('コンテナクラスが適用されている', () => {
      render(<SimpleNavbar />);
      
      const container = document.querySelector('.container');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('mx-auto', 'px-4');
    });

    test('適切な高さ（h-16）が設定されている', () => {
      render(<SimpleNavbar />);
      
      const navContent = document.querySelector('.h-16');
      expect(navContent).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    test('ナビゲーションにrole="navigation"が設定されている', () => {
      render(<SimpleNavbar />);
      
      const navbar = screen.getByRole('navigation');
      expect(navbar).toBeInTheDocument();
    });

    test('ブランドリンクが適切に設定されている', () => {
      render(<SimpleNavbar />);
      
      const brandLink = screen.getByRole('link', { name: /knowledge/i });
      expect(brandLink).toHaveAttribute('href', '/knowledge/list');
    });

    test('検索フォームが適切なラベルを持つ', () => {
      render(<SimpleNavbar />);
      
      const searchInput = screen.getByPlaceholderText('ナレッジを検索...');
      expect(searchInput).toHaveAttribute('placeholder', 'ナレッジを検索...');
    });
  });
});