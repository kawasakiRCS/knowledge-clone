import { NextRequest, NextResponse } from 'next/server';

// モックデータ生成用のヘルパー関数
const generateMockLikes = (knowledgeId: number, page: number, limit: number = 50) => {
  const totalItems = 125; // 仮の総数
  const start = page * limit;
  const end = Math.min(start + limit, totalItems);
  
  const likes = [];
  for (let i = start; i < end; i++) {
    likes.push({
      no: i + 1,
      knowledgeId: knowledgeId,
      insertUser: i % 10 === 0 ? -1 : i + 1, // 10件に1件は匿名ユーザー
      userName: i % 10 === 0 ? null : `ユーザー${i + 1}`,
      insertDatetime: new Date(Date.now() - (totalItems - i) * 3600000).toISOString(), // 1時間ずつ古くなる
    });
  }
  
  return {
    likes,
    totalItems,
    hasNext: end < totalItems,
    hasPrevious: page > 0,
  };
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const knowledgeId = parseInt(params.id);
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '0');

    // ナレッジIDが不正な場合
    if (isNaN(knowledgeId) || knowledgeId <= 0) {
      return NextResponse.json(
        { error: 'Invalid knowledge ID' },
        { status: 400 }
      );
    }

    // モックデータ: ナレッジが存在しない場合
    if (knowledgeId === 999) {
      return NextResponse.json(
        { error: 'Knowledge not found' },
        { status: 404 }
      );
    }

    // モックデータ: アクセス権限がない場合
    if (knowledgeId === 998) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // モックデータ生成
    const { likes, hasNext, hasPrevious } = generateMockLikes(knowledgeId, page);

    const response = {
      knowledgeId,
      likes,
      page,
      previous: hasPrevious ? page - 1 : -1,
      next: hasNext ? page + 1 : -1,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching likes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}