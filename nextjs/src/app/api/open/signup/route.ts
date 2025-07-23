/**
 * サインアップAPI
 * 
 * @description 旧Java SignupControl.javaの完全移植
 * TDD実装: Green実装（テスト通過のための最小実装）
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { SystemConfig } from '@/lib/constants/systemConfig';
import { validateSignupData, SignupRequest } from '@/lib/validation/signupValidation';
import { sendInvitationEmail } from '@/lib/services/mailService';
import { sendNotifyAddUser, sendNotifyAcceptUser } from '@/lib/services/notificationService';

/**
 * ユーザーサインアップ処理
 * 
 * @description 
 * 3つのサインアップモードに対応:
 * - USER: 即座にユーザー作成
 * - MAIL: 招待メール送信
 * - APPROVE: 管理者承認待ち
 */
export async function POST(request: NextRequest) {
  try {
    // システム設定取得
    const systemConfig = await prisma.systemConfig.findFirst({
      where: {
        configName: SystemConfig.USER_ADD_TYPE,
      },
    });

    // システム設定が存在しない、または管理者のみ追加可能な場合は404
    if (!systemConfig || systemConfig.configValue === SystemConfig.USER_ADD_TYPE_VALUE_ADMIN) {
      return NextResponse.json(
        { success: false, message: 'NOT FOUND' },
        { status: 404 }
      );
    }

    // リクエストボディの取得
    const userData: Partial<SignupRequest> = await request.json();

    // バリデーション
    const errors = validateSignupData(userData);

    // ユーザーの存在チェック
    if (userData.userKey) {
      const existingUser = await prisma.user.findFirst({
        where: { userKey: userData.userKey },
      });
      if (existingUser) {
        errors.push({
          field: 'userKey',
          message: 'knowledge.user.mail.exist',
        });
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    const userAddType = systemConfig.configValue;

    // USER: 即座にユーザー作成
    if (userAddType === SystemConfig.USER_ADD_TYPE_VALUE_USER) {
      const newUser = await prisma.user.create({
        data: {
          userKey: userData.userKey!,
          userName: userData.userName!,
          password: userData.password!, // TODO: ハッシュ化実装
          insertDatetime: new Date(),
        },
      });

      // 管理者に通知
      await sendNotifyAddUser({
        userId: BigInt(newUser.userId),
        userKey: newUser.userKey,
        userName: newUser.userName,
      });

      return NextResponse.json({
        success: true,
        message: 'knowledge.signup.success',
      });
    }

    // MAIL: 招待メール送信
    if (userAddType === SystemConfig.USER_ADD_TYPE_VALUE_MAIL) {
      // 既存の仮登録をチェック
      const existingRegistrations = await prisma.provisionalRegistration.findMany({
        where: { userKey: userData.userKey! },
      });

      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // 期限切れの仮登録を削除
      for (const registration of existingRegistrations) {
        if (registration.insertDatetime && registration.insertDatetime < oneHourAgo) {
          await prisma.provisionalRegistration.deleteMany({
            where: { id: registration.id },
          });
        } else {
          // 有効な仮登録が存在する場合
          return NextResponse.json(
            { success: false, message: 'knowledge.signup.exists' },
            { status: 400 }
          );
        }
      }

      // 仮登録作成
      const registration = await prisma.provisionalRegistration.create({
        data: {
          id: `${Math.random().toString(36)}-${Date.now()}`,
          userKey: userData.userKey!,
          userName: userData.userName!,
          password: userData.password!, // TODO: ハッシュ化実装
          salt: 'dummy_salt', // TODO: 実装
          insertDatetime: new Date(),
        },
      });

      // 招待メール送信
      await sendInvitationEmail(registration, 'http://localhost:3000', 'ja');

      return NextResponse.json({
        success: true,
        message: 'knowledge.signup.mail.sent',
      });
    }

    // APPROVE: 管理者承認待ち
    if (userAddType === SystemConfig.USER_ADD_TYPE_VALUE_APPROVE) {
      // 既存の承認待ちをチェック
      const existingRegistrations = await prisma.provisionalRegistration.findMany({
        where: { userKey: userData.userKey! },
      });

      if (existingRegistrations.length > 0) {
        return NextResponse.json(
          { success: false, message: 'knowledge.signup.waiting' },
          { status: 400 }
        );
      }

      // 仮登録作成
      const registration = await prisma.provisionalRegistration.create({
        data: {
          id: `approval-${Math.random().toString(36)}-${Date.now()}`,
          userKey: userData.userKey!,
          userName: userData.userName!,
          password: userData.password!, // TODO: ハッシュ化実装
          salt: 'dummy_salt', // TODO: 実装
          insertDatetime: new Date(),
        },
      });

      // 管理者に承認待ち通知
      await sendNotifyAcceptUser(registration);

      return NextResponse.json({
        success: true,
        message: 'knowledge.signup.waiting.approval',
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid configuration' },
      { status: 500 }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}