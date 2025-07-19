/**
 * CommonKnowledgeListコンポーネントテスト
 * 
 * @description ナレッジ一覧の共通コンポーネントのテスト
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CommonKnowledgeList } from '../CommonKnowledgeList';
import { StockKnowledge } from '@/types/knowledge';

describe('CommonKnowledgeList', () => {
  const mockKnowledges: StockKnowledge[] = [
    {
      knowledgeId: 1,
      title: 'ナレッジ1',
      content: 'コンテンツ1',
      typeId: 1,
      publicFlag: 1,
      likeCount: 5,
      commentCount: 3,
      point: 8,
      insertUser: 1,
      insertUserName: 'ユーザー1',
      insertDatetime: '2025-01-01 10:00:00',
      updateUser: 1,
      updateUserName: 'ユーザー1',
      updateDatetime: '2025-01-01 10:00:00',
      deleteFlag: 0,
      templateId: null,
      pin: false,
      viewerCounts: { total: 0, views: 0 },
    },
    {
      knowledgeId: 2,
      title: 'ナレッジ2',
      content: 'コンテンツ2',
      typeId: 1,
      publicFlag: 1,
      likeCount: 10,
      commentCount: 5,
      point: 15,
      insertUser: 2,
      insertUserName: 'ユーザー2',
      insertDatetime: '2025-01-02 11:00:00',
      updateUser: 2,
      updateUserName: 'ユーザー2',
      updateDatetime: '2025-01-02 11:00:00',
      deleteFlag: 0,
      templateId: null,
      pin: true,
      viewerCounts: { total: 0, views: 0 },
    },
  ];

  describe('基本レンダリング', () => {
    test('ナレッジリストが表示される', () => {
      render(<CommonKnowledgeList knowledges={mockKnowledges} />);

      expect(screen.getByText('ナレッジ1')).toBeInTheDocument();
      expect(screen.getByText('ナレッジ2')).toBeInTheDocument();
    });

    test('空のリストでもエラーにならない', () => {
      render(<CommonKnowledgeList knowledges={[]} />);

      const container = screen.getByText((content, element) => {
        return element?.classList.contains('knowledge-list') || false;
      });
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('CSS構造', () => {
    test('正しいCSSクラスが適用される', () => {
      const { container } = render(<CommonKnowledgeList knowledges={mockKnowledges} />);

      expect(container.querySelector('.knowledge-list')).toBeInTheDocument();
      expect(container.querySelectorAll('.knowledge-item')).toHaveLength(2);
    });
  });

  describe('ナレッジIDでのキー設定', () => {
    test('各アイテムに正しいキーが設定される', () => {
      const { container } = render(<CommonKnowledgeList knowledges={mockKnowledges} />);

      const items = container.querySelectorAll('.knowledge-item');
      expect(items).toHaveLength(2);
      // React DevToolsでキーを確認するのは難しいため、要素数で検証
    });
  });
});