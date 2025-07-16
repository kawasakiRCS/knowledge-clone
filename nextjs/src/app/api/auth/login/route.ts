/**
 * 認証APIエンドポイント
 * 
 * @description ユーザー認証処理を行うAPIルート
 */
import { NextRequest, NextResponse } from 'next/server';
import { findUserByLoginId, getUserPassword, updateLastLoginTime } from '@/repositories/userRepository';
import { verifyPassword } from '@/lib/auth/password';
import { LoginedUser } from '@/types/auth';

/**
 * ログイン処理
 * 
 * @param request NextRequest
 * @returns 認証結果
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { loginId, password } = body;

    // 入力検証
    if (!loginId || !password) {
      return NextResponse.json(
        { success: false, error: 'ログインIDとパスワードを入力してください' },
        { status: 400 }
      );
    }

    // ユーザー検索
    const user = await findUserByLoginId(loginId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'ログインIDまたはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    // パスワード情報取得
    const passwordInfo = await getUserPassword(user.userId);
    if (!passwordInfo) {
      return NextResponse.json(
        { success: false, error: 'パスワード情報が見つかりません' },
        { status: 500 }
      );
    }

    // パスワード検証
    const isValid = await verifyPassword(password, passwordInfo.password, passwordInfo.salt);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'ログインIDまたはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    // 最終ログイン日時更新
    await updateLastLoginTime(user.userId);

    // ユーザー情報を返却（NextAuthで使用）
    const loginedUser: LoginedUser = {
      userId: user.userId,
      userName: user.userName,
      userKey: user.userKey,
      locale: user.localeKey || 'ja',
      role: user.roleFlag === 1 ? 'admin' : 'user',
      unreadCount: 0, // TODO: 未読通知数の取得
      // groups: [] // TODO: グループ情報の取得
    };

    return NextResponse.json({
      success: true,
      user: loginedUser
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'ログイン処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}