/**
 * ユーザーエイリアスリポジトリ
 * 
 * @description user_aliasテーブルへのデータアクセス層
 */

import { prisma } from '@/lib/db';

/**
 * ユーザーエイリアス情報
 */
export interface UserAlias {
  userId: number;
  authKey: string;
  aliasKey: string;
  aliasName: string;
  aliasMail?: string;
  userInfoUpdate?: number;
  insertUser?: number;
  insertDatetime?: Date;
  updateUser?: number;
  updateDatetime?: Date;
  deleteFlag?: number;
}

/**
 * EntraID認証用の定数
 */
export const ENTRAID_AUTH_KEY = 'entraid';

/**
 * 認証キーとエイリアスキーでユーザーエイリアスを検索
 * 
 * @param authKey 認証キー
 * @param aliasKey エイリアスキー
 * @returns ユーザーエイリアス情報、見つからない場合はnull
 */
export async function findUserAliasByKey(
  authKey: string, 
  aliasKey: string
): Promise<UserAlias | null> {
  try {
    const result = await prisma.userAlias.findFirst({
      where: {
        authKey: authKey,
        aliasKey: aliasKey.toLowerCase(),
        deleteFlag: 0,
      },
    });

    return result ? mapPrismaToUserAlias(result) : null;
  } catch (error) {
    console.error('Error finding user alias by key:', error);
    return null;
  }
}

/**
 * EntraIDユーザーをエイリアスキーで検索
 * 
 * @param entraIdEmail EntraIDのメールアドレス
 * @returns ユーザーエイリアス情報、見つからない場合はnull
 */
export async function findEntraIdUserAlias(entraIdEmail: string): Promise<UserAlias | null> {
  return findUserAliasByKey(ENTRAID_AUTH_KEY, entraIdEmail);
}

/**
 * ユーザーIDでユーザーエイリアスを検索
 * 
 * @param userId ユーザーID
 * @param authKey 認証キー（省略時は全て）
 * @returns ユーザーエイリアス配列
 */
export async function findUserAliasesByUserId(
  userId: number, 
  authKey?: string
): Promise<UserAlias[]> {
  try {
    const where: any = {
      userId: userId,
      deleteFlag: 0,
    };

    if (authKey) {
      where.authKey = authKey;
    }

    const results = await prisma.userAlias.findMany({
      where,
      orderBy: { authKey: 'asc' },
    });

    return results.map(mapPrismaToUserAlias);
  } catch (error) {
    console.error('Error finding user aliases by user ID:', error);
    return [];
  }
}

/**
 * ユーザーエイリアスを作成または更新
 * 
 * @param userAlias ユーザーエイリアス情報
 * @returns 作成または更新されたユーザーエイリアス情報
 */
export async function saveUserAlias(userAlias: UserAlias): Promise<UserAlias> {
  try {
    const data = {
      aliasKey: userAlias.aliasKey.toLowerCase(),
      aliasName: userAlias.aliasName,
      aliasMail: userAlias.aliasMail,
      userInfoUpdate: userAlias.userInfoUpdate ?? 1,
      updateUser: userAlias.updateUser ?? userAlias.userId,
      updateDatetime: new Date(),
    };

    const result = await prisma.userAlias.upsert({
      where: {
        userId_authKey: {
          userId: userAlias.userId,
          authKey: userAlias.authKey,
        },
      },
      create: {
        userId: userAlias.userId,
        authKey: userAlias.authKey,
        ...data,
        insertUser: userAlias.insertUser ?? userAlias.userId,
        insertDatetime: new Date(),
        deleteFlag: 0,
      },
      update: data,
    });

    return mapPrismaToUserAlias(result);
  } catch (error) {
    console.error('Error saving user alias:', error);
    throw new Error('ユーザーエイリアスの保存に失敗しました');
  }
}

/**
 * EntraIDユーザーエイリアスを作成
 * 
 * @param userId ユーザーID
 * @param entraIdEmail EntraIDメールアドレス
 * @param displayName 表示名
 * @returns 作成されたユーザーエイリアス情報
 */
export async function createEntraIdUserAlias(
  userId: number,
  entraIdEmail: string,
  displayName: string
): Promise<UserAlias> {
  const userAlias: UserAlias = {
    userId,
    authKey: ENTRAID_AUTH_KEY,
    aliasKey: entraIdEmail,
    aliasName: displayName,
    aliasMail: entraIdEmail,
    userInfoUpdate: 1,
  };

  return saveUserAlias(userAlias);
}

/**
 * 認証キーでユーザーエイリアスを削除（論理削除）
 * 
 * @param userId ユーザーID
 * @param authKey 認証キー
 * @returns 削除成功時true
 */
export async function deleteUserAlias(userId: number, authKey: string): Promise<boolean> {
  try {
    await prisma.userAlias.update({
      where: {
        userId_authKey: {
          userId,
          authKey,
        },
      },
      data: {
        deleteFlag: 1,
        updateDatetime: new Date(),
        updateUser: userId,
      },
    });

    return true;
  } catch (error) {
    console.error('Error deleting user alias:', error);
    return false;
  }
}

/**
 * Prismaの結果をUserAliasインターフェースにマッピング
 */
function mapPrismaToUserAlias(prismaResult: any): UserAlias {
  return {
    userId: prismaResult.userId,
    authKey: prismaResult.authKey,
    aliasKey: prismaResult.aliasKey,
    aliasName: prismaResult.aliasName,
    aliasMail: prismaResult.aliasMail,
    userInfoUpdate: prismaResult.userInfoUpdate,
    insertUser: prismaResult.insertUser,
    insertDatetime: prismaResult.insertDatetime,
    updateUser: prismaResult.updateUser,
    updateDatetime: prismaResult.updateDatetime,
    deleteFlag: prismaResult.deleteFlag,
  };
}