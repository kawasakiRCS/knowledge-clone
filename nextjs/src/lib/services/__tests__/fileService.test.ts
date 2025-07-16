/**
 * FileService テスト
 * 
 * @description ファイルサービスのテストケース
 */
import { describe, test, expect, beforeEach } from '@jest/globals';
import { FileService } from '../fileService';

// Prisma クライアントのモック
const mockFindUnique = jest.fn();
const mockFindFirst = jest.fn();
const mockFindMany = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    knowledgeFile: {
      findUnique: mockFindUnique,
      findFirst: mockFindFirst,
      findMany: mockFindMany,
    },
  })),
}));

// KnowledgeService のモック
const mockCanAccessKnowledge = jest.fn();
const mockGetKnowledgeById = jest.fn();

jest.mock('../knowledgeService', () => ({
  KnowledgeService: jest.fn().mockImplementation(() => ({
    canAccessKnowledge: mockCanAccessKnowledge,
    getKnowledgeById: mockGetKnowledgeById,
  })),
}));

// KnowledgeRepository のモック
const mockFindById = jest.fn();

jest.mock('@/lib/repositories/knowledgeRepository', () => ({
  KnowledgeRepository: jest.fn().mockImplementation(() => ({
    findById: mockFindById,
  })),
}));

describe('FileService', () => {
  let fileService: FileService;

  beforeEach(() => {
    jest.clearAllMocks();
    fileService = new FileService();
  });

  describe('getFile', () => {
    test('存在するファイルを取得できる', async () => {
      const mockFileEntity = {
        fileNo: BigInt(1),
        fileName: 'test.txt',
        fileBinary: Buffer.from('test content'),
        fileSize: BigInt(12),
        knowledgeId: BigInt(1),
        insertUser: 1,
        deleteFlag: 0,
      };

      mockFindUnique.mockResolvedValue(mockFileEntity);
      mockCanAccessKnowledge.mockResolvedValue(true);

      const result = await fileService.getFile(1, { userId: 1, userName: 'test' });

      expect(result).toEqual({
        fileNo: 1,
        fileName: 'test.txt',
        fileBinary: Buffer.from('test content'),
        fileSize: 12,
        knowledgeId: 1,
      });
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { fileNo: BigInt(1) },
        select: {
          fileNo: true,
          fileName: true,
          fileBinary: true,
          fileSize: true,
          knowledgeId: true,
          insertUser: true,
          deleteFlag: true,
        },
      });
    });

    test('存在しないファイルでnullを返す', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await fileService.getFile(999, { userId: 1, userName: 'test' });

      expect(result).toBeNull();
    });

    test('削除フラグが立っているファイルでnullを返す', async () => {
      const mockFileEntity = {
        fileNo: BigInt(1),
        fileName: 'test.txt',
        fileBinary: Buffer.from('test content'),
        fileSize: BigInt(12),
        knowledgeId: BigInt(1),
        insertUser: 1,
        deleteFlag: 1, // 削除フラグ
      };

      mockFindUnique.mockResolvedValue(mockFileEntity);

      const result = await fileService.getFile(1, { userId: 1, userName: 'test' });

      expect(result).toBeNull();
    });

    test('アクセス権限がない場合nullを返す', async () => {
      const mockFileEntity = {
        fileNo: BigInt(1),
        fileName: 'test.txt',
        fileBinary: Buffer.from('test content'),
        fileSize: BigInt(12),
        knowledgeId: BigInt(1),
        insertUser: 1,
        deleteFlag: 0,
      };

      mockFindUnique.mockResolvedValue(mockFileEntity);
      mockCanAccessKnowledge.mockResolvedValue(false);

      const result = await fileService.getFile(1, { userId: 2, userName: 'test2' });

      expect(result).toBeNull();
    });

    test('エラー時にnullを返す', async () => {
      mockFindUnique.mockRejectedValue(new Error('Database error'));

      const result = await fileService.getFile(1, { userId: 1, userName: 'test' });

      expect(result).toBeNull();
    });

    test('未認証ユーザーでも公開ファイルにアクセスできる', async () => {
      const mockFileEntity = {
        fileNo: BigInt(1),
        fileName: 'public.txt',
        fileBinary: Buffer.from('public content'),
        fileSize: BigInt(14),
        knowledgeId: BigInt(1),
        insertUser: 1,
        deleteFlag: 0,
      };

      mockFindUnique.mockResolvedValue(mockFileEntity);
      mockCanAccessKnowledge.mockResolvedValue(true);

      const result = await fileService.getFile(1, null);

      expect(result).toEqual({
        fileNo: 1,
        fileName: 'public.txt',
        fileBinary: Buffer.from('public content'),
        fileSize: 14,
        knowledgeId: 1,
      });
    });

    test('nullバイナリデータを適切に処理する', async () => {
      const mockFileEntity = {
        fileNo: BigInt(1),
        fileName: 'empty.txt',
        fileBinary: null,
        fileSize: BigInt(0),
        knowledgeId: BigInt(1),
        insertUser: 1,
        deleteFlag: 0,
      };

      mockFindUnique.mockResolvedValue(mockFileEntity);
      mockCanAccessKnowledge.mockResolvedValue(true);

      const result = await fileService.getFile(1, { userId: 1, userName: 'test' });

      expect(result).toEqual({
        fileNo: 1,
        fileName: 'empty.txt',
        fileBinary: Buffer.alloc(0),
        fileSize: 0,
        knowledgeId: 1,
      });
    });
  });
});