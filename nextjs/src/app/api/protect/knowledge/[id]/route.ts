/**
 * 個別ナレッジ編集用API
 * 
 * @description 指定されたナレッジの編集用データを取得する
 * @description 編集権限チェックを含む
 */
import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeService } from '@/lib/services/knowledgeService';
import { TagService } from '@/lib/services/tagService';
import { getAuthenticatedUser } from '@/lib/auth/middleware';

/**
 * 編集用ナレッジ取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const knowledgeId = parseInt(resolvedParams.id, 10);
    if (isNaN(knowledgeId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid knowledge ID' },
        { status: 400 }
      );
    }

    const knowledgeService = new KnowledgeService();
    const knowledge = await knowledgeService.getKnowledgeById(BigInt(knowledgeId));

    if (!knowledge) {
      return NextResponse.json(
        { success: false, error: 'Knowledge not found' },
        { status: 404 }
      );
    }

    // 編集権限チェック
    const canEdit = await checkEditPermission(user, knowledge);
    if (!canEdit) {
      return NextResponse.json(
        { success: false, error: 'この記事を編集する権限がありません' },
        { status: 403 }
      );
    }

    // タグ情報を取得
    const tagService = new TagService();
    const tags = await tagService.getTagsByKnowledgeId(BigInt(knowledgeId));

    return NextResponse.json({
      success: true,
      knowledgeId: knowledge.knowledgeId,
      title: knowledge.title,
      content: knowledge.content,
      publicFlag: knowledge.publicFlag,
      typeId: knowledge.typeId,
      commentFlag: knowledge.commentFlag,
      tags: tags.map(tag => tag.tagName),
      editors: [], // TODO: 編集者リストの実装
      viewers: [], // TODO: 閲覧者リストの実装
      insertUser: knowledge.insertUser,
      insertDatetime: knowledge.insertDatetime,
      updateUser: knowledge.updateUser,
      updateDatetime: knowledge.updateDatetime,
    });
  } catch (error) {
    console.error('Knowledge edit data fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * ナレッジ更新
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const knowledgeId = parseInt(resolvedParams.id, 10);
    if (isNaN(knowledgeId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid knowledge ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, content, publicFlag, typeId, draft, tags, commentFlag } = body;

    // バリデーション
    const errors = validateKnowledgeData(body);
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, errors },
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

    // 編集権限チェック
    const canEdit = await checkEditPermission(user, existing);
    if (!canEdit) {
      return NextResponse.json(
        { success: false, error: 'この記事を編集する権限がありません' },
        { status: 403 }
      );
    }

    // 更新実行
    const updateData = {
      knowledgeId: BigInt(knowledgeId),
      title,
      content,
      publicFlag: convertPublicFlag(publicFlag),
      typeId: typeId || 1,
      draft: draft || false,
      commentFlag: commentFlag ?? true,
    };

    const updated = await knowledgeService.updateKnowledge(updateData, user);

    // タグ更新
    if (tags && Array.isArray(tags)) {
      const tagService = new TagService();
      await tagService.updateKnowledgeTags(BigInt(knowledgeId), tags, user);
    }

    return NextResponse.json({
      success: true,
      knowledgeId: updated.knowledgeId,
      message: draft ? '下書きを保存しました' : 'ナレッジを更新しました'
    });
  } catch (error) {
    console.error('Knowledge update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * ナレッジ削除
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const knowledgeId = parseInt(resolvedParams.id, 10);
    if (isNaN(knowledgeId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid knowledge ID' },
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

    // 削除権限チェック
    const canDelete = await checkDeletePermission(user, existing);
    if (!canDelete) {
      return NextResponse.json(
        { success: false, error: 'この記事を削除する権限がありません' },
        { status: 403 }
      );
    }

    // 削除実行
    await knowledgeService.deleteKnowledge(BigInt(knowledgeId), user);

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

// ヘルパー関数

async function checkEditPermission(user: any, knowledge: any): Promise<boolean> {
  // 作成者または管理者の場合は編集可能
  return knowledge.insertUser === user.userId || user.isAdmin;
}

async function checkDeletePermission(user: any, knowledge: any): Promise<boolean> {
  // 削除権限は編集権限と同じ
  return await checkEditPermission(user, knowledge);
}

function validateKnowledgeData(data: any): string[] {
  const errors: string[] = [];
  
  if (!data.title || data.title.trim() === '') {
    errors.push('タイトルは必須です');
  }
  
  if (data.title && data.title.length > 1024) {
    errors.push('タイトルは1024文字以内で入力してください');
  }

  if (!data.content || data.content.trim() === '') {
    errors.push('内容は必須です');
  }

  if (data.publicFlag && !['private', 'public', 'protect'].includes(data.publicFlag)) {
    errors.push('公開フラグが無効です');
  }
  
  return errors;
}

function convertPublicFlag(flag: string): number {
  switch (flag) {
    case 'private': return 1;
    case 'public': return 2;
    case 'protect': return 3;
    default: return 1;
  }
}