/**
 * ユーザーリポジトリ
 * 
 * @description ユーザー情報のデータベースアクセス層
 */
import { prisma } from '@/lib/db';
import { User } from '@prisma/client';

/**
 * ログインIDでユーザーを検索
 * 
 * @param loginId ログインID
 * @returns ユーザー情報またはnull
 */
export async function findUserByLoginId(loginId: string): Promise<User | null> {
  return await prisma.user.findFirst({
    where: {
      userKey: loginId,
      deleteFlag: 0 // 削除されていないユーザーのみ
    }
  });
}

/**
 * ユーザーIDでユーザーを検索
 * 
 * @param userId ユーザーID
 * @returns ユーザー情報またはnull
 */
export async function findUserById(userId: number): Promise<User | null> {
  return await prisma.user.findUnique({
    where: {
      userId: userId
    }
  });
}

/**
 * ユーザーのパスワードを取得
 * 
 * @param userId ユーザーID
 * @returns パスワード情報またはnull
 */
export async function getUserPassword(userId: number): Promise<{ password: string; salt: string } | null> {
  const user = await prisma.user.findUnique({
    where: {
      userId: userId
    },
    select: {
      password: true,
      salt: true
    }
  });

  if (!user || !user.password || !user.salt) {
    return null;
  }

  return {
    password: user.password,
    salt: user.salt
  };
}

/**
 * メールアドレスでユーザーを検索
 * 
 * @param email メールアドレス
 * @returns ユーザー情報またはnull
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  return await prisma.user.findFirst({
    where: {
      mailAddress: email,
      deleteFlag: 0 // 削除されていないユーザーのみ
    }
  });
}

/**
 * ユーザーの最終ログイン日時を更新
 * 
 * @param userId ユーザーID
 */
export async function updateLastLoginTime(userId: number): Promise<void> {
  await prisma.user.update({
    where: {
      userId: userId
    },
    data: {
      updateDatetime: new Date(),
      updateUser: userId
    }
  });
}