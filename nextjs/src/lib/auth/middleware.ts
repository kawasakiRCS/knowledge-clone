/**
 * 認証ミドルウェア
 * 
 * @description 旧JavaシステムのLoginedUserの完全移植
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export interface AuthenticatedUser {
  userId: number;
  userName: string;
  userKey: string;
  isAdmin: boolean;
  // groups: Array<{ groupId: number; groupName: string }>; // Will be added when group functionality is implemented
}

/**
 * リクエストからユーザー認証情報を取得
 * 
 * @description 旧システムのLoginedUserチェック相当
 * @param request Next.jsリクエスト
 * @returns 認証済みユーザー情報またはnull
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // セッションまたはJWTトークンからユーザーIDを取得（実装予定）
    const userId = await getUserIdFromSession(request);
    
    if (!userId) {
      return null; // 未認証
    }

    // データベースからユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { 
        userId: userId,
        deleteFlag: 0 // 削除されていないユーザーのみ
      },
      // Note: Group relations will be added later when group tables are implemented
    });

    if (!user) {
      return null; // ユーザーが存在しない
    }

    // 管理者権限チェック（旧システムの Level.ADMIN チェック）
    // TODO: Add level field to users table or implement admin role check
    const isAdmin = false; // Temporarily disabled until level/role field is added

    // Group functionality will be implemented later
    // const groups = user.userGroups.map(ug => ({
    //   groupId: ug.group.groupId,
    //   groupName: ug.group.groupName
    // }));

    return {
      userId: user.userId,
      userName: user.userName,
      userKey: user.userKey,
      isAdmin
      // groups // Will be added when group functionality is implemented
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * セッションからユーザーIDを取得
 * 
 * @description NextAuthのセッションからユーザーIDを取得
 * @param request Next.jsリクエスト
 * @returns ユーザーIDまたはnull
 */
async function getUserIdFromSession(request: NextRequest): Promise<number | null> {
  try {
    // NextAuthのgetServerSessionを使用してセッション情報を取得
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('./authOptions');
    
    const session = await getServerSession(authOptions);
    
    if (session?.user && 'userId' in session.user) {
      return session.user.userId as number;
    }

    // 開発用: Authorization ヘッダーからuser-idを取得
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer user-')) {
      const userId = parseInt(authHeader.replace('Bearer user-', ''));
      return isNaN(userId) ? null : userId;
    }

    return null;
  } catch (error) {
    console.error('Session retrieval error:', error);
    return null;
  }
}

/**
 * ナレッジの編集権限をチェック
 * 
 * @description 旧システムのKnowledgeLogic.isEditor相当
 * @param user 認証済みユーザー
 * @param knowledge ナレッジ情報
 * @returns 編集可能かどうか
 */
export function canEditKnowledge(user: AuthenticatedUser, knowledge: any): boolean {
  // 作成者の場合は編集可能
  if (knowledge.insertUser === user.userId) {
    return true;
  }

  // システム管理者の場合は編集可能
  if (user.isAdmin) {
    return true;
  }

  // 共同編集者チェック（実装予定）
  // TODO: KnowledgeEditorsテーブルとの照合
  
  // グループ編集権限チェック（実装予定）
  // TODO: KnowledgeGroupsテーブルとユーザーグループの照合

  return false;
}

/**
 * ナレッジの削除権限をチェック
 * 
 * @description 旧システムの削除権限チェック相当
 * @param user 認証済みユーザー
 * @param knowledge ナレッジ情報
 * @returns 削除可能かどうか
 */
export function canDeleteKnowledge(user: AuthenticatedUser, knowledge: any): boolean {
  // 削除権限は編集権限と同じ
  return canEditKnowledge(user, knowledge);
}

/**
 * ナレッジのアクセス権限をチェック
 * 
 * @description 旧システムのアクセス権限チェック相当
 * @param user 認証済みユーザー（nullの場合は未認証）
 * @param knowledge ナレッジ情報
 * @returns アクセス可能かどうか
 */
export function canAccessKnowledge(user: AuthenticatedUser | null, knowledge: any): boolean {
  // 削除されたナレッジはアクセス不可
  if (knowledge.deleteFlag !== 0) {
    return false;
  }

  switch (knowledge.publicFlag) {
    case 1: // 公開
      return true;
    
    case 2: // 非公開
      if (!user) return false;
      // 作成者または管理者の場合はアクセス可能
      return knowledge.insertUser === user.userId || user.isAdmin;
    
    case 3: // 保護（グループメンバーのみ）
      if (!user) return false;
      // 作成者、管理者の場合はアクセス可能
      if (knowledge.insertUser === user.userId || user.isAdmin) {
        return true;
      }
      // グループメンバーチェック（実装予定）
      // TODO: KnowledgeGroupsとユーザーグループの照合
      return false;
    
    default:
      return false;
  }
}