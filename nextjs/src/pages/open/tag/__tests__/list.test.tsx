/**
 * タグ一覧ページテスト
 * 
 * @description 旧システムとの互換性テストを含む
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import TagListPage from '../list';

// Next.js Router のモック
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// useLocale フックのモック
jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => {
      const labels: { [key: string]: string } = {
        'knowledge.tags.title': 'タグ一覧',
        'label.previous': '前',
        'label.next': '次',
      };
      return labels[key] || key;
    },
  }),
}));

// MainLayout のモック
jest.mock('@/components/layout/MainLayout', () => {
  return function MockMainLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="main-layout">{children}</div>;
  };
});

// fetch のモック
global.fetch = jest.fn();

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  pathname: '/open/tag/list',
  query: {},
  asPath: '/open/tag/list',
};

describe('TagListPage', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  describe('基本レンダリング', () => {
    test('タイトルが表示される', async () => {
      const mockTags = [
        { tagId: 1, tagName: 'JavaScript', knowledgeCount: 10 },
        { tagId: 2, tagName: 'TypeScript', knowledgeCount: 5 },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tags: mockTags, total: 2 }),
      });

      render(<TagListPage />);

      expect(screen.getByText('タグ一覧')).toBeInTheDocument();
    });

    test('ページネーションが表示される', async () => {
      const mockTags = [
        { tagId: 1, tagName: 'JavaScript', knowledgeCount: 10 },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tags: mockTags, total: 1 }),
      });

      render(<TagListPage />);

      await waitFor(() => {
        expect(screen.getAllByText('前')).toHaveLength(2);
        expect(screen.getAllByText('次')).toHaveLength(2);
      });
    });
  });

  describe('タグ一覧表示', () => {
    test('タグが正しく表示される', async () => {
      const mockTags = [
        { tagId: 1, tagName: 'JavaScript', knowledgeCount: 10 },
        { tagId: 2, tagName: 'TypeScript', knowledgeCount: 5 },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tags: mockTags, total: 2 }),
      });

      render(<TagListPage />);

      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
      });
    });

    test('ナレッジ数バッジが表示される', async () => {
      const mockTags = [
        { tagId: 1, tagName: 'JavaScript', knowledgeCount: 10 },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tags: mockTags, total: 1 }),
      });

      render(<TagListPage />);

      await waitFor(() => {
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('10')).toHaveClass('badge');
      });
    });

    test('タグアイコン（fa-tag）が表示される', async () => {
      const mockTags = [
        { tagId: 1, tagName: 'JavaScript', knowledgeCount: 10 },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tags: mockTags, total: 1 }),
      });

      render(<TagListPage />);

      await waitFor(() => {
        const tagIcon = document.querySelector('i.fa.fa-tag');
        expect(tagIcon).toBeInTheDocument();
      });
    });
  });

  describe('空の状態', () => {
    test('タグが空の場合にEmptyメッセージが表示される', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tags: [], total: 0 }),
      });

      render(<TagListPage />);

      await waitFor(() => {
        expect(screen.getByText('Empty')).toBeInTheDocument();
      });
    });
  });

  describe('リンク機能', () => {
    test('タグクリックでナレッジ一覧に遷移する', async () => {
      const mockTags = [
        { tagId: 1, tagName: 'JavaScript', knowledgeCount: 10 },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tags: mockTags, total: 1 }),
      });

      render(<TagListPage />);

      await waitFor(() => {
        const tagLink = screen.getByRole('link', { name: /JavaScript/ });
        expect(tagLink).toHaveAttribute('href', '/open/knowledge/list?tag=1');
      });
    });
  });

  describe('ページネーション機能', () => {
    test('ページネーションリンクが正しく設定される', async () => {
      const mockTags = [
        { tagId: 1, tagName: 'JavaScript', knowledgeCount: 10 },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tags: mockTags, total: 1, previous: 0, next: 2 }),
      });

      render(<TagListPage />);

      await waitFor(() => {
        const previousLinks = screen.getAllByRole('link', { name: /前/ });
        const nextLinks = screen.getAllByRole('link', { name: /次/ });
        
        expect(previousLinks[0]).toHaveAttribute('href', '/open/tag/list/0');
        expect(nextLinks[0]).toHaveAttribute('href', '/open/tag/list/2');
      });
    });
  });

  describe('旧システム互換性', () => {
    test('list-groupクラス構造が同等', async () => {
      const mockTags = [
        { tagId: 1, tagName: 'JavaScript', knowledgeCount: 10 },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tags: mockTags, total: 1 }),
      });

      render(<TagListPage />);

      await waitFor(() => {
        expect(document.querySelector('.list-group')).toBeInTheDocument();
        expect(document.querySelector('.list-group-item')).toBeInTheDocument();
      });
    });

    test('pagerクラス構造が同等', async () => {
      const mockTags = [
        { tagId: 1, tagName: 'JavaScript', knowledgeCount: 10 },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tags: mockTags, total: 1 }),
      });

      render(<TagListPage />);

      await waitFor(() => {
        expect(document.querySelector('nav')).toBeInTheDocument();
        expect(document.querySelector('.pager')).toBeInTheDocument();
        expect(document.querySelector('.previous')).toBeInTheDocument();
        expect(document.querySelector('.next')).toBeInTheDocument();
      });
    });

    test('h4.titleクラスが使用される', async () => {
      const mockTags = [
        { tagId: 1, tagName: 'JavaScript', knowledgeCount: 10 },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tags: mockTags, total: 1 }),
      });

      render(<TagListPage />);

      await waitFor(() => {
        const title = screen.getByText('タグ一覧');
        expect(title.tagName).toBe('H4');
        expect(title).toHaveClass('title');
      });
    });
  });

  describe('エラーハンドリング', () => {
    test('API エラー時の処理', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      render(<TagListPage />);

      await waitFor(() => {
        expect(screen.getByText('Empty')).toBeInTheDocument();
      });
    });
  });
});