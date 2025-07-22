/**
 * ナレッジ編集ページテスト
 * 
 * @description Issue #34 - ナレッジ作成・編集ページの実装テスト
 * @description Issue #64 - 公開ボタンエラー修正のテスト追加
 * @description 旧システム protect/knowledge/edit.jsp の完全互換テスト
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KnowledgeEditPage from '../page';

// Mock Next.js navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: { id: 1, loginId: 'test-user', userName: 'Test User' }
    },
    status: 'authenticated'
  }),
}));

// Mock components
jest.mock('@/components/knowledge/MarkdownPreview', () => {
  return function MockMarkdownPreview({ content }: { content: string }) {
    return <div data-testid="markdown-preview">{content}</div>;
  };
});

jest.mock('@/components/knowledge/TagInput', () => {
  return function MockTagInput({ value, onChange, placeholder }: any) {
    return (
      <input
        data-testid="tag-input"
        placeholder={placeholder}
        value={value.join(',')}
        onChange={(e) => onChange(e.target.value.split(',').filter(Boolean))}
      />
    );
  };
});

jest.mock('@/components/knowledge/FileUpload', () => {
  return function MockFileUpload({ onFileUploaded, onFileRemoved }: any) {
    return <div data-testid="file-upload">File Upload Component</div>;
  };
});

// Mock fetch globally
global.fetch = jest.fn();

describe('KnowledgeEditPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        knowledgeId: 123,
        title: 'テスト記事タイトル',
        content: 'テスト記事内容',
        publicFlag: 2, // 数値として設定
        tags: ['tag1', 'tag2'],
        typeId: 1, // デフォルト: ナレッジ
      }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('新規作成モード', () => {
    test('新規作成時の初期状態が正しく表示される', async () => {
      render(<KnowledgeEditPage params={Promise.resolve({ params: undefined })} />);
      
      await waitFor(() => {
        // 基本フォーム要素の存在確認
        expect(screen.getByPlaceholderText('タイトルを入力してください')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('内容をMarkdownで入力してください')).toBeInTheDocument();
        
        // 操作ボタンの存在確認
        expect(screen.getByRole('button', { name: '公開' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '下書き保存' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
      });
    });

    test('必須フィールドが空の場合バリデーションエラーが表示される', async () => {
      const user = userEvent.setup();
      render(<KnowledgeEditPage params={Promise.resolve({ params: undefined })} />);
      
      await waitFor(() => {
        const publishButton = screen.getByRole('button', { name: '公開' });
        expect(publishButton).toBeInTheDocument();
      });
      
      const publishButton = screen.getByRole('button', { name: '公開' });
      await user.click(publishButton);
      
      await waitFor(() => {
        expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();
        expect(screen.getByText('内容は必須です')).toBeInTheDocument();
      });
    });
  });

  describe('編集モード', () => {
    test('既存記事の編集時に初期値が正しく設定される', async () => {
      render(<KnowledgeEditPage params={Promise.resolve({ params: ['123'] })} />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('テスト記事タイトル')).toBeInTheDocument();
        expect(screen.getByDisplayValue('テスト記事内容')).toBeInTheDocument();
      });
    });

    test('削除ボタンが編集モードでのみ表示される', async () => {
      render(<KnowledgeEditPage params={Promise.resolve({ params: ['123'] })} />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument();
      });
    });
  });

  describe('レイアウト構造', () => {
    test('2カラムレイアウトが正しく表示される', async () => {
      render(<KnowledgeEditPage params={Promise.resolve({ params: undefined })} />);
      
      await waitFor(() => {
        // メインエディタ部分（左8カラム）
        expect(screen.getByTestId('main-editor-section')).toBeInTheDocument();
        expect(screen.getByTestId('main-editor-section')).toHaveClass('col-md-8');
        
        // サイドバー部分（右4カラム）
        expect(screen.getByTestId('sidebar-section')).toBeInTheDocument();
        expect(screen.getByTestId('sidebar-section')).toHaveClass('col-md-4');
      });
    });

    test('旧システム互換のCSSクラスが適用される', async () => {
      render(<KnowledgeEditPage params={Promise.resolve({ params: undefined })} />);
      
      await waitFor(() => {
        // 主要なコンテナクラス
        expect(screen.getByTestId('knowledge-edit-container')).toHaveClass('container-fluid');
        expect(screen.getByTestId('knowledge-edit-form')).toHaveClass('form-horizontal');
      });
    });
  });

  describe('フォーム操作', () => {
    test('タイトル入力時にEnterキーが無効化される', async () => {
      const user = userEvent.setup();
      render(<KnowledgeEditPage params={Promise.resolve({ params: undefined })} />);
      
      await waitFor(() => {
        const titleInput = screen.getByPlaceholderText('タイトルを入力してください');
        expect(titleInput).toBeInTheDocument();
      });
      
      const titleInput = screen.getByPlaceholderText('タイトルを入力してください');
      await user.type(titleInput, 'テストタイトル{enter}');
      
      // フォーム送信されないことを確認
      expect(mockPush).not.toHaveBeenCalled();
    });

    test('内容フィールドの変更が正しく反映される', async () => {
      const user = userEvent.setup();
      render(<KnowledgeEditPage params={Promise.resolve({ params: undefined })} />);
      
      await waitFor(() => {
        const contentInput = screen.getByPlaceholderText('内容をMarkdownで入力してください');
        expect(contentInput).toBeInTheDocument();
      });
      
      const contentInput = screen.getByPlaceholderText('内容をMarkdownで入力してください');
      await user.type(contentInput, '# テスト見出し\n\nテスト内容');
      
      expect(contentInput).toHaveValue('# テスト見出し\n\nテスト内容');
    });
  });

  describe('プレビュー機能', () => {
    test('Write/Previewタブの切り替えが正しく動作する', async () => {
      const user = userEvent.setup();
      render(<KnowledgeEditPage params={Promise.resolve({ params: undefined })} />);
      
      await waitFor(() => {
        const previewTab = screen.getByRole('tab', { name: 'Preview' });
        expect(previewTab).toBeInTheDocument();
      });
      
      const previewTab = screen.getByRole('tab', { name: 'Preview' });
      await user.click(previewTab);
      
      expect(screen.getByTestId('preview-content')).toBeInTheDocument();
    });
  });

  describe('権限チェック', () => {
    test('認証済みユーザーでページが表示される', async () => {
      render(<KnowledgeEditPage params={Promise.resolve({ params: undefined })} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('knowledge-edit-container')).toBeInTheDocument();
      });
    });
  });

  describe('Issue #64: 公開ボタンエラー修正テスト', () => {
    test('publicFlag初期値が数値である', async () => {
      render(<KnowledgeEditPage params={Promise.resolve({ params: undefined })} />);
      
      await waitFor(() => {
        // プライベート（自分のみ）がデフォルトで選択されている（value="2"）
        const privateRadio = screen.getByDisplayValue('2');
        expect(privateRadio).toBeInTheDocument();
        // React Hook Formでのchecked属性の確認
        expect(privateRadio).toHaveAttribute('checked', '');
      });
    });

    test('公開フラグ選択が正しく動作する', async () => {
      const user = userEvent.setup();
      render(<KnowledgeEditPage params={Promise.resolve({ params: undefined })} />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('2')).toBeInTheDocument(); // プライベート
      });

      // 各オプションを選択してテスト
      const publicRadio = screen.getByDisplayValue('1'); // パブリック
      const privateRadio = screen.getByDisplayValue('2'); // プライベート
      const protectRadio = screen.getByDisplayValue('3'); // 保護

      // パブリック選択
      await user.click(publicRadio);
      expect(publicRadio).toBeChecked();
      expect(privateRadio).not.toBeChecked();
      expect(protectRadio).not.toBeChecked();

      // 保護選択
      await user.click(protectRadio);
      expect(protectRadio).toBeChecked();
      expect(publicRadio).not.toBeChecked();
      expect(privateRadio).not.toBeChecked();

      // プライベート選択
      await user.click(privateRadio);
      expect(privateRadio).toBeChecked();
      expect(publicRadio).not.toBeChecked();
      expect(protectRadio).not.toBeChecked();
    });

    test('新規作成時の公開ボタンで正しいpublicFlag値が送信される', async () => {
      const user = userEvent.setup();
      
      // fetchモックをクリア
      (global.fetch as jest.Mock).mockClear();
      
      // 公開API成功のモック
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ knowledgeId: 123 })
      });

      render(<KnowledgeEditPage params={Promise.resolve({ params: undefined })} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('タイトルを入力してください')).toBeInTheDocument();
      });

      // フォーム入力
      await user.type(screen.getByPlaceholderText('タイトルを入力してください'), 'テストタイトル');
      await user.type(screen.getByPlaceholderText('内容をMarkdownで入力してください'), 'テスト内容');
      
      // パブリック（全員）を選択
      const publicRadio = screen.getByDisplayValue('1');
      await user.click(publicRadio);
      
      // 公開ボタンをクリック
      const publishButton = screen.getByText('公開');
      await user.click(publishButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/protect/knowledge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'テストタイトル',
            content: 'テスト内容',
            publicFlag: 1, // 数値で送信されることを確認
            tags: [],
            typeId: 1, // デフォルト: ナレッジ
            editors: [],
            viewers: [],
            commentFlag: true,
            tagNames: '',
            draft: false,
          }),
        });
      }, { timeout: 3000 });
    });

    test('編集時の公開ボタンで正しいpublicFlag値が送信される', async () => {
      const user = userEvent.setup();
      
      // すべてのfetchモックをクリア
      (global.fetch as jest.Mock).mockClear();
      
      // 既存記事取得のモック（成功レスポンス）
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            title: '既存タイトル',
            content: '既存内容',
            publicFlag: 2, // 非公開
            tags: [],
            typeId: 1, // デフォルト: ナレッジ
            editors: [],
            viewers: [],
            commentFlag: true
          })
        })
        // 更新API成功のモック
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ knowledgeId: 123 })
        });

      render(<KnowledgeEditPage params={Promise.resolve({ params: ['123'] })} />);

      // データ読み込み完了まで待機
      await waitFor(() => {
        expect(screen.getByDisplayValue('既存タイトル')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // 保護（指定グループのみ）を選択
      const protectRadio = screen.getByDisplayValue('3');
      await user.click(protectRadio);
      
      // 公開ボタンをクリック
      const publishButton = screen.getByText('公開');
      await user.click(publishButton);

      // API呼び出しを確認
      await waitFor(() => {
        // fetch が2回呼ばれる（データ取得 + 更新）
        expect(global.fetch).toHaveBeenCalledTimes(2);
        
        // 2回目の呼び出し（更新API）の確認
        expect(global.fetch).toHaveBeenNthCalledWith(2, '/api/protect/knowledge/123', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: '既存タイトル',
            content: '既存内容',
            publicFlag: 3, // 数値で送信されることを確認
            tags: [],
            typeId: 1, // デフォルト: ナレッジ
            editors: [],
            viewers: [],
            commentFlag: true,
            tagNames: '',
            draft: false,
          }),
        });
      }, { timeout: 3000 });
    });

    test('API エラー時に適切にハンドリングされる', async () => {
      const user = userEvent.setup();
      
      // API エラーのモック
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400
      });

      render(<KnowledgeEditPage params={Promise.resolve({ params: undefined })} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('タイトルを入力してください')).toBeInTheDocument();
      });

      // フォーム入力
      await user.type(screen.getByPlaceholderText('タイトルを入力してください'), 'テストタイトル');
      await user.type(screen.getByPlaceholderText('内容をMarkdownで入力してください'), 'テスト内容');
      
      // 公開ボタンをクリック
      await user.click(screen.getByText('公開'));

      // APIが呼ばれることを確認
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
      
      // エラー時はリダイレクトしない
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});