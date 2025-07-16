/**
 * サーバーサイド認証ユーティリティ
 * 
 * @description APIルートでの認証チェックとユーザー情報取得
 */
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { findUserById } from '@/repositories/userRepository';

/**
 * 認証済みユーザー情報
 */
export interface AuthenticatedUser {
  userId: number;
  userName: string;
  userKey: string;
  role: 'user' | 'admin';
  email?: string;
}

/**
 * 認証エラー
 */
export class AuthenticationError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * 権限エラー
 */
export class AuthorizationError extends Error {
  constructor(message: string, public statusCode: number = 403) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * リクエストから認証済みユーザー情報を取得
 * 
 * @param request NextRequest
 * @returns 認証済みユーザー情報
 * @throws AuthenticationError 未認証の場合
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser> {
  try {
    // NextAuth JWTトークンを取得
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.userId) {
      throw new AuthenticationError('認証が必要です');
    }

    // データベースからユーザー情報を取得
    const user = await findUserById(token.userId as number);
    
    if (!user || user.deleteFlag !== 0) {
      throw new AuthenticationError('ユーザーが見つかりません');
    }

    return {
      userId: user.userId,
      userName: user.userName,
      userKey: user.userKey,
      role: token.role as 'user' | 'admin',
      email: user.mailAddress || undefined,
    };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    console.error('Authentication error:', error);
    throw new AuthenticationError('認証処理中にエラーが発生しました');
  }
}

/**
 * 管理者権限をチェック
 * 
 * @param user 認証済みユーザー
 * @throws AuthorizationError 管理者でない場合
 */
export function requireAdmin(user: AuthenticatedUser): void {
  if (user.role !== 'admin') {
    throw new AuthorizationError('管理者権限が必要です');
  }
}

/**
 * 特定ユーザーまたは管理者の権限をチェック
 * 
 * @param user 認証済みユーザー
 * @param targetUserId 対象ユーザーID
 * @throws AuthorizationError 権限がない場合
 */
export function requireOwnerOrAdmin(user: AuthenticatedUser, targetUserId: number): void {
  if (user.userId !== targetUserId && user.role !== 'admin') {
    throw new AuthorizationError('この操作を行う権限がありません');
  }
}

/**
 * APIエラーレスポンスを生成
 * 
 * @param error エラーオブジェクト
 * @returns Response
 */
export function createErrorResponse(error: Error): Response {
  if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
    return Response.json(
      { success: false, error: error.message },
      { status: error.statusCode }
    );
  }
  
  console.error('API Error:', error);
  return Response.json(
    { success: false, error: 'サーバーエラーが発生しました' },
    { status: 500 }
  );
}

/**
 * 認証が必要なAPI関数をラップするヘルパー
 * 
 * @param handler APIハンドラー関数
 * @returns ラップされたハンドラー
 */
export function withAuth<T extends any[]>(
  handler: (request: NextRequest, user: AuthenticatedUser, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    try {
      const user = await getAuthenticatedUser(request);
      return await handler(request, user, ...args);
    } catch (error) {
      return createErrorResponse(error as Error);
    }
  };
}

/**
 * 管理者権限が必要なAPI関数をラップするヘルパー
 * 
 * @param handler APIハンドラー関数
 * @returns ラップされたハンドラー
 */
export function withAdminAuth<T extends any[]>(
  handler: (request: NextRequest, user: AuthenticatedUser, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    try {
      const user = await getAuthenticatedUser(request);
      requireAdmin(user);
      return await handler(request, user, ...args);
    } catch (error) {
      return createErrorResponse(error as Error);
    }
  };
}