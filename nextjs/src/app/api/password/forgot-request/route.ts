/**
 * パスワードリセット要求API
 * 
 * @description 旧システムの PasswordInitializationControl.request() を移植
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    // バリデーション
    if (!username || !username.trim()) {
      return NextResponse.json(
        { error: 'メールアドレスは必須です' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      return NextResponse.json(
        { error: '有効なメールアドレスを入力してください' },
        { status: 400 }
      );
    }

    // TODO: 実際の実装では以下の処理を行う
    // 1. データベースでユーザーを検索
    // 2. パスワードリセット用のトークンを生成
    // 3. password_resetsテーブルに保存
    // 4. リセットメールを送信

    // 現在はモック実装
    console.log('Password reset requested for:', username);

    // 本番実装では、ユーザーが存在しない場合でも成功を返す（セキュリティのため）
    return NextResponse.json({ 
      success: true,
      message: 'パスワードリセットメールを送信しました' 
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}