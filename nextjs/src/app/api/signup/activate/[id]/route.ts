/**
 * メール認証API
 * 
 * @description 招待メールからの本登録処理
 */
import { NextRequest, NextResponse } from 'next/server';

// モック仮登録データ
const provisionalRegistrations = new Map([
  ['test-activation-key-123', {
    id: 'test-activation-key-123',
    userKey: 'test@example.com',
    userName: 'Test User',
    insertDatetime: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
  }]
]);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if activation key exists
    const registration = provisionalRegistrations.get(id);
    if (!registration) {
      return NextResponse.json(
        { error: 'Invalid activation key' },
        { status: 404 }
      );
    }

    // Check if activation key is expired (1 hour)
    const now = Date.now();
    const registrationTime = registration.insertDatetime.getTime();
    if (now - registrationTime > 60 * 60 * 1000) {
      return NextResponse.json(
        { error: 'Activation key has expired' },
        { status: 404 }
      );
    }

    // In real implementation:
    // - Create actual user from provisional registration
    // - Delete provisional registration
    // - Set up authentication session
    // - Send notification to admin

    return NextResponse.json({
      success: true,
      userKey: registration.userKey,
      userName: registration.userName,
      message: 'knowledge.signup.done'
    });
  } catch (error) {
    console.error('Activation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}