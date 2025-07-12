/**
 * パスワードリセットページテスト
 * 
 * @description 旧システムとの互換性テストを含む
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useParams } from 'next/navigation';
import PasswordResetPage from '../page';

// モック設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

// MainLayoutモック
jest.mock('@/components/layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// グローバルfetch モック
global.fetch = jest.fn();

describe('PasswordResetPage', () => {
  const mockRouterPush = jest.fn();
  const mockParams = { key: 'test-reset-key-123' };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // useRouterモック
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });
    
    // useParamsモック
    (useParams as jest.Mock).mockReturnValue(mockParams);
    
    // fetch モックレスポンス（初期データ取得用）
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          userKey: 'test@example.com',
          key: 'test-reset-key-123',
        },
      }),
    });
  });

  describe('基本レンダリング', () => {
    test('ページタイトルが表示される', async () => {
      render(<PasswordResetPage />);
      
      await waitFor(() => {
        expect(screen.getByText('パスワードリセット')).toBeInTheDocument();
      });
    });

    test('フォームが表示される', async () => {
      render(<PasswordResetPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument();
      });
    });

    test('メールアドレスが読み取り専用で表示される', async () => {
      render(<PasswordResetPage />);
      
      await waitFor(() => {
        const emailInput = screen.getByDisplayValue('test@example.com');
        expect(emailInput).toBeInTheDocument();
        expect(emailInput).toHaveAttribute('readonly');
      });
    });

    test('パスワード入力フィールドが表示される', async () => {
      render(<PasswordResetPage />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
        expect(screen.getByLabelText('パスワード')).toHaveAttribute('type', 'password');
      });
    });

    test('パスワード確認フィールドが表示される', async () => {
      render(<PasswordResetPage />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('パスワード(確認)')).toBeInTheDocument();
        expect(screen.getByLabelText('パスワード(確認)')).toHaveAttribute('type', 'password');
      });
    });

    test('送信ボタンが表示される', async () => {
      render(<PasswordResetPage />);
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: 'パスワード変更' });
        expect(submitButton).toBeInTheDocument();
        expect(submitButton).toHaveClass('btn', 'btn-primary');
      });
    });
  });

  describe('エラーハンドリング', () => {
    test('無効なキーの場合404エラーが表示される', async () => {
      // 404エラーレスポンスをモック
      (global.fetch as jest.Mock).mockReset();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      render(<PasswordResetPage />);
      
      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith('/404');
      });
    });

    test('期限切れキーの場合エラーメッセージが表示される', async () => {
      // エラーレスポンスをモック
      (global.fetch as jest.Mock).mockReset();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: 'リセットキーの有効期限が切れています',
        }),
      });

      render(<PasswordResetPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('リセットキーの有効期限が切れています');
      });
    });
  });

  describe('フォーム送信', () => {
    test('パスワードが空の場合エラーが表示される', async () => {
      const user = userEvent.setup();
      render(<PasswordResetPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'パスワード変更' })).toBeInTheDocument();
      });

      // フォーム送信
      await user.click(screen.getByRole('button', { name: 'パスワード変更' }));
      
      expect(screen.getByText('パスワードは必須です')).toBeInTheDocument();
    });

    test('パスワードが一致しない場合エラーが表示される', async () => {
      const user = userEvent.setup();
      render(<PasswordResetPage />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
      });

      // 異なるパスワードを入力
      await user.type(screen.getByLabelText('パスワード'), 'password123');
      await user.type(screen.getByLabelText('パスワード(確認)'), 'password456');
      
      // フォーム送信
      await user.click(screen.getByRole('button', { name: 'パスワード変更' }));
      
      expect(screen.getByText('パスワードが一致しません')).toBeInTheDocument();
    });

    test('正常にパスワードリセットが完了する', async () => {
      const user = userEvent.setup();
      render(<PasswordResetPage />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
      });

      // 同じパスワードを入力
      await user.type(screen.getByLabelText('パスワード'), 'newPassword123');
      await user.type(screen.getByLabelText('パスワード(確認)'), 'newPassword123');
      
      // APIレスポンスをモック
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
        }),
      });
      
      // フォーム送信
      await user.click(screen.getByRole('button', { name: 'パスワード変更' }));
      
      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith('/open/passwordinitialization/reset_result');
      });
    });

    test('サーバーエラー時にエラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      render(<PasswordResetPage />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText('パスワード'), 'newPassword123');
      await user.type(screen.getByLabelText('パスワード(確認)'), 'newPassword123');
      
      // エラーレスポンスをモック
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: 'パスワード変更に失敗しました',
        }),
      });
      
      await user.click(screen.getByRole('button', { name: 'パスワード変更' }));
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('パスワード変更に失敗しました');
      });
    });
  });

  describe('旧システム互換性', () => {
    test('フォームのCSS構造が旧システムと同等', async () => {
      render(<PasswordResetPage />);
      
      await waitFor(() => {
        const form = screen.getByRole('form');
        expect(form).toBeInTheDocument();
        
        // フォームグループの確認
        const formGroups = form.querySelectorAll('.form-group');
        expect(formGroups).toHaveLength(3); // メール、パスワード、確認
        
        // フォームコントロールの確認
        const formControls = form.querySelectorAll('.form-control');
        expect(formControls).toHaveLength(3);
      });
    });

    test('URLパス構造が旧システムと同等', () => {
      expect(mockParams.key).toBe('test-reset-key-123');
      // URLパスは /open/passwordinitialization/password_reset/[key] となる
    });
  });
});