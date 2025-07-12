import { NextRequest, NextResponse } from 'next/server';

// モックデータ（実際の実装ではデータベースから取得）
const validResetKeys = new Map([
  ['test-reset-key-123', {
    userKey: 'test@example.com',
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30分前
  }],
  ['expired-key', {
    userKey: 'expired@example.com',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2時間前（期限切れ）
  }],
]);

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  const { key } = params;
  
  // リセットキーの検証
  const resetData = validResetKeys.get(key);
  
  if (!resetData) {
    return NextResponse.json(
      { error: 'Not Found' },
      { status: 404 }
    );
  }
  
  // 有効期限チェック（1時間）
  const now = new Date();
  const expirationTime = new Date(resetData.createdAt.getTime() + 60 * 60 * 1000);
  
  if (now > expirationTime) {
    return NextResponse.json({
      success: false,
      error: 'リセットキーの有効期限が切れています',
    });
  }
  
  // 有効なキーの場合
  return NextResponse.json({
    success: true,
    data: {
      userKey: resetData.userKey,
      key: key,
    },
  });
}