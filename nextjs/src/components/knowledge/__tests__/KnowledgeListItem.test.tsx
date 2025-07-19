/**
 * KnowledgeListItemコンポーネントテスト
 * 
 * @description ナレッジリストアイテムの表示と動作をテスト
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import KnowledgeListItem from '../KnowledgeListItem';
import { StockKnowledge } from '@/types/knowledge';

// Mock Next.js modules
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

jest.mock('next/image', () => {
  return ({ src, alt, width, height, ...props }: any) => (
    <img src={src} alt={alt} width={width} height={height} {...props} />
  );
});

// Mock hooks
jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string, ...args: any[]) => {
      const translations: { [key: string]: string } = {
        'label.unread': '未読',
        'knowledge.view.info.insert': '投稿者: %s 投稿日時: %s',
        'knowledge.view.info.update': '更新者: %s 更新日時: %s',
        'knowledge.list.event.datetime': 'イベント日時',
        'knowledge.view.label.status.participation': '参加',
        'knowledge.view.label.status.wait.cansel': 'キャンセル待ち',
      };
      
      let result = translations[key] || key;
      if (args.length > 0) {
        args.forEach((arg: string, index: number) => {
          result = result.replace(`%s`, arg);
        });
      }
      return result;
    },
  }),
}));

// Mock utils
jest.mock('@/lib/utils', () => ({
  formatDate: (date: string) => `${date} (formatted)`,
}));

// Mock window.echo
global.echo = {
  init: jest.fn(),
};

describe('KnowledgeListItem', () => {
  const mockKnowledge: StockKnowledge = {
    knowledgeId: 123,
    title: 'テストナレッジ',
    content: 'テスト内容',
    typeId: 1,
    publicFlag: 1,
    likeCount: 10,
    commentCount: 5,
    point: 15,
    insertUser: 1,
    insertUserName: 'テスト太郎',
    insertDatetime: '2025-01-01 10:00:00',
    updateUser: 2,
    updateUserName: '更新花子',
    updateDatetime: '2025-01-02 11:00:00',
    deleteFlag: 0,
    templateId: null,
    pin: false,
    viewerCounts: { total: 0, views: 0 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本レンダリング', () => {
    test('ナレッジ情報が正しく表示される', () => {
      render(<KnowledgeListItem knowledge={mockKnowledge} />);

      // タイトルとID
      expect(screen.getByText('#123')).toBeInTheDocument();
      expect(screen.getByText('テストナレッジ')).toBeInTheDocument();

      // 投稿者情報（HTMLがレンダリングされるため、個別の要素をテスト）
      expect(screen.getByText('テスト太郎')).toBeInTheDocument();
      expect(screen.getByText(/投稿日時: 2025-01-01 10:00:00/)).toBeInTheDocument();

      // 更新者情報
      expect(screen.getByText('更新花子')).toBeInTheDocument();
      expect(screen.getByText(/更新日時: 2025-01-02 11:00:00/)).toBeInTheDocument();

      // いいね、コメント、ポイント数
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    test('リンクが正しいURLを持つ', () => {
      render(<KnowledgeListItem knowledge={mockKnowledge} />);

      const titleLink = screen.getByRole('link', { name: /#123.*テストナレッジ/ });
      expect(titleLink).toHaveAttribute('href', '/open/knowledge/view/123');
    });

    test('アイコン画像が正しく設定される', () => {
      render(<KnowledgeListItem knowledge={mockKnowledge} />);

      const icons = screen.getAllByAltText('icon');
      expect(icons[0]).toHaveAttribute('data-echo', '/open/account/icon/1');
      expect(icons[1]).toHaveAttribute('data-echo', '/open/account/icon/2');
    });
  });

  describe('条件付き表示', () => {
    test('未読フラグが設定されると未読表示される', () => {
      const { container } = render(<KnowledgeListItem knowledge={mockKnowledge} showUnread={true} />);

      expect(container.querySelector('.knowledge_item')).toHaveClass('unread');
      expect(screen.getByText(/\[未読\]/)).toBeInTheDocument();
    });

    test('ピン留めされている場合にバッジが表示される', () => {
      const pinnedKnowledge = { ...mockKnowledge, pin: true };
      render(<KnowledgeListItem knowledge={pinnedKnowledge} />);

      const badge = screen.getByText((content, element) => {
        return element?.tagName === 'SPAN' && element?.classList.contains('badge');
      });
      expect(badge).toBeInTheDocument();
    });

    test('更新日時が投稿日時と同じ場合は更新情報が表示されない', () => {
      const sameTimeKnowledge = {
        ...mockKnowledge,
        updateDatetime: mockKnowledge.insertDatetime,
      };
      render(<KnowledgeListItem knowledge={sameTimeKnowledge} />);

      expect(screen.queryByText(/更新者/)).not.toBeInTheDocument();
    });

    test('ポイントが未定義の場合は表示されない', () => {
      const noPointKnowledge = { ...mockKnowledge, point: undefined };
      render(<KnowledgeListItem knowledge={noPointKnowledge} />);

      const pointIcon = screen.queryByText((content, element) => {
        return element?.querySelector('.fa-star-o') !== null;
      });
      expect(pointIcon).not.toBeInTheDocument();
    });
  });

  describe('イベント情報', () => {
    test('イベント日時が設定されている場合に表示される', () => {
      const eventKnowledge = {
        ...mockKnowledge,
        startDateTime: '2025-02-01 14:00:00',
      };
      render(<KnowledgeListItem knowledge={eventKnowledge} />);

      expect(screen.getByText(/イベント日時.*2025-02-01 14:00:00/)).toBeInTheDocument();
    });

    test('参加者情報が表示される', () => {
      const eventKnowledge = {
        ...mockKnowledge,
        startDateTime: '2025-02-01 14:00:00',
        participations: {
          count: 10,
          limit: 20,
          status: 1,
        },
      };
      render(<KnowledgeListItem knowledge={eventKnowledge} />);

      // 参加者数が表示される
      expect(screen.getByText(/10 \/ 20/)).toBeInTheDocument();
      expect(screen.getByText('参加')).toBeInTheDocument();
    });

    test('キャンセル待ちステータスが表示される', () => {
      const eventKnowledge = {
        ...mockKnowledge,
        startDateTime: '2025-02-01 14:00:00',
        participations: {
          count: 20,
          limit: 20,
          status: 0,
        },
      };
      render(<KnowledgeListItem knowledge={eventKnowledge} />);

      expect(screen.getByText('キャンセル待ち')).toBeInTheDocument();
    });
  });

  describe('タグ表示', () => {
    test('タグが正しく表示される', () => {
      const knowledgeWithTags = {
        ...mockKnowledge,
        tags: [
          { tagId: 1, tagName: 'JavaScript' },
          { tagId: 2, tagName: 'React' },
        ],
      };
      render(<KnowledgeListItem knowledge={knowledgeWithTags} />);

      const jsTag = screen.getByRole('link', { name: 'JavaScript' });
      expect(jsTag).toHaveAttribute('href', '/open/knowledge/list?tag=1');

      const reactTag = screen.getByRole('link', { name: 'React' });
      expect(reactTag).toHaveAttribute('href', '/open/knowledge/list?tag=2');
    });

    test('タグがない場合は何も表示されない', () => {
      render(<KnowledgeListItem knowledge={mockKnowledge} />);

      const tagsContainer = screen.getByText((content, element) => {
        return element?.classList.contains('tags') || false;
      });
      expect(tagsContainer).toBeEmptyDOMElement();
    });
  });

  describe('パラメータサポート', () => {
    test('paramsが指定されるとリンクに追加される', () => {
      render(<KnowledgeListItem knowledge={mockKnowledge} params="?offset=10" />);

      const titleLink = screen.getByRole('link', { name: /#123.*テストナレッジ/ });
      expect(titleLink).toHaveAttribute('href', '/open/knowledge/view/123?offset=10');
    });
  });

  describe('echo.js初期化', () => {
    test('コンポーネントマウント時にecho.initが呼ばれる', () => {
      render(<KnowledgeListItem knowledge={mockKnowledge} />);

      expect(global.echo.init).toHaveBeenCalledTimes(1);
    });
  });

  describe('CSS構造の互換性', () => {
    test('旧システムと同じCSS構造を持つ', () => {
      const { container } = render(<KnowledgeListItem knowledge={mockKnowledge} />);

      // メインコンテナ
      expect(container.querySelector('.knowledge_item')).toBeInTheDocument();

      // 情報セクション
      expect(container.querySelector('.insert_info')).toBeInTheDocument();
      expect(container.querySelector('.list-title')).toBeInTheDocument();
      expect(container.querySelector('.dispKnowledgeId')).toBeInTheDocument();

      // 表示情報セクション
      expect(container.querySelector('.show_info')).toBeInTheDocument();
      expect(container.querySelectorAll('.show_info_item')).toHaveLength(3);

      // アイコンクラス
      expect(container.querySelector('.fa-thumbs-o-up')).toBeInTheDocument();
      expect(container.querySelector('.fa-comment-o')).toBeInTheDocument();
      expect(container.querySelector('.fa-star-o')).toBeInTheDocument();
    });
  });
});