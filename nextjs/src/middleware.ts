/**
 * Next.js Middleware
 * 
 * @description ページとAPIの認証保護を行う
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * 常に公開のパス（認証不要）
 */
const ALWAYS_PUBLIC_PATHS = [
  // 認証関連
  '/signin',
  '/api/auth',
  
  // 基本ページ
  '/',
  '/index',
  
  // 限定的な公開ページ（具体的なパスを指定）
  '/open/signup/*',
  '/open/passwordinitialization/*',
  '/open/account/*',
  
  // 公開API（最小限）
  '/api/password', // パスワードリセット
  '/api/signup',   // サインアップ
  
  // 開発環境専用（本番では無効）
  '/api/dev/*',    // 開発用API
  
  // 静的ファイル
  '/favicon.ico',
  '/_next',
  '/images',
  '/css',
  '/js',
  '/bower',
  
  // エラーページ
  '/authorizer_error',
  '/not-found',
  '/error',
];

/**
 * 読み取り専用（認証不要）のAPI
 * 注意: 現在はCLOSEモードのため、これらも認証が必要
 */
const READ_ONLY_APIS: string[] = [
  // CLOSEモードでは全て認証必須のため、空配列
  // OPENモードに変更する場合は以下を有効化:
  // '/api/knowledge/list',      // ナレッジ一覧（公開）
  // '/api/knowledge/[id]',      // ナレッジ詳細（公開分のみ）
  // '/api/knowledge/histories', // 履歴表示（公開分のみ）
  // '/api/knowledge/show-history', // 履歴詳細（公開分のみ）
];

/**
 * 管理者権限が必要なパス
 */
const ADMIN_PATHS = [
  '/admin',
  '/api/admin',
  '/protect/admin',
  '/api/protect/admin',
];

/**
 * パスが指定されたパターンにマッチするかチェック
 */
function matchesPath(pathname: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    if (pattern.endsWith('*')) {
      // ワイルドカード: /open/account/* なら /open/account/ で始まるかチェック
      const prefix = pattern.slice(0, -1);
      return pathname.startsWith(prefix);
    }
    // 完全一致または /path/ で始まるかチェック
    return pathname === pattern || pathname.startsWith(pattern + '/');
  });
}

/**
 * パスが公開かどうかをチェック
 * 現在は閉鎖モード固定（SYSTEM_EXPOSE_TYPE=CLOSE）
 */
function isPublicPath(pathname: string): boolean {
  // 常に公開のパスのみをチェック（/open/knowledge/* は含まれない）
  return matchesPath(pathname, ALWAYS_PUBLIC_PATHS);
}

/**
 * パスが読み取り専用APIかチェック
 */
function isReadOnlyAPI(pathname: string): boolean {
  return READ_ONLY_APIS.some(pattern => {
    // 動的ルート [id] の処理
    const regexPattern = pattern.replace(/\[[w]+\]/g, '[^/]+');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(pathname);
  });
}

/**
 * パスが管理者権限必要かチェック
 */
function isAdminPath(pathname: string): boolean {
  return matchesPath(pathname, ADMIN_PATHS);
}

/**
 * 開発モードかつ認証バイパスが有効かチェック
 */
function isDevelopmentAuthBypassEnabled(): boolean {
  const nodeEnv = process.env.NODE_ENV;
  const authBypass = process.env.DEVELOPMENT_AUTH_BYPASS;
  
  console.log('[DEV] Environment check:', {
    NODE_ENV: nodeEnv,
    DEVELOPMENT_AUTH_BYPASS: authBypass,
    enabled: nodeEnv === 'development' && authBypass === 'true'
  });
  
  return nodeEnv === 'development' && authBypass === 'true';
}

/**
 * 開発モード用認証バイパス判定
 */
function shouldBypassAuthInDevelopment(request: NextRequest): boolean {
  if (!isDevelopmentAuthBypassEnabled()) {
    console.log('[DEV] Auth bypass not enabled');
    return false;
  }
  
  const { searchParams } = request.nextUrl;
  const hasDevUser = searchParams.has('dev_user');
  const isDevApi = request.nextUrl.pathname.startsWith('/api/dev/');
  
  console.log('[DEV] Bypass check:', {
    pathname: request.nextUrl.pathname,
    hasDevUser,
    isDevApi,
    shouldBypass: hasDevUser || isDevApi
  });
  
  // dev_userパラメータが指定されている場合のみバイパス
  return hasDevUser || isDevApi;
}

/**
 * Middleware関数
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('[MIDDLEWARE] Processing:', {
    pathname,
    method: request.method,
    searchParams: Object.fromEntries(request.nextUrl.searchParams.entries())
  });

  // 公開パスの場合はそのまま通す
  if (isPublicPath(pathname)) {
    console.log('[MIDDLEWARE] Public path, allowing access');
    return NextResponse.next();
  }

  // 読み取り専用APIの場合はそのまま通す（各APIで個別に権限チェック）
  if (isReadOnlyAPI(pathname)) {
    console.log('[MIDDLEWARE] Read-only API, allowing access');
    return NextResponse.next();
  }

  // 開発モードでの認証バイパスチェック
  if (shouldBypassAuthInDevelopment(request)) {
    console.log('[MIDDLEWARE] Development auth bypass activated, allowing access');
    return NextResponse.next();
  }

  try {
    // NextAuth JWTトークンを取得
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // 認証が必要なパスで未認証の場合
    if (!token) {
      // APIの場合は401を返す
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: '認証が必要です' },
          { status: 401 }
        );
      }
      
      // ページの場合はサインインページにリダイレクト
      const signInUrl = new URL('/signin', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // 管理者権限が必要なパスで管理者でない場合
    if (isAdminPath(pathname) && token.role !== 'admin') {
      // APIの場合は403を返す
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: '管理者権限が必要です' },
          { status: 403 }
        );
      }
      
      // ページの場合は403ページにリダイレクト
      return NextResponse.redirect(new URL('/authorizer_error', request.url));
    }

    return NextResponse.next();
    
  } catch (error) {
    console.error('Middleware error:', error);
    
    // エラーの場合は認証エラーページにリダイレクト
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'サーバーエラーが発生しました' },
        { status: 500 }
      );
    }
    
    return NextResponse.redirect(new URL('/authorizer_error', request.url));
  }
}

/**
 * Middlewareを適用するパスの設定
 */
export const config = {
  matcher: [
    /*
     * 以下のパスを除く全てのパスにMiddlewareを適用:
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico (ファビコン)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};