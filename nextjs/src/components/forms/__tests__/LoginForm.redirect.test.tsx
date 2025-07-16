/**
 * LoginFormのリダイレクト動作テスト
 * 
 * @description サインイン後の遷移先が正しく設定されることをテスト
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signIn } from 'next-auth/react';
import { LoginForm } from '../LoginForm';

// next-auth/reactのモック
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

describe('LoginForm リダイレクト動作', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('デフォルト遷移先', () => {
    test('redirectToが指定されていない場合、/open/knowledge/listに遷移', async () => {
      const user = userEvent.setup();
      
      render(<LoginForm />);
      
      const entraIdButton = screen.getByRole('button', { name: /EntraID でサインイン/i });
      await user.click(entraIdButton);
      
      expect(mockSignIn).toHaveBeenCalledWith('azure-ad', {
        callbackUrl: '/open/knowledge/list',
      });
    });
  });

  describe('カスタムリダイレクト', () => {
    test('redirectToが指定されている場合、そのURLに遷移', async () => {
      const user = userEvent.setup();
      const customRedirect = '/custom/page';
      
      render(<LoginForm redirectTo={customRedirect} />);
      
      const entraIdButton = screen.getByRole('button', { name: /EntraID でサインイン/i });
      await user.click(entraIdButton);
      
      expect(mockSignIn).toHaveBeenCalledWith('azure-ad', {
        callbackUrl: customRedirect,
      });
    });

    test('空文字列のredirectToの場合、デフォルトに遷移', async () => {
      const user = userEvent.setup();
      
      render(<LoginForm redirectTo="" />);
      
      const entraIdButton = screen.getByRole('button', { name: /EntraID でサインイン/i });
      await user.click(entraIdButton);
      
      expect(mockSignIn).toHaveBeenCalledWith('azure-ad', {
        callbackUrl: '/open/knowledge/list',
      });
    });
  });

  describe('旧システム互換性', () => {
    test('旧システムと同じ遷移先（/open/knowledge/list）がデフォルト', async () => {
      const user = userEvent.setup();
      
      render(<LoginForm />);
      
      const entraIdButton = screen.getByRole('button', { name: /EntraID でサインイン/i });
      await user.click(entraIdButton);
      
      expect(mockSignIn).toHaveBeenCalledWith('azure-ad', {
        callbackUrl: '/open/knowledge/list',
      });
    });
  });
});