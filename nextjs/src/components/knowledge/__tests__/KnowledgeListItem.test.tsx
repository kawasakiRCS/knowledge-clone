/**
 * ナレッジリストアイテムコンポーネントテスト
 * 
 * @description 一覧画面で使用する個別のナレッジ表示コンポーネントのテスト
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import KnowledgeListItem from '../KnowledgeListItem';
import { StockKnowledge } from '@/types/knowledge';

// モック設定
jest.mock('next/link', () => {
  return ({ children, href, className }: any) => {
    return <a href={href} className={className}>{children}</a>;
  };
});

jest.mock('next/image', () => {
  return ({ src, alt, width, height, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} width={width} height={height} {...props} />;
  };
});

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string, ...args: any[]) => {
      const translations: Record<string, string> = {
        'label.unread': '未読',
        'knowledge.view.info.insert': '登録者: %s 登録日時: %s',
        'knowledge.view.info.update': '更新者: %s 更新日時: %s',
        'knowledge.list.event.datetime': 'イベント日時',
        'knowledge.view.label.status.participation': '参加',
        'knowledge.view.label.status.wait.cansel': 'キャンセル待ち'
      };
      let result = translations[key] || key;
      args.forEach((arg: string, index: number) => {
        result = result.replace(`%s`, arg);
      });
      return result;
    }
  })
}));

jest.mock('@/lib/utils', () => ({
  formatDate: (date: string) => {
    return new Date(date).toLocaleDateString('ja-JP');
  }
}));

describe('KnowledgeListItem', () => {
  const mockKnowledge: StockKnowledge = {
    knowledgeId: 1,
    title: 'テストナレッジ',
    content: 'テスト内容',
    publicFlag: 1,
    insertUser: 1,
    insertUserName: 'テストユーザー1',
    insertDatetime: '2024-01-01T10:00:00Z',
    updateUser: 2,
    updateUserName: 'テストユーザー2',
    updateDatetime: '2024-01-02T15:00:00Z',
    likeCount: 10,
    commentCount: 5,
    pin: false,
    startDateTime: null,
    participations: null,
    point: undefined,
    deleteFlag: 0,
    fulltextSearch: '',
    attachFileList: [],
    commentList: [],
    tagList: [],
    likeUsers: [],
    stockUsers: [],
    viewHistoriesEntity: []
  };

  describe('基本レンダリング', () => {
    test('ナレッジ情報が正しく表示される', () => {
      render(<KnowledgeListItem knowledge={mockKnowledge} />);

      // タイトルとID
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('テストナレッジ')).toBeInTheDocument();
      
      // 登録者情報
      expect(screen.getByText(/テストユーザー1/)).toBeInTheDocument();
      expect(screen.getByText(/2024\/1\/1/)).toBeInTheDocument();
      
      // 更新者情報
      expect(screen.getByText(/テストユーザー2/)).toBeInTheDocument();
      expect(screen.getByText(/2024\/1\/3/)).toBeInTheDocument();
      
      // いいねとコメント数
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    test('リンクが正しく設定される', () => {
      render(<KnowledgeListItem knowledge={mockKnowledge} />);

      const titleLink = screen.getByRole('link', { name: /#1 テストナレッジ/ });
      expect(titleLink).toHaveAttribute('href', '/open/knowledge/view/1');
    });

    test('アイコン画像が表示される', () => {
      render(<KnowledgeListItem knowledge={mockKnowledge} />);

      const icons = screen.getAllByAltText('icon');
      expect(icons).toHaveLength(2); // 登録者と更新者のアイコン
      expect(icons[0]).toHaveAttribute('data-echo', '/open/account/icon/1');
      expect(icons[1]).toHaveAttribute('data-echo', '/open/account/icon/2');
    });
  });

  describe('未読表示', () => {
    test('未読フラグがtrueの場合、未読ラベルが表示される', () => {
      render(<KnowledgeListItem knowledge={mockKnowledge} showUnread={true} />);

      // 正確なテキストコンテンツを検索
      expect(screen.getByText(/\[未読\]/)).toBeInTheDocument();
      
      const container = screen.getByText('#1').closest('.knowledge_item');
      expect(container).toHaveClass('unread');
    });

    test('未読フラグがfalseの場合、未読ラベルが表示されない', () => {
      render(<KnowledgeListItem knowledge={mockKnowledge} showUnread={false} />);

      expect(screen.queryByText('[未読]')).not.toBeInTheDocument();
      
      const container = screen.getByText('#1').closest('.knowledge_item');
      expect(container).not.toHaveClass('unread');
    });
  });

  describe('ピン表示', () => {
    test('ピンフラグがtrueの場合、ピンアイコンが表示される', () => {
      const pinnedKnowledge = { ...mockKnowledge, pin: true };
      render(<KnowledgeListItem knowledge={pinnedKnowledge} />);

      // fa-bullhornクラスを持つ要素が存在することを確認
      const pinIcon = document.querySelector('.fa-bullhorn');
      expect(pinIcon).toBeInTheDocument();
    });

    test('ピンフラグがfalseの場合、ピンアイコンが表示されない', () => {
      render(<KnowledgeListItem knowledge={mockKnowledge} />);

      // fa-bullhornクラスを持つ要素が存在しないことを確認
      const pinIcon = document.querySelector('.fa-bullhorn');
      expect(pinIcon).not.toBeInTheDocument();
    });
  });

  describe('イベント情報', () => {
    test('イベント日時が設定されている場合、表示される', () => {
      const eventKnowledge = {
        ...mockKnowledge,
        startDateTime: '2024-02-01 14:00',
        participations: {
          count: 5,
          limit: 10,
          status: 1
        }
      };
      render(<KnowledgeListItem knowledge={eventKnowledge} />);

      expect(screen.getByText(/イベント日時/)).toBeInTheDocument();
      expect(screen.getByText(/2024-02-01 14:00/)).toBeInTheDocument();
      expect(screen.getByText(/5 \/ 10/)).toBeInTheDocument();
      expect(screen.getByText('参加')).toBeInTheDocument();
    });

    test('イベント日時が設定されていない場合、表示されない', () => {
      render(<KnowledgeListItem knowledge={mockKnowledge} />);

      expect(screen.queryByText(/イベント日時/)).not.toBeInTheDocument();
    });

    test('キャンセル待ちステータスが正しく表示される', () => {
      const eventKnowledge = {
        ...mockKnowledge,
        startDateTime: '2024-02-01 14:00',
        participations: {
          count: 10,
          limit: 10,
          status: 2
        }
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
          { tagId: 2, tagName: 'React' }
        ]
      };
      render(<KnowledgeListItem knowledge={knowledgeWithTags as any} />);

      const jsTag = screen.getByRole('link', { name: 'JavaScript' });
      expect(jsTag).toHaveAttribute('href', '/open/knowledge/list?tag=1');
      
      const reactTag = screen.getByRole('link', { name: 'React' });
      expect(reactTag).toHaveAttribute('href', '/open/knowledge/list?tag=2');
    });

    test('タグがない場合、タグエリアは空になる', () => {
      render(<KnowledgeListItem knowledge={mockKnowledge} />);

      const tagsContainer = screen.getByText('#1').closest('.knowledge_item')?.querySelector('.tags');
      expect(tagsContainer).toBeEmptyDOMElement();
    });
  });

  describe('ポイント表示', () => {
    test('ポイントが設定されている場合、表示される', () => {
      const knowledgeWithPoint = { ...mockKnowledge, point: 100 };
      render(<KnowledgeListItem knowledge={knowledgeWithPoint} />);

      expect(screen.getByText('100')).toBeInTheDocument();
      
      // fa-star-oクラスを持つ要素が存在することを確認
      const pointIcon = document.querySelector('.fa-star-o');
      expect(pointIcon).toBeInTheDocument();
    });

    test('ポイントが未定義の場合、表示されない', () => {
      render(<KnowledgeListItem knowledge={mockKnowledge} />);

      // fa-star-oクラスを持つ要素が存在しないことを確認
      const starIcon = document.querySelector('.fa-star-o');
      expect(starIcon).not.toBeInTheDocument();
    });
  });

  describe('パラメータサポート', () => {
    test('paramsが渡された場合、リンクに追加される', () => {
      render(<KnowledgeListItem knowledge={mockKnowledge} params="?tag=1" />);

      const titleLink = screen.getByRole('link', { name: /#1 テストナレッジ/ });
      expect(titleLink).toHaveAttribute('href', '/open/knowledge/view/1?tag=1');
    });
  });

  describe('更新情報の表示制御', () => {
    test('登録日時と更新日時が同じ場合、更新情報は表示されない', () => {
      const sameTimeKnowledge = {
        ...mockKnowledge,
        updateDatetime: mockKnowledge.insertDatetime
      };
      render(<KnowledgeListItem knowledge={sameTimeKnowledge} />);

      expect(screen.queryByText(/テストユーザー2/)).not.toBeInTheDocument();
    });
  });

  describe('エッジケース', () => {
    test('必須フィールドのみでレンダリングできる', () => {
      const minimalKnowledge: StockKnowledge = {
        knowledgeId: 999,
        title: '最小限のナレッジ',
        content: '',
        publicFlag: 1,
        insertUser: 1,
        insertUserName: 'ユーザー',
        insertDatetime: '2024-01-01T00:00:00Z',
        updateUser: 1,
        updateUserName: 'ユーザー',
        updateDatetime: '2024-01-01T00:00:00Z',
        likeCount: 0,
        commentCount: 0,
        pin: false,
        startDateTime: null,
        participations: null,
        deleteFlag: 0,
        fulltextSearch: '',
        attachFileList: [],
        commentList: [],
        tagList: [],
        likeUsers: [],
        stockUsers: [],
        viewHistoriesEntity: []
      };

      render(<KnowledgeListItem knowledge={minimalKnowledge} />);

      expect(screen.getByText('#999')).toBeInTheDocument();
      expect(screen.getByText('最小限のナレッジ')).toBeInTheDocument();
    });
  });
});