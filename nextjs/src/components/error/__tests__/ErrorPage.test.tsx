/**
 * ErrorPageテスト
 * 
 * @description エラーページの表示と動作を検証
 */
import { render, screen } from '@testing-library/react';
import ErrorPage from '../ErrorPage';

// Next.js Linkコンポーネントのモック
jest.mock('next/link', () => {
  return ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => {
    return <a {...props}>{children}</a>;
  };
});

describe('ErrorPage', () => {
  describe('基本レンダリング', () => {
    test('エラーページが表示される', () => {
      render(<ErrorPage />);
      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    });

    test('デフォルトのステータスコード500が表示される', () => {
      render(<ErrorPage />);
      expect(screen.getByText('500')).toBeInTheDocument();
    });

    test('エラーメッセージが表示される', () => {
      render(<ErrorPage />);
      expect(screen.getByText('申し訳ございません。エラーが発生しました。')).toBeInTheDocument();
    });

    test('トップページへ戻るリンクが表示される', () => {
      render(<ErrorPage />);
      const link = screen.getByRole('link', { name: /トップページへ戻る/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/');
    });
  });

  describe('ステータスコード表示', () => {
    test('404エラーが表示される', () => {
      render(<ErrorPage statusCode={404} />);
      expect(screen.getByText('404')).toBeInTheDocument();
    });

    test('403エラーが表示される', () => {
      render(<ErrorPage statusCode={403} />);
      expect(screen.getByText('403')).toBeInTheDocument();
    });

    test('503エラーが表示される', () => {
      render(<ErrorPage statusCode={503} />);
      expect(screen.getByText('503')).toBeInTheDocument();
    });
  });

  describe('スタイリングとレイアウト', () => {
    test('エラーページのコンテナ構造が正しい', () => {
      const { container } = render(<ErrorPage />);
      
      expect(container.querySelector('.container')).toBeInTheDocument();
      expect(container.querySelector('.row')).toBeInTheDocument();
      expect(container.querySelector('.col-sm-12')).toBeInTheDocument();
      expect(container.querySelector('.error-page')).toBeInTheDocument();
    });

    test('中央寄せクラスが適用されている', () => {
      const { container } = render(<ErrorPage />);
      const errorPage = container.querySelector('.error-page');
      
      expect(errorPage).toHaveClass('text-center');
    });

    test('ステータスコードの文字サイズが正しい', () => {
      render(<ErrorPage />);
      const heading = screen.getByText('500');
      
      expect(heading.tagName).toBe('H1');
      expect(heading).toHaveStyle({ fontSize: '72px' });
    });

    test('ボタンにアイコンクラスが含まれている', () => {
      render(<ErrorPage />);
      const link = screen.getByRole('link', { name: /トップページへ戻る/i });
      const icon = link.querySelector('.fa.fa-home');
      
      expect(icon).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    test('見出しの階層が正しい', () => {
      render(<ErrorPage />);
      
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });
      
      expect(h1).toHaveTextContent('500');
      expect(h2).toHaveTextContent('エラーが発生しました');
    });

    test('リンクにbtnクラスが適用されている', () => {
      render(<ErrorPage />);
      const link = screen.getByRole('link', { name: /トップページへ戻る/i });
      
      expect(link).toHaveClass('btn', 'btn-primary');
    });
  });
});