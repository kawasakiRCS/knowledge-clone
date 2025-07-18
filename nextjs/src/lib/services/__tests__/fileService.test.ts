/**
 * fileServiceテスト
 * 
 * @description ファイルサービスのビジネスロジックテスト
 */
import { fileService } from '../fileService';
import { db } from '../../db';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// モック設定
jest.mock('../../db');
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

describe('fileService', () => {
  const mockDb = db as jest.MockedObject<typeof db>;
  const mockS3Client = S3Client as jest.MockedClass<typeof S3Client>;
  const mockGetSignedUrl = getSignedUrl as jest.MockedFunction<typeof getSignedUrl>;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AWS_REGION = 'ap-northeast-1';
    process.env.S3_BUCKET_NAME = 'test-bucket';
    process.env.AWS_ACCESS_KEY_ID = 'test-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
  });

  describe('uploadFile', () => {
    const mockFile = {
      buffer: Buffer.from('test file content'),
      originalname: 'test.txt',
      mimetype: 'text/plain',
      size: 1024,
    } as Express.Multer.File;

    test('ファイルをアップロードできる', async () => {
      const mockS3Instance = {
        send: jest.fn().mockResolvedValue({}),
      };
      mockS3Client.prototype.send = mockS3Instance.send;

      mockDb.query.mockResolvedValue({
        rows: [{ fileId: 1 }],
      } as any);

      const result = await fileService.uploadFile(mockDb, mockFile, 'user1', 1);

      expect(mockS3Instance.send).toHaveBeenCalledWith(
        expect.any(PutObjectCommand)
      );
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO files'),
        expect.arrayContaining(['test.txt', 'text/plain', 1024])
      );
      expect(result).toBe(1);
    });

    test('S3アップロードエラーをハンドリング', async () => {
      const mockS3Instance = {
        send: jest.fn().mockRejectedValue(new Error('S3 Error')),
      };
      mockS3Client.prototype.send = mockS3Instance.send;

      await expect(
        fileService.uploadFile(mockDb, mockFile, 'user1', 1)
      ).rejects.toThrow('S3 Error');
    });

    test('ファイルサイズ制限を超えた場合エラー', async () => {
      const largeFile = {
        ...mockFile,
        size: 100 * 1024 * 1024, // 100MB
      } as Express.Multer.File;

      await expect(
        fileService.uploadFile(mockDb, largeFile, 'user1', 1)
      ).rejects.toThrow('File size exceeds limit');
    });
  });

  describe('deleteFile', () => {
    test('ファイルを削除できる', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{ 
          fileId: 1,
          fileName: 'test.txt',
          s3Key: 'files/1/test.txt',
          userId: 'user1',
        }],
      } as any);

      const mockS3Instance = {
        send: jest.fn().mockResolvedValue({}),
      };
      mockS3Client.prototype.send = mockS3Instance.send;

      mockDb.query.mockResolvedValueOnce({
        rows: [],
      } as any);

      const result = await fileService.deleteFile(mockDb, 1, 'user1');

      expect(mockS3Instance.send).toHaveBeenCalledWith(
        expect.any(DeleteObjectCommand)
      );
      expect(mockDb.query).toHaveBeenNthCalledWith(2,
        expect.stringContaining('DELETE FROM files'),
        [1]
      );
      expect(result).toBe(true);
    });

    test('ファイルが存在しない場合falseを返す', async () => {
      mockDb.query.mockResolvedValue({
        rows: [],
      } as any);

      const result = await fileService.deleteFile(mockDb, 999, 'user1');

      expect(result).toBe(false);
    });

    test('権限がない場合falseを返す', async () => {
      mockDb.query.mockResolvedValue({
        rows: [{
          fileId: 1,
          fileName: 'test.txt',
          s3Key: 'files/1/test.txt',
          userId: 'otheruser',
        }],
      } as any);

      const result = await fileService.deleteFile(mockDb, 1, 'wronguser');

      expect(result).toBe(false);
    });
  });

  describe('getFile', () => {
    test('ファイル情報を取得できる', async () => {
      const mockFile = {
        fileId: 1,
        fileName: 'test.txt',
        mimeType: 'text/plain',
        fileSize: 1024,
        s3Key: 'files/1/test.txt',
        uploadDate: '2024-01-15T10:00:00',
        userId: 'user1',
      };

      mockDb.query.mockResolvedValue({
        rows: [mockFile],
      } as any);

      const result = await fileService.getFile(mockDb, 1);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [1]
      );
      expect(result).toEqual(mockFile);
    });

    test('ファイルが存在しない場合nullを返す', async () => {
      mockDb.query.mockResolvedValue({
        rows: [],
      } as any);

      const result = await fileService.getFile(mockDb, 999);

      expect(result).toBeNull();
    });
  });

  describe('getFilesByKnowledge', () => {
    test('ナレッジに関連するファイルを取得できる', async () => {
      const mockFiles = [
        {
          fileId: 1,
          fileName: 'doc1.pdf',
          mimeType: 'application/pdf',
          fileSize: 2048,
        },
        {
          fileId: 2,
          fileName: 'image.png',
          mimeType: 'image/png',
          fileSize: 4096,
        },
      ];

      mockDb.query.mockResolvedValue({
        rows: mockFiles,
      } as any);

      const result = await fileService.getFilesByKnowledge(mockDb, 1);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('JOIN knowledge_files'),
        [1]
      );
      expect(result).toEqual(mockFiles);
    });

    test('ファイルがない場合空配列を返す', async () => {
      mockDb.query.mockResolvedValue({
        rows: [],
      } as any);

      const result = await fileService.getFilesByKnowledge(mockDb, 999);

      expect(result).toEqual([]);
    });
  });

  describe('generatePresignedUrl', () => {
    test('署名付きURLを生成できる', async () => {
      mockDb.query.mockResolvedValue({
        rows: [{
          fileId: 1,
          s3Key: 'files/1/test.txt',
          fileName: 'test.txt',
        }],
      } as any);

      mockGetSignedUrl.mockResolvedValue('https://test-bucket.s3.amazonaws.com/signed-url');

      const result = await fileService.generatePresignedUrl(mockDb, 1);

      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.any(S3Client),
        expect.any(GetObjectCommand),
        { expiresIn: 3600 }
      );
      expect(result).toBe('https://test-bucket.s3.amazonaws.com/signed-url');
    });

    test('ファイルが存在しない場合nullを返す', async () => {
      mockDb.query.mockResolvedValue({
        rows: [],
      } as any);

      const result = await fileService.generatePresignedUrl(mockDb, 999);

      expect(result).toBeNull();
    });

    test('カスタム有効期限を設定できる', async () => {
      mockDb.query.mockResolvedValue({
        rows: [{
          fileId: 1,
          s3Key: 'files/1/test.txt',
          fileName: 'test.txt',
        }],
      } as any);

      mockGetSignedUrl.mockResolvedValue('https://test-bucket.s3.amazonaws.com/signed-url');

      await fileService.generatePresignedUrl(mockDb, 1, 7200);

      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.any(S3Client),
        expect.any(GetObjectCommand),
        { expiresIn: 7200 }
      );
    });
  });

  describe('validateFile', () => {
    test('有効なファイルを受け入れる', () => {
      const validFile = {
        mimetype: 'image/jpeg',
        size: 5 * 1024 * 1024, // 5MB
      } as Express.Multer.File;

      expect(() => fileService.validateFile(validFile)).not.toThrow();
    });

    test('許可されていないMIMEタイプを拒否', () => {
      const invalidFile = {
        mimetype: 'application/x-executable',
        size: 1024,
      } as Express.Multer.File;

      expect(() => fileService.validateFile(invalidFile)).toThrow('File type not allowed');
    });

    test('大きすぎるファイルを拒否', () => {
      const largeFile = {
        mimetype: 'image/jpeg',
        size: 100 * 1024 * 1024, // 100MB
      } as Express.Multer.File;

      expect(() => fileService.validateFile(largeFile)).toThrow('File size exceeds limit');
    });
  });

  describe('attachFileToKnowledge', () => {
    test('ファイルをナレッジに添付できる', async () => {
      mockDb.query.mockResolvedValue({
        rows: [],
      } as any);

      const result = await fileService.attachFileToKnowledge(mockDb, 1, 1);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO knowledge_files'),
        [1, 1]
      );
      expect(result).toBe(true);
    });

    test('エラー時はfalseを返す', async () => {
      mockDb.query.mockRejectedValue(new Error('DB Error'));

      const result = await fileService.attachFileToKnowledge(mockDb, 1, 1);

      expect(result).toBe(false);
    });
  });

  describe('detachFileFromKnowledge', () => {
    test('ファイルをナレッジから切り離せる', async () => {
      mockDb.query.mockResolvedValue({
        rows: [],
      } as any);

      const result = await fileService.detachFileFromKnowledge(mockDb, 1, 1);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM knowledge_files'),
        [1, 1]
      );
      expect(result).toBe(true);
    });
  });

  describe('getFileStats', () => {
    test('ファイル統計を取得できる', async () => {
      mockDb.query.mockResolvedValue({
        rows: [{
          totalFiles: 100,
          totalSize: 1073741824, // 1GB
          averageSize: 10737418,
          largestFile: 104857600,
        }],
      } as any);

      const result = await fileService.getFileStats(mockDb, 'user1');

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('COUNT'),
        ['user1']
      );
      expect(result).toEqual({
        totalFiles: 100,
        totalSize: 1073741824,
        averageSize: 10737418,
        largestFile: 104857600,
      });
    });

    test('ファイルがない場合ゼロの統計を返す', async () => {
      mockDb.query.mockResolvedValue({
        rows: [{
          totalFiles: 0,
          totalSize: 0,
          averageSize: 0,
          largestFile: 0,
        }],
      } as any);

      const result = await fileService.getFileStats(mockDb, 'newuser');

      expect(result.totalFiles).toBe(0);
    });
  });

  describe('cleanupOrphanedFiles', () => {
    test('孤立したファイルをクリーンアップできる', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [
          { fileId: 1, s3Key: 'files/1/orphaned1.txt' },
          { fileId: 2, s3Key: 'files/2/orphaned2.txt' },
        ],
      } as any);

      const mockS3Instance = {
        send: jest.fn().mockResolvedValue({}),
      };
      mockS3Client.prototype.send = mockS3Instance.send;

      mockDb.query.mockResolvedValueOnce({
        rows: [],
      } as any);

      const result = await fileService.cleanupOrphanedFiles(mockDb);

      expect(mockS3Instance.send).toHaveBeenCalledTimes(2);
      expect(mockDb.query).toHaveBeenNthCalledWith(2,
        expect.stringContaining('DELETE FROM files'),
        expect.arrayContaining([1, 2])
      );
      expect(result).toBe(2);
    });

    test('孤立したファイルがない場合0を返す', async () => {
      mockDb.query.mockResolvedValue({
        rows: [],
      } as any);

      const result = await fileService.cleanupOrphanedFiles(mockDb);

      expect(result).toBe(0);
    });
  });
});