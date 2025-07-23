/**
 * サインアップバリデーション
 * 
 * @description 旧Java SignupControl.javaのvalidate()メソッド移植
 */
export interface SignupRequest {
  userKey: string; // メールアドレス
  userName: string;
  password: string;
  confirm_password: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * サインアップデータのバリデーション
 */
export function validateSignupData(data: Partial<SignupRequest>): ValidationError[] {
  const errors: ValidationError[] = [];

  // 必須フィールドチェック
  if (!data.userKey || data.userKey.trim() === '') {
    errors.push({
      field: 'userKey',
      message: 'errors.required.userKey',
    });
  }

  if (!data.userName || data.userName.trim() === '') {
    errors.push({
      field: 'userName',
      message: 'errors.required.userName',
    });
  }

  if (!data.password || data.password.trim() === '') {
    errors.push({
      field: 'password',
      message: 'errors.required.password',
    });
  }

  // メールアドレス形式チェック
  if (data.userKey && data.userKey.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.userKey)) {
      errors.push({
        field: 'userKey',
        message: 'errors.invalid.email',
      });
    }
  }

  // パスワード確認チェック
  if (data.password && data.confirm_password && data.password !== data.confirm_password) {
    errors.push({
      field: 'confirm_password',
      message: 'knowledge.user.invalid.same.password',
    });
  }

  // フィールド長制限チェック
  if (data.userKey && data.userKey.length > 255) {
    errors.push({
      field: 'userKey',
      message: 'errors.maxlength.userKey',
    });
  }

  if (data.userName && data.userName.length > 255) {
    errors.push({
      field: 'userName',
      message: 'errors.maxlength.userName',
    });
  }

  if (data.password && data.password.length > 255) {
    errors.push({
      field: 'password',
      message: 'errors.maxlength.password',
    });
  }

  return errors;
}