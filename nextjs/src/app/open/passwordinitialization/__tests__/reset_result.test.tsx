/**
 * パスワードリセット完了ページテスト
 * 
 * @description 旧システムとの互換性テストを含む
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import PasswordResetResultPage from '../reset_result/page';

// useRouter mockの設定
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// useLocale mockの設定
jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'knowledge.auth.title.forgot.password': 'Password Reset',
        'knowledge.auth.msg.changed': 'The password has been initialized. Please try to sign in.',
        'knowledge.auth.label.back.top': 'Back to Top',
      };
      return translations[key] || key;
    },
  }),
}));

describe('PasswordResetResultPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本レンダリング', () => {
    test('ページタイトルが表示される', () => {
      render(<PasswordResetResultPage />);
      
      const title = screen.getByRole('heading', { level: 4 });
      expect(title).toHaveClass('title');
      expect(title).toHaveTextContent('Password Reset');
    });

    test('完了メッセージが表示される', () => {
      render(<PasswordResetResultPage />);
      
      expect(screen.getByText('The password has been initialized. Please try to sign in.')).toBeInTheDocument();
    });

    test('Topへ戻るリンクが表示される', () => {
      render(<PasswordResetResultPage />);
      
      const backLink = screen.getByRole('link', { name: 'Back to Top' });
      expect(backLink).toHaveAttribute('href', '/');
    });
  });

  describe('レイアウト構造', () => {
    test('適切な余白が設定されている', () => {
      const { container } = render(<PasswordResetResultPage />);
      
      const brElements = container.querySelectorAll('br');
      expect(brElements).toHaveLength(4); // 旧システムと同じ改行数
    });

    test('メッセージ後に適切な余白がある', () => {
      const { container } = render(<PasswordResetResultPage />);
      
      const content = container.firstChild;
      expect(content).toMatchSnapshot();
    });
  });

  describe('旧システム互換性', () => {
    test('見た目が旧システムと同等である', () => {
      const { container } = render(<PasswordResetResultPage />);
      
      // タイトルのクラス
      const title = container.querySelector('h4.title');
      expect(title).toBeInTheDocument();
      
      // Topへ戻るリンク
      const link = container.querySelector('a[href="/"]');
      expect(link).toBeInTheDocument();
    });
  });
});