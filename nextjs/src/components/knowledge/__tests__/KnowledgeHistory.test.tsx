/**
 * ナレッジ履歴詳細コンポーネントテスト
 * 
 * @description 差分表示とコンテンツ比較機能のテスト
 */
import { render, screen, waitFor } from '@testing-library/react';
import KnowledgeHistory from '../KnowledgeHistory';

// diff2htmlのモック
jest.mock('diff2html', () => ({
  Diff2Html: {
    parse: jest.fn(() => []),
    html: jest.fn(() => '<div class="diff-mock">Diff content</div>'),
  },
}));

describe('KnowledgeHistory', () => {
  const mockHistory = {
    historyNo: 1,
    knowledgeId: 1,
    updateUser: '1',
    userName: 'テストユーザー',
    updateDatetime: '2024-01-01T10:00:00Z',
    content: '# 履歴のコンテンツ\n\n古いバージョンです。',
  };

  const mockCurrent = {
    knowledgeId: 1,
    title: 'テストナレッジ',
    content: '# 現在のコンテンツ\n\n新しいバージョンです。',
  };

  describe('基本レンダリング', () => {
    test('タイトルが表示される', () => {
      render(
        <KnowledgeHistory
          history={mockHistory}
          current={mockCurrent}
          page={1}
        />
      );

      expect(screen.getByText('編集履歴詳細')).toBeInTheDocument();
    });

    test('更新者情報が表示される', () => {
      render(
        <KnowledgeHistory
          history={mockHistory}
          current={mockCurrent}
          page={1}
        />
      );

      // ユーザー名が存在することを確認（空白文字で分割されている可能性を考慮）
      const userNameElement = screen.getByText(/テストユーザー/);
      expect(userNameElement).toBeInTheDocument();
      expect(screen.getByText(/2024\/01\/01/)).toBeInTheDocument();
    });

    test('ユーザーアイコンが遅延読み込みされる', () => {
      render(
        <KnowledgeHistory
          history={mockHistory}
          current={mockCurrent}
          page={1}
        />
      );

      const icon = screen.getByAltText('icon');
      expect(icon).toHaveAttribute('data-src', '/open.account/icon/1');
      expect(icon).toHaveAttribute('src', '/images/loader.gif');
      expect(icon).toHaveAttribute('width', '36');
      expect(icon).toHaveAttribute('height', '36');
    });
  });

  describe('差分表示', () => {
    test('差分表示エリアが存在する', () => {
      render(
        <KnowledgeHistory
          history={mockHistory}
          current={mockCurrent}
          page={1}
        />
      );

      expect(screen.getByTestId('content-diff')).toBeInTheDocument();
      expect(screen.getByText('差分')).toHaveClass('sub_title');
    });

    test('差分がマウント時に計算される', async () => {
      render(
        <KnowledgeHistory
          history={mockHistory}
          current={mockCurrent}
          page={1}
        />
      );

      await waitFor(() => {
        const diffContainer = screen.getByTestId('content-diff');
        expect(diffContainer).toBeInTheDocument();
      });
    });
  });

  describe('コンテンツ表示', () => {
    test('履歴コンテンツが表示される', () => {
      render(
        <KnowledgeHistory
          history={mockHistory}
          current={mockCurrent}
          page={1}
        />
      );

      const historyTextarea = screen.getByLabelText('履歴時点の内容');
      expect(historyTextarea).toHaveValue('# 履歴のコンテンツ\n\n古いバージョンです。');
      expect(historyTextarea).toHaveAttribute('readOnly');
      expect(historyTextarea).toHaveClass('form-control');
    });

    test('現在のコンテンツが表示される', () => {
      render(
        <KnowledgeHistory
          history={mockHistory}
          current={mockCurrent}
          page={1}
        />
      );

      const currentTextarea = screen.getByLabelText('現在の内容');
      expect(currentTextarea).toHaveValue('# 現在のコンテンツ\n\n新しいバージョンです。');
      expect(currentTextarea).toHaveAttribute('readOnly');
      expect(currentTextarea).toHaveClass('form-control');
    });

    test('セクションタイトルが正しく表示される', () => {
      render(
        <KnowledgeHistory
          history={mockHistory}
          current={mockCurrent}
          page={1}
        />
      );

      expect(screen.getByText('履歴時点')).toHaveClass('sub_title');
      expect(screen.getByText('現在')).toHaveClass('sub_title');
    });
  });

  describe('ナビゲーション', () => {
    test('戻るボタンが表示される', () => {
      render(
        <KnowledgeHistory
          history={mockHistory}
          current={mockCurrent}
          page={1}
        />
      );

      const backButton = screen.getByText(/戻る/).closest('a');
      expect(backButton).toBeInTheDocument();
      expect(backButton).toHaveClass('btn btn-warning');
      expect(backButton.querySelector('i')).toHaveClass('fa fa-undo');
    });

    test('戻るボタンのリンクが正しい（pageパラメータ付き）', () => {
      render(
        <KnowledgeHistory
          history={mockHistory}
          current={mockCurrent}
          page={2}
        />
      );

      const backButton = screen.getByText(/戻る/).closest('a');
      expect(backButton).toHaveAttribute('href', '/open/knowledge/histories/1?page=2');
    });

    test('戻るボタンのリンクが正しい（追加パラメータ付き）', () => {
      render(
        <KnowledgeHistory
          history={mockHistory}
          current={mockCurrent}
          page={1}
          params="?keyword=test"
        />
      );

      const backButton = screen.getByText(/戻る/).closest('a');
      expect(backButton).toHaveAttribute('href', '/open/knowledge/histories/1?keyword=test&page=1');
    });
  });

  describe('旧システム互換性', () => {
    test('レイアウト構造が同等', () => {
      render(
        <KnowledgeHistory
          history={mockHistory}
          current={mockCurrent}
          page={1}
        />
      );

      const formGroups = screen.getAllByTestId(/form-group/);
      expect(formGroups).toHaveLength(2);
      formGroups.forEach(group => {
        expect(group).toHaveClass('form-group');
      });
    });

    test('テキストエリアの属性が同等', () => {
      render(
        <KnowledgeHistory
          history={mockHistory}
          current={mockCurrent}
          page={1}
        />
      );

      const textareas = screen.getAllByRole('textbox');
      expect(textareas).toHaveLength(2);
      textareas.forEach(textarea => {
        expect(textarea).toHaveAttribute('rows', '5');
        expect(textarea).toHaveClass('form-control');
      });
    });
  });
});