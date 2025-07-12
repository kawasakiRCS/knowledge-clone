/**
 * パスワードリセット結果ページのテスト
 * 
 * @description 旧システムの open/passwordinitialization/forgot_pass_result.jsp のテスト
 */
import { render, screen } from '@testing-library/react';
import ForgotPasswordResultPage from '../forgot_pass_result/page';

// useRouterのモック
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

describe('ForgotPasswordResultPage', () => {
  describe('基本レンダリング', () => {
    test('ページタイトルが表示される', () => {
      render(<ForgotPasswordResultPage />);
      
      const title = screen.getByRole('heading', { level: 4 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('title');
      expect(title).toHaveTextContent('パスワード忘れのリクエスト');
    });
    
    test('受付完了メッセージが表示される', () => {
      render(<ForgotPasswordResultPage />);
      
      const message = screen.getByText(/リクエストを受け付けました/);
      expect(message).toBeInTheDocument();
    });
    
    test('メール送信説明が表示される', () => {
      render(<ForgotPasswordResultPage />);
      
      // 旧システムのメッセージを確認
      const description = screen.getByText(/パスワード初期化のためのメールを送信しました/);
      expect(description).toBeInTheDocument();
    });
  });
  
  describe('旧システム互換性', () => {
    test('旧システムと同じラベルが使用される', () => {
      render(<ForgotPasswordResultPage />);
      
      // knowledge.auth.title.forgot.password
      expect(screen.getByText('パスワード忘れのリクエスト')).toBeInTheDocument();
      
      // knowledge.auth.msg.accept.request
      expect(screen.getByText(/リクエストを受け付けました/)).toBeInTheDocument();
    });
    
    test('メインレイアウトでラップされる', () => {
      const { container } = render(<ForgotPasswordResultPage />);
      
      // MainLayoutでラップされることを確認（クラス構造で判定）
      const content = container.querySelector('.container');
      expect(content).toBeInTheDocument();
    });
  });
  
  describe('ユーザビリティ', () => {
    test('追加の説明テキストが含まれる', () => {
      render(<ForgotPasswordResultPage />);
      
      // メールの確認を促すメッセージ
      expect(screen.getByText(/メールボックスをご確認ください/)).toBeInTheDocument();
      
      // スパムフォルダの確認案内
      expect(screen.getByText(/迷惑メールフォルダもご確認ください/)).toBeInTheDocument();
    });
    
    test('サインインページへのリンクが表示される', () => {
      render(<ForgotPasswordResultPage />);
      
      const signInLink = screen.getByRole('link', { name: /サインインページへ戻る/ });
      expect(signInLink).toBeInTheDocument();
      expect(signInLink).toHaveAttribute('href', '/signin');
    });
  });
  
  describe('アクセシビリティ', () => {
    test('適切な見出し構造を持つ', () => {
      render(<ForgotPasswordResultPage />);
      
      const heading = screen.getByRole('heading', { level: 4 });
      expect(heading).toBeInTheDocument();
    });
    
    test('情報アラートとして適切にマークアップされる', () => {
      render(<ForgotPasswordResultPage />);
      
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveClass('alert', 'alert-info');
    });
  });
});