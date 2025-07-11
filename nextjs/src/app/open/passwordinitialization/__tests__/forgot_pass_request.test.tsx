/**
 * パスワードリセット要求ページテスト
 * 
 * @description 旧システムとの互換性テストを含む
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ForgotPasswordRequestPage } from '../forgot_pass_request/page';
import React from 'react';

// モックの設定
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// グローバルfetch関数のモック
global.fetch = jest.fn();

describe('ForgotPasswordRequestPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('基本レンダリング', () => {
    test('ページタイトルが表示される', () => {
      render(<ForgotPasswordRequestPage />);
      
      expect(screen.getByText('パスワード忘れのリクエスト')).toBeInTheDocument();
    });

    test('説明メッセージが表示される', () => {
      render(<ForgotPasswordRequestPage />);
      
      expect(screen.getByText('アカウントのメールアドレスを入力してください')).toBeInTheDocument();
    });

    test('メールアドレス入力フィールドが表示される', () => {
      render(<ForgotPasswordRequestPage />);
      
      const emailInput = screen.getByPlaceholderText('Email address');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'text');
      expect(emailInput).toHaveAttribute('name', 'username');
    });

    test('送信ボタンが表示される', () => {
      render(<ForgotPasswordRequestPage />);
      
      const submitButton = screen.getByRole('button', { name: /パスワード初期化メールを送信/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveClass('btn-primary');
    });

    test('サインインページへのリンクが表示される', () => {
      render(<ForgotPasswordRequestPage />);
      
      const backLink = screen.getByRole('link', { name: /サインインへ戻る/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveClass('btn-info');
      expect(backLink).toHaveAttribute('href', '/signin');
    });
  });

  describe('フォーム操作', () => {
    test('メールアドレスを入力できる', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordRequestPage />);
      
      const emailInput = screen.getByPlaceholderText('Email address');
      await user.type(emailInput, 'test@example.com');
      
      expect(emailInput).toHaveValue('test@example.com');
    });

    test('空のメールアドレスで送信するとエラーが表示される', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordRequestPage />);
      
      const submitButton = screen.getByRole('button', { name: /パスワード初期化メールを送信/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/メールアドレスは必須です/i)).toBeInTheDocument();
      });
    });

    test('無効なメールアドレスで送信するとエラーが表示される', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordRequestPage />);
      
      const emailInput = screen.getByPlaceholderText('Email address');
      await user.type(emailInput, 'invalid-email');
      
      const submitButton = screen.getByRole('button', { name: /パスワード初期化メールを送信/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/有効なメールアドレスを入力してください/i)).toBeInTheDocument();
      });
    });

    test('有効なメールアドレスで送信すると結果ページへ遷移する', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });
      
      render(<ForgotPasswordRequestPage />);
      
      const emailInput = screen.getByPlaceholderText('Email address');
      await user.type(emailInput, 'test@example.com');
      
      const submitButton = screen.getByRole('button', { name: /パスワード初期化メールを送信/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/password/forgot-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: 'test@example.com' }),
        });
        expect(mockPush).toHaveBeenCalledWith('/open/passwordinitialization/forgot_pass_result');
      });
    });

    test('APIエラー時にエラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'ユーザーが見つかりません' }),
      });
      
      render(<ForgotPasswordRequestPage />);
      
      const emailInput = screen.getByPlaceholderText('Email address');
      await user.type(emailInput, 'notfound@example.com');
      
      const submitButton = screen.getByRole('button', { name: /パスワード初期化メールを送信/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('ユーザーが見つかりません')).toBeInTheDocument();
      });
    });
  });

  describe('旧システム互換性', () => {
    test('CSSクラス構造が旧システムと同等', () => {
      render(<ForgotPasswordRequestPage />);
      
      // タイトル
      const title = screen.getByText('パスワード忘れのリクエスト');
      expect(title.tagName).toBe('H4');
      expect(title).toHaveClass('title');
      
      // フォーム
      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('action', '/open.PasswordInitialization/request');
      expect(form).toHaveAttribute('method', 'post');
      
      // フォームグループ
      const formGroups = screen.getAllByTestId('form-group');
      expect(formGroups.length).toBeGreaterThan(0);
      formGroups.forEach(group => {
        expect(group).toHaveClass('form-group');
      });
    });

    test('フォームの構造が旧システムと同等', () => {
      render(<ForgotPasswordRequestPage />);
      
      const container = screen.getByTestId('forgot-password-container');
      expect(container).toHaveClass('container');
    });
  });
});