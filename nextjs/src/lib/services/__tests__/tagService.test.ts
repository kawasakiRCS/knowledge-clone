/**
 * tagServiceテスト
 * 
 * @description タグサービスのビジネスロジックテスト
 */
import { tagService } from '../tagService';
import { db } from '../../db';

// モック設定
jest.mock('../../db');

describe('tagService', () => {
  const mockDb = db as jest.MockedObject<typeof db>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchTags', () => {
    const mockTags = [
      { tagName: 'React', colorCode: '#61DAFB', usageCount: 25 },
      { tagName: 'TypeScript', colorCode: '#3178C6', usageCount: 20 },
      { tagName: 'Next.js', colorCode: '#000000', usageCount: 15 },
    ];

    test('キーワードでタグを検索できる', async () => {
      mockDb.query.mockResolvedValue({ rows: mockTags } as any);

      const result = await tagService.searchTags(mockDb, 'React');

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE LOWER(tag_name) LIKE LOWER'),
        ['%React%']
      );
      expect(result).toEqual([
        { 
          tagName: 'React', 
          tagColorType: { colorCode: '#61DAFB' },
          usageCount: 25 
        },
      ]);
    });

    test('すべてのタグを取得できる', async () => {
      mockDb.query.mockResolvedValue({ rows: mockTags } as any);

      const result = await tagService.searchTags(mockDb);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.not.stringContaining('WHERE'),
        []
      );
      expect(result).toHaveLength(3);
    });

    test('空の結果を処理できる', async () => {
      mockDb.query.mockResolvedValue({ rows: [] } as any);

      const result = await tagService.searchTags(mockDb, 'NonExistent');

      expect(result).toEqual([]);
    });
  });

  describe('getPopularTags', () => {
    const mockPopularTags = [
      { tagName: 'React', colorCode: '#61DAFB', usageCount: 50 },
      { tagName: 'JavaScript', colorCode: '#F7DF1E', usageCount: 45 },
      { tagName: 'Node.js', colorCode: '#339933', usageCount: 40 },
    ];

    test('人気タグを取得できる', async () => {
      mockDb.query.mockResolvedValue({ rows: mockPopularTags } as any);

      const result = await tagService.getPopularTags(mockDb);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY usage_count DESC'),
        []
      );
      expect(result).toHaveLength(3);
      expect(result[0].tagName).toBe('React');
      expect(result[0].usageCount).toBe(50);
    });

    test('取得数を制限できる', async () => {
      mockDb.query.mockResolvedValue({ rows: mockPopularTags.slice(0, 2) } as any);

      const result = await tagService.getPopularTags(mockDb, 2);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT'),
        [2]
      );
      expect(result).toHaveLength(2);
    });

    test('タグがない場合空配列を返す', async () => {
      mockDb.query.mockResolvedValue({ rows: [] } as any);

      const result = await tagService.getPopularTags(mockDb);

      expect(result).toEqual([]);
    });
  });

  describe('getTagStats', () => {
    const mockTagStats = [
      { tagName: 'React', colorCode: '#61DAFB', usageCount: 30, knowledgeCount: 15 },
      { tagName: 'Vue', colorCode: '#4FC08D', usageCount: 25, knowledgeCount: 12 },
    ];

    test('タグ統計を取得できる', async () => {
      mockDb.query.mockResolvedValue({ rows: mockTagStats } as any);

      const result = await tagService.getTagStats(mockDb);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('COUNT(DISTINCT'),
        []
      );
      expect(result).toEqual([
        {
          tagName: 'React',
          tagColorType: { colorCode: '#61DAFB' },
          usageCount: 30,
          knowledgeCount: 15,
        },
        {
          tagName: 'Vue',
          tagColorType: { colorCode: '#4FC08D' },
          usageCount: 25,
          knowledgeCount: 12,
        },
      ]);
    });

    test('期間フィルタを適用できる', async () => {
      mockDb.query.mockResolvedValue({ rows: mockTagStats } as any);

      const result = await tagService.getTagStats(mockDb, 'monthly');

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('AND k.create_date >='),
        expect.any(Array)
      );
      expect(result).toHaveLength(2);
    });
  });

  describe('getUserTags', () => {
    const mockUserTags = [
      { tagName: 'Python', colorCode: '#3776AB', usageCount: 10 },
      { tagName: 'Django', colorCode: '#092E20', usageCount: 8 },
    ];

    test('ユーザーが使用したタグを取得できる', async () => {
      mockDb.query.mockResolvedValue({ rows: mockUserTags } as any);

      const result = await tagService.getUserTags(mockDb, 'testuser');

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE k.user_id = '),
        ['testuser']
      );
      expect(result).toEqual([
        {
          tagName: 'Python',
          tagColorType: { colorCode: '#3776AB' },
          usageCount: 10,
        },
        {
          tagName: 'Django',
          tagColorType: { colorCode: '#092E20' },
          usageCount: 8,
        },
      ]);
    });

    test('ユーザーがタグを使用していない場合空配列を返す', async () => {
      mockDb.query.mockResolvedValue({ rows: [] } as any);

      const result = await tagService.getUserTags(mockDb, 'newuser');

      expect(result).toEqual([]);
    });
  });

  describe('getTagColor', () => {
    test('タグの色を取得できる', async () => {
      mockDb.query.mockResolvedValue({ 
        rows: [{ colorCode: '#61DAFB' }] 
      } as any);

      const result = await tagService.getTagColor(mockDb, 'React');

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE t.tag_name = '),
        ['React']
      );
      expect(result).toBe('#61DAFB');
    });

    test('タグが存在しない場合デフォルト色を返す', async () => {
      mockDb.query.mockResolvedValue({ rows: [] } as any);

      const result = await tagService.getTagColor(mockDb, 'NewTag');

      expect(result).toBe('#808080'); // デフォルトのグレー
    });
  });

  describe('createTag', () => {
    test('新しいタグを作成できる', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] } as any); // 既存チェック
      mockDb.query.mockResolvedValueOnce({ rows: [] } as any); // 挿入

      const result = await tagService.createTag(mockDb, 'NewTag', '#FF0000');

      expect(mockDb.query).toHaveBeenNthCalledWith(1,
        expect.stringContaining('SELECT 1 FROM tags WHERE tag_name = '),
        ['NewTag']
      );
      expect(mockDb.query).toHaveBeenNthCalledWith(2,
        expect.stringContaining('INSERT INTO tags'),
        expect.arrayContaining(['NewTag', expect.any(Number)])
      );
      expect(result).toBe(true);
    });

    test('既存のタグ名の場合エラーをスロー', async () => {
      mockDb.query.mockResolvedValue({ 
        rows: [{ exists: true }] 
      } as any);

      await expect(
        tagService.createTag(mockDb, 'React', '#000000')
      ).rejects.toThrow('Tag already exists');
    });
  });

  describe('updateTagColor', () => {
    test('タグの色を更新できる', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ tagId: 1 }] } as any); // タグ存在確認
      mockDb.query.mockResolvedValueOnce({ rows: [] } as any); // 更新

      const result = await tagService.updateTagColor(mockDb, 'React', '#0000FF');

      expect(mockDb.query).toHaveBeenNthCalledWith(2,
        expect.stringContaining('UPDATE tag_color_types SET color_code = '),
        ['#0000FF', expect.any(Number)]
      );
      expect(result).toBe(true);
    });

    test('タグが存在しない場合エラーをスロー', async () => {
      mockDb.query.mockResolvedValue({ rows: [] } as any);

      await expect(
        tagService.updateTagColor(mockDb, 'NonExistent', '#000000')
      ).rejects.toThrow('Tag not found');
    });
  });

  describe('mergeTag', () => {
    test('タグをマージできる', async () => {
      // 両タグの存在確認
      mockDb.query.mockResolvedValueOnce({ rows: [{ tagId: 1 }] } as any);
      mockDb.query.mockResolvedValueOnce({ rows: [{ tagId: 2 }] } as any);
      // マージ実行
      mockDb.query.mockResolvedValueOnce({ rows: [] } as any);
      // 古いタグ削除
      mockDb.query.mockResolvedValueOnce({ rows: [] } as any);

      const result = await tagService.mergeTag(mockDb, 'OldTag', 'NewTag');

      expect(mockDb.query).toHaveBeenCalledTimes(4);
      expect(result).toBe(true);
    });

    test('元タグが存在しない場合エラーをスロー', async () => {
      mockDb.query.mockResolvedValue({ rows: [] } as any);

      await expect(
        tagService.mergeTag(mockDb, 'NonExistent', 'React')
      ).rejects.toThrow('Source tag not found');
    });

    test('対象タグが存在しない場合エラーをスロー', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ tagId: 1 }] } as any);
      mockDb.query.mockResolvedValueOnce({ rows: [] } as any);

      await expect(
        tagService.mergeTag(mockDb, 'React', 'NonExistent')
      ).rejects.toThrow('Target tag not found');
    });
  });

  describe('getTagSuggestions', () => {
    const mockSuggestions = [
      { tagName: 'JavaScript', score: 0.9 },
      { tagName: 'TypeScript', score: 0.8 },
      { tagName: 'React', score: 0.7 },
    ];

    test('コンテンツに基づくタグ提案を取得できる', async () => {
      mockDb.query.mockResolvedValue({ rows: mockSuggestions } as any);

      const result = await tagService.getTagSuggestions(
        mockDb,
        'JavaScriptとTypeScriptでReactを使う'
      );

      expect(mockDb.query).toHaveBeenCalled();
      expect(result).toEqual(['JavaScript', 'TypeScript', 'React']);
    });

    test('提案数を制限できる', async () => {
      mockDb.query.mockResolvedValue({ 
        rows: mockSuggestions.slice(0, 2) 
      } as any);

      const result = await tagService.getTagSuggestions(
        mockDb,
        'テストコンテンツ',
        2
      );

      expect(result).toHaveLength(2);
    });

    test('提案がない場合空配列を返す', async () => {
      mockDb.query.mockResolvedValue({ rows: [] } as any);

      const result = await tagService.getTagSuggestions(
        mockDb,
        '無関係なコンテンツ'
      );

      expect(result).toEqual([]);
    });
  });
});