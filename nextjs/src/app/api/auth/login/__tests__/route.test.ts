/**
 * 認証APIエンドポイントテスト
 * 
 * @description /api/auth/loginのテストケース
 */
import { NextRequest } from 'next/server';
import { POST } from '../route';
import { findUserByLoginId, getUserPassword, updateLastLoginTime } from '@/repositories/userRepository';
import { verifyPassword } from '@/lib/auth/password';

// モック
jest.mock('@/repositories/userRepository');
jest.mock('@/lib/auth/password');

const mockFindUserByLoginId = findUserByLoginId as jest.Mock;
const mockGetUserPassword = getUserPassword as jest.Mock;
const mockUpdateLastLoginTime = updateLastLoginTime as jest.Mock;
const mockVerifyPassword = verifyPassword as jest.Mock;

describe('/api/auth/login POST', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('有効な認証情報でログイン成功', async () => {
    // モックデータ設定
    const mockUser = {
      userId: 1,
      userName: 'テストユーザー',
      userKey: 'testuser',
      localeKey: 'ja',
      roleFlag: 0,
    };

    const mockPasswordInfo = {
      password: 'hashed_password',
      salt: 'test_salt',
    };

    mockFindUserByLoginId.mockResolvedValue(mockUser);
    mockGetUserPassword.mockResolvedValue(mockPasswordInfo);
    mockVerifyPassword.mockResolvedValue(true);
    mockUpdateLastLoginTime.mockResolvedValue(undefined);

    // リクエスト作成
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        loginId: 'testuser',
        password: 'password123',
      }),
    });

    // テスト実行
    const response = await POST(request);
    const data = await response.json();

    // 検証
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user).toEqual({
      userId: 1,
      userName: 'テストユーザー',
      userKey: 'testuser',
      locale: 'ja',
      role: 'user',
      unreadCount: 0,
    });

    expect(mockFindUserByLoginId).toHaveBeenCalledWith('testuser');
    expect(mockGetUserPassword).toHaveBeenCalledWith(1);
    expect(mockVerifyPassword).toHaveBeenCalledWith('password123', 'hashed_password', 'test_salt');
    expect(mockUpdateLastLoginTime).toHaveBeenCalledWith(1);
  });

  test('ログインIDが空の場合エラー', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        loginId: '',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('ログインIDとパスワードを入力してください');
  });

  test('パスワードが空の場合エラー', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        loginId: 'testuser',
        password: '',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('ログインIDとパスワードを入力してください');
  });

  test('存在しないユーザーの場合エラー', async () => {
    mockFindUserByLoginId.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        loginId: 'nonexistent',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('ログインIDまたはパスワードが正しくありません');
  });

  test('パスワードが間違っている場合エラー', async () => {
    const mockUser = {
      userId: 1,
      userName: 'テストユーザー',
      userKey: 'testuser',
      localeKey: 'ja',
      roleFlag: 0,
    };

    const mockPasswordInfo = {
      password: 'hashed_password',
      salt: 'test_salt',
    };

    mockFindUserByLoginId.mockResolvedValue(mockUser);
    mockGetUserPassword.mockResolvedValue(mockPasswordInfo);
    mockVerifyPassword.mockResolvedValue(false);

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        loginId: 'testuser',
        password: 'wrongpassword',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('ログインIDまたはパスワードが正しくありません');
  });

  test('管理者権限のユーザーログイン', async () => {
    const mockUser = {
      userId: 1,
      userName: '管理者',
      userKey: 'admin',
      localeKey: 'ja',
      roleFlag: 1, // 管理者フラグ
    };

    const mockPasswordInfo = {
      password: 'hashed_password',
      salt: 'test_salt',
    };

    mockFindUserByLoginId.mockResolvedValue(mockUser);
    mockGetUserPassword.mockResolvedValue(mockPasswordInfo);
    mockVerifyPassword.mockResolvedValue(true);
    mockUpdateLastLoginTime.mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        loginId: 'admin',
        password: 'adminpass',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user.role).toBe('admin');
  });

  test('データベースエラーの場合', async () => {
    mockFindUserByLoginId.mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        loginId: 'testuser',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('ログイン処理中にエラーが発生しました');
  });

  test('パスワード情報が取得できない場合', async () => {
    const mockUser = {
      userId: 1,
      userName: 'テストユーザー',
      userKey: 'testuser',
      localeKey: 'ja',
      roleFlag: 0,
    };

    mockFindUserByLoginId.mockResolvedValue(mockUser);
    mockGetUserPassword.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        loginId: 'testuser',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('パスワード情報が見つかりません');
  });

  test('localeKeyがnullの場合はデフォルト値ja', async () => {
    const mockUser = {
      userId: 1,
      userName: 'テストユーザー',
      userKey: 'testuser',
      localeKey: null,
      roleFlag: 0,
    };

    const mockPasswordInfo = {
      password: 'hashed_password',
      salt: 'test_salt',
    };

    mockFindUserByLoginId.mockResolvedValue(mockUser);
    mockGetUserPassword.mockResolvedValue(mockPasswordInfo);
    mockVerifyPassword.mockResolvedValue(true);
    mockUpdateLastLoginTime.mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        loginId: 'testuser',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user.locale).toBe('ja');
  });

  test('不正なJSONボディの場合', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: 'invalid json',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('ログイン処理中にエラーが発生しました');
  });
});