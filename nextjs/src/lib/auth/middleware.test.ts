/**
 * 認証ミドルウェア テスト
 * 
 * @description TDD - 認証・権限システムの網羅テスト
 */
import { getAuthenticatedUser, canEditKnowledge, canDeleteKnowledge, canAccessKnowledge, AuthenticatedUser } from './middleware';

// Prismaクライアントのモック
jest.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    }
  }
}));

// テスト用のモックデータ
const mockUser: AuthenticatedUser = {
  userId: 1,
  userName: 'testuser',
  userKey: 'testkey',
  isAdmin: false,
  groups: [
    { groupId: 1, groupName: 'Test Group' }
  ]
};

const mockAdminUser: AuthenticatedUser = {
  userId: 2,
  userName: 'admin',
  userKey: 'adminkey',
  isAdmin: true,
  groups: []
};

const mockKnowledge = {
  knowledgeId: 1,
  title: 'Test Knowledge',
  insertUser: 1,
  publicFlag: 1,
  deleteFlag: 0
};

describe('Authentication Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuthenticatedUser', () => {
    test('should return null for unauthenticated request', async () => {
      const mockRequest = {
        headers: { get: jest.fn().mockReturnValue(null) },
        cookies: { get: jest.fn().mockReturnValue(null) }
      } as any;

      const result = await getAuthenticatedUser(mockRequest);
      expect(result).toBeNull();
    });

    test('should return user for valid Authorization header', async () => {
      const { prisma } = require('@/lib/db/prisma');
      
      prisma.user.findUnique.mockResolvedValue({
        userId: 1,
        userName: 'testuser',
        userKey: 'testkey',
        level: 0,
        deleteFlag: 0,
        userGroups: [
          {
            group: {
              groupId: 1,
              groupName: 'Test Group'
            }
          }
        ]
      });

      const mockRequest = {
        headers: { get: jest.fn().mockReturnValue('Bearer user-1') },
        cookies: { get: jest.fn().mockReturnValue(null) }
      } as any;

      const result = await getAuthenticatedUser(mockRequest);
      
      expect(result).toEqual({
        userId: 1,
        userName: 'testuser',
        userKey: 'testkey',
        isAdmin: false,
        groups: [{ groupId: 1, groupName: 'Test Group' }]
      });
    });

    test('should identify admin user correctly', async () => {
      const { prisma } = require('@/lib/db/prisma');
      
      prisma.user.findUnique.mockResolvedValue({
        userId: 2,
        userName: 'admin',
        userKey: 'adminkey',
        level: 1, // 管理者レベル
        deleteFlag: 0,
        userGroups: []
      });

      const mockRequest = {
        headers: { get: jest.fn().mockReturnValue('Bearer user-2') },
        cookies: { get: jest.fn().mockReturnValue(null) }
      } as any;

      const result = await getAuthenticatedUser(mockRequest);
      
      expect(result?.isAdmin).toBe(true);
    });
  });

  describe('canEditKnowledge', () => {
    test('should allow owner to edit', () => {
      const result = canEditKnowledge(mockUser, mockKnowledge);
      expect(result).toBe(true);
    });

    test('should allow admin to edit any knowledge', () => {
      const otherUserKnowledge = { ...mockKnowledge, insertUser: 999 };
      const result = canEditKnowledge(mockAdminUser, otherUserKnowledge);
      expect(result).toBe(true);
    });

    test('should deny non-owner non-admin user', () => {
      const otherUserKnowledge = { ...mockKnowledge, insertUser: 999 };
      const result = canEditKnowledge(mockUser, otherUserKnowledge);
      expect(result).toBe(false);
    });
  });

  describe('canDeleteKnowledge', () => {
    test('should allow owner to delete', () => {
      const result = canDeleteKnowledge(mockUser, mockKnowledge);
      expect(result).toBe(true);
    });

    test('should allow admin to delete any knowledge', () => {
      const otherUserKnowledge = { ...mockKnowledge, insertUser: 999 };
      const result = canDeleteKnowledge(mockAdminUser, otherUserKnowledge);
      expect(result).toBe(true);
    });

    test('should deny non-owner non-admin user', () => {
      const otherUserKnowledge = { ...mockKnowledge, insertUser: 999 };
      const result = canDeleteKnowledge(mockUser, otherUserKnowledge);
      expect(result).toBe(false);
    });
  });

  describe('canAccessKnowledge', () => {
    test('should deny access to deleted knowledge', () => {
      const deletedKnowledge = { ...mockKnowledge, deleteFlag: 1 };
      const result = canAccessKnowledge(mockUser, deletedKnowledge);
      expect(result).toBe(false);
    });

    test('should allow public knowledge access for anyone', () => {
      const publicKnowledge = { ...mockKnowledge, publicFlag: 1 };
      
      // 認証済みユーザー
      expect(canAccessKnowledge(mockUser, publicKnowledge)).toBe(true);
      
      // 未認証ユーザー
      expect(canAccessKnowledge(null, publicKnowledge)).toBe(true);
    });

    test('should handle private knowledge access', () => {
      const privateKnowledge = { ...mockKnowledge, publicFlag: 2 };
      
      // 未認証ユーザーはアクセス不可
      expect(canAccessKnowledge(null, privateKnowledge)).toBe(false);
      
      // 作成者はアクセス可能
      expect(canAccessKnowledge(mockUser, privateKnowledge)).toBe(true);
      
      // 管理者はアクセス可能
      expect(canAccessKnowledge(mockAdminUser, privateKnowledge)).toBe(true);
      
      // 他のユーザーはアクセス不可
      const otherUserKnowledge = { ...privateKnowledge, insertUser: 999 };
      expect(canAccessKnowledge(mockUser, otherUserKnowledge)).toBe(false);
    });

    test('should handle protected knowledge access', () => {
      const protectedKnowledge = { ...mockKnowledge, publicFlag: 3 };
      
      // 未認証ユーザーはアクセス不可
      expect(canAccessKnowledge(null, protectedKnowledge)).toBe(false);
      
      // 作成者はアクセス可能
      expect(canAccessKnowledge(mockUser, protectedKnowledge)).toBe(true);
      
      // 管理者はアクセス可能
      expect(canAccessKnowledge(mockAdminUser, protectedKnowledge)).toBe(true);
      
      // グループメンバーのアクセス（今後実装予定）
      const otherUserKnowledge = { ...protectedKnowledge, insertUser: 999 };
      expect(canAccessKnowledge(mockUser, otherUserKnowledge)).toBe(false);
    });

    test('should deny access for unknown public flag', () => {
      const unknownFlagKnowledge = { ...mockKnowledge, publicFlag: 999 };
      expect(canAccessKnowledge(mockUser, unknownFlagKnowledge)).toBe(false);
    });
  });
});