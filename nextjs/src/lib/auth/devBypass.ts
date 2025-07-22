/**
 * 開発環境専用認証バイパス機能
 * 
 * @description Playwright MCP統合での動作確認用
 * @warning 本番環境では絶対に使用禁止
 */

import { LoginedUser } from '@/types/auth';

/**
 * 開発環境での認証バイパスが有効かチェック
 */
export function isDevelopmentAuthBypassEnabled(): boolean {
  return process.env.NODE_ENV === 'development' && 
         process.env.DEVELOPMENT_AUTH_BYPASS === 'true';
}

/**
 * 検証用ユーザー定義
 * 実際のDB内のユーザーIDと対応
 */
export const DEVELOPMENT_USERS = {
  admin: {
    userId: 12,  // Knowledge test
    userName: 'Knowledge test (Dev Admin)',
    userKey: 'kbtest',
    role: 'admin',
    unreadCount: 0,
  },
  user: {
    userId: 7,   // 山田 テスト  
    userName: '山田 テスト (Dev User)',
    userKey: 'yamada01',
    role: 'user',
    unreadCount: 0,
  },
} as const;

/**
 * 開発用ユーザータイプの検証
 */
export function isValidDevelopmentUserType(userType: string): userType is keyof typeof DEVELOPMENT_USERS {
  return userType in DEVELOPMENT_USERS;
}

/**
 * 開発用ユーザー情報を取得
 */
export function getDevelopmentUser(userType: keyof typeof DEVELOPMENT_USERS): LoginedUser {
  if (!isDevelopmentAuthBypassEnabled()) {
    throw new Error('Development auth bypass is not enabled');
  }
  
  const userData = DEVELOPMENT_USERS[userType];
  
  return {
    userId: userData.userId,
    userName: userData.userName,
    userKey: userData.userKey,
    role: userData.role,
    unreadCount: userData.unreadCount,
  };
}

/**
 * JWT用の開発ユーザートークンペイロードを生成
 */
export function generateDevelopmentTokenPayload(userType: keyof typeof DEVELOPMENT_USERS) {
  if (!isDevelopmentAuthBypassEnabled()) {
    throw new Error('Development auth bypass is not enabled');
  }
  
  const user = getDevelopmentUser(userType);
  
  return {
    userId: user.userId,
    userName: user.userName,
    userKey: user.userKey,
    role: user.role,
    unreadCount: user.unreadCount,
    // 開発モードフラグ
    isDevelopmentBypass: true,
    // 有効期限（24時間）
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
  };
}