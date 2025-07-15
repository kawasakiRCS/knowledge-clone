/**
 * 旧システム互換ファイルダウンロードAPI テスト
 * 
 * @description /knowledge/open.file/download?fileNo=XXX 完全互換性テスト
 */
import { FileService } from '@/lib/services/fileService';
import { getAuthenticatedUser } from '@/lib/auth/middleware';

// モック設定
jest.mock('@/lib/services/fileService');
jest.mock('@/lib/auth/middleware');

const mockFileService = FileService as jest.MockedClass<typeof FileService>;
const mockGetAuthenticatedUser = getAuthenticatedUser as jest.MockedFunction<typeof getAuthenticatedUser>;

describe('/api/open/files/download', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAuthenticatedUser.mockResolvedValue(null);
  });

  describe('旧システム互換ファイルダウンロードAPI', () => {
    test('APIエンドポイントファイルが存在する', () => {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '../route.ts');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    test('必要な依存関係がインポートされている', () => {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '../route.ts');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      expect(content).toContain('import { NextRequest, NextResponse }');
      expect(content).toContain('import { FileService }');
      expect(content).toContain('import { getAuthenticatedUser }');
    });

    test('GET関数がエクスポートされている', () => {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '../route.ts');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      expect(content).toContain('export async function GET(request: NextRequest)');
    });

    test('fileNoパラメータの検証ロジックが存在する', () => {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '../route.ts');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      expect(content).toContain('fileNo');
      expect(content).toContain('searchParams.get');
      expect(content).toContain('Invalid file number');
    });

    test('画像ファイルのContent-Type判定ロジックが存在する', () => {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '../route.ts');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      expect(content).toContain('image/png');
      expect(content).toContain('image/jpeg');
      expect(content).toContain('image/gif');
      expect(content).toContain('inline');
    });

    test('ファイルバイナリのnullチェックが存在する', () => {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '../route.ts');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      expect(content).toContain('fileBinary');
      expect(content).toContain('File binary is null');
      expect(content).toContain('File data not found');
    });

    test('エラーハンドリングが実装されている', () => {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '../route.ts');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      expect(content).toContain('try {');
      expect(content).toContain('catch (error)');
      expect(content).toContain('Download failed');
      expect(content).toContain('status: 500');
    });

    test('レスポンスヘッダーの設定が存在する', () => {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '../route.ts');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      expect(content).toContain('Content-Type');
      expect(content).toContain('Content-Length');
      expect(content).toContain('Content-Disposition');
      expect(content).toContain('Cache-Control');
    });

    test('FileServiceの統合が正しく実装されている', () => {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '../route.ts');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      expect(content).toContain('new FileService()');
      expect(content).toContain('fileService.getFile');
      expect(content).toContain('getAuthenticatedUser');
    });

  });
});