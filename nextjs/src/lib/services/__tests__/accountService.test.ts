/**
 * accountServiceテスト
 * 
 * @description アカウントサービスのビジネスロジックテスト
 */
import { accountService } from '../accountService';
import * as userRepository from '../../repositories/userRepository';
import * as userAliasRepository from '../../repositories/userAliasRepository';
import { db } from '../../db';
import bcrypt from 'bcryptjs';

// モック設定
jest.mock('../../repositories/userRepository');
jest.mock('../../repositories/userAliasRepository');
jest.mock('../../db');
jest.mock('bcryptjs');

describe('accountService', () => {
  const mockDb = db as jest.MockedObject<typeof db>;
  const mockUserRepo = userRepository as jest.MockedObject<typeof userRepository>;
  const mockAliasRepo = userAliasRepository as jest.MockedObject<typeof userAliasRepository>;
  const mockBcrypt = bcrypt as jest.MockedObject<typeof bcrypt>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const mockUserData = {
      userId: 'testuser',
      userName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      locale: 'ja',
    };

    test('新しいユーザーを作成できる', async () => {
      mockUserRepo.findByUserId.mockResolvedValue(null);
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue('hashedPassword' as never);
      mockUserRepo.create.mockResolvedValue(true);

      const result = await accountService.createUser(mockDb, mockUserData);

      expect(mockUserRepo.findByUserId).toHaveBeenCalledWith(mockDb, 'testuser');
      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(mockDb, 'test@example.com');
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUserRepo.create).toHaveBeenCalledWith(
        mockDb,
        expect.objectContaining({
          userId: 'testuser',
          userName: 'Test User',
          email: 'test@example.com',
          password: 'hashedPassword',
        })
      );
      expect(result).toBe(true);
    });

    test('既存のユーザーIDの場合エラーをスロー', async () => {
      mockUserRepo.findByUserId.mockResolvedValue({
        userId: 'testuser',
        userName: 'Existing User',
      } as any);

      await expect(
        accountService.createUser(mockDb, mockUserData)
      ).rejects.toThrow('User ID already exists');
    });

    test('既存のメールアドレスの場合エラーをスロー', async () => {
      mockUserRepo.findByUserId.mockResolvedValue(null);
      mockUserRepo.findByEmail.mockResolvedValue({
        userId: 'otheruser',
        email: 'test@example.com',
      } as any);

      await expect(
        accountService.createUser(mockDb, mockUserData)
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('updateUser', () => {
    const mockUpdateData = {
      userId: 'testuser',
      userName: 'Updated User',
      email: 'updated@example.com',
      locale: 'en',
    };

    test('ユーザー情報を更新できる', async () => {
      mockUserRepo.findByUserId.mockResolvedValue({
        userId: 'testuser',
        userName: 'Test User',
        email: 'test@example.com',
      } as any);
      mockUserRepo.update.mockResolvedValue(true);

      const result = await accountService.updateUser(mockDb, mockUpdateData);

      expect(mockUserRepo.update).toHaveBeenCalledWith(mockDb, mockUpdateData);
      expect(result).toBe(true);
    });

    test('存在しないユーザーの場合エラーをスロー', async () => {
      mockUserRepo.findByUserId.mockResolvedValue(null);

      await expect(
        accountService.updateUser(mockDb, mockUpdateData)
      ).rejects.toThrow('User not found');
    });

    test('メールアドレスが重複する場合エラーをスロー', async () => {
      mockUserRepo.findByUserId.mockResolvedValue({
        userId: 'testuser',
        email: 'test@example.com',
      } as any);
      mockUserRepo.findByEmail.mockResolvedValue({
        userId: 'otheruser',
        email: 'updated@example.com',
      } as any);

      await expect(
        accountService.updateUser(mockDb, mockUpdateData)
      ).rejects.toThrow('Email already in use');
    });
  });

  describe('changePassword', () => {
    test('パスワードを変更できる', async () => {
      mockUserRepo.findByUserId.mockResolvedValue({
        userId: 'testuser',
        password: 'oldHashedPassword',
      } as any);
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockBcrypt.hash.mockResolvedValue('newHashedPassword' as never);
      mockUserRepo.updatePassword.mockResolvedValue(true);

      const result = await accountService.changePassword(
        mockDb,
        'testuser',
        'oldPassword',
        'newPassword'
      );

      expect(mockBcrypt.compare).toHaveBeenCalledWith('oldPassword', 'oldHashedPassword');
      expect(mockBcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
      expect(mockUserRepo.updatePassword).toHaveBeenCalledWith(
        mockDb,
        'testuser',
        'newHashedPassword'
      );
      expect(result).toBe(true);
    });

    test('現在のパスワードが間違っている場合エラーをスロー', async () => {
      mockUserRepo.findByUserId.mockResolvedValue({
        userId: 'testuser',
        password: 'oldHashedPassword',
      } as any);
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        accountService.changePassword(mockDb, 'testuser', 'wrongPassword', 'newPassword')
      ).rejects.toThrow('Current password is incorrect');
    });

    test('ユーザーが存在しない場合エラーをスロー', async () => {
      mockUserRepo.findByUserId.mockResolvedValue(null);

      await expect(
        accountService.changePassword(mockDb, 'testuser', 'oldPassword', 'newPassword')
      ).rejects.toThrow('User not found');
    });
  });

  describe('deleteUser', () => {
    test('ユーザーを削除できる', async () => {
      mockUserRepo.findByUserId.mockResolvedValue({
        userId: 'testuser',
      } as any);
      mockUserRepo.delete.mockResolvedValue(true);

      const result = await accountService.deleteUser(mockDb, 'testuser');

      expect(mockUserRepo.delete).toHaveBeenCalledWith(mockDb, 'testuser');
      expect(result).toBe(true);
    });

    test('ユーザーが存在しない場合エラーをスロー', async () => {
      mockUserRepo.findByUserId.mockResolvedValue(null);

      await expect(
        accountService.deleteUser(mockDb, 'nonexistent')
      ).rejects.toThrow('User not found');
    });
  });

  describe('getUserAliases', () => {
    const mockAliases = [
      { aliasName: 'alias1', targetUserId: 'user1' },
      { aliasName: 'alias2', targetUserId: 'user2' },
    ];

    test('ユーザーエイリアスを取得できる', async () => {
      mockAliasRepo.findByUserId.mockResolvedValue(mockAliases);

      const result = await accountService.getUserAliases(mockDb, 'testuser');

      expect(mockAliasRepo.findByUserId).toHaveBeenCalledWith(mockDb, 'testuser');
      expect(result).toEqual(mockAliases);
    });

    test('エイリアスがない場合空配列を返す', async () => {
      mockAliasRepo.findByUserId.mockResolvedValue([]);

      const result = await accountService.getUserAliases(mockDb, 'testuser');

      expect(result).toEqual([]);
    });
  });

  describe('createUserAlias', () => {
    test('ユーザーエイリアスを作成できる', async () => {
      mockAliasRepo.findByUserIdAndAlias.mockResolvedValue(null);
      mockUserRepo.findByUserId.mockResolvedValue({
        userId: 'targetuser',
      } as any);
      mockAliasRepo.create.mockResolvedValue(true);

      const result = await accountService.createUserAlias(
        mockDb,
        'testuser',
        'myalias',
        'targetuser'
      );

      expect(mockAliasRepo.create).toHaveBeenCalledWith(
        mockDb,
        'testuser',
        'myalias',
        'targetuser'
      );
      expect(result).toBe(true);
    });

    test('エイリアスが既に存在する場合エラーをスロー', async () => {
      mockAliasRepo.findByUserIdAndAlias.mockResolvedValue({
        aliasName: 'myalias',
        targetUserId: 'existinguser',
      } as any);

      await expect(
        accountService.createUserAlias(mockDb, 'testuser', 'myalias', 'targetuser')
      ).rejects.toThrow('Alias already exists');
    });

    test('対象ユーザーが存在しない場合エラーをスロー', async () => {
      mockAliasRepo.findByUserIdAndAlias.mockResolvedValue(null);
      mockUserRepo.findByUserId.mockResolvedValue(null);

      await expect(
        accountService.createUserAlias(mockDb, 'testuser', 'myalias', 'nonexistent')
      ).rejects.toThrow('Target user not found');
    });
  });

  describe('deleteUserAlias', () => {
    test('ユーザーエイリアスを削除できる', async () => {
      mockAliasRepo.findByUserIdAndAlias.mockResolvedValue({
        aliasName: 'myalias',
        targetUserId: 'targetuser',
      } as any);
      mockAliasRepo.delete.mockResolvedValue(true);

      const result = await accountService.deleteUserAlias(
        mockDb,
        'testuser',
        'myalias'
      );

      expect(mockAliasRepo.delete).toHaveBeenCalledWith(
        mockDb,
        'testuser',
        'myalias'
      );
      expect(result).toBe(true);
    });

    test('エイリアスが存在しない場合エラーをスロー', async () => {
      mockAliasRepo.findByUserIdAndAlias.mockResolvedValue(null);

      await expect(
        accountService.deleteUserAlias(mockDb, 'testuser', 'nonexistent')
      ).rejects.toThrow('Alias not found');
    });
  });

  describe('getUserProfile', () => {
    test('ユーザープロフィールを取得できる', async () => {
      const mockUser = {
        userId: 'testuser',
        userName: 'Test User',
        email: 'test@example.com',
        locale: 'ja',
        createdAt: '2024-01-01T00:00:00Z',
      };
      mockUserRepo.findByUserId.mockResolvedValue(mockUser as any);

      const result = await accountService.getUserProfile(mockDb, 'testuser');

      expect(mockUserRepo.findByUserId).toHaveBeenCalledWith(mockDb, 'testuser');
      expect(result).toEqual({
        userId: 'testuser',
        userName: 'Test User',
        email: 'test@example.com',
        locale: 'ja',
        createdAt: '2024-01-01T00:00:00Z',
      });
    });

    test('ユーザーが存在しない場合nullを返す', async () => {
      mockUserRepo.findByUserId.mockResolvedValue(null);

      const result = await accountService.getUserProfile(mockDb, 'nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getUserStats', () => {
    test('ユーザー統計を取得できる', async () => {
      const mockStats = {
        knowledgeCount: 10,
        commentCount: 25,
        likeCount: 50,
        lastPostDate: '2024-01-15T10:00:00Z',
      };
      mockUserRepo.getUserStats.mockResolvedValue(mockStats);

      const result = await accountService.getUserStats(mockDb, 'testuser');

      expect(mockUserRepo.getUserStats).toHaveBeenCalledWith(mockDb, 'testuser');
      expect(result).toEqual(mockStats);
    });
  });
});