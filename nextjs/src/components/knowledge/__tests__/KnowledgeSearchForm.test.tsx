/**
 * KnowledgeSearchFormコンポーネントテスト
 * 
 * @description ナレッジ検索フォームの表示・操作テスト
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KnowledgeSearchForm } from '../KnowledgeSearchForm';

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

describe('KnowledgeSearchForm', () => {
  const mockOnSearch = jest.fn();
  const mockOnReset = jest.fn();

  const defaultSearchParams = {
    keyword: '',
    userName: '',
    tagName: '',
    knowledgeTypes: [],
    dateFrom: '',
    dateTo: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本レンダリング', () => {
    test('検索フォームが表示される', () => {
      render(
        <KnowledgeSearchForm 
          searchParams={defaultSearchParams}
          onSearch={mockOnSearch}
          onReset={mockOnReset}
        />
      );
      
      expect(screen.getByPlaceholderText('ナレッジを検索...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '検索' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'リセット' })).toBeInTheDocument();
    });

    test('詳細検索エリアが折りたたまれている', () => {
      render(
        <KnowledgeSearchForm 
          searchParams={defaultSearchParams}
          onSearch={mockOnSearch}
          onReset={mockOnReset}
        />
      );
      
      expect(screen.queryByPlaceholderText('ユーザー名')).not.toBeInTheDocument();
    });

    test('詳細検索を開くと全フィールドが表示される', async () => {
      const user = userEvent.setup();
      render(
        <KnowledgeSearchForm 
          searchParams={defaultSearchParams}
          onSearch={mockOnSearch}
          onReset={mockOnReset}
        />
      );
      
      await user.click(screen.getByText('詳細検索'));
      
      expect(screen.getByPlaceholderText('ユーザー名')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('タグ名')).toBeInTheDocument();
      expect(screen.getByLabelText('開始日')).toBeInTheDocument();
      expect(screen.getByLabelText('終了日')).toBeInTheDocument();
    });
  });

  describe('初期値の設定', () => {
    test('検索パラメータが正しく設定される', () => {
      const searchParams = {
        keyword: 'React',
        userName: 'testuser',
        tagName: 'TypeScript',
        knowledgeTypes: [1, 2],
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
      };
      
      render(
        <KnowledgeSearchForm 
          searchParams={searchParams}
          onSearch={mockOnSearch}
          onReset={mockOnReset}
        />
      );
      
      expect(screen.getByDisplayValue('React')).toBeInTheDocument();
    });
  });

  describe('検索操作', () => {
    test('キーワード入力して検索', async () => {
      const user = userEvent.setup();
      render(
        <KnowledgeSearchForm 
          searchParams={defaultSearchParams}
          onSearch={mockOnSearch}
          onReset={mockOnReset}
        />
      );
      
      await user.type(screen.getByPlaceholderText('ナレッジを検索...'), 'React');
      await user.click(screen.getByRole('button', { name: '検索' }));
      
      expect(mockOnSearch).toHaveBeenCalledWith({
        keyword: 'React',
        userName: '',
        tagName: '',
        knowledgeTypes: [],
        dateFrom: '',
        dateTo: '',
      });
    });

    test('詳細検索フィールドを使用した検索', async () => {
      const user = userEvent.setup();
      render(
        <KnowledgeSearchForm 
          searchParams={defaultSearchParams}
          onSearch={mockOnSearch}
          onReset={mockOnReset}
        />
      );
      
      // 詳細検索を開く
      await user.click(screen.getByText('詳細検索'));
      
      // フィールドに入力
      await user.type(screen.getByPlaceholderText('ユーザー名'), 'testuser');
      await user.type(screen.getByPlaceholderText('タグ名'), 'TypeScript');
      await user.type(screen.getByLabelText('開始日'), '2024-01-01');
      await user.type(screen.getByLabelText('終了日'), '2024-12-31');
      
      // 検索実行
      await user.click(screen.getByRole('button', { name: '検索' }));
      
      expect(mockOnSearch).toHaveBeenCalledWith({
        keyword: '',
        userName: 'testuser',
        tagName: 'TypeScript',
        knowledgeTypes: [],
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
      });
    });

    test('Enterキーで検索が実行される', async () => {
      const user = userEvent.setup();
      render(
        <KnowledgeSearchForm 
          searchParams={defaultSearchParams}
          onSearch={mockOnSearch}
          onReset={mockOnReset}
        />
      );
      
      const input = screen.getByPlaceholderText('ナレッジを検索...');
      await user.type(input, 'React');
      await user.keyboard('{Enter}');
      
      expect(mockOnSearch).toHaveBeenCalled();
    });
  });

  describe('リセット操作', () => {
    test('リセットボタンでonResetが呼ばれる', async () => {
      const user = userEvent.setup();
      render(
        <KnowledgeSearchForm 
          searchParams={defaultSearchParams}
          onSearch={mockOnSearch}
          onReset={mockOnReset}
        />
      );
      
      await user.click(screen.getByRole('button', { name: 'リセット' }));
      
      expect(mockOnReset).toHaveBeenCalled();
    });

    test('リセット後フォームがクリアされる', async () => {
      const user = userEvent.setup();
      const searchParams = {
        keyword: 'React',
        userName: 'testuser',
        tagName: 'TypeScript',
        knowledgeTypes: [1, 2],
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
      };
      
      const { rerender } = render(
        <KnowledgeSearchForm 
          searchParams={searchParams}
          onSearch={mockOnSearch}
          onReset={mockOnReset}
        />
      );
      
      await user.click(screen.getByRole('button', { name: 'リセット' }));
      
      // リセット後の再レンダリング
      rerender(
        <KnowledgeSearchForm 
          searchParams={defaultSearchParams}
          onSearch={mockOnSearch}
          onReset={mockOnReset}
        />
      );
      
      expect(screen.getByPlaceholderText('ナレッジを検索...')).toHaveValue('');
    });
  });

  describe('ナレッジタイプ選択', () => {
    test('ナレッジタイプのチェックボックスが表示される', async () => {
      const user = userEvent.setup();
      render(
        <KnowledgeSearchForm 
          searchParams={defaultSearchParams}
          onSearch={mockOnSearch}
          onReset={mockOnReset}
          knowledgeTypes={[
            { typeId: 1, typeName: '技術メモ' },
            { typeId: 2, typeName: 'ナレッジ' },
            { typeId: 3, typeName: 'FAQ' },
          ]}
        />
      );
      
      await user.click(screen.getByText('詳細検索'));
      
      expect(screen.getByLabelText('技術メモ')).toBeInTheDocument();
      expect(screen.getByLabelText('ナレッジ')).toBeInTheDocument();
      expect(screen.getByLabelText('FAQ')).toBeInTheDocument();
    });

    test('ナレッジタイプを選択して検索', async () => {
      const user = userEvent.setup();
      render(
        <KnowledgeSearchForm 
          searchParams={defaultSearchParams}
          onSearch={mockOnSearch}
          onReset={mockOnReset}
          knowledgeTypes={[
            { typeId: 1, typeName: '技術メモ' },
            { typeId: 2, typeName: 'ナレッジ' },
          ]}
        />
      );
      
      await user.click(screen.getByText('詳細検索'));
      await user.click(screen.getByLabelText('技術メモ'));
      await user.click(screen.getByLabelText('ナレッジ'));
      await user.click(screen.getByRole('button', { name: '検索' }));
      
      expect(mockOnSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          knowledgeTypes: [1, 2],
        })
      );
    });
  });

  describe('旧システム互換性', () => {
    test('CSSクラス構造が同等', () => {
      render(
        <KnowledgeSearchForm 
          searchParams={defaultSearchParams}
          onSearch={mockOnSearch}
          onReset={mockOnReset}
        />
      );
      
      const form = screen.getByRole('form');
      expect(form).toHaveClass('search-form');
    });

    test('ボタンのスタイルが旧システムと同等', () => {
      render(
        <KnowledgeSearchForm 
          searchParams={defaultSearchParams}
          onSearch={mockOnSearch}
          onReset={mockOnReset}
        />
      );
      
      const searchButton = screen.getByRole('button', { name: '検索' });
      expect(searchButton).toHaveClass('btn-primary');
      
      const resetButton = screen.getByRole('button', { name: 'リセット' });
      expect(resetButton).toHaveClass('btn-secondary');
    });
  });
});