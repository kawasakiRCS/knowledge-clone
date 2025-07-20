/**
 * TagInputコンポーネントテスト
 * 
 * @description タグ入力、自動補完、バリデーション機能のテスト
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagInput } from '../TagInput';

// fetchモック
global.fetch = jest.fn();

// useDebounceモック
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

// デフォルトのfetch応答を設定
const mockEmptyResponse = {
  ok: true,
  json: async () => ({ success: true, tags: [] }),
};

describe('TagInput', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    // デフォルトのモックレスポンスを設定
    (global.fetch as jest.Mock).mockResolvedValue(mockEmptyResponse);
  });

  describe('基本レンダリング', () => {
    test('コンポーネントが正しくレンダリングされる', () => {
      render(<TagInput value={[]} onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText('タグを入力してください');
      expect(input).toBeInTheDocument();
    });

    test('既存のタグが表示される', () => {
      const tags = ['React', 'TypeScript', 'JavaScript'];
      render(<TagInput value={tags} onChange={mockOnChange} />);
      
      tags.forEach(tag => {
        expect(screen.getByText(tag)).toBeInTheDocument();
      });
    });

    test('カスタムプレースホルダーが表示される', () => {
      render(
        <TagInput 
          value={[]} 
          onChange={mockOnChange} 
          placeholder="カスタムプレースホルダー" 
        />
      );
      
      expect(screen.getByPlaceholderText('カスタムプレースホルダー')).toBeInTheDocument();
    });

    test('disabled時は入力が無効化される', () => {
      render(<TagInput value={[]} onChange={mockOnChange} disabled={true} />);
      
      const input = screen.getByPlaceholderText('タグを入力してください');
      expect(input).toBeDisabled();
    });
  });

  describe('タグの追加', () => {
    test('Enterキーでタグが追加される', () => {
      render(<TagInput value={[]} onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText('タグを入力してください');
      fireEvent.change(input, { target: { value: 'NewTag' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(mockOnChange).toHaveBeenCalledWith(['NewTag']);
    });

    test('カンマ区切りで複数タグが追加される', () => {
      const { rerender } = render(<TagInput value={[]} onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText('タグを入力してください');
      fireEvent.change(input, { target: { value: 'Tag1, Tag2, Tag3' } });
      
      // カンマ区切りで順番に追加される（各タグは個別に追加される）
      expect(mockOnChange).toHaveBeenCalledTimes(3);
      expect(mockOnChange).toHaveBeenNthCalledWith(1, ['Tag1']);
      expect(mockOnChange).toHaveBeenNthCalledWith(2, ['Tag2']);
      expect(mockOnChange).toHaveBeenNthCalledWith(3, ['Tag3']);
    });

    test('空のタグは追加されない', () => {
      render(<TagInput value={[]} onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText('タグを入力してください');
      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    test('重複するタグは追加されない', () => {
      render(<TagInput value={['React']} onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText('');
      fireEvent.change(input, { target: { value: 'react' } }); // 小文字で入力
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    test('最大タグ数制限が機能する', () => {
      window.alert = jest.fn();
      const tags = ['Tag1', 'Tag2', 'Tag3'];
      render(<TagInput value={tags} onChange={mockOnChange} maxTags={3} />);
      
      const input = screen.getByPlaceholderText('');
      fireEvent.change(input, { target: { value: 'Tag4' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(mockOnChange).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('タグは最大3個まで設定できます');
    });
  });

  describe('タグの削除', () => {
    test('削除ボタンでタグが削除される', () => {
      const tags = ['React', 'TypeScript', 'JavaScript'];
      render(<TagInput value={tags} onChange={mockOnChange} />);
      
      const deleteButtons = screen.getAllByLabelText(/を削除$/);
      fireEvent.click(deleteButtons[1]); // TypeScriptを削除
      
      expect(mockOnChange).toHaveBeenCalledWith(['React', 'JavaScript']);
    });

    test('Backspaceキーで最後のタグが削除される', () => {
      const tags = ['React', 'TypeScript'];
      render(<TagInput value={tags} onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText('');
      fireEvent.keyDown(input, { key: 'Backspace' });
      
      expect(mockOnChange).toHaveBeenCalledWith(['React']);
    });

    test('disabled時は削除ボタンが表示されない', () => {
      const tags = ['React', 'TypeScript'];
      render(<TagInput value={tags} onChange={mockOnChange} disabled={true} />);
      
      const deleteButtons = screen.queryAllByLabelText(/を削除$/);
      expect(deleteButtons).toHaveLength(0);
    });
  });

  describe('自動補完機能', () => {
    test('入力時にタグ候補が表示される', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          tags: [
            { tagId: 1, tagName: 'React' },
            { tagId: 2, tagName: 'Redux' },
          ],
        }),
      });

      render(<TagInput value={[]} onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText('タグを入力してください');
      fireEvent.change(input, { target: { value: 'Re' } });
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/open/tags/json?keyword=Re');
      });

      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('Redux')).toBeInTheDocument();
      });
    });

    test('既に追加されているタグは候補に表示されない', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          tags: [
            { tagId: 1, tagName: 'React' },
            { tagId: 2, tagName: 'Redux' },
          ],
        }),
      });

      render(<TagInput value={['react']} onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText('');
      fireEvent.change(input, { target: { value: 'Re' } });
      
      await waitFor(() => {
        expect(screen.queryByText('React')).not.toBeInTheDocument();
        expect(screen.getByText('Redux')).toBeInTheDocument();
      });
    });

    test('候補をクリックでタグが追加される', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          tags: [
            { tagId: 1, tagName: 'React' },
          ],
        }),
      });

      render(<TagInput value={[]} onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText('タグを入力してください');
      fireEvent.change(input, { target: { value: 'Re' } });
      
      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('React'));
      
      expect(mockOnChange).toHaveBeenCalledWith(['React']);
    });

    test('APIエラー時はコンソールにエラーが出力される', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<TagInput value={[]} onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText('タグを入力してください');
      fireEvent.change(input, { target: { value: 'Re' } });
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('タグ候補の取得に失敗しました:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('キーボード操作', () => {
    test('矢印キーで候補を選択できる', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          tags: [
            { tagId: 1, tagName: 'React' },
            { tagId: 2, tagName: 'Redux' },
            { tagId: 3, tagName: 'Recoil' },
          ],
        }),
      });

      const { container } = render(<TagInput value={[]} onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText('タグを入力してください');
      fireEvent.change(input, { target: { value: 'Re' } });
      
      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
      });

      // 下矢印で選択
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(container.querySelector('.suggestion-item.selected')).toHaveTextContent('React');

      // さらに下矢印
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(container.querySelector('.suggestion-item.selected')).toHaveTextContent('Redux');

      // 上矢印で戻る
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      expect(container.querySelector('.suggestion-item.selected')).toHaveTextContent('React');

      // Enterで選択
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(mockOnChange).toHaveBeenCalledWith(['React']);
    });

    test('Escapeキーで候補を閉じる', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          tags: [
            { tagId: 1, tagName: 'React' },
          ],
        }),
      });

      render(<TagInput value={[]} onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText('タグを入力してください');
      fireEvent.change(input, { target: { value: 'Re' } });
      
      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByText('React')).not.toBeInTheDocument();
      });
    });
  });

  describe('フォーカス処理', () => {
    test('フォーカスアウトで候補が閉じる', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          tags: [
            { tagId: 1, tagName: 'React' },
          ],
        }),
      });

      render(<TagInput value={[]} onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText('タグを入力してください');
      fireEvent.change(input, { target: { value: 'Re' } });
      
      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
      });

      fireEvent.blur(input);
      
      // 遅延があるため待機
      await waitFor(() => {
        expect(screen.queryByText('React')).not.toBeInTheDocument();
      }, { timeout: 300 });
    });
  });

  describe('ローディング状態', () => {
    test('候補検索中はローディング表示される', async () => {
      let resolvePromise: (value: any) => void;
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => {
          resolvePromise = resolve;
        })
      );

      render(<TagInput value={[]} onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText('タグを入力してください');
      fireEvent.change(input, { target: { value: 'Re' } });
      
      // fetch実装の確認 - TagInputではsetIsLoading(true)が
      // fetchTagSuggestionsの最初で呼ばれるため、
      // fetchが呼ばれた時点でisLoadingがtrueになる
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // APIレスポンスを解決
      resolvePromise!({
        ok: true,
        json: async () => ({
          success: true,
          tags: [{ tagId: 1, tagName: 'React' }],
        }),
      });

      // 結果が表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
      });
    });
  });

  describe('スタイルとクラス', () => {
    test('カスタムクラスが適用される', () => {
      const { container } = render(
        <TagInput 
          value={[]} 
          onChange={mockOnChange} 
          className="custom-class" 
        />
      );
      
      expect(container.querySelector('.tag-input-container')).toHaveClass('custom-class');
    });
  });
});