/**
 * TagListコンポーネントテスト
 * 
 * @description タグリストの表示・操作テスト
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagList } from '../TagList';

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

describe('TagList', () => {
  const mockTags = [
    { tagName: 'React', tagColorType: { colorCode: '#61DAFB' } },
    { tagName: 'TypeScript', tagColorType: { colorCode: '#3178C6' } },
    { tagName: 'Next.js', tagColorType: { colorCode: '#000000' } },
  ];

  describe('基本レンダリング', () => {
    test('すべてのタグが表示される', () => {
      render(<TagList tags={mockTags} />);
      
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Next.js')).toBeInTheDocument();
    });

    test('タグが正しい色で表示される', () => {
      render(<TagList tags={mockTags} />);
      
      const reactTag = screen.getByText('React');
      expect(reactTag).toHaveStyle({ backgroundColor: '#61DAFB' });
      
      const tsTag = screen.getByText('TypeScript');
      expect(tsTag).toHaveStyle({ backgroundColor: '#3178C6' });
      
      const nextTag = screen.getByText('Next.js');
      expect(nextTag).toHaveStyle({ backgroundColor: '#000000' });
    });

    test('空のタグリストの場合何も表示されない', () => {
      const { container } = render(<TagList tags={[]} />);
      
      expect(container.firstChild).toBeEmptyDOMElement();
    });

    test('タグがnullの場合も正常に動作', () => {
      const { container } = render(<TagList tags={null as any} />);
      
      expect(container.firstChild).toBeEmptyDOMElement();
    });
  });

  describe('スタイルバリアント', () => {
    test('smallサイズが適用される', () => {
      render(<TagList tags={mockTags} size="small" />);
      
      const tag = screen.getByText('React');
      expect(tag).toHaveClass('text-xs', 'px-1.5', 'py-0.5');
    });

    test('mediumサイズが適用される', () => {
      render(<TagList tags={mockTags} size="medium" />);
      
      const tag = screen.getByText('React');
      expect(tag).toHaveClass('text-sm', 'px-2', 'py-1');
    });

    test('largeサイズが適用される', () => {
      render(<TagList tags={mockTags} size="large" />);
      
      const tag = screen.getByText('React');
      expect(tag).toHaveClass('text-base', 'px-3', 'py-1.5');
    });

    test('デフォルトサイズはmedium', () => {
      render(<TagList tags={mockTags} />);
      
      const tag = screen.getByText('React');
      expect(tag).toHaveClass('text-sm', 'px-2', 'py-1');
    });
  });

  describe('クリックイベント', () => {
    test('タグクリック時にonTagClickが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockOnTagClick = jest.fn();
      
      render(<TagList tags={mockTags} onTagClick={mockOnTagClick} />);
      
      await user.click(screen.getByText('React'));
      
      expect(mockOnTagClick).toHaveBeenCalledWith('React');
    });

    test('複数のタグをクリックできる', async () => {
      const user = userEvent.setup();
      const mockOnTagClick = jest.fn();
      
      render(<TagList tags={mockTags} onTagClick={mockOnTagClick} />);
      
      await user.click(screen.getByText('React'));
      await user.click(screen.getByText('TypeScript'));
      
      expect(mockOnTagClick).toHaveBeenCalledTimes(2);
      expect(mockOnTagClick).toHaveBeenNthCalledWith(1, 'React');
      expect(mockOnTagClick).toHaveBeenNthCalledWith(2, 'TypeScript');
    });

    test('onTagClickがない場合もクリック可能', async () => {
      const user = userEvent.setup();
      render(<TagList tags={mockTags} />);
      
      await expect(user.click(screen.getByText('React'))).resolves.not.toThrow();
    });
  });

  describe('カスタムクラス', () => {
    test('カスタムclassNameが適用される', () => {
      render(<TagList tags={mockTags} className="custom-class" />);
      
      const container = screen.getByText('React').parentElement;
      expect(container).toHaveClass('custom-class');
    });

    test('wrapプロパティが適用される', () => {
      render(<TagList tags={mockTags} wrap={false} />);
      
      const container = screen.getByText('React').parentElement;
      expect(container).not.toHaveClass('flex-wrap');
    });
  });

  describe('テキストカラーの自動調整', () => {
    test('明るい背景色の場合は黒文字', () => {
      const lightBgTags = [
        { tagName: 'Light', tagColorType: { colorCode: '#FFFFFF' } },
      ];
      
      render(<TagList tags={lightBgTags} />);
      
      const tag = screen.getByText('Light');
      expect(tag).toHaveClass('text-gray-800');
    });

    test('暗い背景色の場合は白文字', () => {
      const darkBgTags = [
        { tagName: 'Dark', tagColorType: { colorCode: '#000000' } },
      ];
      
      render(<TagList tags={darkBgTags} />);
      
      const tag = screen.getByText('Dark');
      expect(tag).toHaveClass('text-white');
    });
  });

  describe('旧システム互換性', () => {
    test('タグのCSSクラスが同等', () => {
      render(<TagList tags={mockTags} />);
      
      const tag = screen.getByText('React');
      expect(tag).toHaveClass('inline-block', 'rounded-full');
    });

    test('ホバースタイルが適用される', () => {
      render(<TagList tags={mockTags} onTagClick={() => {}} />);
      
      const tag = screen.getByText('React');
      expect(tag).toHaveClass('cursor-pointer', 'hover:opacity-80');
    });
  });
});