/**
 * サインアップ保存API
 * 
 * @description ユーザー新規登録処理
 */
import { NextRequest, NextResponse } from 'next/server';

// モックデータ - 本来はデータベースから取得
const SYSTEM_CONFIG = {
  USER_ADD_TYPE: 'USER' // USER, MAIL, APPROVE, ADMIN
};

const existingUsers = [
  'admin@example.com',
  'user@example.com'
];

interface SignupRequest {
  userKey: string;
  userName: string;
  password: string;
  confirm_password: string;
}

interface ValidationError {
  field: string;
  message: string;
}

interface Warning {
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json();
    
    // Check if user registration is allowed
    if (SYSTEM_CONFIG.USER_ADD_TYPE === 'ADMIN') {
      return NextResponse.json(
        { error: 'User registration is not allowed' },
        { status: 404 }
      );
    }

    // Validation
    const errors: ValidationError[] = [];
    const warnings: Warning[] = [];

    // Required field validation
    if (!body.userKey?.trim()) {
      errors.push({ field: 'userKey', message: 'errors.required' });
    }
    if (!body.userName?.trim()) {
      errors.push({ field: 'userName', message: 'errors.required' });
    }
    if (!body.password?.trim()) {
      errors.push({ field: 'password', message: 'errors.required' });
    }
    if (!body.confirm_password?.trim()) {
      errors.push({ field: 'confirm_password', message: 'errors.required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (body.userKey && !emailRegex.test(body.userKey)) {
      errors.push({ field: 'userKey', message: 'errors.invalid.email' });
    }

    // Password match validation
    if (body.password && body.confirm_password && body.password !== body.confirm_password) {
      errors.push({ field: 'confirm_password', message: 'knowledge.user.invalid.same.password' });
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Check for existing user
    if (existingUsers.includes(body.userKey.toLowerCase())) {
      // Handle based on registration type
      if (SYSTEM_CONFIG.USER_ADD_TYPE === 'MAIL') {
        // For MAIL type, return warning about existing provisional registration
        warnings.push({ message: 'knowledge.signup.exists' });
        return NextResponse.json({ warnings }, { status: 400 });
      } else if (SYSTEM_CONFIG.USER_ADD_TYPE === 'APPROVE') {
        // For APPROVE type, return warning about waiting for approval
        warnings.push({ message: 'knowledge.signup.waiting' });
        return NextResponse.json({ warnings }, { status: 400 });
      } else {
        // For USER type, return error about existing email
        errors.push({ field: 'userKey', message: 'knowledge.user.mail.exist' });
        return NextResponse.json({ errors }, { status: 400 });
      }
    }

    // Process based on registration type
    switch (SYSTEM_CONFIG.USER_ADD_TYPE) {
      case 'USER':
        // Direct registration
        // In real implementation:
        // - Create user in database
        // - Set up authentication session
        // - Send notification to admin
        console.log('Creating user directly:', body.userKey);
        return NextResponse.json({
          success: true,
          registrationType: 'USER',
          message: 'knowledge.signup.success'
        });

      case 'MAIL':
        // Email confirmation required
        // In real implementation:
        // - Create provisional registration
        // - Send confirmation email
        console.log('Creating provisional registration for:', body.userKey);
        return NextResponse.json({
          success: true,
          registrationType: 'MAIL',
          message: 'knowledge.registration.msg.mail'
        });

      case 'APPROVE':
        // Admin approval required
        // In real implementation:
        // - Create provisional registration
        // - Send notification to admin
        console.log('Creating provisional registration for admin approval:', body.userKey);
        return NextResponse.json({
          success: true,
          registrationType: 'APPROVE',
          message: 'knowledge.registration.msg.wait'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid registration type' },
          { status: 500 }
        );
    }
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}