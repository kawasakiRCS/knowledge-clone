/**
 * 404 Not Found ページのテスト
 * 
 * @description not-found.tsxのテストケース
 */
import { render, screen } from '@testing-library/react';
import NotFound from '../not-found';

// モック
jest.mock('@/components/layout', () => ({
  ErrorPage: function MockErrorPage({ statusCode, message }: { statusCode: number; message: string }) {
    return (
      <div>
        <h1>Error {statusCode}</h1>
        <p>{message}</p>
      </div>
    );
  }
}));

describe('NotFound', () => {
  test('404エラーページが正しく表示される', () => {
    render(<NotFound />);
    
    expect(screen.getByText('Error 404')).toBeInTheDocument();
    expect(screen.getByText('お探しのページは見つかりませんでした。URLをご確認ください。')).toBeInTheDocument();
  });

  test('正しいpropsがErrorPageに渡される', () => {
    const { container } = render(<NotFound />);
    
    // ErrorPageコンポーネントが適切なpropsで呼ばれていることを確認
    const errorTitle = container.querySelector('h1');
    const errorMessage = container.querySelector('p');
    
    expect(errorTitle?.textContent).toBe('Error 404');
    expect(errorMessage?.textContent).toBe('お探しのページは見つかりませんでした。URLをご確認ください。');
  });
});