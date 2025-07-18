/**
 * KnowledgeCardコンポーネントテスト
 * 
 * @description ナレッジカードの表示・操作テスト
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KnowledgeCard } from '../KnowledgeCard';
import { useRouter } from 'next/navigation';

// モック設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../lib/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    isLoggedIn: true,
    user: { userId: 'testuser', userName: 'Test User' },
    loading: false,
  })),
}));

describe('KnowledgeCard', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockKnowledge = {
    knowledgeId: 1,
    title: 'テストナレッジ',
    content: 'これはテストコンテンツです。\n複数行のコンテンツがあります。',
    userName: 'テストユーザー',
    knowledgeType: { typeId: 1, typeName: '技術メモ' },
    publicFlag: 1,
    updateDate: '2024-01-15T10:30:00',
    commentCount: 5,
    userLike: 1,
    likeCount: 3,
    tagList: [
      { tagName: 'React', tagColorType: { colorCode: '#61DAFB' } },
      { tagName: 'TypeScript', tagColorType: { colorCode: '#3178C6' } },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe('基本レンダリング', () => {
    test('ナレッジカードが表示される', () => {
      render(<KnowledgeCard knowledge={mockKnowledge} />);
      
      expect(screen.getByText('テストナレッジ')).toBeInTheDocument();
      expect(screen.getByText(/これはテストコンテンツです/)).toBeInTheDocument();
      expect(screen.getByText('テストユーザー')).toBeInTheDocument();
    });

    test('タイトルクリックで詳細ページへ遷移', async () => {
      const user = userEvent.setup();
      render(<KnowledgeCard knowledge={mockKnowledge} />);
      
      await user.click(screen.getByText('テストナレッジ'));
      
      expect(mockRouter.push).toHaveBeenCalledWith('/open/knowledge/detail/1');
    });

    test('コンテンツが3行で切り詰められる', () => {
      const longContent = '行1\n行2\n行3\n行4\n行5';
      const knowledge = { ...mockKnowledge, content: longContent };
      
      render(<KnowledgeCard knowledge={knowledge} />);
      
      const content = screen.getByText(/行1/);
      expect(content).toHaveTextContent('行1\n行2\n行3...');
    });
  });

  describe('メタデータ表示', () => {
    test('更新日時が正しく表示される', () => {
      render(<KnowledgeCard knowledge={mockKnowledge} />);
      
      expect(screen.getByText('2024/01/15 10:30')).toBeInTheDocument();
    });

    test('コメント数が表示される', () => {
      render(<KnowledgeCard knowledge={mockKnowledge} />);
      
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    test('いいね数が表示される', () => {
      render(<KnowledgeCard knowledge={mockKnowledge} />);
      
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    test('非公開フラグが表示される', () => {
      const privateKnowledge = { ...mockKnowledge, publicFlag: 0 };
      render(<KnowledgeCard knowledge={privateKnowledge} />);
      
      expect(screen.getByText('非公開')).toBeInTheDocument();
    });
  });

  describe('タグ表示', () => {
    test('タグが正しい色で表示される', () => {
      render(<KnowledgeCard knowledge={mockKnowledge} />);
      
      const reactTag = screen.getByText('React');
      expect(reactTag).toHaveStyle({ backgroundColor: '#61DAFB' });
      
      const tsTag = screen.getByText('TypeScript');
      expect(tsTag).toHaveStyle({ backgroundColor: '#3178C6' });
    });

    test('タグがない場合も正常に表示される', () => {
      const noTagKnowledge = { ...mockKnowledge, tagList: [] };
      render(<KnowledgeCard knowledge={noTagKnowledge} />);
      
      expect(screen.getByText('テストナレッジ')).toBeInTheDocument();
    });
  });

  describe('いいね機能', () => {
    test('いいね済みの場合ハートが赤色', () => {
      render(<KnowledgeCard knowledge={mockKnowledge} />);
      
      const heartIcon = screen.getByLabelText('like');
      expect(heartIcon).toHaveClass('text-red-500');
    });

    test('未いいねの場合ハートがグレー', () => {
      const notLikedKnowledge = { ...mockKnowledge, userLike: 0 };
      render(<KnowledgeCard knowledge={notLikedKnowledge} />);
      
      const heartIcon = screen.getByLabelText('like');
      expect(heartIcon).toHaveClass('text-gray-400');
    });
  });

  describe('コールバック関数', () => {
    test('onTagClickが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockOnTagClick = jest.fn();
      
      render(<KnowledgeCard knowledge={mockKnowledge} onTagClick={mockOnTagClick} />);
      
      await user.click(screen.getByText('React'));
      
      expect(mockOnTagClick).toHaveBeenCalledWith('React');
    });

    test('onUserClickが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockOnUserClick = jest.fn();
      
      render(<KnowledgeCard knowledge={mockKnowledge} onUserClick={mockOnUserClick} />);
      
      await user.click(screen.getByText('テストユーザー'));
      
      expect(mockOnUserClick).toHaveBeenCalledWith('テストユーザー');
    });
  });

  describe('旧システム互換性', () => {
    test('CSSクラス構造が同等', () => {
      render(<KnowledgeCard knowledge={mockKnowledge} />);
      
      const card = screen.getByRole('article');
      expect(card).toHaveClass('knowledge_box');
    });

    test('メタデータ部分のクラス構造', () => {
      render(<KnowledgeCard knowledge={mockKnowledge} />);
      
      const metaSection = screen.getByText('2024/01/15 10:30').closest('div');
      expect(metaSection).toHaveClass('knowledge_meta');
    });
  });
});