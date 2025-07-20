/**
 * 認証エラーページのテスト
 * 
 * @description authorizer_error/page.tsxのテストケース
 */
import { render, screen } from '@testing-library/react';
import AuthorizerErrorPage from '../page';

// モック
jest.mock('@/components/layout/MainLayout', () => {
  return function MockMainLayout({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  };
});

describe('AuthorizerErrorPage', () => {
  test('認証エラーページが正しく表示される', () => {
    render(<AuthorizerErrorPage />);
    
    expect(screen.getByText('アクセスエラー')).toBeInTheDocument();
    expect(screen.getByText('権限がありません')).toBeInTheDocument();
    expect(screen.getByText('アクセスする権限がありません。')).toBeInTheDocument();
  });

  test('アラートが適切なクラスで表示される', () => {
    const { container } = render(<AuthorizerErrorPage />);
    
    const alert = container.querySelector('.alert.alert-danger');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('role', 'alert');
  });

  test('トップページへのリンクが表示される', () => {
    render(<AuthorizerErrorPage />);
    
    const topLink = screen.getByRole('link', { name: /トップページへ戻る/i });
    expect(topLink).toBeInTheDocument();
    expect(topLink).toHaveAttribute('href', '/');
    expect(topLink).toHaveClass('btn', 'btn-primary');
  });

  test('サインインリンクが表示される', () => {
    render(<AuthorizerErrorPage />);
    
    const signinLink = screen.getByRole('link', { name: /サインイン/i });
    expect(signinLink).toBeInTheDocument();
    expect(signinLink).toHaveAttribute('href', '/signin');
    expect(signinLink).toHaveClass('btn', 'btn-info', 'ml-2');
  });

  test('アイコンが正しく表示される', () => {
    const { container } = render(<AuthorizerErrorPage />);
    
    const homeIcon = container.querySelector('.fa-home');
    const signinIcon = container.querySelector('.fa-sign-in');
    
    expect(homeIcon).toBeInTheDocument();
    expect(signinIcon).toBeInTheDocument();
  });

  test('コンテナ構造が正しい', () => {
    const { container } = render(<AuthorizerErrorPage />);
    
    const containerDiv = container.querySelector('.container');
    const title = containerDiv?.querySelector('.title');
    
    expect(containerDiv).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    expect(title?.tagName).toBe('H4');
  });
});