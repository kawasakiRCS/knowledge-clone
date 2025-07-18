/**
 * StatsContentコンポーネントテスト
 * 
 * @description 統計情報表示コンポーネントのテスト
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatsContent } from '../StatsContent';

// モック設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('../../../lib/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    isLoggedIn: true,
    user: { userId: 'testuser', userName: 'Test User' },
    loading: false,
  })),
}));

describe('StatsContent', () => {
  const mockStats = {
    userStats: [
      { userName: 'user1', knowledgeCount: 15, lastPostDate: '2024-01-15T10:00:00' },
      { userName: 'user2', knowledgeCount: 10, lastPostDate: '2024-01-14T15:30:00' },
      { userName: 'user3', knowledgeCount: 8, lastPostDate: '2024-01-13T09:45:00' },
    ],
    tagStats: [
      { tagName: 'React', usageCount: 25, tagColorType: { colorCode: '#61DAFB' } },
      { tagName: 'TypeScript', usageCount: 20, tagColorType: { colorCode: '#3178C6' } },
      { tagName: 'Next.js', usageCount: 15, tagColorType: { colorCode: '#000000' } },
    ],
    monthlyStats: [
      { month: '2024-01', postCount: 30 },
      { month: '2023-12', postCount: 25 },
      { month: '2023-11', postCount: 20 },
    ],
  };

  describe('基本レンダリング', () => {
    test('統計コンテナが表示される', () => {
      render(<StatsContent stats={mockStats} />);
      
      expect(screen.getByText('投稿数ランキング')).toBeInTheDocument();
      expect(screen.getByText('人気タグ')).toBeInTheDocument();
      expect(screen.getByText('月別投稿数')).toBeInTheDocument();
    });

    test('ローディング状態が表示される', () => {
      render(<StatsContent stats={null} loading={true} />);
      
      expect(screen.getByText('統計情報を読み込み中...')).toBeInTheDocument();
    });

    test('エラー状態が表示される', () => {
      render(<StatsContent stats={null} error="統計情報の取得に失敗しました" />);
      
      expect(screen.getByText('統計情報の取得に失敗しました')).toBeInTheDocument();
    });
  });

  describe('ユーザー統計表示', () => {
    test('ユーザーランキングが正しく表示される', () => {
      render(<StatsContent stats={mockStats} />);
      
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('15件')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
      expect(screen.getByText('10件')).toBeInTheDocument();
      expect(screen.getByText('user3')).toBeInTheDocument();
      expect(screen.getByText('8件')).toBeInTheDocument();
    });

    test('ランキング順位が表示される', () => {
      render(<StatsContent stats={mockStats} />);
      
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    test('最終投稿日が表示される', () => {
      render(<StatsContent stats={mockStats} />);
      
      expect(screen.getByText('最終投稿: 2024/01/15')).toBeInTheDocument();
      expect(screen.getByText('最終投稿: 2024/01/14')).toBeInTheDocument();
      expect(screen.getByText('最終投稿: 2024/01/13')).toBeInTheDocument();
    });
  });

  describe('タグ統計表示', () => {
    test('人気タグが正しく表示される', () => {
      render(<StatsContent stats={mockStats} />);
      
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('25回使用')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('20回使用')).toBeInTheDocument();
      expect(screen.getByText('Next.js')).toBeInTheDocument();
      expect(screen.getByText('15回使用')).toBeInTheDocument();
    });

    test('タグが正しい色で表示される', () => {
      render(<StatsContent stats={mockStats} />);
      
      const reactTag = screen.getByText('React');
      expect(reactTag).toHaveStyle({ backgroundColor: '#61DAFB' });
      
      const tsTag = screen.getByText('TypeScript');
      expect(tsTag).toHaveStyle({ backgroundColor: '#3178C6' });
    });
  });

  describe('月別統計表示', () => {
    test('月別投稿数が正しく表示される', () => {
      render(<StatsContent stats={mockStats} />);
      
      expect(screen.getByText('2024年1月')).toBeInTheDocument();
      expect(screen.getByText('30件')).toBeInTheDocument();
      expect(screen.getByText('2023年12月')).toBeInTheDocument();
      expect(screen.getByText('25件')).toBeInTheDocument();
      expect(screen.getByText('2023年11月')).toBeInTheDocument();
      expect(screen.getByText('20件')).toBeInTheDocument();
    });

    test('グラフバーが正しい幅で表示される', () => {
      render(<StatsContent stats={mockStats} />);
      
      // 最大値30に対する割合で幅が設定される
      const bars = screen.getAllByRole('progressbar');
      expect(bars[0]).toHaveStyle({ width: '100%' }); // 30/30
      expect(bars[1]).toHaveStyle({ width: expect.stringContaining('%') }); // 25/30
      expect(bars[2]).toHaveStyle({ width: expect.stringContaining('%') }); // 20/30
    });
  });

  describe('ユーザーインタラクション', () => {
    test('ユーザー名クリックでコールバックが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockOnUserClick = jest.fn();
      
      render(<StatsContent stats={mockStats} onUserClick={mockOnUserClick} />);
      
      await user.click(screen.getByText('user1'));
      
      expect(mockOnUserClick).toHaveBeenCalledWith('user1');
    });

    test('タグクリックでコールバックが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockOnTagClick = jest.fn();
      
      render(<StatsContent stats={mockStats} onTagClick={mockOnTagClick} />);
      
      await user.click(screen.getByText('React'));
      
      expect(mockOnTagClick).toHaveBeenCalledWith('React');
    });
  });

  describe('空データの処理', () => {
    test('統計データが空の場合メッセージが表示される', () => {
      const emptyStats = {
        userStats: [],
        tagStats: [],
        monthlyStats: [],
      };
      
      render(<StatsContent stats={emptyStats} />);
      
      expect(screen.getByText('投稿データがありません')).toBeInTheDocument();
      expect(screen.getByText('タグデータがありません')).toBeInTheDocument();
      expect(screen.getByText('月別データがありません')).toBeInTheDocument();
    });
  });

  describe('期間フィルタ', () => {
    test('期間選択タブが表示される', () => {
      render(<StatsContent stats={mockStats} />);
      
      expect(screen.getByRole('tab', { name: '週間' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: '月間' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: '年間' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: '全期間' })).toBeInTheDocument();
    });

    test('期間変更でコールバックが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockOnPeriodChange = jest.fn();
      
      render(
        <StatsContent 
          stats={mockStats} 
          onPeriodChange={mockOnPeriodChange}
        />
      );
      
      await user.click(screen.getByRole('tab', { name: '月間' }));
      
      expect(mockOnPeriodChange).toHaveBeenCalledWith('monthly');
    });
  });

  describe('旧システム互換性', () => {
    test('CSSクラス構造が同等', () => {
      render(<StatsContent stats={mockStats} />);
      
      const container = screen.getByTestId('stats-content');
      expect(container).toHaveClass('stats-container');
    });

    test('ランキングアイテムのスタイルが同等', () => {
      render(<StatsContent stats={mockStats} />);
      
      const rankingItems = screen.getAllByTestId('ranking-item');
      expect(rankingItems[0]).toHaveClass('ranking-item');
    });
  });
});