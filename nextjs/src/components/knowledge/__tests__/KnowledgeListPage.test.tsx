/**
 * ナレッジ一覧ページテスト
 * 
 * @description 旧システムのopen/knowledge/list.jspとの互換性テストを含む
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { KnowledgeListPage } from '../KnowledgeListPage';
import { useRouter, useSearchParams } from 'next/navigation';
import '@testing-library/jest-dom';

// モックの設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('../../../lib/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({ user: null, isAuthenticated: false })),
}));

jest.mock('../../../lib/hooks/useLocale', () => ({
  useLocale: jest.fn(() => ({ locale: 'ja', label: (key: string) => key })),
}));

describe('KnowledgeListPage', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    pathname: '/open/knowledge/list',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
  });

  describe('基本レンダリング', () => {
    test('ナレッジ一覧ページが表示される', () => {
      render(<KnowledgeListPage />);
      
      // タブが表示される
      expect(screen.getByText('knowledge.list.kind.list')).toBeInTheDocument();
      expect(screen.getByText('knowledge.list.kind.popular')).toBeInTheDocument();
      expect(screen.getByText('knowledge.list.kind.history')).toBeInTheDocument();
    });

    test('ログイン時はストックタブが表示される', () => {
      const { useAuth } = require('../../../lib/hooks/useAuth');
      useAuth.mockReturnValue({ user: { userId: 1 }, isAuthenticated: true });
      
      render(<KnowledgeListPage />);
      
      expect(screen.getByText('knowledge.list.kind.stock')).toBeInTheDocument();
    });
  });

  describe('ページレイアウト', () => {
    test('旧システムと同じCSS構造を維持', () => {
      render(<KnowledgeListPage />);
      
      const container = screen.getByTestId('knowledge-list-container');
      expect(container).toHaveClass('knowledge_list');
    });

    test('ページネーションが表示される', () => {
      render(<KnowledgeListPage />);
      
      expect(screen.getByText('label.previous')).toBeInTheDocument();
      expect(screen.getByText('label.next')).toBeInTheDocument();
    });

    test('フィルタトグルが表示される', () => {
      render(<KnowledgeListPage />);
      
      expect(screen.getByText('Filter')).toBeInTheDocument();
    });
  });

  describe('初期データ渡し', () => {
    test('初期データがある場合はナレッジが表示される', () => {
      const initialData = {
        knowledges: [
          {
            knowledgeId: 1,
            title: 'テストナレッジ',
            content: 'テストコンテンツ',
            insertUser: 1,
            insertUserName: 'テストユーザー',
            insertDatetime: '2025-01-01T00:00:00Z',
            updateUser: 1,
            updateUserName: 'テストユーザー',
            updateDatetime: '2025-01-01T00:00:00Z',
            publicFlag: 1,
            likeCount: 5,
            commentCount: 3,
            point: 10,
            typeId: 1,
          },
        ],
        total: 1,
        offset: 0,
        limit: 50,
        tags: [],
        groups: [],
        templates: {},
      };
      
      render(<KnowledgeListPage initialData={initialData} />);
      
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('テストナレッジ')).toBeInTheDocument();
    });

    test('初期データが空の場合は空メッセージが表示される', () => {
      const initialData = {
        knowledges: [],
        total: 0,
        offset: 0,
        limit: 50,
        tags: [],
        groups: [],
        templates: {},
      };
      
      render(<KnowledgeListPage initialData={initialData} />);
      
      expect(screen.getByText('knowledge.list.empty')).toBeInTheDocument();
    });
  });

  describe('サイドバー基本構造', () => {
    test('サイドバー領域が存在する', () => {
      render(<KnowledgeListPage />);
      
      // サイドバーのdiv要素を確認
      const sidebar = screen.getByTestId('knowledge-list-container').querySelector('.col-sm-12.col-md-4');
      expect(sidebar).toBeInTheDocument();
    });
  });
});