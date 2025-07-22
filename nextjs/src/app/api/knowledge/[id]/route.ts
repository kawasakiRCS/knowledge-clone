import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { KnowledgeService } from '@/lib/services/knowledgeService';
import { getAuthenticatedUser } from '@/lib/auth/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // IDの妥当性チェック
    if (isNaN(Number(id)) || Number(id) <= 0 || !Number.isInteger(Number(id))) {
      return NextResponse.json(
        { error: 'Invalid knowledge ID' },
        { status: 400 }
      );
    }
    
    const knowledgeId = BigInt(id);

    const knowledgeService = new KnowledgeService();
    
    // ユーザー認証情報取得（ログインしていない場合はundefined）
    const user = await getAuthenticatedUser(request);
    
    // ナレッジの存在確認とアクセス権限チェック
    const canAccess = await knowledgeService.canAccessKnowledge(knowledgeId, user);
    if (!canAccess) {
      // 存在しないか、アクセス権限がない場合
      const knowledge = await knowledgeService.getKnowledgeById(knowledgeId);
      if (!knowledge) {
        return NextResponse.json(
          { error: 'Knowledge not found' },
          { status: 404 }
        );
      } else {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // ナレッジ詳細情報を取得
    const knowledge = await knowledgeService.getKnowledgeByIdWithUser(knowledgeId);
    
    if (!knowledge) {
      return NextResponse.json(
        { error: 'Knowledge not found' },
        { status: 404 }
      );
    }

    // 閲覧数を増加（非同期、エラーは無視）
    knowledgeService.incrementViewCount(knowledgeId).catch(console.error);

    // レスポンス用のデータ変換
    const responseData = {
      knowledgeId: knowledge.knowledgeId.toString(), // BigIntは文字列に変換
      title: knowledge.title,
      content: knowledge.content,
      publicFlag: knowledge.publicFlag,
      typeId: knowledge.typeId,
      point: knowledge.point,
      likeCount: knowledge.likeCount?.toString() || '0',
      commentCount: knowledge.commentCount || 0,
      viewCount: knowledge.viewCount?.toString() || '0',
      insertUser: knowledge.insertUser,
      insertUserName: knowledge.author?.userName || '',
      insertDatetime: knowledge.insertDatetime?.toISOString() || '',
      updateUser: knowledge.updateUser,
      updateUserName: knowledge.author?.userName || '', // 更新者情報は別途取得が必要
      updateDatetime: knowledge.updateDatetime?.toISOString() || '',
      // 以下は現在の実装では空配列/デフォルト値
      tags: [],
      stocks: [],
      targets: [],
      groups: [],
      editors: [],
      editable: false,
      files: [],
      comments: []
    };

    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error fetching knowledge:', error);
    
    // BigInt変換エラーの場合
    if (error instanceof RangeError || error instanceof TypeError) {
      return NextResponse.json(
        { error: 'Invalid knowledge ID' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}