/**
 * 仮登録ページテスト
 * 
 * @description 旧システムとの互換性テストを含む
 */
import { render, screen } from '@testing-library/react';
import ProvisionalRegistrationPage from '../page';

// useRouterモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
}));

describe('ProvisionalRegistrationPage', () => {
  describe('基本レンダリング', () => {
    test('ページタイトルが表示される', () => {
      render(<ProvisionalRegistrationPage />);
      
      const title = screen.getByRole('heading', { level: 4 });
      expect(title).toHaveTextContent('登録受付結果');
      expect(title).toHaveClass('title');
    });

    test('登録受付メッセージが表示される', () => {
      render(<ProvisionalRegistrationPage />);
      
      const message = screen.getByText(/登録を受け付けました/, { exact: false });
      expect(message).toBeInTheDocument();
      
      const waitMessage = screen.getByText(/管理者の確認が必要/, { exact: false });
      expect(waitMessage).toBeInTheDocument();
      
      const pleaseWaitMessage = screen.getByText(/しばらくお待ちください/, { exact: false });
      expect(pleaseWaitMessage).toBeInTheDocument();
    });

    test('メッセージ内のbrタグが改行として表示される', () => {
      const { container } = render(<ProvisionalRegistrationPage />);
      
      const brElements = container.querySelectorAll('br');
      expect(brElements.length).toBeGreaterThan(0);
    });
  });

  describe('レイアウト統合', () => {
    test('MainLayoutを使用している', () => {
      const { container } = render(<ProvisionalRegistrationPage />);
      
      // MainLayoutの特徴的な構造を確認
      const navbar = container.querySelector('.navbar');
      expect(navbar).toBeInTheDocument();
      
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });
  });

  describe('旧システム互換性', () => {
    test('JSP同等のHTML構造が生成される', () => {
      const { container } = render(<ProvisionalRegistrationPage />);
      
      // h4.titleクラスの存在
      const title = container.querySelector('h4.title');
      expect(title).toBeInTheDocument();
      
      // メッセージがtitle要素の後に配置される
      const titleElement = screen.getByRole('heading', { level: 4 });
      const nextElement = titleElement.nextElementSibling;
      expect(nextElement).toBeInTheDocument();
    });
  });
});