/**
 * ログインフォームコンポーネントテスト
 * 
 * @description 旧システムauth/form.jspの完全互換実装テスト
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { LoginForm } from '../LoginForm';
import { signIn } from 'next-auth/react';

// モック設定
jest.mock('next-auth/react', () => ({
  signIn: jest.fn()
}));

describe('LoginForm', () => {
  const mockOnSubmit = jest.fn();
  const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本レンダリング', () => {
    test('基本的なフォーム要素が表示される', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      expect(screen.getByText('ログイン')).toBeInTheDocument();
      expect(screen.getByLabelText('ID')).toBeInTheDocument();
      expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /サインイン実行/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /EntraID でサインイン/ })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /パスワードを忘れましたか？/ })).toBeInTheDocument();
    });

    test('ID入力フィールドにオートフォーカスが設定される', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const idInput = screen.getByLabelText('ID');
      expect(idInput).toHaveFocus();
    });
  });

  describe('フォーム入力', () => {
    test('ID入力が正しく動作する', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const idInput = screen.getByLabelText('ID');
      await user.type(idInput, 'testuser');

      expect(idInput).toHaveValue('testuser');
    });

    test('パスワード入力が正しく動作する', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByLabelText('パスワード');
      await user.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('初期値が正しく設定される', () => {
      render(
        <LoginForm
          onSubmit={mockOnSubmit}
          initialValues={{
            username: 'initialuser',
            password: 'initialpass',
            page: '/redirect'
          }}
        />
      );

      expect(screen.getByLabelText('ID')).toHaveValue('initialuser');
      expect(screen.getByLabelText('パスワード')).toHaveValue('initialpass');
    });
  });

  describe('フォーム送信', () => {
    test('フォーム送信時にonSubmitが呼ばれる', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const idInput = screen.getByLabelText('ID');
      const passwordInput = screen.getByLabelText('パスワード');
      const submitButton = screen.getByRole('button', { name: /サインイン実行/ });

      await user.type(idInput, 'testuser');
      await user.type(passwordInput, 'testpass');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'testpass',
        page: undefined
      });
    });

    test('redirectToが設定されている場合、pageに含まれる', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} redirectTo="/custom/redirect" />);

      const submitButton = screen.getByRole('button', { name: /サインイン実行/ });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        username: '',
        password: '',
        page: '/custom/redirect'
      });
    });
  });

  describe('エラー表示', () => {
    test('loginErrorがtrueの場合、エラーメッセージが表示される', () => {
      render(<LoginForm onSubmit={mockOnSubmit} loginError={true} />);

      expect(screen.getByText('ID/Passwordが間違っています。')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveClass('alert-danger');
    });

    test('エラーメッセージの閉じるボタンが動作する', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} loginError={true} />);

      const closeButton = screen.getByRole('button', { name: 'Close' });
      await user.click(closeButton);

      expect(screen.queryByText('ID/Passwordが間違っています。')).not.toBeInTheDocument();
    });
  });

  describe('説明文表示', () => {
    test('showDescriptionがtrueの場合、説明文が表示される', () => {
      render(<LoginForm onSubmit={mockOnSubmit} showDescription={true} />);

      expect(screen.getByText(/サインインが必要な機能です。/)).toBeInTheDocument();
      expect(screen.getByText(/ナレッジの編集などはサインインが必要です/)).toBeInTheDocument();
    });

    test('showDescriptionがfalseの場合、説明文は表示されない', () => {
      render(<LoginForm onSubmit={mockOnSubmit} showDescription={false} />);

      expect(screen.queryByText(/サインインが必要な機能です。/)).not.toBeInTheDocument();
    });
  });

  describe('サインアップボタン表示', () => {
    test('showSignupがtrueの場合、アカウント新規登録ボタンが表示される', () => {
      render(<LoginForm onSubmit={mockOnSubmit} showSignup={true} />);

      expect(screen.getByRole('button', { name: /アカウント新規登録/ })).toBeInTheDocument();
    });

    test('showSignupがfalseの場合、アカウント新規登録ボタンは表示されない', () => {
      render(<LoginForm onSubmit={mockOnSubmit} showSignup={false} />);

      expect(screen.queryByRole('button', { name: /アカウント新規登録/ })).not.toBeInTheDocument();
    });
  });

  describe('EntraIDサインイン', () => {
    test('EntraIDボタンクリックでsignInが呼ばれる', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const entraIdButton = screen.getByRole('button', { name: /EntraID でサインイン/ });
      await user.click(entraIdButton);

      expect(mockSignIn).toHaveBeenCalledWith('azure-ad', {
        callbackUrl: '/open/knowledge/list'
      });
    });

    test('redirectToが設定されている場合、callbackUrlに使用される', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} redirectTo="/custom/page" />);

      const entraIdButton = screen.getByRole('button', { name: /EntraID でサインイン/ });
      await user.click(entraIdButton);

      expect(mockSignIn).toHaveBeenCalledWith('azure-ad', {
        callbackUrl: '/custom/page'
      });
    });

    test('EntraIDサインインエラー時にエラー表示される', async () => {
      const user = userEvent.setup();
      mockSignIn.mockRejectedValue(new Error('SignIn failed'));
      
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const entraIdButton = screen.getByRole('button', { name: /EntraID でサインイン/ });
      await user.click(entraIdButton);

      await waitFor(() => {
        expect(screen.getByText('ID/Passwordが間違っています。')).toBeInTheDocument();
      });
    });
  });

  describe('hidden フィールド', () => {
    test('page hiddenフィールドが正しく設定される', () => {
      const { container } = render(
        <LoginForm onSubmit={mockOnSubmit} redirectTo="/test/page" />
      );

      const hiddenInput = container.querySelector('input[name="page"]');
      expect(hiddenInput).toHaveAttribute('type', 'hidden');
      expect(hiddenInput).toHaveValue('/test/page');
    });
  });

  describe('リンク', () => {
    test('パスワードリセットリンクが正しく設定される', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const resetLink = screen.getByRole('link', { name: /パスワードを忘れましたか？/ });
      expect(resetLink).toHaveAttribute('href', '/open.PasswordInitialization/view');
    });
  });

  describe('フォーム属性', () => {
    test('フォームの属性が正しく設定される', () => {
      const { container } = render(<LoginForm onSubmit={mockOnSubmit} />);

      const form = container.querySelector('form');
      expect(form).toHaveAttribute('action', '/signin');
      expect(form).toHaveAttribute('method', 'post');
      expect(form).toHaveAttribute('role', 'form');
    });
  });

  describe('エッジケース', () => {
    test('onSubmitが未定義でもエラーにならない', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const submitButton = screen.getByRole('button', { name: /サインイン実行/ });
      
      // エラーが発生しないことを確認
      await expect(user.click(submitButton)).resolves.not.toThrow();
    });

    test('空のフォームでも送信できる', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /サインイン実行/ });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        username: '',
        password: '',
        page: undefined
      });
    });
  });
});