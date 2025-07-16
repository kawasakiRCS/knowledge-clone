/**
 * パスワード処理ユーティリティ
 * 
 * @description パスワードのハッシュ化と検証処理
 */
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * パスワードをハッシュ化
 * 
 * @param password プレーンテキストのパスワード
 * @param salt ソルト（旧システム互換性のため）
 * @returns ハッシュ化されたパスワード
 */
export async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  // 新規パスワードの場合はbcryptを使用
  if (!salt) {
    const bcryptSalt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, bcryptSalt);
    return { hash, salt: bcryptSalt };
  }

  // 旧システムとの互換性のため、既存のソルトがある場合はSHA-256を使用
  const hash = crypto
    .createHash('sha256')
    .update(password + salt)
    .digest('hex');
  
  return { hash, salt };
}

/**
 * パスワードを検証
 * 
 * @param password 入力されたパスワード
 * @param hashedPassword 保存されているハッシュ化パスワード
 * @param salt ソルト
 * @returns パスワードが一致するかどうか
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string,
  salt: string
): Promise<boolean> {
  // bcryptでハッシュ化されたパスワードの場合
  if (hashedPassword.startsWith('$2')) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // 旧システムのSHA-256ハッシュの場合
  const { hash } = await hashPassword(password, salt);
  return hash === hashedPassword;
}

/**
 * ランダムなソルトを生成
 * 
 * @returns ランダムなソルト文字列
 */
export function generateSalt(): string {
  return crypto.randomBytes(32).toString('hex');
}