/**
 * サインアップページテスト
 * 
 * @description 旧システムとの互換性テストを含む
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import SignupPage from '../page';
import { useLocale } from '@/hooks/useLocale';

// モック設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: jest.fn()
}));

// APIモック
global.fetch = jest.fn();

describe('SignupPage', () => {
  const mockPush = jest.fn();
  const mockT = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
    (useLocale as jest.Mock).mockReturnValue({
      t: mockT.mockImplementation((key: string) => {
        const translations: Record<string, string> = {
          'knowledge.signup.title': 'Sign Up',
          'knowledge.signup.label.mail': 'Mail Address (will at the time of signin ID and / There is no published is that)',
          'knowledge.signup.label.name': 'User Name (The name that display in this service)',
          'knowledge.signup.label.password': 'Password',
          'knowledge.signup.label.confirm.password': 'Confirm Password',
          'label.registration': 'Registration',
          'knowledge.view.back.list': 'Back to List',
          'knowledge.user.invalid.same.password': 'Password and Confirm Password has a different',
          'knowledge.user.mail.exist': 'The Email Address already registered',
          'errors.required': 'Required field',
          'errors.invalid.email': 'Invalid email format'
        };
        return translations[key] || key;
      })
    });
  });

  describe('基本レンダリング', () => {
    test('サインアップフォームが表示される', () => {
      render(<SignupPage />);
      
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
      expect(screen.getByLabelText(/Mail Address/)).toBeInTheDocument();
      expect(screen.getByLabelText(/User Name/)).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Registration/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Back to List/ })).toBeInTheDocument();
    });

    test('戻るリンクが正しいURLを持つ', () => {
      render(<SignupPage />);
      
      const backLink = screen.getByRole('button', { name: /Back to List/ });
      expect(backLink.closest('a')).toHaveAttribute('href', '/open/knowledge/list');
    });
  });

  describe('フォームバリデーション', () => {
    test('必須項目が空の場合エラーが表示される', async () => {
      const user = userEvent.setup();
      render(<SignupPage />);
      
      const submitButton = screen.getByRole('button', { name: /Registration/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getAllByText('Required field')).toHaveLength(4);
      });
    });

    test('パスワードが一致しない場合エラーが表示される', async () => {
      const user = userEvent.setup();
      render(<SignupPage />);
      
      await user.type(screen.getByLabelText(/Mail Address/), 'test@example.com');
      await user.type(screen.getByLabelText(/User Name/), 'Test User');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText('Confirm Password'), 'password456');
      
      const submitButton = screen.getByRole('button', { name: /Registration/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Password and Confirm Password has a different')).toBeInTheDocument();
      });
    });

    test('無効なメールアドレスの場合エラーが表示される', async () => {
      const user = userEvent.setup();
      render(<SignupPage />);
      
      await user.type(screen.getByLabelText(/Mail Address/), 'invalid-email');
      await user.type(screen.getByLabelText(/User Name/), 'Test User');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText('Confirm Password'), 'password123');
      
      const submitButton = screen.getByRole('button', { name: /Registration/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });
  });

  describe('フォーム送信', () => {
    test('FREE登録タイプ - 成功時はホームページにリダイレクト', async () => {
      const user = userEvent.setup();
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ registrationType: 'USER' })
      });
      
      render(<SignupPage />);
      
      await user.type(screen.getByLabelText(/Mail Address/), 'test@example.com');
      await user.type(screen.getByLabelText(/User Name/), 'Test User');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText('Confirm Password'), 'password123');
      
      const submitButton = screen.getByRole('button', { name: /Registration/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/signup/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userKey: 'test@example.com',
            userName: 'Test User',
            password: 'password123',
            confirm_password: 'password123'
          })
        });
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    test('MAIL登録タイプ - メール送信ページにリダイレクト', async () => {
      const user = userEvent.setup();
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ registrationType: 'MAIL' })
      });
      
      render(<SignupPage />);
      
      await user.type(screen.getByLabelText(/Mail Address/), 'test@example.com');
      await user.type(screen.getByLabelText(/User Name/), 'Test User');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText('Confirm Password'), 'password123');
      
      const submitButton = screen.getByRole('button', { name: /Registration/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/open/signup/mail_sended');
      });
    });

    test('APPROVE登録タイプ - 仮登録ページにリダイレクト', async () => {
      const user = userEvent.setup();
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ registrationType: 'APPROVE' })
      });
      
      render(<SignupPage />);
      
      await user.type(screen.getByLabelText(/Mail Address/), 'test@example.com');
      await user.type(screen.getByLabelText(/User Name/), 'Test User');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText('Confirm Password'), 'password123');
      
      const submitButton = screen.getByRole('button', { name: /Registration/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/open/signup/provisional_registration');
      });
    });

    test('既存メールアドレスエラー', async () => {
      const user = userEvent.setup();
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ 
          errors: [{ message: 'knowledge.user.mail.exist' }]
        })
      });
      
      render(<SignupPage />);
      
      await user.type(screen.getByLabelText(/Mail Address/), 'existing@example.com');
      await user.type(screen.getByLabelText(/User Name/), 'Test User');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText('Confirm Password'), 'password123');
      
      const submitButton = screen.getByRole('button', { name: /Registration/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('The Email Address already registered')).toBeInTheDocument();
      });
    });

    test('既に仮登録済みの警告', async () => {
      const user = userEvent.setup();
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ 
          warnings: [{ message: 'knowledge.signup.exists' }]
        })
      });
      
      mockT.mockImplementation((key: string) => {
        const translations: Record<string, string> = {
          'knowledge.signup.exists': 'It is already been registered. Since the registered e-mail address has sent an invitation e-mail, please check.',
          'label.registration': 'Registration',
          'knowledge.view.back.list': 'Back to List',
          'errors.required': 'Required field',
          'errors.invalid.email': 'Invalid email format'
        };
        return translations[key] || key;
      });
      
      render(<SignupPage />);
      
      await user.type(screen.getByPlaceholderText('Mail Address'), 'existing@example.com');
      await user.type(screen.getByPlaceholderText('User Name'), 'Test User');
      await user.type(screen.getByPlaceholderText('Password'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm Password'), 'password123');
      
      const submitButton = screen.getByRole('button', { name: /Registration/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/already been registered/)).toBeInTheDocument();
      });
    });
  });

  describe('旧システム互換性', () => {
    test('フォームのaction属性が正しい', () => {
      const { container } = render(<SignupPage />);
      
      const form = container.querySelector('form[action="/api/signup/save"]');
      expect(form).toHaveAttribute('method', 'post');
    });

    test('入力フィールドのname属性が旧システムと同じ', () => {
      const { container } = render(<SignupPage />);
      
      expect(container.querySelector('input[name="userKey"]')).toBeInTheDocument();
      expect(container.querySelector('input[name="userName"]')).toBeInTheDocument();
      expect(container.querySelector('input[name="password"]')).toBeInTheDocument();
      expect(container.querySelector('input[name="confirm_password"]')).toBeInTheDocument();
    });

    test('CSSクラスが旧システムと同じ', () => {
      const { container } = render(<SignupPage />);
      
      expect(container.querySelector('.title')).toHaveTextContent('Sign Up');
      expect(container.querySelectorAll('.form-group')).toHaveLength(4);
      expect(container.querySelector('.btn-primary')).toBeInTheDocument();
      expect(container.querySelector('.btn-success')).toBeInTheDocument();
    });
  });
});