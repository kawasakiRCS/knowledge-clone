/**
 * 認証フックテスト
 * 
 * @description useAuthフックのテストケース
 */
import { renderHook } from '@testing-library/react';

// モック解除は不要（存在しないパスのため）

// next-auth/reactのモック - importの前にモックを設定
const mockUseSession = jest.fn();
jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}));

// useAuthのインポート - モック設定後
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  test('ローディング状態', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current).toEqual({
      isLoggedIn: false,
      user: null,
      unreadCount: 0,
      loading: true,
    });
  });

  test('未認証状態', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current).toEqual({
      isLoggedIn: false,
      user: null,
      unreadCount: 0,
      loading: false,
    });
  });

  test('認証済み状態（一般ユーザー）', () => {
    const mockSession = {
      user: {
        userId: 1,
        userName: 'テストユーザー',
        userKey: 'testuser',
        role: 'user',
        unreadCount: 5,
      },
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current).toEqual({
      isLoggedIn: true,
      user: {
        id: 1,
        name: 'テストユーザー',
        email: 'テストユーザー@knowledge.local',
        isAdmin: false,
        icon: undefined,
      },
      unreadCount: 5,
      loading: false,
    });
  });

  test('認証済み状態（管理者ユーザー）', () => {
    const mockSession = {
      user: {
        userId: 2,
        userName: '管理者',
        userKey: 'admin',
        role: 'admin',
        unreadCount: 0,
      },
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current).toEqual({
      isLoggedIn: true,
      user: {
        id: 2,
        name: '管理者',
        email: '管理者@knowledge.local',
        isAdmin: true,
        icon: undefined,
      },
      unreadCount: 0,
      loading: false,
    });
  });

  test('セッションデータが不正な場合は未認証として扱う', () => {
    const mockSession = {
      user: {
        // userIdが存在しない不正なデータ
        name: 'Invalid User',
      },
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current).toEqual({
      isLoggedIn: false,
      user: null,
      unreadCount: 0,
      loading: false,
    });
  });

  test('未読数が未設定の場合は0として扱う', () => {
    const mockSession = {
      user: {
        userId: 1,
        userName: 'テストユーザー',
        userKey: 'testuser',
        role: 'user',
        // unreadCountが未設定
      },
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.unreadCount).toBe(0);
  });

  test('不明なステータスの場合は未認証として扱う', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unknown' as any,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current).toEqual({
      isLoggedIn: false,
      user: null,
      unreadCount: 0,
      loading: false,
    });
  });

  test('ロールが管理者でも一般ユーザーでもない場合', () => {
    const mockSession = {
      user: {
        userId: 3,
        userName: '特殊ユーザー',
        userKey: 'special',
        role: 'guest',
        unreadCount: 2,
      },
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current).toEqual({
      isLoggedIn: true,
      user: {
        id: 3,
        name: '特殊ユーザー',
        email: '特殊ユーザー@knowledge.local',
        isAdmin: false, // admin以外はすべてfalse
        icon: undefined,
      },
      unreadCount: 2,
      loading: false,
    });
  });

  test('userIdが0の場合', () => {
    const mockSession = {
      user: {
        userId: 0,
        userName: 'ゼロユーザー',
        userKey: 'zero',
        role: 'user',
        unreadCount: 0,
      },
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current).toEqual({
      isLoggedIn: true,
      user: {
        id: 0,
        name: 'ゼロユーザー',
        email: 'ゼロユーザー@knowledge.local',
        isAdmin: false,
        icon: undefined,
      },
      unreadCount: 0,
      loading: false,
    });
  });

  test('ユーザー名が空文字列の場合', () => {
    const mockSession = {
      user: {
        userId: 4,
        userName: '',
        userKey: 'empty',
        role: 'user',
        unreadCount: 1,
      },
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current).toEqual({
      isLoggedIn: true,
      user: {
        id: 4,
        name: '',
        email: '@knowledge.local',
        isAdmin: false,
        icon: undefined,
      },
      unreadCount: 1,
      loading: false,
    });
  });

  test('セッションかnullでステータスおauthenticatedの場合', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'authenticated',
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current).toEqual({
      isLoggedIn: false,
      user: null,
      unreadCount: 0,
      loading: false,
    });
  });

  test('マイナスの未読数が設定されている場合', () => {
    const mockSession = {
      user: {
        userId: 5,
        userName: 'マイナスユーザー',
        userKey: 'negative',
        role: 'user',
        unreadCount: -5,
      },
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.unreadCount).toBe(-5); // マイナス値もそのまま返す
  });
});