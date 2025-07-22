/**
 * 開発環境専用認証バイパスAPI
 * 
 * @description Playwright MCP統合での動作確認用エンドポイント
 * @warning 本番環境では絶対に使用禁止
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { encode } from 'next-auth/jwt';
import { 
  isDevelopmentAuthBypassEnabled, 
  isValidDevelopmentUserType,
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

  console.log('[DEV AUTH BYPASS] Request received:', {
    url: request.url,
    nodeEnv: process.env.NODE_ENV,
    authBypass: process.env.DEVELOPMENT_AUTH_BYPASS
  });

  // 開発環境認証バイパスが有効でない場合
  if (!isDevelopmentAuthBypassEnabled()) {
    const response = {
      success: false, 
      error: 'Development auth bypass is not enabled',
      env: {
        NODE_ENV: process.env.NODE_ENV,
        DEVELOPMENT_AUTH_BYPASS: process.env.DEVELOPMENT_AUTH_BYPASS
      }
    };
    console.log('[DEV AUTH BYPASS] Not enabled:', response);
    return NextResponse.json(response, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('user') || 'user';

    console.log('[DEV AUTH BYPASS] Processing user type:', userType);

    // ユーザータイプの検証
    if (!isValidDevelopmentUserType(userType)) {
      const response = { 
        success: false, 
        error: `Invalid user type. Valid types: ${Object.keys(DEVELOPMENT_USERS).join(', ')}` 
      };
      console.log('[DEV AUTH BYPASS] Invalid user type:', response);
      return NextResponse.json(response, { status: 400 });
    }

    // 開発用ユーザー情報を取得
    const user = DEVELOPMENT_USERS[userType];
    console.log('[DEV AUTH BYPASS] User data:', user);
    
    // NextAuth互換のJWTトークンを生成
    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
      // NextAuth標準フィールド
      iat: now,
      exp: now + (24 * 60 * 60), // 24時間後
      
      // カスタムユーザー情報
      userId: user.userId,
      userName: user.userName,
      userKey: user.userKey,
      role: user.role,
      unreadCount: user.unreadCount,
      
      // 開発モード識別子
      isDevelopmentBypass: true,
    };

    console.log('[DEV AUTH BYPASS] Token payload prepared:', tokenPayload);

    // NextAuthのencodeを使用してトークン生成
    const jwtToken = await encode({
      token: tokenPayload,
      secret: process.env.NEXTAUTH_SECRET!,
    });

    console.log('[DEV AUTH BYPASS] JWT token generated');

    // レスポンス準備
    const response = NextResponse.json({
      success: true,
      message: `Development auth bypass activated for ${userType}`,
      user: {
        userId: user.userId,
        userName: user.userName,
        userKey: user.userKey,
        role: user.role,
      },
      redirect: '/protect/knowledge/edit', // 認証後のリダイレクト先
      debug: {
        timestamp: new Date().toISOString(),
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          DEVELOPMENT_AUTH_BYPASS: process.env.DEVELOPMENT_AUTH_BYPASS
        }
      }
    });

    // NextAuth互換のセッションCookieを設定
    const cookieName = process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token' 
      : 'next-auth.session-token';
      
    response.cookies.set(cookieName, jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24時間
      path: '/',
    });

    console.log('[DEV AUTH BYPASS] Cookie set:', cookieName);
    return response;

  } catch (error) {
    console.error('Development auth bypass error:', error);
    
    // デバッグ用のエラー詳細情報
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    const errorResponse = { 
      success: false, 
      error: 'Internal server error', 
      debug: { 
        message: errorMessage,
        stack: stack
      }
    };
    
    console.log('[DEV AUTH BYPASS] Error response:', errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
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