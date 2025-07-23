/**
 * サインアップAPI テスト
 * 
 * @description 旧Java SignupControl.javaの完全移植テスト
 * TDD: Red → Green → Refactor サイクルでの実装
 */
import { POST } from '../route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { SystemConfig } from '@/lib/constants/systemConfig';

// モック設定
jest.mock('@/lib/db', () => ({
  prisma: {
    systemConfig: {
      findFirst: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    provisionalRegistration: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/services/mailService', () => ({
  sendInvitationEmail: jest.fn(),
}));

jest.mock('@/lib/services/notificationService', () => ({
  sendNotifyAddUser: jest.fn(),
  sendNotifyAcceptUser: jest.fn(),
}));

describe('/api/open/signup', () => {
  let mockRequest: Partial<NextRequest>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      json: jest.fn(),
    };
  });

  describe('POST /api/open/signup', () => {
    describe('ユーザー追加タイプ: USER (即座登録)', () => {
      beforeEach(() => {
        // システム設定: ユーザーが自分で登録可能
        (prisma.systemConfig.findFirst as jest.Mock).mockResolvedValue({
          configValue: SystemConfig.USER_ADD_TYPE_VALUE_USER,
        });
      });

      test('should create user immediately with valid data', async () => {
        const validUserData = {
          userKey: 'test@example.com',
          userName: 'Test User',
          password: 'password123',
          confirm_password: 'password123',
        };

        (mockRequest.json as jest.Mock).mockResolvedValue(validUserData);
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(null); // ユーザー存在しない
        (prisma.user.create as jest.Mock).mockResolvedValue({
          userId: 1,
          userKey: validUserData.userKey,
          userName: validUserData.userName,
        });

        const request = mockRequest as NextRequest;
        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.success).toBe(true);
        expect(responseData.message).toBe('knowledge.signup.success');
        expect(prisma.user.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            userKey: validUserData.userKey,
            userName: validUserData.userName,
          }),
        });
      });

      test('should return validation error for existing user', async () => {
        const existingUserData = {
          userKey: 'existing@example.com',
          userName: 'Existing User',
          password: 'password123',
          confirm_password: 'password123',
        };

        (mockRequest.json as jest.Mock).mockResolvedValue(existingUserData);
        (prisma.user.findFirst as jest.Mock).mockResolvedValue({
          userId: 1,
          userKey: existingUserData.userKey,
        }); // ユーザー既存

        const request = mockRequest as NextRequest;
        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(400);
        expect(responseData.success).toBe(false);
        expect(responseData.errors).toContainEqual(
          expect.objectContaining({
            message: 'knowledge.user.mail.exist',
          })
        );
      });

      test('should return validation error for password mismatch', async () => {
        const invalidUserData = {
          userKey: 'test@example.com',
          userName: 'Test User',
          password: 'password123',
          confirm_password: 'different123',
        };

        (mockRequest.json as jest.Mock).mockResolvedValue(invalidUserData);
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

        const request = mockRequest as NextRequest;
        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(400);
        expect(responseData.success).toBe(false);
        expect(responseData.errors).toContainEqual(
          expect.objectContaining({
            message: 'knowledge.user.invalid.same.password',
          })
        );
      });

      test('should return validation error for invalid email format', async () => {
        const invalidEmailData = {
          userKey: 'invalid-email',
          userName: 'Test User',
          password: 'password123',
          confirm_password: 'password123',
        };

        (mockRequest.json as jest.Mock).mockResolvedValue(invalidEmailData);

        const request = mockRequest as NextRequest;
        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(400);
        expect(responseData.success).toBe(false);
        expect(responseData.errors).toContainEqual(
          expect.objectContaining({
            field: 'userKey',
            message: expect.stringContaining('email'),
          })
        );
      });
    });

    describe('ユーザー追加タイプ: MAIL (招待メール)', () => {
      beforeEach(() => {
        // システム設定: 招待メールで登録
        (prisma.systemConfig.findFirst as jest.Mock).mockResolvedValue({
          configValue: SystemConfig.USER_ADD_TYPE_VALUE_MAIL,
        });
      });

      test('should create provisional registration and send invitation email', async () => {
        const userData = {
          userKey: 'test@example.com',
          userName: 'Test User',
          password: 'password123',
          confirm_password: 'password123',
        };

        (mockRequest.json as jest.Mock).mockResolvedValue(userData);
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
        (prisma.provisionalRegistration.findMany as jest.Mock).mockResolvedValue([]);
        (prisma.provisionalRegistration.create as jest.Mock).mockResolvedValue({
          id: 'uuid-123',
          userKey: userData.userKey,
        });

        const request = mockRequest as NextRequest;
        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.success).toBe(true);
        expect(responseData.message).toBe('knowledge.signup.mail.sent');
        expect(prisma.provisionalRegistration.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            userKey: userData.userKey,
            userName: userData.userName,
          }),
        });
      });

      test('should return warning for existing provisional registration', async () => {
        const userData = {
          userKey: 'test@example.com',
          userName: 'Test User',
          password: 'password123',
          confirm_password: 'password123',
        };

        (mockRequest.json as jest.Mock).mockResolvedValue(userData);
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
        (prisma.provisionalRegistration.findMany as jest.Mock).mockResolvedValue([
          {
            id: 'existing-123',
            userKey: userData.userKey,
            insertDatetime: new Date(), // 新しい登録
          },
        ]);

        const request = mockRequest as NextRequest;
        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(400);
        expect(responseData.success).toBe(false);
        expect(responseData.message).toBe('knowledge.signup.exists');
      });

      test('should delete expired provisional registrations', async () => {
        const userData = {
          userKey: 'test@example.com',
          userName: 'Test User',
          password: 'password123',
          confirm_password: 'password123',
        };

        const expiredTime = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2時間前
        (mockRequest.json as jest.Mock).mockResolvedValue(userData);
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
        (prisma.provisionalRegistration.findMany as jest.Mock).mockResolvedValue([
          {
            id: 'expired-123',
            userKey: userData.userKey,
            insertDatetime: expiredTime,
          },
        ]);
        (prisma.provisionalRegistration.create as jest.Mock).mockResolvedValue({
          id: 'new-123',
          userKey: userData.userKey,
        });

        const request = mockRequest as NextRequest;
        const response = await POST(request);

        expect(prisma.provisionalRegistration.deleteMany).toHaveBeenCalledWith({
          where: {
            id: 'expired-123',
          },
        });
        expect(response.status).toBe(200);
      });
    });

    describe('ユーザー追加タイプ: APPROVE (管理者承認)', () => {
      beforeEach(() => {
        // システム設定: 管理者承認が必要
        (prisma.systemConfig.findFirst as jest.Mock).mockResolvedValue({
          configValue: SystemConfig.USER_ADD_TYPE_VALUE_APPROVE,
        });
      });

      test('should create provisional registration and notify admin', async () => {
        const userData = {
          userKey: 'test@example.com',
          userName: 'Test User',
          password: 'password123',
          confirm_password: 'password123',
        };

        (mockRequest.json as jest.Mock).mockResolvedValue(userData);
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
        (prisma.provisionalRegistration.findMany as jest.Mock).mockResolvedValue([]);
        (prisma.provisionalRegistration.create as jest.Mock).mockResolvedValue({
          id: 'approval-123',
          userKey: userData.userKey,
        });

        const request = mockRequest as NextRequest;
        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.success).toBe(true);
        expect(responseData.message).toBe('knowledge.signup.waiting.approval');
        expect(prisma.provisionalRegistration.create).toHaveBeenCalled();
      });

      test('should return warning for pending approval', async () => {
        const userData = {
          userKey: 'test@example.com',
          userName: 'Test User',
          password: 'password123',
          confirm_password: 'password123',
        };

        (mockRequest.json as jest.Mock).mockResolvedValue(userData);
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
        (prisma.provisionalRegistration.findMany as jest.Mock).mockResolvedValue([
          {
            id: 'pending-123',
            userKey: userData.userKey,
            insertDatetime: new Date(),
          },
        ]);

        const request = mockRequest as NextRequest;
        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(400);
        expect(responseData.success).toBe(false);
        expect(responseData.message).toBe('knowledge.signup.waiting');
      });
    });

    describe('ユーザー追加タイプ: ADMIN (追加不可)', () => {
      test('should return 404 when user registration is disabled', async () => {
        // システム設定: 管理者のみ追加可能
        (prisma.systemConfig.findFirst as jest.Mock).mockResolvedValue({
          configValue: SystemConfig.USER_ADD_TYPE_VALUE_ADMIN,
        });

        const userData = {
          userKey: 'test@example.com',
          userName: 'Test User',
          password: 'password123',
          confirm_password: 'password123',
        };

        (mockRequest.json as jest.Mock).mockResolvedValue(userData);

        const request = mockRequest as NextRequest;
        const response = await POST(request);

        expect(response.status).toBe(404);
      });

      test('should return 404 when system config is not found', async () => {
        // システム設定が見つからない
        (prisma.systemConfig.findFirst as jest.Mock).mockResolvedValue(null);

        const userData = {
          userKey: 'test@example.com',
          userName: 'Test User',
          password: 'password123',
          confirm_password: 'password123',
        };

        (mockRequest.json as jest.Mock).mockResolvedValue(userData);

        const request = mockRequest as NextRequest;
        const response = await POST(request);

        expect(response.status).toBe(404);
      });
    });

    describe('バリデーション', () => {
      beforeEach(() => {
        (prisma.systemConfig.findFirst as jest.Mock).mockResolvedValue({
          configValue: SystemConfig.USER_ADD_TYPE_VALUE_USER,
        });
      });

      test('should validate required fields', async () => {
        const incompleteData = {
          userKey: '',
          userName: '',
          password: '',
          confirm_password: '',
        };

        (mockRequest.json as jest.Mock).mockResolvedValue(incompleteData);

        const request = mockRequest as NextRequest;
        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(400);
        expect(responseData.success).toBe(false);
        expect(responseData.errors).toHaveLength(3); // userKey, userName, password
      });

      test('should validate maximum field lengths', async () => {
        const longData = {
          userKey: 'a'.repeat(256) + '@example.com', // 長すぎるメール
          userName: 'a'.repeat(256), // 長すぎる名前
          password: 'password123',
          confirm_password: 'password123',
        };

        (mockRequest.json as jest.Mock).mockResolvedValue(longData);

        const request = mockRequest as NextRequest;
        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(400);
        expect(responseData.success).toBe(false);
        expect(responseData.errors.length).toBeGreaterThan(0);
      });
    });
  });
});