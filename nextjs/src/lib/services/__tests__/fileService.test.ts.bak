/**
 * FileServiceテスト
 * 
 * @description ファイルサービスの単体テスト
 */
import { FileService } from '../fileService';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

// モック設定
jest.mock('fs/promises');
jest.mock('sharp');

describe('FileService', () => {
  let service: FileService;
  const mockFs = fs as jest.Mocked<typeof fs>;
  const mockSharp = sharp as jest.MockedFunction<typeof sharp>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FileService();
  });

  describe('saveUploadedFile', () => {
    const mockFile = {
      fieldname: 'file',
      originalname: 'test.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      destination: '/tmp',
      filename: 'temp123.txt',
      path: '/tmp/temp123.txt',
      size: 1024,
      stream: {} as any,
      buffer: Buffer.from('test content'),
    };

    test('ファイルを正しく保存できる', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.copyFile.mockResolvedValue(undefined);
      mockFs.unlink.mockResolvedValue(undefined);
      mockFs.stat.mockResolvedValue({ size: 1024 } as any);

      const result = await service.saveUploadedFile(mockFile, 'knowledge', 1);

      expect(result).toEqual({
        fileName: expect.stringMatching(/^\d{8}_\d{6}_.*test\.txt$/),
        realFileName: path.join(process.cwd(), 'uploads', 'knowledge', '1', expect.any(String)),
        size: 1024,
        fileNo: expect.any(Number),
      });

      expect(mockFs.mkdir).toHaveBeenCalled();
      expect(mockFs.copyFile).toHaveBeenCalled();
      expect(mockFs.unlink).toHaveBeenCalled();
    });

    test('ディレクトリ作成に失敗した場合エラーをスロー', async () => {
      mockFs.mkdir.mockRejectedValue(new Error('Permission denied'));

      await expect(service.saveUploadedFile(mockFile, 'knowledge', 1))
        .rejects.toThrow('Permission denied');
    });

    test('一時ファイルが存在しない場合エラーをスロー', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.copyFile.mockRejectedValue(new Error('File not found'));

      await expect(service.saveUploadedFile(mockFile, 'knowledge', 1))
        .rejects.toThrow('File not found');
    });
  });

  describe('getFileInfo', () => {
    test('ファイル情報を正しく取得できる', async () => {
      const testFilePath = '/test/file.txt';
      mockFs.stat.mockResolvedValue({
        size: 2048,
        isFile: () => true,
        isDirectory: () => false,
        birthtime: new Date('2024-01-01'),
        mtime: new Date('2024-01-02'),
      } as any);

      const result = await service.getFileInfo(testFilePath);

      expect(result).toEqual({
        exists: true,
        size: 2048,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      });
    });

    test('ファイルが存在しない場合', async () => {
      mockFs.stat.mockRejectedValue({ code: 'ENOENT' });

      const result = await service.getFileInfo('/nonexistent/file.txt');

      expect(result).toEqual({
        exists: false,
        size: 0,
      });
    });
  });

  describe('deleteFile', () => {
    test('ファイルを正しく削除できる', async () => {
      mockFs.unlink.mockResolvedValue(undefined);

      await expect(service.deleteFile('/test/file.txt'))
        .resolves.not.toThrow();

      expect(mockFs.unlink).toHaveBeenCalledWith('/test/file.txt');
    });

    test('ファイルが存在しない場合は無視する', async () => {
      mockFs.unlink.mockRejectedValue({ code: 'ENOENT' });

      await expect(service.deleteFile('/nonexistent/file.txt'))
        .resolves.not.toThrow();
    });

    test('その他のエラーは再スロー', async () => {
      mockFs.unlink.mockRejectedValue(new Error('Permission denied'));

      await expect(service.deleteFile('/test/file.txt'))
        .rejects.toThrow('Permission denied');
    });
  });

  describe('generateThumbnail', () => {
    test('サムネイルを正しく生成できる', async () => {
      const mockSharpInstance = {
        resize: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue(undefined),
      };
      mockSharp.mockReturnValue(mockSharpInstance as any);

      const result = await service.generateThumbnail(
        '/test/image.jpg',
        '/test/thumb.jpg',
        { width: 200, height: 150 }
      );

      expect(result).toBe('/test/thumb.jpg');
      expect(mockSharp).toHaveBeenCalledWith('/test/image.jpg');
      expect(mockSharpInstance.resize).toHaveBeenCalledWith(200, 150, {
        fit: 'inside',
        withoutEnlargement: true,
      });
      expect(mockSharpInstance.toFile).toHaveBeenCalledWith('/test/thumb.jpg');
    });

    test('画像処理に失敗した場合エラーをスロー', async () => {
      mockSharp.mockImplementation(() => {
        throw new Error('Invalid image format');
      });

      await expect(service.generateThumbnail('/test/invalid.jpg', '/test/thumb.jpg'))
        .rejects.toThrow('Invalid image format');
    });
  });

  describe('validateFile', () => {
    test('有効なファイルの場合trueを返す', () => {
      const validFile = {
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
      };

      const result = service.validateFile(validFile as any, {
        allowedMimeTypes: ['image/jpeg', 'image/png'],
        maxSize: 5 * 1024 * 1024, // 5MB
      });

      expect(result).toEqual({ valid: true });
    });

    test('MIMEタイプが許可されていない場合', () => {
      const invalidFile = {
        mimetype: 'application/exe',
        size: 1024,
      };

      const result = service.validateFile(invalidFile as any, {
        allowedMimeTypes: ['image/jpeg', 'image/png'],
      });

      expect(result).toEqual({
        valid: false,
        error: 'Invalid file type',
      });
    });

    test('ファイルサイズが大きすぎる場合', () => {
      const largeFile = {
        mimetype: 'image/jpeg',
        size: 10 * 1024 * 1024, // 10MB
      };

      const result = service.validateFile(largeFile as any, {
        maxSize: 5 * 1024 * 1024, // 5MB
      });

      expect(result).toEqual({
        valid: false,
        error: 'File size exceeds limit',
      });
    });

    test('オプションが指定されない場合は常に有効', () => {
      const anyFile = {
        mimetype: 'any/type',
        size: 999999999,
      };

      const result = service.validateFile(anyFile as any, {});

      expect(result).toEqual({ valid: true });
    });
  });

  describe('getUploadDirectory', () => {
    test('アップロードディレクトリパスを正しく生成', () => {
      const result = service.getUploadDirectory('knowledge', 123);

      expect(result).toBe(path.join(process.cwd(), 'uploads', 'knowledge', '123'));
    });

    test('カテゴリなしの場合', () => {
      const result = service.getUploadDirectory();

      expect(result).toBe(path.join(process.cwd(), 'uploads'));
    });

    test('カテゴリのみの場合', () => {
      const result = service.getUploadDirectory('temp');

      expect(result).toBe(path.join(process.cwd(), 'uploads', 'temp'));
    });
  });

  describe('sanitizeFileName', () => {
    test('安全なファイル名はそのまま返す', () => {
      const result = service.sanitizeFileName('test-file_123.txt');

      expect(result).toBe('test-file_123.txt');
    });

    test('危険な文字を置換する', () => {
      const result = service.sanitizeFileName('../../../etc/passwd');

      expect(result).toBe('_________etc_passwd');
    });

    test('日本語ファイル名も処理できる', () => {
      const result = service.sanitizeFileName('テスト<ファイル>.txt');

      expect(result).toBe('テスト_ファイル_.txt');
    });

    test('空のファイル名の場合デフォルト値を返す', () => {
      const result = service.sanitizeFileName('');

      expect(result).toBe('unnamed');
    });
  });

  describe('getMimeType', () => {
    test('一般的な拡張子のMIMEタイプを返す', () => {
      expect(service.getMimeType('test.jpg')).toBe('image/jpeg');
      expect(service.getMimeType('test.png')).toBe('image/png');
      expect(service.getMimeType('test.pdf')).toBe('application/pdf');
      expect(service.getMimeType('test.txt')).toBe('text/plain');
    });

    test('不明な拡張子の場合デフォルトを返す', () => {
      expect(service.getMimeType('test.xyz')).toBe('application/octet-stream');
    });

    test('拡張子がない場合デフォルトを返す', () => {
      expect(service.getMimeType('noextension')).toBe('application/octet-stream');
    });

    test('大文字の拡張子も処理できる', () => {
      expect(service.getMimeType('test.JPG')).toBe('image/jpeg');
      expect(service.getMimeType('test.PDF')).toBe('application/pdf');
    });
  });
});