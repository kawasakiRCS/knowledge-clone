/**
 * ナレッジ関連型定義のテスト
 * 
 * @description knowledge.tsの型定義と定数のテスト
 */
import { describe, test, expect } from '@jest/globals';
import type {
  Knowledge,
  StockKnowledge,
  Tag,
  Group,
  User,
  Stock,
  TargetLabel,
  TemplateType,
  KnowledgeListResponse,
  KnowledgeListParams,
} from '../knowledge';
import {
  PUBLIC_FLAG,
  KEYWORD_SORT_TYPE,
  EVENT_STATUS,
  PAGE_LIMIT,
} from '../knowledge';

describe('Knowledge Types', () => {
  describe('Knowledge interface', () => {
    test('必須項目を含むKnowledge型が正しく定義されている', () => {
      const knowledge: Knowledge = {
        knowledgeId: 1,
        title: 'テストナレッジ',
        content: 'テスト内容',
        insertUser: 1,
        insertUserName: 'テストユーザー',
        insertDatetime: '2024-01-01T00:00:00Z',
        updateUser: 1,
        updateUserName: 'テストユーザー',
        updateDatetime: '2024-01-01T00:00:00Z',
        publicFlag: 1,
        likeCount: 10,
        commentCount: 5,
        point: 100,
        typeId: 1,
      };

      expect(knowledge.knowledgeId).toBe(1);
      expect(knowledge.title).toBe('テストナレッジ');
      expect(knowledge.publicFlag).toBe(1);
    });

    test('オプション項目を含むKnowledge型が正しく定義されている', () => {
      const knowledge: Knowledge = {
        knowledgeId: 1,
        title: 'テストナレッジ',
        content: 'テスト内容',
        insertUser: 1,
        insertUserName: 'テストユーザー',
        insertDatetime: '2024-01-01T00:00:00Z',
        updateUser: 1,
        updateUserName: 'テストユーザー',
        updateDatetime: '2024-01-01T00:00:00Z',
        publicFlag: 1,
        likeCount: 10,
        commentCount: 5,
        point: 100,
        pointOnTerm: 50,
        typeId: 1,
        tagNames: 'tag1,tag2',
        tagIds: '1,2',
        pin: true,
        stocks: [],
        targets: [],
        startDateTime: '2024-01-01T10:00:00Z',
        viewed: true,
      };

      expect(knowledge.pointOnTerm).toBe(50);
      expect(knowledge.pin).toBe(true);
      expect(knowledge.viewed).toBe(true);
      expect(knowledge.tagNames).toBe('tag1,tag2');
    });
  });

  describe('StockKnowledge interface', () => {
    test('StockKnowledge型が正しく定義されている', () => {
      const stockKnowledge: StockKnowledge = {
        knowledgeId: 1,
        title: 'ストックナレッジ',
        content: '内容',
        insertUser: 1,
        insertUserName: 'ユーザー',
        insertDatetime: '2024-01-01T00:00:00Z',
        updateUser: 1,
        updateUserName: 'ユーザー',
        updateDatetime: '2024-01-01T00:00:00Z',
        publicFlag: 1,
        likeCount: 0,
        commentCount: 0,
        point: 0,
        typeId: 2,
        viewed: true,
        participations: {
          count: 10,
          limit: 20,
          status: 1,
        },
      };

      expect(stockKnowledge.viewed).toBe(true);
      expect(stockKnowledge.participations?.count).toBe(10);
      expect(stockKnowledge.participations?.limit).toBe(20);
    });
  });

  describe('Support interfaces', () => {
    test('Tag型が正しく定義されている', () => {
      const tag: Tag = {
        tagId: 1,
        tagName: 'JavaScript',
        knowledgeCount: 50,
      };

      expect(tag.tagId).toBe(1);
      expect(tag.tagName).toBe('JavaScript');
      expect(tag.knowledgeCount).toBe(50);
    });

    test('Group型が正しく定義されている', () => {
      const group: Group = {
        groupId: 1,
        groupName: '開発チーム',
        groupKnowledgeCount: 100,
      };

      expect(group.groupId).toBe(1);
      expect(group.groupName).toBe('開発チーム');
    });

    test('TemplateType型が正しく定義されている', () => {
      const template: TemplateType = {
        typeId: 1,
        typeName: 'ナレッジ',
        typeIcon: 'fa-file-text',
      };

      expect(template.typeId).toBe(1);
      expect(template.typeName).toBe('ナレッジ');
      expect(template.typeIcon).toBe('fa-file-text');
    });
  });

  describe('KnowledgeListResponse interface', () => {
    test('完全なKnowledgeListResponse型が正しく定義されている', () => {
      const response: KnowledgeListResponse = {
        knowledges: [],
        total: 100,
        offset: 0,
        limit: 50,
        tags: [{ tagId: 1, tagName: 'tag1' }],
        groups: [{ groupId: 1, groupName: 'group1' }],
        selectedTag: { tagId: 1, tagName: 'tag1' },
        selectedGroup: { groupId: 1, groupName: 'group1' },
        selectedUser: { userId: 1, userName: 'user1' },
        selectedTags: [],
        selectedGroups: [],
        creators: [],
        templates: {
          1: { typeId: 1, typeName: 'ナレッジ', typeIcon: 'fa-file-text' },
        },
        selectedTemplates: [],
        targets: {
          1: [{ label: 'ラベル', value: '値' }],
        },
      };

      expect(response.total).toBe(100);
      expect(response.limit).toBe(50);
      expect(response.tags?.length).toBe(1);
      expect(response.templates?.[1].typeName).toBe('ナレッジ');
    });
  });

  describe('KnowledgeListParams interface', () => {
    test('KnowledgeListParams型が正しく定義されている', () => {
      const params: KnowledgeListParams = {
        offset: 0,
        limit: 50,
        keyword: '検索キーワード',
        tag: 'JavaScript',
        group: '開発チーム',
        user: 'testuser',
        tagNames: 'tag1,tag2',
        groupNames: 'group1,group2',
        creators: 'user1,user2',
        template: ['1', '2'],
        stockid: '123',
        keywordSortType: 1,
      };

      expect(params.offset).toBe(0);
      expect(params.limit).toBe(50);
      expect(params.keyword).toBe('検索キーワード');
      expect(params.template).toEqual(['1', '2']);
      expect(params.keywordSortType).toBe(1);
    });
  });

  describe('Constants', () => {
    test('PUBLIC_FLAG定数が正しく定義されている', () => {
      expect(PUBLIC_FLAG.PUBLIC).toBe(1);
      expect(PUBLIC_FLAG.PRIVATE).toBe(2);
      expect(PUBLIC_FLAG.PROTECT).toBe(3);
    });

    test('KEYWORD_SORT_TYPE定数が正しく定義されている', () => {
      expect(KEYWORD_SORT_TYPE.SCORE).toBe(1);
      expect(KEYWORD_SORT_TYPE.TIME).toBe(2);
    });

    test('EVENT_STATUS定数が正しく定義されている', () => {
      expect(EVENT_STATUS.PARTICIPATION).toBe(1);
      expect(EVENT_STATUS.WAIT_CANCEL).toBe(2);
    });

    test('PAGE_LIMIT定数が正しく定義されている', () => {
      expect(PAGE_LIMIT).toBe(50);
    });

    test('定数がreadonlyである', () => {
      // TypeScriptのconstアサーションにより、これらは読み取り専用
      const publicFlag: typeof PUBLIC_FLAG = PUBLIC_FLAG;
      const keywordSort: typeof KEYWORD_SORT_TYPE = KEYWORD_SORT_TYPE;
      const eventStatus: typeof EVENT_STATUS = EVENT_STATUS;

      expect(publicFlag).toBe(PUBLIC_FLAG);
      expect(keywordSort).toBe(KEYWORD_SORT_TYPE);
      expect(eventStatus).toBe(EVENT_STATUS);
    });
  });
});