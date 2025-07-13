/**
 * 閲覧履歴APIエンドポイント
 * 
 * @description 指定されたIDのナレッジを取得する
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { StockKnowledge } from '@/types/knowledge';

// モックデータ
const mockKnowledges: Record<string, StockKnowledge> = {
  '1': {
    knowledgeId: 1,
    title: '初めての投稿',
    content: '最初の記事です',
    publicFlag: 1,
    typeId: 1,
    insertUser: 1,
    insertUserName: 'Admin User',
    insertDatetime: '2024-01-01T08:00:00Z',
    updateUser: 1,
    updateUserName: 'Admin User',
    updateDatetime: '2024-01-01T08:00:00Z',
    likeCount: 3,
    commentCount: 1,
    point: 10,
    viewed: true,
    stocks: []
  },
  '2': {
    knowledgeId: 2,
    title: 'TypeScript入門',
    content: 'TypeScriptの基本を学ぶ',
    publicFlag: 1,
    typeId: 1,
    insertUser: 2,
    insertUserName: 'Test User',
    insertDatetime: '2024-01-02T09:00:00Z',
    updateUser: 2,
    updateUserName: 'Test User',
    updateDatetime: '2024-01-02T09:00:00Z',
    likeCount: 5,
    commentCount: 2,
    point: 15,
    viewed: true,
    stocks: []
  },
  '3': {
    knowledgeId: 3,
    title: 'React Best Practices',
    content: 'React開発のベストプラクティス',
    publicFlag: 1,
    typeId: 1,
    insertUser: 1,
    insertUserName: 'Admin User',
    insertDatetime: '2024-01-03T10:00:00Z',
    updateUser: 1,
    updateUserName: 'Admin User',
    updateDatetime: '2024-01-03T15:00:00Z',
    likeCount: 8,
    commentCount: 3,
    point: 25,
    viewed: false,
    stocks: []
  },
  '4': {
    knowledgeId: 4,
    title: 'Node.js バックエンド開発',
    content: 'Node.jsでバックエンドを構築する方法',
    publicFlag: 1,
    typeId: 1,
    insertUser: 3,
    insertUserName: 'Developer',
    insertDatetime: '2024-01-04T11:00:00Z',
    updateUser: 3,
    updateUserName: 'Developer',
    updateDatetime: '2024-01-04T11:00:00Z',
    likeCount: 12,
    commentCount: 5,
    point: 35,
    viewed: false,
    stocks: []
  },
  '5': {
    knowledgeId: 5,
    title: 'GraphQL入門',
    content: 'GraphQLの基本概念と使い方',
    publicFlag: 1,
    typeId: 1,
    insertUser: 2,
    insertUserName: 'Test User',
    insertDatetime: '2024-01-05T12:00:00Z',
    updateUser: 2,
    updateUserName: 'Test User',
    updateDatetime: '2024-01-05T12:00:00Z',
    likeCount: 6,
    commentCount: 2,
    point: 18,
    viewed: true,
    stocks: []
  }
};

export async function GET(request: NextRequest) {
  try {
    // セッション取得
    const session = await getServerSession(authOptions);
    
    // クエリパラメータからIDリストを取得
    const searchParams = request.nextUrl.searchParams;
    const idsParam = searchParams.get('ids');
    
    if (!idsParam) {
      return NextResponse.json([]);
    }
    
    // IDリストを解析
    const ids = idsParam.split(',').filter(id => /^\d+$/.test(id));
    
    // 指定されたIDのナレッジを取得（順序を保持）
    const knowledges: StockKnowledge[] = [];
    for (const id of ids) {
      if (mockKnowledges[id]) {
        const knowledge = { ...mockKnowledges[id] };
        
        // ログインユーザーの場合、既読状態をランダムに設定（デモ用）
        if (session?.user) {
          // ID 3は未読、それ以外は既読（テスト用の固定値）
          knowledge.viewed = id !== '3';
        }
        
        knowledges.push(knowledge);
      }
    }
    
    return NextResponse.json(knowledges);
  } catch (error) {
    console.error('Error fetching history knowledges:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}