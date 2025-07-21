/**
 * ファイルサービステスト
 * 
 * @description 旧Javaシステムの完全移植テスト
 * - UploadedFileLogic + SlideLogic の機能テスト
 * - ファイルアクセス制御、スライド処理、バイナリデータ管理テスト
 */

// モック設定を最初に定義
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    knowledgeFile: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    }
  };
  
  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient)
  };
});

jest.mock('@/lib/repositories/knowledgeRepository');
jest.mock('@/lib/services/knowledgeService');
jest.mock('@/lib/db', () => ({
  db: {
    knowledgeFile: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    }
  }
}));

import { FileService } from '../fileService';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedUser } from '@/lib/auth/middleware';

// モッククライアントの参照を取得
const mockPrismaClient = new (PrismaClient as any)();

// グローバルprismaオブジェクトを設定
(global as any).prisma = mockPrismaClient;

describe('FileService', () => {
  let fileService: FileService;
  let mockPrisma: any;
  let mockKnowledgeRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // KnowledgeRepositoryのモックインスタンスを作成
    const { KnowledgeRepository } = require('@/lib/repositories/knowledgeRepository');
    mockKnowledgeRepository = new KnowledgeRepository();
    
    // FileServiceにモックを注入
    fileService = new FileService(mockKnowledgeRepository);
    mockPrisma = mockPrismaClient;
  });

  describe('getFile', () => {
    const mockUser: AuthenticatedUser = {
      userId: 1,
      loginUserId: 'testuser',
      userName: 'Test User',
      mailAddress: 'test@example.com',
      localeKey: 'ja',
      roleAdmin: false,
      isLdapUser: false
    };

    describe('正常系', () => {
      test('公開ファイルを未認証ユーザーが取得できる', async () => {
        const mockFile = {
          fileNo: BigInt(1),
          fileName: 'test.pdf',
          fileBinary: Buffer.from('test content'),
          fileSize: BigInt(12),
          knowledgeId: BigInt(100),
          insertUser: 2,
          deleteFlag: 0
        };

        const mockKnowledge = {
          knowledgeId: BigInt(100),
          publicFlag: 1, // 公開
          insertUser: 2
        };

        mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFile);
        
        // KnowledgeRepositoryのモック
        mockKnowledgeRepository.findById = jest.fn().mockResolvedValue(mockKnowledge);

        const result = await fileService.getFile(1, null);

        expect(result).not.toBeNull();
        expect(result?.fileNo).toBe(1);
        expect(result?.fileName).toBe('test.pdf');
        expect(result?.fileBinary).toEqual(Buffer.from('test content'));
        expect(result?.fileSize).toBe(12);
        expect(result?.knowledgeId).toBe(100);
      });

      test('保護ファイルを認証済みユーザーが取得できる', async () => {
        const mockFile = {
          fileNo: BigInt(2),
          fileName: 'protected.pdf',
          fileBinary: Buffer.from('protected content'),
          fileSize: BigInt(17),
          knowledgeId: BigInt(200),
          insertUser: 3,
          deleteFlag: 0
        };

        const mockKnowledge = {
          knowledgeId: BigInt(200),
          publicFlag: 2, // 保護
          insertUser: 3
        };

        mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFile);
        
        mockKnowledgeRepository.findById = jest.fn().mockResolvedValue(mockKnowledge);

        const result = await fileService.getFile(2, mockUser);

        expect(result).not.toBeNull();
        expect(result?.fileNo).toBe(2);
        expect(result?.fileName).toBe('protected.pdf');
      });

      test('非公開ファイルを作成者が取得できる', async () => {
        const mockFile = {
          fileNo: BigInt(3),
          fileName: 'private.pdf',
          fileBinary: Buffer.from('private content'),
          fileSize: BigInt(15),
          knowledgeId: BigInt(300),
          insertUser: 1,
          deleteFlag: 0
        };

        const mockKnowledge = {
          knowledgeId: BigInt(300),
          publicFlag: 3, // 非公開
          insertUser: 1
        };

        mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFile);
        
        mockKnowledgeRepository.findById = jest.fn().mockResolvedValue(mockKnowledge);

        const result = await fileService.getFile(3, mockUser);

        expect(result).not.toBeNull();
        expect(result?.fileNo).toBe(3);
      });

      test('下書きファイルを作成者が取得できる', async () => {
        const mockFile = {
          fileNo: BigInt(4),
          fileName: 'draft.pdf',
          fileBinary: Buffer.from('draft content'),
          fileSize: BigInt(13),
          knowledgeId: null,
          insertUser: 1,
          deleteFlag: 0
        };

        mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFile);

        const result = await fileService.getFile(4, mockUser);

        expect(result).not.toBeNull();
        expect(result?.fileNo).toBe(4);
        expect(result?.fileName).toBe('draft.pdf');
        expect(result?.knowledgeId).toBeUndefined();
      });
    });

    describe('異常系', () => {
      test('存在しないファイルはnullを返す', async () => {
        mockPrisma.knowledgeFile.findUnique.mockResolvedValue(null);

        const result = await fileService.getFile(999, mockUser);

        expect(result).toBeNull();
      });

      test('削除済みファイルはnullを返す', async () => {
        const mockFile = {
          fileNo: BigInt(5),
          fileName: 'deleted.pdf',
          fileBinary: Buffer.from('deleted'),
          fileSize: BigInt(7),
          knowledgeId: BigInt(500),
          insertUser: 1,
          deleteFlag: 1
        };

        mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFile);

        const result = await fileService.getFile(5, mockUser);

        expect(result).toBeNull();
      });

      test('保護ファイルを未認証ユーザーが取得できない', async () => {
        const mockFile = {
          fileNo: BigInt(6),
          fileName: 'protected.pdf',
          fileBinary: Buffer.from('protected'),
          fileSize: BigInt(9),
          knowledgeId: BigInt(600),
          insertUser: 2,
          deleteFlag: 0
        };

        const mockKnowledge = {
          knowledgeId: BigInt(600),
          publicFlag: 2, // 保護
          insertUser: 2
        };

        mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFile);
        
        mockKnowledgeRepository.findById = jest.fn().mockResolvedValue(mockKnowledge);

        const result = await fileService.getFile(6, null);

        expect(result).toBeNull();
      });

      test('非公開ファイルを他ユーザーが取得できない', async () => {
        const mockFile = {
          fileNo: BigInt(7),
          fileName: 'private.pdf',
          fileBinary: Buffer.from('private'),
          fileSize: BigInt(7),
          knowledgeId: BigInt(700),
          insertUser: 2,
          deleteFlag: 0
        };

        const mockKnowledge = {
          knowledgeId: BigInt(700),
          publicFlag: 3, // 非公開
          insertUser: 2
        };

        mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFile);
        
        mockKnowledgeRepository.findById = jest.fn().mockResolvedValue(mockKnowledge);

        const result = await fileService.getFile(7, mockUser);

        expect(result).toBeNull();
      });

      test('下書きファイルを他ユーザーが取得できない', async () => {
        const mockFile = {
          fileNo: BigInt(8),
          fileName: 'draft.pdf',
          fileBinary: Buffer.from('draft'),
          fileSize: BigInt(5),
          knowledgeId: null,
          insertUser: 2,
          deleteFlag: 0
        };

        mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFile);

        const result = await fileService.getFile(8, mockUser);

        expect(result).toBeNull();
      });

      test('DBエラー時はnullを返す', async () => {
        mockPrisma.knowledgeFile.findUnique.mockRejectedValue(new Error('DB Error'));

        const result = await fileService.getFile(1, mockUser);

        expect(result).toBeNull();
      });
    });
  });

  describe('getSlideInfo', () => {
    const mockUser: AuthenticatedUser = {
      userId: 1,
      loginUserId: 'testuser',
      userName: 'Test User',
      mailAddress: 'test@example.com',
      localeKey: 'ja',
      roleAdmin: false,
      isLdapUser: false
    };

    describe('正常系', () => {
      test('PDFファイルのスライド情報を取得できる', async () => {
        const mockFile = {
          fileNo: BigInt(10),
          fileName: 'presentation.pdf',
          fileBinary: Buffer.from('pdf content'),
          fileSize: BigInt(1000),
          knowledgeId: BigInt(1000),
          insertUser: 1,
          deleteFlag: 0
        };

        const mockKnowledge = {
          knowledgeId: BigInt(1000),
          publicFlag: 1,
          insertUser: 1
        };

        mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFile);
        
        mockKnowledgeRepository.findById = jest.fn().mockResolvedValue(mockKnowledge);

        const result = await fileService.getSlideInfo('10', mockUser);

        expect(result).not.toBeNull();
        expect(result?.fileNo).toBe('10');
        expect(result?.fileName).toBe('presentation.pdf');
        expect(result?.totalSlides).toBeGreaterThan(0);
        expect(result?.slides).toHaveLength(result?.totalSlides || 0);
        expect(result?.slides[0]).toHaveProperty('slideNumber', 1);
        expect(result?.slides[0]).toHaveProperty('imageName', 'slide_1.png');
      });

      test('PPTXファイルのスライド情報を取得できる', async () => {
        const mockFile = {
          fileNo: BigInt(11),
          fileName: 'presentation.pptx',
          fileBinary: Buffer.from('pptx content'),
          fileSize: BigInt(2000),
          knowledgeId: BigInt(1100),
          insertUser: 1,
          deleteFlag: 0
        };

        const mockKnowledge = {
          knowledgeId: BigInt(1100),
          publicFlag: 1,
          insertUser: 1
        };

        mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFile);
        
        mockKnowledgeRepository.findById = jest.fn().mockResolvedValue(mockKnowledge);

        const result = await fileService.getSlideInfo('11', mockUser);

        expect(result).not.toBeNull();
        expect(result?.fileName).toBe('presentation.pptx');
      });
    });

    describe('異常系', () => {
      test('非スライドファイルはnullを返す', async () => {
        const mockFile = {
          fileNo: BigInt(12),
          fileName: 'document.txt',
          fileBinary: Buffer.from('text content'),
          fileSize: BigInt(100),
          knowledgeId: BigInt(1200),
          insertUser: 1,
          deleteFlag: 0
        };

        const mockKnowledge = {
          knowledgeId: BigInt(1200),
          publicFlag: 1,
          insertUser: 1
        };

        mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFile);
        
        mockKnowledgeRepository.findById = jest.fn().mockResolvedValue(mockKnowledge);

        const result = await fileService.getSlideInfo('12', mockUser);

        expect(result).toBeNull();
      });

      test('アクセス権限がない場合はnullを返す', async () => {
        const mockFile = {
          fileNo: BigInt(13),
          fileName: 'private.pdf',
          fileBinary: Buffer.from('pdf'),
          fileSize: BigInt(100),
          knowledgeId: BigInt(1300),
          insertUser: 2,
          deleteFlag: 0
        };

        const mockKnowledge = {
          knowledgeId: BigInt(1300),
          publicFlag: 3, // 非公開
          insertUser: 2
        };

        mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFile);
        
        mockKnowledgeRepository.findById = jest.fn().mockResolvedValue(mockKnowledge);

        const result = await fileService.getSlideInfo('13', mockUser);

        expect(result).toBeNull();
      });

      test('エラー時はnullを返す', async () => {
        mockPrisma.knowledgeFile.findUnique.mockRejectedValue(new Error('DB Error'));

        const result = await fileService.getSlideInfo('1', mockUser);

        expect(result).toBeNull();
      });
    });
  });

  describe('getSlideImage', () => {
    const mockUser: AuthenticatedUser = {
      userId: 1,
      loginUserId: 'testuser',
      userName: 'Test User',
      mailAddress: 'test@example.com',
      localeKey: 'ja',
      roleAdmin: false,
      isLdapUser: false
    };

    describe('正常系', () => {
      test('スライド画像を取得できる', async () => {
        const mockFile = {
          fileNo: BigInt(20),
          fileName: 'slides.pdf',
          fileBinary: Buffer.from('pdf'),
          fileSize: BigInt(5000),
          knowledgeId: BigInt(2000),
          insertUser: 1,
          deleteFlag: 0
        };

        const mockKnowledge = {
          knowledgeId: BigInt(2000),
          publicFlag: 1,
          insertUser: 1
        };

        mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFile);
        
        mockKnowledgeRepository.findById = jest.fn().mockResolvedValue(mockKnowledge);

        const result = await fileService.getSlideImage('20', 'slide_1.png', mockUser);

        expect(result).not.toBeNull();
        expect(result?.data).toBeInstanceOf(Buffer);
        expect(result?.contentType).toBe('image/png');
        expect(result?.size).toBeGreaterThan(0);
      });
    });

    describe('異常系', () => {
      test('アクセス権限がない場合はnullを返す', async () => {
        const mockFile = {
          fileNo: BigInt(21),
          fileName: 'private-slides.pdf',
          fileBinary: Buffer.from('pdf'),
          fileSize: BigInt(5000),
          knowledgeId: BigInt(2100),
          insertUser: 2,
          deleteFlag: 0
        };

        const mockKnowledge = {
          knowledgeId: BigInt(2100),
          publicFlag: 3, // 非公開
          insertUser: 2
        };

        mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFile);
        
        mockKnowledgeRepository.findById = jest.fn().mockResolvedValue(mockKnowledge);

        const result = await fileService.getSlideImage('21', 'slide_1.png', mockUser);

        expect(result).toBeNull();
      });

      test('エラー時はnullを返す', async () => {
        mockPrisma.knowledgeFile.findUnique.mockRejectedValue(new Error('DB Error'));

        const result = await fileService.getSlideImage('1', 'slide_1.png', mockUser);

        expect(result).toBeNull();
      });
    });
  });

  describe('createFile', () => {
    describe('正常系', () => {
      test('ファイルを作成できる', async () => {
        const mockCreatedFile = {
          fileNo: BigInt(30),
          fileName: 'new-file.pdf',
          fileBinary: Buffer.from('new content'),
          fileSize: BigInt(11),
          knowledgeId: BigInt(3000),
          insertUser: 1,
          insertDatetime: new Date(),
          updateUser: 1,
          updateDatetime: new Date(),
          deleteFlag: 0,
          parseStatus: 0
        };

        mockPrisma.knowledgeFile.create.mockResolvedValue(mockCreatedFile);

        const result = await fileService.createFile(
          'new-file.pdf',
          Buffer.from('new content'),
          3000,
          1
        );

        expect(result).not.toBeNull();
        expect(result?.fileNo).toBe(30);
        expect(result?.fileName).toBe('new-file.pdf');
        expect(result?.fileBinary).toEqual(Buffer.from('new content'));
        expect(result?.fileSize).toBe(11);
        expect(result?.knowledgeId).toBe(3000);

        expect(mockPrisma.knowledgeFile.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            fileName: 'new-file.pdf',
            fileBinary: Buffer.from('new content'),
            fileSize: 11,
            knowledgeId: BigInt(3000),
            insertUser: 1,
            deleteFlag: 0,
            parseStatus: 0
          })
        });
      });

      test('下書きファイル（knowledgeIdなし）を作成できる', async () => {
        const mockCreatedFile = {
          fileNo: BigInt(31),
          fileName: 'draft-file.pdf',
          fileBinary: Buffer.from('draft'),
          fileSize: BigInt(5),
          knowledgeId: null,
          insertUser: 1,
          insertDatetime: new Date(),
          updateUser: 1,
          updateDatetime: new Date(),
          deleteFlag: 0,
          parseStatus: 0
        };

        mockPrisma.knowledgeFile.create.mockResolvedValue(mockCreatedFile);

        const result = await fileService.createFile(
          'draft-file.pdf',
          Buffer.from('draft'),
          null,
          1
        );

        expect(result).not.toBeNull();
        expect(result?.fileNo).toBe(31);
        expect(result?.knowledgeId).toBeUndefined();
      });
    });

    describe('異常系', () => {
      test('DBエラー時はnullを返す', async () => {
        mockPrisma.knowledgeFile.create.mockRejectedValue(new Error('DB Error'));

        const result = await fileService.createFile(
          'error.pdf',
          Buffer.from('content'),
          4000,
          1
        );

        expect(result).toBeNull();
      });
    });
  });

  describe('deleteFile', () => {
    describe('正常系', () => {
      test('下書きファイルを作成者が削除できる', async () => {
        const mockFile = {
          fileNo: BigInt(40),
          fileName: 'draft.pdf',
          fileBinary: Buffer.from('draft'),
          fileSize: BigInt(5),
          knowledgeId: null,
          insertUser: 1,
          deleteFlag: 0
        };

        mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFile);
        mockPrisma.knowledgeFile.update.mockResolvedValue({
          ...mockFile,
          deleteFlag: 1,
          updateUser: 1,
          updateDatetime: new Date()
        });

        const result = await fileService.deleteFile(40, 1);

        expect(result).toBe(true);
        expect(mockPrisma.knowledgeFile.update).toHaveBeenCalledWith({
          where: { fileNo: BigInt(40) },
          data: {
            deleteFlag: 1,
            updateUser: 1,
            updateDatetime: expect.any(Date)
          }
        });
      });
    });

    describe('異常系', () => {
      test('存在しないファイルは削除できない', async () => {
        mockPrisma.knowledgeFile.findUnique.mockResolvedValue(null);

        const result = await fileService.deleteFile(999, 1);

        expect(result).toBe(false);
        expect(mockPrisma.knowledgeFile.update).not.toHaveBeenCalled();
      });

      test('削除済みファイルは削除できない', async () => {
        const mockFile = {
          fileNo: BigInt(41),
          fileName: 'deleted.pdf',
          fileBinary: Buffer.from('deleted'),
          fileSize: BigInt(7),
          knowledgeId: null,
          insertUser: 1,
          deleteFlag: 1
        };

        mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFile);

        const result = await fileService.deleteFile(41, 1);

        expect(result).toBe(false);
        expect(mockPrisma.knowledgeFile.update).not.toHaveBeenCalled();
      });

      test('下書きファイルを他ユーザーが削除できない', async () => {
        const mockFile = {
          fileNo: BigInt(42),
          fileName: 'draft.pdf',
          fileBinary: Buffer.from('draft'),
          fileSize: BigInt(5),
          knowledgeId: null,
          insertUser: 2,
          deleteFlag: 0
        };

        mockPrisma.knowledgeFile.findUnique.mockResolvedValue(mockFile);

        const result = await fileService.deleteFile(42, 1);

        expect(result).toBe(false);
        expect(mockPrisma.knowledgeFile.update).not.toHaveBeenCalled();
      });

      test('DBエラー時はfalseを返す', async () => {
        mockPrisma.knowledgeFile.findUnique.mockRejectedValue(new Error('DB Error'));

        const result = await fileService.deleteFile(1, 1);

        expect(result).toBe(false);
      });
    });
  });
});