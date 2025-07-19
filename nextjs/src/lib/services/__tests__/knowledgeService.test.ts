/**
 * KnowledgeServiceテスト
 * 
 * @description ナレッジサービスの単体テスト
 */
import { KnowledgeService } from '../knowledgeService';
import { KnowledgeRepository } from '@/lib/repositories/knowledgeRepository';
import { AuthenticatedUser } from '@/lib/auth/middleware';
import { Knowledge } from '@prisma/client';

// KnowledgeRepositoryをモック化
jest.mock('@/lib/repositories/knowledgeRepository');

describe('KnowledgeService', () => {
  let service: KnowledgeService;
  let mockKnowledgeRepo: jest.Mocked<KnowledgeRepository>;

  // テスト用データ
  const mockKnowledge: Knowledge = {
    knowledgeId: BigInt(1),
    title: 'テストナレッジ',
    content: 'テストコンテンツ',
    publicFlag: 1,
    typeId: 1,
    insertUser: 1,
    insertDatetime: new Date('2024-01-01'),
    updateUser: 1,
    updateDatetime: new Date('2024-01-01'),
    deleteFlag: 0,
    viewCount: BigInt(10),
    point: 100
  };

  const mockUser: AuthenticatedUser = {
    userId: 1,
    userName: 'testuser',
    userInfoId: 1,
    localeKey: 'ja',
    isAdmin: false
  };

  beforeEach(() => {
    // モックをリセット
    jest.clearAllMocks();
    
    // サービスインスタンスを作成
    service = new KnowledgeService();
    
    // モックリポジトリを取得
    mockKnowledgeRepo = (service as any).knowledgeRepo as jest.Mocked<KnowledgeRepository>;
  });

  describe('getKnowledgeById', () => {
    test('ナレッジIDで正しく取得できる', async () => {
      mockKnowledgeRepo.findById.mockResolvedValue(mockKnowledge);

      const result = await service.getKnowledgeById(BigInt(1));

      expect(mockKnowledgeRepo.findById).toHaveBeenCalledWith(BigInt(1));
      expect(result).toEqual(mockKnowledge);
    });

    test('存在しないナレッジの場合nullを返す', async () => {
      mockKnowledgeRepo.findById.mockResolvedValue(null);

      const result = await service.getKnowledgeById(BigInt(999));

      expect(result).toBeNull();
    });
  });

  describe('getKnowledgeByIdWithUser', () => {
    test('ユーザー情報を含むナレッジを取得できる', async () => {
      const mockKnowledgeWithUser = {
        ...mockKnowledge,
        insertUserInfo: {
          userId: 1,
          userName: 'testuser'
        }
      };
      mockKnowledgeRepo.findByIdWithUserInfo.mockResolvedValue(mockKnowledgeWithUser as any);

      const result = await service.getKnowledgeByIdWithUser(BigInt(1));

      expect(mockKnowledgeRepo.findByIdWithUserInfo).toHaveBeenCalledWith(BigInt(1));
      expect(result).toEqual(mockKnowledgeWithUser);
    });
  });

  describe('canAccessKnowledge', () => {
    test('公開ナレッジは誰でもアクセス可能', async () => {
      mockKnowledgeRepo.findById.mockResolvedValue({
        ...mockKnowledge,
        publicFlag: 1
      });

      const result = await service.canAccessKnowledge(BigInt(1));

      expect(result).toBe(true);
    });

    test('非公開ナレッジは作成者のみアクセス可能', async () => {
      mockKnowledgeRepo.findById.mockResolvedValue({
        ...mockKnowledge,
        publicFlag: 2,
        insertUser: 1
      });

      // 作成者の場合
      const result1 = await service.canAccessKnowledge(BigInt(1), { userId: 1 });
      expect(result1).toBe(true);

      // 他のユーザーの場合
      const result2 = await service.canAccessKnowledge(BigInt(1), { userId: 2 });
      expect(result2).toBe(false);

      // ログインしていない場合
      const result3 = await service.canAccessKnowledge(BigInt(1));
      expect(result3).toBe(false);
    });

    test('非公開ナレッジは管理者もアクセス可能', async () => {
      mockKnowledgeRepo.findById.mockResolvedValue({
        ...mockKnowledge,
        publicFlag: 2,
        insertUser: 1
      });

      const result = await service.canAccessKnowledge(BigInt(1), { userId: 2, isAdmin: true });
      expect(result).toBe(true);
    });

    test('保護ナレッジはログインユーザーのみアクセス可能', async () => {
      mockKnowledgeRepo.findById.mockResolvedValue({
        ...mockKnowledge,
        publicFlag: 3
      });

      // ログインしていない場合
      const result1 = await service.canAccessKnowledge(BigInt(1));
      expect(result1).toBe(false);

      // 作成者の場合
      const result2 = await service.canAccessKnowledge(BigInt(1), { userId: 1 });
      expect(result2).toBe(true);

      // 管理者の場合
      const result3 = await service.canAccessKnowledge(BigInt(1), { userId: 2, isAdmin: true });
      expect(result3).toBe(true);

      // その他のユーザー（グループメンバーでない）
      const result4 = await service.canAccessKnowledge(BigInt(1), { userId: 2 });
      expect(result4).toBe(false);
    });

    test('存在しないナレッジはアクセス不可', async () => {
      mockKnowledgeRepo.findById.mockResolvedValue(null);

      const result = await service.canAccessKnowledge(BigInt(999));
      expect(result).toBe(false);
    });

    test('不明な公開フラグはアクセス不可', async () => {
      mockKnowledgeRepo.findById.mockResolvedValue({
        ...mockKnowledge,
        publicFlag: 99
      });

      const result = await service.canAccessKnowledge(BigInt(1));
      expect(result).toBe(false);
    });
  });

  describe('incrementViewCount', () => {
    test('閲覧数を正しく増加させる', async () => {
      mockKnowledgeRepo.findById.mockResolvedValue({
        ...mockKnowledge,
        viewCount: BigInt(10)
      });
      mockKnowledgeRepo.updateViewCount.mockResolvedValue();

      await service.incrementViewCount(BigInt(1));

      expect(mockKnowledgeRepo.updateViewCount).toHaveBeenCalledWith(BigInt(1), BigInt(11));
    });

    test('viewCountがnullの場合も処理できる', async () => {
      mockKnowledgeRepo.findById.mockResolvedValue({
        ...mockKnowledge,
        viewCount: null
      });
      mockKnowledgeRepo.updateViewCount.mockResolvedValue();

      await service.incrementViewCount(BigInt(1));

      expect(mockKnowledgeRepo.updateViewCount).toHaveBeenCalledWith(BigInt(1), BigInt(1));
    });

    test('エラーが発生してもクラッシュしない', async () => {
      mockKnowledgeRepo.findById.mockRejectedValue(new Error('DB Error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(service.incrementViewCount(BigInt(1))).resolves.not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getKnowledgePoint', () => {
    test('ポイントを正しく取得できる', async () => {
      mockKnowledgeRepo.getPoint.mockResolvedValue(100);

      const result = await service.getKnowledgePoint(BigInt(1));

      expect(mockKnowledgeRepo.getPoint).toHaveBeenCalledWith(BigInt(1));
      expect(result).toBe(100);
    });
  });

  describe('updateKnowledgePoint', () => {
    test('ポイントを正しく更新できる', async () => {
      mockKnowledgeRepo.updatePoint.mockResolvedValue();

      await service.updateKnowledgePoint(BigInt(1), 200);

      expect(mockKnowledgeRepo.updatePoint).toHaveBeenCalledWith(BigInt(1), 200);
    });
  });

  describe('createKnowledge', () => {
    const createData = {
      title: '新規ナレッジ',
      content: '新規コンテンツ',
      publicFlag: 1,
      typeId: 1
    };

    test('ナレッジを正しく作成できる', async () => {
      mockKnowledgeRepo.create.mockResolvedValue(mockKnowledge);

      const result = await service.createKnowledge(createData, mockUser);

      expect(mockKnowledgeRepo.create).toHaveBeenCalledWith({
        title: createData.title,
        content: createData.content,
        publicFlag: createData.publicFlag,
        typeId: createData.typeId,
        insertUser: mockUser.userId,
        insertDatetime: expect.any(Date),
        updateUser: mockUser.userId,
        updateDatetime: expect.any(Date),
        deleteFlag: 0,
        viewCount: BigInt(0),
        point: 0
      });
      expect(result).toEqual(mockKnowledge);
    });

    test('contentが空の場合も作成できる', async () => {
      mockKnowledgeRepo.create.mockResolvedValue(mockKnowledge);

      const dataWithoutContent = { ...createData, content: undefined };
      await service.createKnowledge(dataWithoutContent, mockUser);

      expect(mockKnowledgeRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          content: ''
        })
      );
    });

    test('タイトルが空の場合エラーになる', async () => {
      const invalidData = { ...createData, title: '' };

      await expect(service.createKnowledge(invalidData, mockUser))
        .rejects.toThrow('タイトルは必須です');
    });

    test('タイトルが長すぎる場合エラーになる', async () => {
      const invalidData = { ...createData, title: 'a'.repeat(1025) };

      await expect(service.createKnowledge(invalidData, mockUser))
        .rejects.toThrow('タイトルは1024文字以内で入力してください');
    });

    test('不正な公開フラグでエラーになる', async () => {
      const invalidData = { ...createData, publicFlag: 99 };

      await expect(service.createKnowledge(invalidData, mockUser))
        .rejects.toThrow('公開フラグが無効です');
    });
  });

  describe('updateKnowledge', () => {
    const updateData = {
      knowledgeId: BigInt(1),
      title: '更新ナレッジ',
      content: '更新コンテンツ',
      publicFlag: 1,
      typeId: 1
    };

    test('ナレッジを正しく更新できる', async () => {
      mockKnowledgeRepo.findById.mockResolvedValue(mockKnowledge);
      mockKnowledgeRepo.update.mockResolvedValue(mockKnowledge);

      const result = await service.updateKnowledge(updateData, mockUser);

      expect(mockKnowledgeRepo.update).toHaveBeenCalledWith(BigInt(1), {
        title: updateData.title,
        content: updateData.content,
        publicFlag: updateData.publicFlag,
        typeId: updateData.typeId,
        updateUser: mockUser.userId,
        updateDatetime: expect.any(Date)
      });
      expect(result).toEqual(mockKnowledge);
    });

    test('存在しないナレッジの更新はエラーになる', async () => {
      mockKnowledgeRepo.findById.mockResolvedValue(null);

      await expect(service.updateKnowledge(updateData, mockUser))
        .rejects.toThrow('Knowledge not found');
    });

    test('作成者以外の更新は管理者のみ可能', async () => {
      mockKnowledgeRepo.findById.mockResolvedValue({
        ...mockKnowledge,
        insertUser: 999
      });

      // 一般ユーザーの場合
      await expect(service.updateKnowledge(updateData, mockUser))
        .rejects.toThrow('ナレッジの編集権限がありません');

      // 管理者の場合
      mockKnowledgeRepo.update.mockResolvedValue(mockKnowledge);
      const adminUser = { ...mockUser, isAdmin: true };
      await expect(service.updateKnowledge(updateData, adminUser))
        .resolves.toEqual(mockKnowledge);
    });
  });

  describe('deleteKnowledge', () => {
    test('ナレッジを正しく削除できる', async () => {
      mockKnowledgeRepo.findById.mockResolvedValue(mockKnowledge);
      mockKnowledgeRepo.softDelete.mockResolvedValue();

      await service.deleteKnowledge(BigInt(1), mockUser);

      expect(mockKnowledgeRepo.softDelete).toHaveBeenCalledWith(BigInt(1), mockUser.userId);
    });

    test('存在しないナレッジの削除はエラーになる', async () => {
      mockKnowledgeRepo.findById.mockResolvedValue(null);

      await expect(service.deleteKnowledge(BigInt(999), mockUser))
        .rejects.toThrow('Knowledge not found');
    });

    test('作成者以外の削除は管理者のみ可能', async () => {
      mockKnowledgeRepo.findById.mockResolvedValue({
        ...mockKnowledge,
        insertUser: 999
      });

      // 一般ユーザーの場合
      await expect(service.deleteKnowledge(BigInt(1), mockUser))
        .rejects.toThrow('ナレッジの編集権限がありません');

      // 管理者の場合
      mockKnowledgeRepo.softDelete.mockResolvedValue();
      const adminUser = { ...mockUser, isAdmin: true };
      await expect(service.deleteKnowledge(BigInt(1), adminUser))
        .resolves.not.toThrow();
    });
  });
});