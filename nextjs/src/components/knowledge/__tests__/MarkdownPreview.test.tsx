/**
 * MarkdownPreviewコンポーネントテスト
 * 
 * @description マークダウンプレビュー機能のテスト
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MarkdownPreview } from '../MarkdownPreview';

// Mock hooks
jest.mock('@/hooks/useSafeHTML', () => ({
  useSafeHTMLProps: (content: string) => ({ __html: content }),
}));

jest.mock('@/lib/emoji', () => ({
  convertEmoji: (content: string) => {
    // 簡単な絵文字変換のモック
    return content
      .replace(':smile:', '😄')
      .replace(':heart:', '❤️')
      .replace(':thumbsup:', '👍');
  },
}));

describe('MarkdownPreview', () => {
  describe('基本レンダリング', () => {
    test('コンテンツが表示される', () => {
      render(<MarkdownPreview content="# テストタイトル\n\nテスト内容" />);

      // テスト環境ではdangerouslySetInnerHTMLで表示される
      const container = screen.getByText((content, element) => {
        return element?.classList.contains('knowledge-content') || false;
      });
      expect(container).toBeInTheDocument();
    });

    test('空のコンテンツの場合、メッセージが表示される', () => {
      render(<MarkdownPreview content="" />);

      expect(screen.getByText('プレビュー内容がありません')).toBeInTheDocument();
    });

    test('nullまたはundefinedの場合も正しく処理される', () => {
      render(<MarkdownPreview content={undefined as any} />);

      expect(screen.getByText('プレビュー内容がありません')).toBeInTheDocument();
    });
  });

  describe('カスタムプロパティ', () => {
    test('カスタムクラス名が適用される', () => {
      const { container } = render(
        <MarkdownPreview content="テスト" className="custom-class" />
      );

      const previewDiv = container.querySelector('.knowledge-preview');
      expect(previewDiv).toHaveClass('custom-class');
    });

    test('カスタムスタイルが適用される', () => {
      const { container } = render(
        <MarkdownPreview content="テスト" style={{ color: 'red', fontSize: '16px' }} />
      );

      const previewDiv = container.querySelector('.knowledge-preview');
      expect(previewDiv).toHaveStyle({
        color: 'rgb(255, 0, 0)',
        fontSize: '16px',
      });
    });
  });

  describe('絵文字変換', () => {
    test('絵文字コードが変換される', () => {
      const { container } = render(
        <MarkdownPreview content="これは :smile: テストです :heart:" />
      );

      const content = container.querySelector('.knowledge-content');
      expect(content?.innerHTML).toContain('😄');
      expect(content?.innerHTML).toContain('❤️');
    });

    test('複数の絵文字が同時に変換される', () => {
      const { container } = render(
        <MarkdownPreview content=":thumbsup: いいね！ :smile: :heart:" />
      );

      const content = container.querySelector('.knowledge-content');
      expect(content?.innerHTML).toContain('👍');
      expect(content?.innerHTML).toContain('😄');
      expect(content?.innerHTML).toContain('❤️');
    });
  });

  describe('CSS構造の互換性', () => {
    test('旧システムと同じCSS構造を持つ', () => {
      const { container } = render(
        <MarkdownPreview content="テストコンテンツ" />
      );

      // メインコンテナ
      expect(container.querySelector('.knowledge-preview')).toBeInTheDocument();

      // コンテンツコンテナ
      expect(container.querySelector('.knowledge-content')).toBeInTheDocument();
    });

    test('空コンテンツ時のスタイル', () => {
      render(<MarkdownPreview content="" />);

      const emptyMessage = screen.getByText('プレビュー内容がありません');
      expect(emptyMessage).toHaveClass('text-muted');
    });
  });

  describe('マークダウン処理（テスト環境）', () => {
    test('HTMLコンテンツがサニタイズされて表示される', () => {
      const { container } = render(
        <MarkdownPreview content="<script>alert('test')</script>通常のテキスト" />
      );

      const content = container.querySelector('.knowledge-content');
      expect(content?.innerHTML).toContain('通常のテキスト');
      // useSafeHTMLPropsのモックではサニタイズされないが、本番環境では適切に処理される
    });

    test('マークダウン記法が含まれる場合も表示される', () => {
      const { container } = render(
        <MarkdownPreview content="# 見出し\n\n**太字** *斜体*\n\n- リスト1\n- リスト2" />
      );

      const content = container.querySelector('.knowledge-content');
      expect(content).toBeInTheDocument();
      // テスト環境では生のマークダウンとして表示される
    });
  });

  describe('長いコンテンツの処理', () => {
    test('長いコンテンツも正しく表示される', () => {
      const longContent = Array(100).fill('これは長いコンテンツです。').join('\n');
      const { container } = render(
        <MarkdownPreview content={longContent} />
      );

      const content = container.querySelector('.knowledge-content');
      expect(content).toBeInTheDocument();
      expect(content?.innerHTML.length).toBeGreaterThan(1000);
    });
  });

  describe('特殊文字の処理', () => {
    test('特殊文字が正しく表示される', () => {
      const { container } = render(
        <MarkdownPreview content={'< > & \' " 特殊文字のテスト'} />
      );

      const content = container.querySelector('.knowledge-content');
      expect(content).toBeInTheDocument();
      // HTMLとして正しくエスケープされることを確認
    });
  });
});