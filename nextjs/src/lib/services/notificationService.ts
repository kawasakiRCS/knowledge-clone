/**
 * 通知サービス
 * 
 * @description 旧Java Notification系Logicの移植
 */
export interface User {
  userId: bigint;
  userKey: string;
  userName: string;
}

export interface ProvisionalRegistration {
  id: string;
  userKey: string;  
  userName: string;
  insertDatetime: Date;
}

/**
 * 管理者にユーザー追加を通知
 */
export async function sendNotifyAddUser(user: User): Promise<void> {
  // TODO: 実装予定
  // 現在はモック関数として定義
  console.log('管理者にユーザー追加通知:', {
    userId: user.userId,
    userKey: user.userKey,
    userName: user.userName,
  });
}

/**
 * 管理者にユーザー承認待ちを通知
 */
export async function sendNotifyAcceptUser(registration: ProvisionalRegistration): Promise<void> {
  // TODO: 実装予定
  // 現在はモック関数として定義
  console.log('管理者にユーザー承認待ち通知:', {
    registrationId: registration.id,
    userKey: registration.userKey,
    userName: registration.userName,
  });
}