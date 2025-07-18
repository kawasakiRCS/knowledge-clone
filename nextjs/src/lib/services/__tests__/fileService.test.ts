/**
 * ファイルサービステスト
 * 
 * @description fileService.tsの包括的なテストカバレッジ
 */
import { FileService } from '../fileService';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedUser } from '@/lib/auth/middleware';

// Prismaのモック
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    knowledgeFile: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  })),
}));

// KnowledgeRepositoryのモック
jest.mock('@/lib/repositories/knowledgeRepository', () => ({
  KnowledgeRepository: jest.fn().mockImplementation(() => ({
    findById: jest.fn(),
  })),
}));

describe('FileService', () => {
  let fileService: FileService;
  let mockPrisma: any;
  let mockKnowledgeRepository: any;
  
  const mockUser: AuthenticatedUser = {
    userId: 1,
    email: 'test@example.com',
    userInfoName: 'Test User',
  };

  beforeEach(() => {
    // モックをリセット
    jest.clearAllMocks();
    
    fileService = new FileService();
    mockPrisma = new PrismaClient();
    mockKnowledgeRepository = (fileService as any).knowledgeRepository;
  });

  describe('getFile', () => {
    const mockFileData = {
      fileNo: BigInt(123),
      fileName: 'test.pdf',
      fileBinary: Buffer.from('test data'),
      fileSize: BigInt(1024),
      knowledgeId: BigInt(1),
      insertUser: 1,
      deleteFlag: 0,
    };

    test('正常なファイル取得（公開ナレッジ）', async () => {
      mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFileData);
      mockKnowledgeRepository.findById.mockResolvedValue({
        publicFlag: 1, // 公開
        insertUser: 1,
      });

      const result = await fileService.getFile(123, mockUser);

      expect(result).toEqual({
        fileNo: 123,
        fileName: 'test.pdf',
        fileBinary: Buffer.from('test data'),
        fileSize: 1024,
        knowledgeId: 1,
      });
    });

    test('ファイルが存在しない場合', async () => {
      mockPrisma.knowledgeFile.findUnique.mockResolvedValue(null);

      const result = await fileService.getFile(123, mockUser);

      expect(result).toBeNull();
    });

    test('削除済みファイルの場合', async () => {
      mockPrisma.knowledgeFile.findUnique.mockResolvedValue({
        ...mockFileData,
        deleteFlag: 1,
      });

      const result = await fileService.getFile(123, mockUser);

      expect(result).toBeNull();
    });

    test('アクセス権限がない場合（非公開、別ユーザー）', async () => {
      const otherUser: AuthenticatedUser = {
        userId: 2,
        email: 'other@example.com',
        userInfoName: 'Other User',
      };

      mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFileData);
      mockKnowledgeRepository.findById.mockResolvedValue({
        publicFlag: 3, // 非公開
        insertUser: 1, // 作成者は別ユーザー
      });

      const result = await fileService.getFile(123, otherUser);

      expect(result).toBeNull();
    });

    test('下書きファイルへのアクセス（作成者）', async () => {
      const draftFile = {
        ...mockFileData,
        knowledgeId: null,
      };

      mockPrisma.knowledgeFile.findUnique.mockResolvedValue(draftFile);

      const result = await fileService.getFile(123, mockUser);

      expect(result).toEqual({
        fileNo: 123,
        fileName: 'test.pdf',
        fileBinary: Buffer.from('test data'),
        fileSize: 1024,
        knowledgeId: undefined,
      });
    });

    test('下書きファイルへのアクセス（別ユーザー）', async () => {
      const draftFile = {
        ...mockFileData,
        knowledgeId: null,
      };
      const otherUser: AuthenticatedUser = {
        userId: 2,
        email: 'other@example.com',
        userInfoName: 'Other User',
      };

      mockPrisma.knowledgeFile.findUnique.mockResolvedValue(draftFile);

      const result = await fileService.getFile(123, otherUser);

      expect(result).toBeNull();
    });

    test('保護されたナレッジ（認証済みユーザー）', async () => {
      mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFileData);
      mockKnowledgeRepository.findById.mockResolvedValue({
        publicFlag: 2, // 保護
        insertUser: 1,
      });

      const result = await fileService.getFile(123, mockUser);

      expect(result).toBeTruthy();
    });

    test('保護されたナレッジ（未認証ユーザー）', async () => {
      mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFileData);
      mockKnowledgeRepository.findById.mockResolvedValue({
        publicFlag: 2, // 保護
        insertUser: 1,
      });

      const result = await fileService.getFile(123, null);

      expect(result).toBeNull();
    });

    test('エラー処理', async () => {
      mockPrisma.knowledgeFile.findUnique.mockRejectedValue(new Error('DB Error'));

      const result = await fileService.getFile(123, mockUser);

      expect(result).toBeNull();
    });
  });

  describe('getSlideInfo', () => {
    test('PDFファイルのスライド情報取得', async () => {
      const mockFileData = {
        fileNo: BigInt(123),
        fileName: 'presentation.pdf',
        fileBinary: Buffer.from('pdf data'),
        fileSize: BigInt(2048),
        knowledgeId: BigInt(1),
        insertUser: 1,
        deleteFlag: 0,
      };

      mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFileData);
      mockKnowledgeRepository.findById.mockResolvedValue({
        publicFlag: 1,
        insertUser: 1,
      });

      const result = await fileService.getSlideInfo('123', mockUser);

      expect(result).toEqual({
        fileNo: '123',
        fileName: 'presentation.pdf',
        totalSlides: expect.any(Number),
        slides: expect.arrayContaining([
          {
            slideNumber: 1,
            imageName: 'slide_1.png',
          },
        ]),
      });
    });

    test('PPTXファイルのスライド情報取得', async () => {
      const mockFileData = {
        fileNo: BigInt(456),
        fileName: 'slides.pptx',
        fileBinary: Buffer.from('pptx data'),
        fileSize: BigInt(4096),
        knowledgeId: BigInt(2),
        insertUser: 1,
        deleteFlag: 0,
      };

      mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFileData);
      mockKnowledgeRepository.findById.mockResolvedValue({
        publicFlag: 1,
        insertUser: 1,
      });

      const result = await fileService.getSlideInfo('456', mockUser);

      expect(result).toBeTruthy();
      expect(result?.fileName).toBe('slides.pptx');
    });

    test('非スライドファイルの場合', async () => {
      const mockFileData = {
        fileNo: BigInt(789),
        fileName: 'document.txt',
        fileBinary: Buffer.from('text data'),
        fileSize: BigInt(100),
        knowledgeId: BigInt(3),
        insertUser: 1,
        deleteFlag: 0,
      };

      mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFileData);
      mockKnowledgeRepository.findById.mockResolvedValue({
        publicFlag: 1,
        insertUser: 1,
      });

      const result = await fileService.getSlideInfo('789', mockUser);

      expect(result).toBeNull();
    });

    test('ファイルが存在しない場合', async () => {
      mockPrisma.knowledgeFile.findUnique.mockResolvedValue(null);

      const result = await fileService.getSlideInfo('999', mockUser);

      expect(result).toBeNull();
    });

    test('エラー処理', async () => {
      mockPrisma.knowledgeFile.findUnique.mockRejectedValue(new Error('DB Error'));

      const result = await fileService.getSlideInfo('123', mockUser);

      expect(result).toBeNull();
    });
  });

  describe('getSlideImage', () => {
    test('スライド画像の取得成功', async () => {
      const mockFileData = {
        fileNo: BigInt(123),
        fileName: 'presentation.pdf',
        fileBinary: Buffer.from('pdf data'),
        fileSize: BigInt(2048),
        knowledgeId: BigInt(1),
        insertUser: 1,
        deleteFlag: 0,
      };

      mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFileData);
      mockKnowledgeRepository.findById.mockResolvedValue({
        publicFlag: 1,
        insertUser: 1,
      });

      const result = await fileService.getSlideImage('123', 'slide_1.png', mockUser);

      expect(result).toBeTruthy();
      expect(result?.contentType).toBe('image/png');
      expect(result?.data).toBeInstanceOf(Buffer);
      expect(result?.size).toBeGreaterThan(0);
    });

    test('ファイルアクセス権限がない場合', async () => {
      const mockFileData = {
        fileNo: BigInt(123),
        fileName: 'presentation.pdf',
        fileBinary: Buffer.from('pdf data'),
        fileSize: BigInt(2048),
        knowledgeId: BigInt(1),
        insertUser: 2,
        deleteFlag: 0,
      };

      mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFileData);
      mockKnowledgeRepository.findById.mockResolvedValue({
        publicFlag: 3, // 非公開
        insertUser: 2,
      });

      const result = await fileService.getSlideImage('123', 'slide_1.png', mockUser);

      expect(result).toBeNull();
    });

    test('エラー処理', async () => {
      mockPrisma.knowledgeFile.findUnique.mockRejectedValue(new Error('DB Error'));

      const result = await fileService.getSlideImage('123', 'slide_1.png', mockUser);

      expect(result).toBeNull();
    });
  });

  describe('createFile', () => {
    test('ファイル作成成功', async () => {
      const mockCreatedFile = {
        fileNo: BigInt(999),
        fileName: 'newfile.pdf',
        fileBinary: Buffer.from('new file data'),
        fileSize: 13,
        knowledgeId: BigInt(1),
        insertUser: 1,
        insertDatetime: new Date(),
        updateUser: 1,
        updateDatetime: new Date(),
        deleteFlag: 0,
        parseStatus: 0,
      };

      mockPrisma.knowledgeFile.create.mockResolvedValue(mockCreatedFile);

      const result = await fileService.createFile(
        'newfile.pdf',
        Buffer.from('new file data'),
        1,
        1
      );

      expect(result).toEqual({
        fileNo: 999,
        fileName: 'newfile.pdf',
        fileBinary: Buffer.from('new file data'),
        fileSize: 13,
        knowledgeId: 1,
      });

      expect(mockPrisma.knowledgeFile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          fileName: 'newfile.pdf',
          fileBinary: Buffer.from('new file data'),
          fileSize: 13,
          knowledgeId: BigInt(1),
          insertUser: 1,
          deleteFlag: 0,
          parseStatus: 0,
        }),
      });
    });

    test('下書きファイル作成（knowledgeIdなし）', async () => {
      const mockCreatedFile = {
        fileNo: BigInt(1000),
        fileName: 'draft.pdf',
        fileBinary: Buffer.from('draft data'),
        fileSize: 10,
        knowledgeId: null,
        insertUser: 1,
        insertDatetime: new Date(),
        updateUser: 1,
        updateDatetime: new Date(),
        deleteFlag: 0,
        parseStatus: 0,
      };

      mockPrisma.knowledgeFile.create.mockResolvedValue(mockCreatedFile);

      const result = await fileService.createFile(
        'draft.pdf',
        Buffer.from('draft data'),
        null,
        1
      );

      expect(result).toEqual({
        fileNo: 1000,
        fileName: 'draft.pdf',
        fileBinary: Buffer.from('draft data'),
        fileSize: 10,
        knowledgeId: undefined,
      });
    });

    test('エラー処理', async () => {
      mockPrisma.knowledgeFile.create.mockRejectedValue(new Error('DB Error'));

      const result = await fileService.createFile(
        'error.pdf',
        Buffer.from('data'),
        1,
        1
      );

      expect(result).toBeNull();
    });
  });

  describe('deleteFile', () => {
    test('ファイル削除成功（下書き、作成者）', async () => {
      const mockFileData = {
        fileNo: BigInt(123),
        fileName: 'draft.pdf',
        fileBinary: Buffer.from('data'),
        fileSize: BigInt(100),
        knowledgeId: null,
        insertUser: 1,
        deleteFlag: 0,
      };

      mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFileData);
      mockPrisma.knowledgeFile.update.mockResolvedValue({
        ...mockFileData,
        deleteFlag: 1,
      });

      const result = await fileService.deleteFile(123, 1);

      expect(result).toBe(true);
      expect(mockPrisma.knowledgeFile.update).toHaveBeenCalledWith({
        where: { fileNo: BigInt(123) },
        data: {
          deleteFlag: 1,
          updateUser: 1,
          updateDatetime: expect.any(Date),
        },
      });
    });

    test('ファイルが存在しない場合', async () => {
      mockPrisma.knowledgeFile.findUnique.mockResolvedValue(null);

      const result = await fileService.deleteFile(999, 1);

      expect(result).toBe(false);
    });

    test('既に削除済みの場合', async () => {
      const mockFileData = {
        fileNo: BigInt(123),
        fileName: 'deleted.pdf',
        fileBinary: Buffer.from('data'),
        fileSize: BigInt(100),
        knowledgeId: null,
        insertUser: 1,
        deleteFlag: 1,
      };

      mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFileData);

      const result = await fileService.deleteFile(123, 1);

      expect(result).toBe(false);
    });

    test('削除権限がない場合（下書き、別ユーザー）', async () => {
      const mockFileData = {
        fileNo: BigInt(123),
        fileName: 'draft.pdf',
        fileBinary: Buffer.from('data'),
        fileSize: BigInt(100),
        knowledgeId: null,
        insertUser: 2,
        deleteFlag: 0,
      };

      mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFileData);

      const result = await fileService.deleteFile(123, 1);

      expect(result).toBe(false);
    });

    test('エラー処理', async () => {
      mockPrisma.knowledgeFile.findUnique.mockRejectedValue(new Error('DB Error'));

      const result = await fileService.deleteFile(123, 1);

      expect(result).toBe(false);
    });
  });

  describe('プライベートメソッド', () => {
    test('buildSlideImagePath', () => {
      const path = (fileService as any).buildSlideImagePath('123', 'slide_1.png');
      expect(path).toBe('/slides/123/slide_1.png');
    });

    test('countSlidePages', async () => {
      const count = await (fileService as any).countSlidePages('123');
      expect(count).toBeGreaterThanOrEqual(1);
      expect(count).toBeLessThanOrEqual(20);
    });

    test('loadSlideImageFromStorage', async () => {
      const buffer = await (fileService as any).loadSlideImageFromStorage('/path/to/image');
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });
});