/**
 * NextAuth APIルートテスト
 * 
 * @description NextAuthの認証エンドポイントのテスト
 */
import { GET, POST } from '../route';
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

// NextAuthをモック
jest.mock('next-auth');
jest.mock('@/lib/auth/authOptions', () => ({
  authOptions: {
    providers: [],
    callbacks: {},
    pages: {},
  },
}));

describe('NextAuth API Route', () => {
  let mockHandler: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // NextAuthのモックハンドラー
    mockHandler = jest.fn();
    (NextAuth as jest.Mock).mockReturnValue(mockHandler);
  });

  describe('ルート設定', () => {
    test('NextAuthが正しいオプションで初期化される', () => {
      // モジュールを再読み込みして初期化を実行
      jest.resetModules();
      require('../route');

      expect(NextAuth).toHaveBeenCalledTimes(1);
      expect(NextAuth).toHaveBeenCalledWith(authOptions);
    });
  });

  describe('エクスポート', () => {
    test('GETハンドラーがエクスポートされる', () => {
      expect(GET).toBeDefined();
      expect(GET).toBe(mockHandler);
    });

    test('POSTハンドラーがエクスポートされる', () => {
      expect(POST).toBeDefined();
      expect(POST).toBe(mockHandler);
    });

    test('GETとPOSTが同じハンドラーを使用', () => {
      expect(GET).toBe(POST);
    });
  });

  describe('ハンドラー動作', () => {
    test('GETリクエストがハンドラーに転送される', async () => {
      const mockRequest = new Request('http://localhost:3000/api/auth/signin');
      const mockResponse = new Response();
      
      mockHandler.mockResolvedValue(mockResponse);

      const result = await GET(mockRequest);

      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(mockHandler).toHaveBeenCalledWith(mockRequest);
      expect(result).toBe(mockResponse);
    });

    test('POSTリクエストがハンドラーに転送される', async () => {
      const mockRequest = new Request('http://localhost:3000/api/auth/callback/credentials', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
      });
      const mockResponse = new Response();
      
      mockHandler.mockResolvedValue(mockResponse);

      const result = await POST(mockRequest);

      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(mockHandler).toHaveBeenCalledWith(mockRequest);
      expect(result).toBe(mockResponse);
    });
  });

  describe('エラーハンドリング', () => {
    test('ハンドラーのエラーが伝播される', async () => {
      const mockError = new Error('Authentication failed');
      mockHandler.mockRejectedValue(mockError);

      const mockRequest = new Request('http://localhost:3000/api/auth/signin');

      await expect(GET(mockRequest)).rejects.toThrow('Authentication failed');
    });
  });
});