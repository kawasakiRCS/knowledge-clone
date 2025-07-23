/**
 * KnowledgeView編集ボタンテスト
 * 
 * @description 旧システムと同じ3状態の編集ボタン表示をテスト
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import KnowledgeView from '../KnowledgeView';
import { useAuth } from '@/lib/hooks/useAuth';

// モックの設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

// マークダウン関連ライブラリのモック
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div>{children}</div>
}));

const mockKnowledge = {
  knowledgeId: '1',
  title: 'テスト記事',
  content: 'テスト内容',
  publicFlag: 1,
  typeId: 1,
  point: 0,
  likeCount: '10',
  commentCount: 5,
  viewCount: '100',
  insertUser: 100,
  insertUserName: 'テストユーザー',
  insertDatetime: '2025-01-01T00:00:00.000Z',
  updateUser: 100,
  updateUserName: 'テストユーザー',
  updateDatetime: '2025-01-01T00:00:00.000Z',
  tags: [],
  stocks: [],
  targets: [],
  groups: [],
  editors: [],
  editable: false,
  files: [],
  comments: []
};

describe('KnowledgeView 編集ボタン', () => {
  const mockPush = jest.fn();
  const mockUseAuth = useAuth as jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  describe('ログインユーザーの場合', () => {
    const mockUser = { userId: 100, userName: 'テストユーザー' };

    test('編集権限がある場合は「投稿を編集」ボタンが表示される', () => {
      mockUseAuth.mockReturnValue({ user: mockUser });
      
      render(
        <KnowledgeView 
          knowledge={{ ...mockKnowledge, editable: true }} 
        />
      );

      const editButton = screen.getByRole('button', { name: /投稿を編集/i });
      expect(editButton).toBeInTheDocument();
      expect(editButton).not.toBeDisabled();
      expect(editButton).toHaveClass('btn_edit');
    });

    test('編集権限がない場合は「編集権限がありません」ボタンが表示される', () => {
      mockUseAuth.mockReturnValue({ user: mockUser });
      
      render(
        <KnowledgeView 
          knowledge={{ ...mockKnowledge, editable: false }} 
        />
      );

      const editButton = screen.getByRole('button', { name: /編集権限がありません/i });
      expect(editButton).toBeInTheDocument();
      expect(editButton).toBeDisabled();
      expect(editButton).toHaveClass('btn_edit', 'disabled');
    });

    test('編集ボタンクリックで編集ページに遷移する', async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue({ user: mockUser });
      
      render(
        <KnowledgeView 
          knowledge={{ ...mockKnowledge, editable: true }} 
        />
      );

      const editButton = screen.getByRole('button', { name: /投稿を編集/i });
      await user.click(editButton);

      expect(mockPush).toHaveBeenCalledWith('/protect/knowledge/edit/1');
    });
  });

  describe('未ログインユーザーの場合', () => {
    test('「ログインして編集」リンクが表示される', () => {
      mockUseAuth.mockReturnValue({ user: undefined });
      
      render(
        <KnowledgeView 
          knowledge={mockKnowledge} 
        />
      );

      const editLink = screen.getByRole('link', { name: /ログインして編集/i });
      expect(editLink).toBeInTheDocument();
      expect(editLink).toHaveAttribute('href', '/protect/knowledge/view_edit/1');
      expect(editLink).toHaveClass('btn_edit');
    });
  });

  describe('共同編集者の場合', () => {
    const mockEditor = { userId: 200, userName: '編集者' };

    test('共同編集者は編集可能', () => {
      mockUseAuth.mockReturnValue({ user: mockEditor });
      
      render(
        <KnowledgeView 
          knowledge={{ 
            ...mockKnowledge, 
            editable: true,
            editors: [{ userId: 200, userName: '編集者' }]
          }} 
        />
      );

      const editButton = screen.getByRole('button', { name: /投稿を編集/i });
      expect(editButton).toBeInTheDocument();
      expect(editButton).not.toBeDisabled();
    });
  });
});