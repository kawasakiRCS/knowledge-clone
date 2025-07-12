import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, password, confirmPassword } = body;
    
    // バリデーション
    if (!password) {
      return NextResponse.json({
        success: false,
        error: 'パスワードは必須です',
      });
    }
    
    if (!confirmPassword) {
      return NextResponse.json({
        success: false,
        error: 'パスワード(確認)は必須です',
      });
    }
    
    if (password !== confirmPassword) {
      return NextResponse.json({
        success: false,
        error: 'パスワードが一致しません',
      });
    }
    
    // キーの再検証（実際の実装ではデータベースで確認）
    if (!key || !key.includes('test-reset-key')) {
      return NextResponse.json({
        success: false,
        error: 'リセットキーが無効です',
      });
    }
    
    // パスワード更新処理（実際の実装ではデータベース更新）
    // ここではモックとして成功を返す
    console.log('Password reset for key:', key);
    console.log('New password set');
    
    // リセットキーの削除（実際の実装で行う）
    
    return NextResponse.json({
      success: true,
      message: 'パスワードが正常に変更されました',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({
      success: false,
      error: 'パスワード変更中にエラーが発生しました',
    });
  }
}