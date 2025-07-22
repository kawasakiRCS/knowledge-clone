/**
 * 開発環境専用認証バイパスAPI
 * 
 * @description Playwright MCP統合での動作確認用エンドポイント
 * @warning 本番環境では絶対に使用禁止
 */

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { 
  isDevelopmentAuthBypassEnabled, 
  isValidDevelopmentUserType, 
  generateDevelopmentTokenPayload,
  DEVELOPMENT_USERS 
} from '@/lib/auth/devBypass';

/**
 * 開発用認証バイパス処理
 * 
 * GET /api/dev/auth/bypass?user=admin|user
 */
export async function GET(request: NextRequest) {
  // 本番環境では絶対に実行しない
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'This endpoint is not available in production' },
      { status: 404 }
    );
  }

  // 開発環境認証バイパスが有効でない場合
  if (!isDevelopmentAuthBypassEnabled()) {
    return NextResponse.json(
      { success: false, error: 'Development auth bypass is not enabled' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('user') || 'user';

    // ユーザータイプの検証
    if (!isValidDevelopmentUserType(userType)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid user type. Valid types: ${Object.keys(DEVELOPMENT_USERS).join(', ')}` 
        },
        { status: 400 }
      );
    }

    // JWTトークンペイロードを生成
    const tokenPayload = generateDevelopmentTokenPayload(userType);

    // JWTトークンを生成
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
    const token = await new SignJWT(tokenPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    // NextAuthのJWTトークンとして設定
    const response = NextResponse.json({
      success: true,
      message: `Development auth bypass activated for ${userType}`,
      user: {
        userId: tokenPayload.userId,
        userName: tokenPayload.userName,
        userKey: tokenPayload.userKey,
        role: tokenPayload.role,
      },
    });

    // HTTPOnly Cookieとしてトークンを設定
    // Next.jsの開発環境ではクッキー名が異なる場合がある
    const cookieName = process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token' 
      : 'next-auth.session-token';
      
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24時間
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Development auth bypass error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 開発用認証解除処理
 * 
 * DELETE /api/dev/auth/bypass
 */
export async function DELETE(request: NextRequest) {
  // 本番環境では絶対に実行しない
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'This endpoint is not available in production' },
      { status: 404 }
    );
  }

  const response = NextResponse.json({
    success: true,
    message: 'Development auth session cleared',
  });

  // セッションクッキーを削除
  response.cookies.delete('next-auth.session-token');

  return response;
}