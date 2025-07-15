/**
 * 公開アカウントAPI
 * 
 * @description 旧Javaシステムのopen/AccountControl.javaの完全移植
 * - GET /[id]/icon: ユーザーアイコン取得
 * - GET /[id]/info: ユーザー情報・ナレッジ一覧取得
 * - GET /[id]/cp: CPチャート履歴取得
 * - GET /[id]/knowledge: ユーザーナレッジ一覧取得
 * - GET /[id]/activity: アクティビティ履歴取得
 */
import { NextRequest, NextResponse } from 'next/server';
import { AccountService } from '@/lib/services/accountService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { pathname } = new URL(request.url);
    
    // /open/account/icon/X の場合はアイコン処理
    if (pathname.match(/\/open\/account\/icon\/\d+/)) {
      const userId = parseInt(resolvedParams.id);
      const accountService = new AccountService();
      return await handleIconRequest(userId, accountService);
    }
    
    const userId = parseInt(resolvedParams.id);
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'info'; // デフォルトはinfo

    // ユーザーIDバリデーション
    if (isNaN(userId) && userId !== -1) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const accountService = new AccountService();

    switch (action) {
      case 'icon':
        return await handleIconRequest(userId, accountService);
        
      case 'info':
        return await handleInfoRequest(userId, request, accountService);
        
      case 'cp':
        return await handleCPRequest(userId, accountService);
        
      case 'knowledge':
        return await handleKnowledgeRequest(userId, request, accountService);
        
      case 'activity':
        return await handleActivityRequest(userId, request, accountService);
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Account API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * アイコン取得リクエスト処理
 */
async function handleIconRequest(userId: number, accountService: AccountService) {
  try {
    const iconData = await accountService.getUserIcon(userId);
    
    if (!iconData) {
      // デフォルトアイコンを返す
      const defaultIcon = await accountService.getDefaultIcon();
      return new NextResponse(defaultIcon.data, {
        headers: {
          'Content-Type': defaultIcon.contentType,
          'Content-Length': defaultIcon.size.toString(),
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }

    return new NextResponse(iconData.data, {
      headers: {
        'Content-Type': iconData.contentType,
        'Content-Length': iconData.size.toString(),
        'Content-Disposition': `inline; filename="${iconData.fileName}"`,
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Icon fetch error:', error);
    // エラー時はデフォルトアイコンを返す
    const defaultIcon = await accountService.getDefaultIcon();
    return new NextResponse(defaultIcon.data, {
      headers: {
        'Content-Type': defaultIcon.contentType,
        'Content-Length': defaultIcon.size.toString(),
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }
}

/**
 * ユーザー情報取得リクエスト処理
 */
async function handleInfoRequest(userId: number, request: NextRequest, accountService: AccountService) {
  const user = await accountService.getUserInfo(userId);
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 404 }
    );
  }

  // ページネーション処理
  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get('offset') || '0');
  const limit = 50; // PAGE_LIMIT

  // 現在のユーザー情報を取得（認証状態の確認）
  const currentUser = await getCurrentUser(request);
  
  // ユーザーのナレッジ一覧を取得
  const knowledges = await accountService.getUserKnowledges(userId, currentUser, offset * limit, limit);
  
  // ポイント情報を取得
  const point = await accountService.getUserPoint(userId);

  return NextResponse.json({
    success: true,
    user: {
      userId: user.userId,
      userName: user.userName,
      userKey: user.userKey,
      insertDatetime: user.insertDatetime,
      updateDatetime: user.updateDatetime
    },
    knowledges,
    point,
    pagination: {
      offset,
      previous: Math.max(0, offset - 1),
      next: offset + 1
    }
  });
}

/**
 * CP履歴取得リクエスト処理
 */
async function handleCPRequest(userId: number, accountService: AccountService) {
  const user = await accountService.getUserInfo(userId);
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 404 }
    );
  }

  const cpHistory = await accountService.getUserCPHistory(userId);
  
  return NextResponse.json({
    success: true,
    cpHistory
  });
}

/**
 * ナレッジ一覧取得リクエスト処理
 */
async function handleKnowledgeRequest(userId: number, request: NextRequest, accountService: AccountService) {
  const user = await accountService.getUserInfo(userId);
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 404 }
    );
  }

  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get('offset') || '0');
  const limit = 50; // PAGE_LIMIT

  const currentUser = await getCurrentUser(request);
  const knowledges = await accountService.getUserKnowledges(userId, currentUser, offset * limit, limit);

  return NextResponse.json({
    success: true,
    knowledges
  });
}

/**
 * アクティビティ履歴取得リクエスト処理
 */
async function handleActivityRequest(userId: number, request: NextRequest, accountService: AccountService) {
  const user = await accountService.getUserInfo(userId);
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 404 }
    );
  }

  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get('offset') || '0');
  const limit = 20;

  const activityHistory = await accountService.getUserActivity(userId, limit, offset);

  return NextResponse.json({
    success: true,
    activityHistory
  });
}

/**
 * 現在のユーザー情報を取得（認証状態の確認）
 */
async function getCurrentUser(request: NextRequest): Promise<any> {
  // 認証システム実装後に適切に実装
  // 現在はモック実装
  return null;
}