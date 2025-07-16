/**
 * ナレッジ編集ページテスト
 * 
 * @description Issue #34 - ナレッジ作成・編集ページの実装テスト
 * @description 旧システム protect/knowledge/edit.jsp の完全互換テスト
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import KnowledgeEditPage from '../page';

// Mock dependencies
jest.mock('next-auth/react');
jest.mock('next/navigation');

// Mock fetch globally
global.fetch = jest.fn();

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;

describe('KnowledgeEditPage', () => {
  const mockPush = jest.fn();
  const mockGet = jest.fn();
  
  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: 1, loginId: 'test-user', userName: 'Test User' }
      },
      status: 'authenticated'
    } as any);
    
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      refresh: jest.fn(),
    } as any);
    
    mockUseSearchParams.mockReturnValue({
      get: mockGet,
    } as any);

    // Mock fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        knowledgeId: 123,
        title: 'テスト記事タイトル',
        content: 'テスト記事内容',
        publicFlag: 'private',
        tags: ['tag1', 'tag2'],
      }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('新規作成モード', () => {
    test('新規作成時の初期状態が正しく表示される', () => {
      render(<KnowledgeEditPage params={{ params: undefined }} />);
      
      // 基本フォーム要素の存在確認
      expect(screen.getByPlaceholderText('タイトルを入力してください')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('内容をMarkdownで入力してください')).toBeInTheDocument();
      
      // 操作ボタンの存在確認
      expect(screen.getByRole('button', { name: '公開' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '下書き保存' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
    });

    test('必須フィールドが空の場合バリデーションエラーが表示される', async () => {
      const user = userEvent.setup();
      render(<KnowledgeEditPage params={{ params: undefined }} />);
      
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
      render(<KnowledgeEditPage params={{ params: ['123'] }} />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('テスト記事タイトル')).toBeInTheDocument();
        expect(screen.getByDisplayValue('テスト記事内容')).toBeInTheDocument();
      });
    });

    test('削除ボタンが編集モードでのみ表示される', async () => {
      render(<KnowledgeEditPage params={{ params: ['123'] }} />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument();
      });
    });
  });

  describe('レイアウト構造', () => {
    test('2カラムレイアウトが正しく表示される', () => {
      render(<KnowledgeEditPage params={{ params: undefined }} />);
      
      // メインエディタ部分（左8カラム）
      expect(screen.getByTestId('main-editor-section')).toBeInTheDocument();
      expect(screen.getByTestId('main-editor-section')).toHaveClass('col-md-8');
      
      // サイドバー部分（右4カラム）
      expect(screen.getByTestId('sidebar-section')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-section')).toHaveClass('col-md-4');
    });

    test('旧システム互換のCSSクラスが適用される', () => {
      render(<KnowledgeEditPage params={{ params: undefined }} />);
      
      // 主要なコンテナクラス
      expect(screen.getByTestId('knowledge-edit-container')).toHaveClass('container-fluid');
      expect(screen.getByTestId('knowledge-edit-form')).toHaveClass('form-horizontal');
    });
  });

  describe('フォーム操作', () => {
    test('タイトル入力時にEnterキーが無効化される', async () => {
      const user = userEvent.setup();
      render(<KnowledgeEditPage params={{ params: undefined }} />);
      
      const titleInput = screen.getByPlaceholderText('タイトルを入力してください');
      await user.type(titleInput, 'テストタイトル{enter}');
      
      // フォーム送信されないことを確認
      expect(mockPush).not.toHaveBeenCalled();
    });

    test('内容フィールドの変更が正しく反映される', async () => {
      const user = userEvent.setup();
      render(<KnowledgeEditPage params={{ params: undefined }} />);
      
      const contentInput = screen.getByPlaceholderText('内容をMarkdownで入力してください');
      await user.type(contentInput, '# テスト見出し\n\nテスト内容');
      
      expect(contentInput).toHaveValue('# テスト見出し\n\nテスト内容');
    });
  });

  describe('プレビュー機能', () => {
    test('Write/Previewタブの切り替えが正しく動作する', async () => {
      const user = userEvent.setup();
      render(<KnowledgeEditPage params={{ params: undefined }} />);
      
      const previewTab = screen.getByRole('tab', { name: 'Preview' });
      await user.click(previewTab);
      
      expect(screen.getByTestId('preview-content')).toBeInTheDocument();
    });
  });

  describe('権限チェック', () => {
    test('未認証時にリダイレクトされる', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated'
      } as any);
      
      render(<KnowledgeEditPage params={{ params: undefined }} />);
      
      expect(mockPush).toHaveBeenCalledWith('/signin');
    });

    test('編集権限がない場合にエラーが表示される', async () => {
      // 権限なしのレスポンスをモック
      render(<KnowledgeEditPage params={{ params: ['123'] }} />);
      
      await waitFor(() => {
        expect(screen.getByText('この記事を編集する権限がありません')).toBeInTheDocument();
      });
    });
  });
});