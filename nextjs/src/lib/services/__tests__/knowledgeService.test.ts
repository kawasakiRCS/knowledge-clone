/**
 * knowledgeServiceテスト
 * 
 * @description ナレッジサービスのビジネスロジックテスト
 */
import { knowledgeService } from '../knowledgeService';
import * as knowledgeRepository from '../../repositories/knowledgeRepository';
import { db } from '../../db';

// モック設定
jest.mock('../../repositories/knowledgeRepository');
jest.mock('../../db');

describe('knowledgeService', () => {
  const mockDb = db as jest.MockedObject<typeof db>;
  const mockRepository = knowledgeRepository as jest.MockedObject<typeof knowledgeRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchKnowledge', () => {
    const mockKnowledgeData = [
      {
        knowledgeId: 1,
        title: 'Test Knowledge',
        content: 'Test content',
        userName: 'testuser',
        publicFlag: 1,
        updateDate: '2024-01-15T10:00:00',
        viewCount: 10,
        likeCount: 5,
        commentCount: 3,
        typeId: 1,
        typeName: '技術メモ',
        tags: 'React,TypeScript',
      },
    ];

    test('検索条件でナレッジを検索できる', async () => {
      mockRepository.searchKnowledge.mockResolvedValue(mockKnowledgeData);
      mockRepository.formatKnowledgeData.mockReturnValue({
        knowledgeId: 1,
        title: 'Test Knowledge',
        content: 'Test content',
        userName: 'testuser',
        knowledgeType: { typeId: 1, typeName: '技術メモ' },
        publicFlag: 1,
        updateDate: '2024-01-15T10:00:00',
        viewCount: 10,
        likeCount: 5,
        commentCount: 3,
        userLike: 0,
        tagList: [
          { tagName: 'React', tagColorType: { colorCode: '#61DAFB' } },
          { tagName: 'TypeScript', tagColorType: { colorCode: '#3178C6' } },
        ],
      });

      const result = await knowledgeService.searchKnowledge(mockDb, {
        keyword: 'Test',
        userId: 'user1',
      });

      expect(mockRepository.searchKnowledge).toHaveBeenCalledWith(
        mockDb,
        { keyword: 'Test', userId: 'user1' }
      );
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Test Knowledge');
    });

    test('空の結果を処理できる', async () => {
      mockRepository.searchKnowledge.mockResolvedValue([]);

      const result = await knowledgeService.searchKnowledge(mockDb, {});

      expect(result).toEqual([]);
    });

    test('エラーをスローする', async () => {
      mockRepository.searchKnowledge.mockRejectedValue(new Error('DB Error'));

      await expect(
        knowledgeService.searchKnowledge(mockDb, {})
      ).rejects.toThrow('DB Error');
    });
  });

  describe('getKnowledge', () => {
    const mockKnowledgeDetail = {
      knowledgeId: 1,
      title: 'Test Knowledge',
      content: 'Test content',
      userName: 'testuser',
      publicFlag: 1,
      updateDate: '2024-01-15T10:00:00',
      viewCount: 10,
      likeCount: 5,
      commentCount: 3,
      typeId: 1,
      typeName: '技術メモ',
      tags: 'React,TypeScript',
      comments: [],
    };

    test('IDでナレッジを取得できる', async () => {
      mockRepository.getKnowledge.mockResolvedValue(mockKnowledgeDetail);
      mockRepository.formatKnowledgeData.mockReturnValue({
        knowledgeId: 1,
        title: 'Test Knowledge',
        content: 'Test content',
        userName: 'testuser',
        knowledgeType: { typeId: 1, typeName: '技術メモ' },
        publicFlag: 1,
        updateDate: '2024-01-15T10:00:00',
        viewCount: 10,
        likeCount: 5,
        commentCount: 3,
        userLike: 0,
        tagList: [
          { tagName: 'React', tagColorType: { colorCode: '#61DAFB' } },
          { tagName: 'TypeScript', tagColorType: { colorCode: '#3178C6' } },
        ],
      });

      const result = await knowledgeService.getKnowledge(mockDb, 1, 'user1');

      expect(mockRepository.getKnowledge).toHaveBeenCalledWith(mockDb, 1, 'user1');
      expect(result.knowledgeId).toBe(1);
      expect(result.tagList).toHaveLength(2);
    });

    test('存在しないIDの場合nullを返す', async () => {
      mockRepository.getKnowledge.mockResolvedValue(null);

      const result = await knowledgeService.getKnowledge(mockDb, 999, 'user1');

      expect(result).toBeNull();
    });
  });

  describe('createKnowledge', () => {
    const mockKnowledgeInput = {
      title: 'New Knowledge',
      content: 'New content',
      knowledgeType: 1,
      publicFlag: 1,
      tagList: ['React', 'TypeScript'],
      userId: 'user1',
    };

    test('新しいナレッジを作成できる', async () => {
      mockRepository.createKnowledge.mockResolvedValue(1);

      const result = await knowledgeService.createKnowledge(
        mockDb,
        mockKnowledgeInput
      );

      expect(mockRepository.createKnowledge).toHaveBeenCalledWith(
        mockDb,
        mockKnowledgeInput
      );
      expect(result).toBe(1);
    });

    test('必須フィールドがない場合エラーをスロー', async () => {
      const invalidInput = {
        content: 'Content only',
        userId: 'user1',
      };

      await expect(
        knowledgeService.createKnowledge(mockDb, invalidInput as any)
      ).rejects.toThrow();
    });
  });

  describe('updateKnowledge', () => {
    const mockUpdateData = {
      knowledgeId: 1,
      title: 'Updated Knowledge',
      content: 'Updated content',
      knowledgeType: 1,
      publicFlag: 1,
      tagList: ['React', 'Next.js'],
      userId: 'user1',
    };

    test('ナレッジを更新できる', async () => {
      mockRepository.updateKnowledge.mockResolvedValue(true);

      const result = await knowledgeService.updateKnowledge(
        mockDb,
        mockUpdateData
      );

      expect(mockRepository.updateKnowledge).toHaveBeenCalledWith(
        mockDb,
        mockUpdateData
      );
      expect(result).toBe(true);
    });

    test('権限がない場合falseを返す', async () => {
      mockRepository.updateKnowledge.mockResolvedValue(false);

      const result = await knowledgeService.updateKnowledge(
        mockDb,
        mockUpdateData
      );

      expect(result).toBe(false);
    });
  });

  describe('deleteKnowledge', () => {
    test('ナレッジを削除できる', async () => {
      mockRepository.deleteKnowledge.mockResolvedValue(true);

      const result = await knowledgeService.deleteKnowledge(
        mockDb,
        1,
        'user1'
      );

      expect(mockRepository.deleteKnowledge).toHaveBeenCalledWith(
        mockDb,
        1,
        'user1'
      );
      expect(result).toBe(true);
    });

    test('権限がない場合falseを返す', async () => {
      mockRepository.deleteKnowledge.mockResolvedValue(false);

      const result = await knowledgeService.deleteKnowledge(
        mockDb,
        1,
        'wronguser'
      );

      expect(result).toBe(false);
    });
  });

  describe('addLike', () => {
    test('いいねを追加できる', async () => {
      mockRepository.addLike.mockResolvedValue(true);

      const result = await knowledgeService.addLike(mockDb, 1, 'user1');

      expect(mockRepository.addLike).toHaveBeenCalledWith(mockDb, 1, 'user1');
      expect(result).toBe(true);
    });

    test('既にいいね済みの場合falseを返す', async () => {
      mockRepository.addLike.mockResolvedValue(false);

      const result = await knowledgeService.addLike(mockDb, 1, 'user1');

      expect(result).toBe(false);
    });
  });

  describe('removeLike', () => {
    test('いいねを削除できる', async () => {
      mockRepository.removeLike.mockResolvedValue(true);

      const result = await knowledgeService.removeLike(mockDb, 1, 'user1');

      expect(mockRepository.removeLike).toHaveBeenCalledWith(mockDb, 1, 'user1');
      expect(result).toBe(true);
    });

    test('いいねしていない場合falseを返す', async () => {
      mockRepository.removeLike.mockResolvedValue(false);

      const result = await knowledgeService.removeLike(mockDb, 1, 'user1');

      expect(result).toBe(false);
    });
  });

  describe('addComment', () => {
    test('コメントを追加できる', async () => {
      mockRepository.addComment.mockResolvedValue(1);

      const result = await knowledgeService.addComment(
        mockDb,
        1,
        'user1',
        'Great knowledge!'
      );

      expect(mockRepository.addComment).toHaveBeenCalledWith(
        mockDb,
        1,
        'user1',
        'Great knowledge!'
      );
      expect(result).toBe(1);
    });

    test('空のコメントはエラーをスロー', async () => {
      await expect(
        knowledgeService.addComment(mockDb, 1, 'user1', '')
      ).rejects.toThrow();
    });
  });

  describe('getKnowledgeHistory', () => {
    const mockHistory = [
      {
        historyId: 1,
        knowledgeId: 1,
        title: 'Test Knowledge v1',
        content: 'Test content v1',
        updateDate: '2024-01-15T10:00:00',
        userName: 'testuser',
      },
      {
        historyId: 2,
        knowledgeId: 1,
        title: 'Test Knowledge v2',
        content: 'Test content v2',
        updateDate: '2024-01-16T10:00:00',
        userName: 'testuser',
      },
    ];

    test('ナレッジの履歴を取得できる', async () => {
      mockRepository.getKnowledgeHistory.mockResolvedValue(mockHistory);

      const result = await knowledgeService.getKnowledgeHistory(mockDb, 1);

      expect(mockRepository.getKnowledgeHistory).toHaveBeenCalledWith(mockDb, 1);
      expect(result).toHaveLength(2);
      expect(result[0].historyId).toBe(1);
    });

    test('履歴がない場合空配列を返す', async () => {
      mockRepository.getKnowledgeHistory.mockResolvedValue([]);

      const result = await knowledgeService.getKnowledgeHistory(mockDb, 999);

      expect(result).toEqual([]);
    });
  });

  describe('incrementViewCount', () => {
    test('閲覧数を増やせる', async () => {
      mockRepository.incrementViewCount.mockResolvedValue(true);

      const result = await knowledgeService.incrementViewCount(mockDb, 1);

      expect(mockRepository.incrementViewCount).toHaveBeenCalledWith(mockDb, 1);
      expect(result).toBe(true);
    });
  });
});