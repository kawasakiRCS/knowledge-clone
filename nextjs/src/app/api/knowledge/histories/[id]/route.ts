/**
 * ナレッジ編集履歴API
 * 
 * @description ナレッジの編集履歴を取得
 */
import { NextRequest, NextResponse } from 'next/server';

// モックデータ（実装時はDBから取得）
const mockHistories: Record<string, any[]> = {
  '1': [
    {
      historyNo: 5,
      knowledgeId: 1,
      title: 'ナレッジベースシステム開発ガイド v1.5',
      content: '更新された内容...',
      updateUser: 1,
      userName: 'admin',
      updateDatetime: '2024-12-10T10:00:00Z',
    },
    {
      historyNo: 4,
      knowledgeId: 1,
      title: 'ナレッジベースシステム開発ガイド v1.4',
      content: '更新された内容...',
      updateUser: 2,
      userName: 'developer',
      updateDatetime: '2024-12-05T14:30:00Z',
    },
    {
      historyNo: 3,
      knowledgeId: 1,
      title: 'ナレッジベースシステム開発ガイド v1.3',
      content: '更新された内容...',
      updateUser: 1,
      userName: 'admin',
      updateDatetime: '2024-11-20T09:15:00Z',
    },
    {
      historyNo: 2,
      knowledgeId: 1,
      title: 'ナレッジベースシステム開発ガイド v1.2',
      content: '更新された内容...',
      updateUser: 3,
      userName: 'editor',
      updateDatetime: '2024-11-10T16:45:00Z',
    },
    {
      historyNo: 1,
      knowledgeId: 1,
      title: 'ナレッジベースシステム開発ガイド（初版）',
      content: '初版の内容...',
      updateUser: 1,
      userName: 'admin',
      updateDatetime: '2024-10-01T10:00:00Z',
    },
  ],
  '2': [
    {
      historyNo: 2,
      knowledgeId: 2,
      title: 'TypeScript入門ガイド（改訂版）',
      content: '改訂された内容...',
      updateUser: 2,
      userName: 'developer',
      updateDatetime: '2024-12-08T11:30:00Z',
    },
    {
      historyNo: 1,
      knowledgeId: 2,
      title: 'TypeScript入門ガイド',
      content: '初版の内容...',
      updateUser: 2,
      userName: 'developer',
      updateDatetime: '2024-11-15T13:00:00Z',
    },
  ],
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const knowledgeId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '0', 10);
    const limit = 20; // PAGE_LIMIT

    // 実装時は権限チェック
    // const session = await getSession();
    // if (!canViewKnowledge(knowledgeId, session?.user)) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // モックデータ取得
    const allHistories = mockHistories[knowledgeId] || [];
    
    if (allHistories.length === 0 && knowledgeId !== '1' && knowledgeId !== '2') {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    // ページネーション
    const start = page * limit;
    const end = start + limit;
    const histories = allHistories.slice(start, end);

    return NextResponse.json({
      histories,
      page,
      hasMore: end < allHistories.length,
    });
  } catch (error) {
    console.error('Error fetching knowledge histories:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}