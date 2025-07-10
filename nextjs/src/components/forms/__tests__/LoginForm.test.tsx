/**
 * ログインフォームテスト
 * 
 * @description 旧システムauth/form.jspとの完全互換性テスト
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';

describe('LoginForm', () => {
  describe('基本レンダリング', () => {
    test('ログインフォームが表示される', () => {
      render(<LoginForm />);
      
      // タイトル
      expect(screen.getByText('ログイン')).toBeInTheDocument();
      
      // ID入力フィールド
      expect(screen.getByLabelText('ID')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('ID')).toBeInTheDocument();
      
      // パスワード入力フィールド
      expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('パスワード')).toBeInTheDocument();
      
      // サインインボタン
      expect(screen.getByRole('button', { name: /サインイン実行/ })).toBeInTheDocument();
      
      // パスワード忘れリンク
      expect(screen.getByText('パスワードを忘れましたか？')).toBeInTheDocument();
    });

    test('認証説明が条件付きで表示される', () => {
      render(<LoginForm showDescription={true} />);
      
      expect(screen.getByText((content, element) => 
        content.includes('サインインが必要な機能です。')
      )).toBeInTheDocument();
      expect(screen.getByText((content, element) => 
        content.includes('(ナレッジの編集などはサインインが必要です)')
      )).toBeInTheDocument();
    });

    test('サインアップボタンが条件付きで表示される', () => {
      render(<LoginForm showSignup={true} />);
      
      expect(screen.getByRole('button', { name: /アカウント新規登録/ })).toBeInTheDocument();
    });
  });

  describe('フォーム入力', () => {
    test('ユーザーIDが入力できる', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);
      
      const idInput = screen.getByLabelText('ID');
      await user.type(idInput, 'testuser');
      
      expect(idInput).toHaveValue('testuser');
    });

    test('パスワードが入力できる', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);
      
      const passwordInput = screen.getByLabelText('パスワード');
      await user.type(passwordInput, 'password123');
      
      expect(passwordInput).toHaveValue('password123');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('初期値が設定される', () => {
      const initialValues = {
        username: 'initialuser',
        password: 'initialpass'
      };
      
      render(<LoginForm initialValues={initialValues} />);
      
      expect(screen.getByDisplayValue('initialuser')).toBeInTheDocument();
      expect(screen.getByDisplayValue('initialpass')).toBeInTheDocument();
    });
  });

  describe('エラー処理', () => {
    test('ログインエラー時にアラートが表示される', () => {
      render(<LoginForm loginError={true} />);
      
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveClass('alert-danger');
      expect(screen.getByText('ID/Passwordが間違っています。')).toBeInTheDocument();
    });

    test('エラーアラートが閉じられる', async () => {
      const user = userEvent.setup();
      render(<LoginForm loginError={true} />);
      
      const closeButton = screen.getByRole('button', { name: /Close/ });
      await user.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('フォーム送信', () => {
    test('フォーム送信時にonSubmitが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockSubmit = jest.fn();
      
      render(<LoginForm onSubmit={mockSubmit} />);
      
      await user.type(screen.getByLabelText('ID'), 'testuser');
      await user.type(screen.getByLabelText('パスワード'), 'password123');
      await user.click(screen.getByRole('button', { name: /サインイン実行/ }));
      
      expect(mockSubmit).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
        page: undefined
      });
    });

    test('リダイレクト先が保持される', async () => {
      const user = userEvent.setup();
      const mockSubmit = jest.fn();
      
      render(<LoginForm onSubmit={mockSubmit} redirectTo="/protected" />);
      
      await user.type(screen.getByLabelText('ID'), 'testuser');
      await user.type(screen.getByLabelText('パスワード'), 'password123');
      await user.click(screen.getByRole('button', { name: /サインイン実行/ }));
      
      expect(mockSubmit).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
        page: '/protected'
      });
    });
  });

  describe('旧システム互換性', () => {
    test('CSSクラス構造が同等', () => {
      render(<LoginForm />);
      
      // 旧システムのCSSクラス構造を維持
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument(); // formにclassが無いのは正常
      expect(screen.getByLabelText('ID')).toHaveClass('form-control');
      expect(screen.getByLabelText('パスワード')).toHaveClass('form-control');
      expect(screen.getByRole('button', { name: /サインイン実行/ })).toHaveClass('btn', 'btn-primary');
    });

    test('アクションURLが正しく設定される', () => {
      render(<LoginForm />);
      
      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('action', '/signin');
      expect(form).toHaveAttribute('method', 'post');
    });
  });
});