/**
 * 保護アカウントAPI
 * 
 * @description 旧Javaシステムのprotect/AccountControl.javaの完全移植
 * - GET: アカウント情報取得・デフォルト設定表示
 * - POST: アカウント更新・アイコンアップロード・メール変更・設定保存
 * - DELETE: アカウント削除（退会）
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { AccountService } from '@/lib/services/accountService';

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const accountService = new AccountService();

    switch (action) {
      case 'info':
        return await handleGetAccountInfo(user, accountService);
        
      case 'targets':
        return await handleGetDefaultTargets(user, accountService);
        
      case 'changekey':
        return await handleGetChangeEmailForm(accountService);
        
      default:
        // デフォルトはアカウント情報取得
        return await handleGetAccountInfo(user, accountService);
    }
  } catch (error) {
    console.error('Account GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    const accountService = new AccountService();

    switch (action) {
      case 'update':
        return await handleAccountUpdate(user, body, accountService);
        
      case 'iconupload':
        return await handleIconUpload(user, body, accountService);
        
      case 'changerequest':
        return await handleEmailChangeRequest(user, body, accountService);
        
      case 'savetargets':
        return await handleSaveTargets(user, body, accountService);
        
      default:
        // デフォルトはアカウント更新
        return await handleAccountUpdate(user, body, accountService);
    }
  } catch (error) {
    console.error('Account POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 認証チェック
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { knowledge_remove } = body;

    const accountService = new AccountService();
    
    // 退会処理
    const knowledgeRemove = knowledge_remove !== '2'; // "2"以外はナレッジも削除
    await accountService.withdrawUser(user.userId, knowledgeRemove);

    // セッション無効化は呼び出し側で実行

    return NextResponse.json({
      success: true,
      message: 'アカウントを削除しました'
    });
  } catch (error) {
    console.error('Account DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * アカウント情報取得処理
 */
async function handleGetAccountInfo(user: any, accountService: AccountService) {
  const accountInfo = await accountService.getUserInfo(user.userId);
  
  if (!accountInfo) {
    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 404 }
    );
  }

  // システム設定情報を取得
  const systemConfig = await accountService.getSystemConfig();

  return NextResponse.json({
    success: true,
    user: {
      userId: accountInfo.userId,
      userName: accountInfo.userName,
      userKey: accountInfo.userKey,
      mailAddress: accountInfo.mailAddress,
      insertDatetime: accountInfo.insertDatetime,
      updateDatetime: accountInfo.updateDatetime
    },
    systemConfig: {
      userAddType: systemConfig.userAddType
    }
  });
}

/**
 * デフォルト公開範囲取得処理
 */
async function handleGetDefaultTargets(user: any, accountService: AccountService) {
  const userConfig = await accountService.getUserConfig(user.userId);
  
  return NextResponse.json({
    success: true,
    config: {
      publicFlag: userConfig.defaultPublicFlag || '1',
      targets: userConfig.defaultTargets || [],
      viewers: userConfig.defaultViewers || []
    }
  });
}

/**
 * メールアドレス変更フォーム取得処理
 */
async function handleGetChangeEmailForm(accountService: AccountService) {
  const systemConfig = await accountService.getSystemConfig();
  
  // ダブルオプトインでの登録時のみメールアドレス変更可能
  if (systemConfig.userAddType !== 'MAIL') {
    return NextResponse.json(
      { success: false, error: 'Email change not allowed' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Email change form available'
  });
}

/**
 * アカウント更新処理
 */
async function handleAccountUpdate(user: any, data: any, accountService: AccountService) {
  // バリデーション
  const errors = validateAccountData(data);
  if (errors.length > 0) {
    return NextResponse.json(
      { success: false, errors },
      { status: 400 }
    );
  }

  try {
    const updatedUser = await accountService.updateUserInfo(user.userId, {
      userName: data.userName,
      password: data.password || undefined,
      userKey: data.userKey || undefined
    });

    return NextResponse.json({
      success: true,
      message: 'アカウント情報を更新しました',
      user: updatedUser
    });
  } catch (error) {
    console.error('Account update error:', error);
    return NextResponse.json(
      { success: false, error: 'Update failed' },
      { status: 400 }
    );
  }
}

/**
 * アイコンアップロード処理
 */
async function handleIconUpload(user: any, data: any, accountService: AccountService) {
  const { fileimg } = data;
  
  if (!fileimg) {
    return NextResponse.json(
      { success: false, error: 'Image is required' },
      { status: 400 }
    );
  }

  if (!fileimg.startsWith('data:image/png;base64,')) {
    return NextResponse.json(
      { success: false, error: 'Invalid image format' },
      { status: 400 }
    );
  }

  try {
    const base64Data = fileimg.substring('data:image/png;base64,'.length);
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // ファイルサイズチェック（5MB）
    const maxSize = 5 * 1024 * 1024;
    if (imageBuffer.length > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    const result = await accountService.saveIconImage(imageBuffer, user);
    
    return NextResponse.json({
      success: true,
      message: 'アイコンを更新しました',
      file: result
    });
  } catch (error) {
    console.error('Icon upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Icon upload failed' },
      { status: 500 }
    );
  }
}

/**
 * メールアドレス変更リクエスト処理
 */
async function handleEmailChangeRequest(user: any, data: any, accountService: AccountService) {
  const { userKey } = data;
  
  if (!userKey || !isValidEmail(userKey)) {
    return NextResponse.json(
      { success: false, error: 'Valid email address is required' },
      { status: 400 }
    );
  }

  try {
    const errors = await accountService.saveChangeEmailRequest(userKey, user);
    
    if (errors && errors.length > 0) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'メールアドレス変更リクエストを受け付けました'
    });
  } catch (error) {
    console.error('Email change request error:', error);
    return NextResponse.json(
      { success: false, error: 'Email change request failed' },
      { status: 500 }
    );
  }
}

/**
 * デフォルト設定保存処理
 */
async function handleSaveTargets(user: any, data: any, accountService: AccountService) {
  const { publicFlag, viewers } = data;

  try {
    await accountService.saveUserConfig(user.userId, {
      defaultPublicFlag: publicFlag,
      defaultTargets: viewers
    });

    return NextResponse.json({
      success: true,
      message: 'デフォルト設定を保存しました'
    });
  } catch (error) {
    console.error('Save targets error:', error);
    return NextResponse.json(
      { success: false, error: 'Save failed' },
      { status: 500 }
    );
  }
}

/**
 * アカウントデータのバリデーション
 */
function validateAccountData(data: any): string[] {
  const errors: string[] = [];

  if (!data.userName || data.userName.trim() === '') {
    errors.push('ユーザー名は必須です');
  }

  if (data.password && data.password !== data.confirm_password) {
    errors.push('パスワードと確認用パスワードが一致しません');
  }

  if (data.userKey && !isValidEmail(data.userKey)) {
    errors.push('有効なメールアドレスを入力してください');
  }

  return errors;
}

/**
 * メールアドレス形式チェック
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}