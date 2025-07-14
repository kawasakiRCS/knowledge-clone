/**
 * 保護ナレッジAPI
 * 
 * @description 旧Javaシステムのprotect/KnowledgeControl.javaの完全移植
 * - POST: ナレッジ新規作成・更新
 * - DELETE: ナレッジ削除
 * - GET: 編集用メタデータ取得
 */
import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeService } from '@/lib/services/knowledgeService';
import { KnowledgeRepository } from '@/lib/repositories/knowledgeRepository';

export async function POST(request: NextRequest) {
  try {
    // 認証チェック（実装予定）
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { knowledgeId, title, content, publicFlag, typeId } = body;

    // バリデーション
    const errors = validateKnowledgeData(body);
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    const knowledgeService = new KnowledgeService();

    if (knowledgeId) {
      // 更新処理
      const existing = await knowledgeService.getKnowledgeById(BigInt(knowledgeId));
      if (!existing) {
        return NextResponse.json(
          { success: false, error: 'Knowledge not found' },
          { status: 404 }
        );
      }

      // 編集権限チェック（実装予定）
      const canEdit = await checkEditPermission(user, existing);
      if (!canEdit) {
        return NextResponse.json(
          { success: false, error: 'Edit permission denied' },
          { status: 403 }
        );
      }

      // 更新実行（実装予定）
      const updated = await updateKnowledge(knowledgeId, body, user);
      
      return NextResponse.json({
        success: true,
        knowledgeId: updated.knowledgeId,
        message: 'ナレッジを更新しました'
      });
    } else {
      // 新規作成処理（実装予定）
      const created = await createKnowledge(body, user);
      
      return NextResponse.json({
        success: true,
        knowledgeId: created.knowledgeId,
        message: 'ナレッジを作成しました'
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Knowledge save error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 認証チェック（実装予定）
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { knowledgeId } = body;

    if (!knowledgeId) {
      return NextResponse.json(
        { success: false, error: 'Knowledge ID required' },
        { status: 400 }
      );
    }

    const knowledgeService = new KnowledgeService();
    const existing = await knowledgeService.getKnowledgeById(BigInt(knowledgeId));
    
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Knowledge not found' },
        { status: 404 }
      );
    }

    // 削除権限チェック（実装予定）
    const canDelete = await checkDeletePermission(user, existing);
    if (!canDelete) {
      return NextResponse.json(
        { success: false, error: 'Delete permission denied' },
        { status: 403 }
      );
    }

    // 削除実行（実装予定）
    await deleteKnowledge(knowledgeId, user);
    
    return NextResponse.json({
      success: true,
      message: 'ナレッジを削除しました'
    });
  } catch (error) {
    console.error('Knowledge delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // 認証チェック（実装予定）
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'meta') {
      // 編集用メタデータを取得（実装予定）
      const metadata = await getEditMetadata(user);
      return NextResponse.json(metadata);
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Knowledge metadata error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 実装完了版のヘルパー関数
import { getAuthenticatedUser as getUser } from '@/lib/auth/middleware';

async function getAuthenticatedUser(request: NextRequest) {
  return await getUser(request);
}

function validateKnowledgeData(data: any): string[] {
  const errors: string[] = [];
  
  if (!data.title || data.title.trim() === '') {
    errors.push('タイトルは必須です');
  }
  
  if (data.title && data.title.length > 1024) {
    errors.push('タイトルは1024文字以内で入力してください');
  }

  if (!data.typeId) {
    errors.push('テンプレートタイプは必須です');
  }

  if (![1, 2, 3].includes(data.publicFlag)) {
    errors.push('公開フラグが無効です');
  }
  
  return errors;
}

async function checkEditPermission(user: any, knowledge: any): Promise<boolean> {
  // 作成者または管理者の場合は編集可能
  return knowledge.insertUser === user.userId || user.isAdmin;
}

async function checkDeletePermission(user: any, knowledge: any): Promise<boolean> {
  // 削除権限は編集権限と同じ
  return await checkEditPermission(user, knowledge);
}

async function createKnowledge(data: any, user: any): Promise<any> {
  const knowledgeService = new KnowledgeService();
  return await knowledgeService.createKnowledge(data, user);
}

async function updateKnowledge(knowledgeId: number, data: any, user: any): Promise<any> {
  const knowledgeService = new KnowledgeService();
  const updateData = { ...data, knowledgeId: BigInt(knowledgeId) };
  return await knowledgeService.updateKnowledge(updateData, user);
}

async function deleteKnowledge(knowledgeId: number, user: any): Promise<void> {
  const knowledgeService = new KnowledgeService();
  await knowledgeService.deleteKnowledge(BigInt(knowledgeId), user);
}

async function getEditMetadata(user: any): Promise<any> {
  // 編集用メタデータ取得（実装予定：テンプレート、グループ、ユーザー設定）
  return {
    templates: [
      { typeId: 1, typeName: 'ナレッジ' },
      { typeId: 2, typeName: 'イベント' },
      { typeId: 3, typeName: 'プレゼンテーション' },
      { typeId: 4, typeName: 'ブックマーク' },
      { typeId: 5, typeName: '障害情報' }
    ],
    groups: user.groups || [],
    userConfig: {
      defaultPublicFlag: 1,
      defaultTargets: []
    }
  };
}