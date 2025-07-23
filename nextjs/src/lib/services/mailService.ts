/**
 * メールサービス
 * 
 * @description 旧Java MailLogic.javaの移植
 */
export interface ProvisionalRegistration {
  id: string;
  userKey: string;
  userName: string;
  insertDatetime: Date;
}

/**
 * 招待メールを送信
 */
export async function sendInvitationEmail(
  registration: ProvisionalRegistration,
  systemUrl: string,
  locale: string = 'ja'
): Promise<void> {
  // TODO: 実装予定
  // 現在はモック関数として定義
  console.log('招待メール送信:', {
    to: registration.userKey,
    activationUrl: `${systemUrl}/signup/activate/${registration.id}`,
    locale,
  });
}

/**
 * パスワードリセット用のメール情報
 */
export interface PasswordResetInfo {
  id: string;
  userKey: string;
  insertDatetime: Date;
}

/**
 * パスワードリセットメールを送信
 */
export async function sendPasswordResetEmail(
  resetInfo: PasswordResetInfo,
  systemUrl: string,
  locale: string = 'ja'
): Promise<void> {
  // TODO: 実装予定
  // 現在はモック関数として定義
  console.log('パスワードリセットメール送信:', {
    to: resetInfo.userKey,
    resetUrl: `${systemUrl}/password/reset/${resetInfo.id}`,
    locale,
  });
}