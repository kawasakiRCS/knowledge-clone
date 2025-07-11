/**
 * IndexPageコンポーネントテスト
 * 
 * @description 旧システムのindex/index.jspとの互換性テストを含む
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { IndexPage } from '../IndexPage';

// Next.jsのルーターをモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    isLoggedIn: false,
    user: null,
    unreadCount: 0,
    loading: false,
  }),
}));

describe('IndexPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  describe('基本レンダリング', () => {
    test('ページタイトルが表示される', () => {
      render(<IndexPage />);
      
      // メインタイトル
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Knowledge');
      
      // サブタイトル
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Free Knowledge Base System');
    });

    test('Get Startedボタンが表示される', () => {
      render(<IndexPage />);
      
      const button = screen.getByRole('button', { name: 'Get Started!' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('href', '/open.knowledge/list');
      expect(button).toHaveClass('get-start');
    });

    test('ヘッダーセクションがクリック可能', () => {
      render(<IndexPage />);
      
      const headerSection = screen.getByTestId('header-section');
      expect(headerSection).toHaveStyle({ cursor: 'pointer' });
    });
  });

  describe('Aboutセクション', () => {
    test('Aboutタイトルが表示される', () => {
      render(<IndexPage />);
      
      expect(screen.getByText('About Knowledge')).toBeInTheDocument();
      expect(screen.getByText('Knowledge is a free information sharing service of open source')).toBeInTheDocument();
    });

    test('8つの機能が表示される', () => {
      render(<IndexPage />);
      
      // 各機能のタイトルとアイコンを確認
      const features = [
        { title: 'Free', icon: 'fa-github', description: 'Service is free. This is open source.' },
        { title: 'Easy set up', icon: 'fa-download', description: 'Easy setup of just put the downloaded file.' },
        { title: 'Mobile', icon: 'fa-mobile-phone', description: 'It is corresponding to the display of the PC and mobile and tablet.' },
        { title: 'Nimble editing', icon: 'fa-pencil', description: 'You will edit lightly in Markdown. the registered content, you can specify whether to publish to anyone.' },
        { title: 'Find', icon: 'fa-search', description: /You can find knowledge with full-text search/ },
        { title: 'Notification', icon: 'fa-bell-o', description: 'Email notification and desktop notification to your knowledge of the update.' },
        { title: 'Attach File', icon: 'fa-paperclip', description: 'Various files of Word, Excel and Zip and PDF also attachable.' },
        { title: 'Social', icon: 'fa-comments', description: 'By a like and comment function, you will share the tacit knowledge.' }
      ];

      features.forEach(feature => {
        expect(screen.getByText(feature.title)).toBeInTheDocument();
        
        // アイコンの確認
        const iconElement = screen.getByTestId(`feature-icon-${feature.icon}`);
        expect(iconElement).toHaveClass(feature.icon);
        
        // 説明文の確認
        if (typeof feature.description === 'string') {
          expect(screen.getByText(feature.description)).toBeInTheDocument();
        } else {
          expect(screen.getByText(feature.description)).toBeInTheDocument();
        }
      });
    });

    test('More Informationリンクが表示される', () => {
      render(<IndexPage />);
      
      const moreInfoLink = screen.getByRole('link', { name: '-> More Information' });
      expect(moreInfoLink).toBeInTheDocument();
      expect(moreInfoLink).toHaveAttribute('href', 'https://support-project.org/knowledge_info/index');
    });
  });

  describe('ユーザー操作', () => {
    test('ヘッダーセクションクリックでナレッジ一覧へ遷移', async () => {
      const user = userEvent.setup();
      render(<IndexPage />);
      
      const headerSection = screen.getByTestId('header-section');
      await user.click(headerSection);
      
      expect(mockPush).toHaveBeenCalledWith('/open.knowledge/list');
    });

    test('Get Startedボタンクリックでナレッジ一覧へ遷移', async () => {
      const user = userEvent.setup();
      render(<IndexPage />);
      
      const button = screen.getByRole('button', { name: 'Get Started!' });
      await user.click(button);
      
      // リンクなのでpreventDefaultしない限り通常の遷移
      expect(button).toHaveAttribute('href', '/open.knowledge/list');
    });
  });

  describe('旧システム互換性', () => {
    test('CSS構造が旧システムと同等', () => {
      render(<IndexPage />);
      
      // ヘッダーセクション
      const headerWrap = screen.getByTestId('header-section');
      expect(headerWrap).toHaveAttribute('id', 'headerwrap');
      
      // アイコンスタイル
      const icons = screen.getAllByTestId(/feature-icon-/);
      icons.forEach(icon => {
        expect(icon).toHaveClass('icon-img');
      });
      
      // Aboutセクションクラス
      const aboutSection = screen.getByTestId('about-section');
      expect(aboutSection).toHaveAttribute('id', 'about');
    });

    test('レスポンシブ対応が維持されている', () => {
      render(<IndexPage />);
      
      // Bootstrap グリッドシステムのクラスが適用されている
      const featureColumns = screen.getAllByTestId('feature-column');
      featureColumns.forEach(column => {
        expect(column).toHaveClass('col-sm-6', 'col-md-3', 'col-lg-3');
      });
    });
  });
});