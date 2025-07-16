/**
 * 認証フックテスト
 * 
 * @description useAuthフックのテストケース
 */
import { describe, test, expect, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { useAuth } from '../useAuth';

// next-auth/reactのモック
const mockUseSession = jest.fn();

jest.doMock('next-auth/react', () => ({
  useSession: mockUseSession,
}));

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
        email: 'testuser@knowledge.local',
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
        email: 'admin@knowledge.local',
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
});