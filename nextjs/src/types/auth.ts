/**
 * 認証関連の型定義
 */

export interface LoginFormData {
  username: string;
  password: string;
  page?: string;
}

export interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => void;
  initialValues?: Partial<LoginFormData>;
  loginError?: boolean;
  showDescription?: boolean;
  showSignup?: boolean;
  redirectTo?: string;
}

export interface User {
  id: number;
  userKey: string;
  userName: string;
  mailAddress?: string;
  admin?: boolean;
  locale?: string;
}

export interface LoginedUser {
  user: User;
  roles: string[];
}

export interface AuthenticationResult {
  success: boolean;
  user?: LoginedUser;
  error?: string;
}