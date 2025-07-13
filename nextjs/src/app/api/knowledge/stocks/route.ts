import { NextRequest, NextResponse } from 'next/server';
import { StockKnowledge } from '@/types/knowledge';
import { Stock as StocksEntity } from '@/types/knowledge';

// モックデータ
const mockStocks: StocksEntity[] = [
  {
    stockId: 1,
    stockName: 'お気に入り',
  },
  {
    stockId: 2,
    stockName: 'プロジェクトA',
  },
  {
    stockId: 3,
    stockName: '技術メモ',
  },
];

const mockKnowledges: StockKnowledge[] = [
  {
    knowledgeId: 1,
    title: 'React Hooksの使い方',
    content: 'React Hooksの基本的な使い方について解説します。\n\nuseState、useEffect、useContext...',
    publicFlag: 1,
    likeCount: 15,
    commentCount: 5,
    point: 35,
    typeId: 1,
    insertUser: 1,
    insertUserName: '山田太郎',
    insertDatetime: '2024-01-15T10:00:00Z',
    updateUser: 1,
    updateUserName: '山田太郎',
    updateDatetime: '2024-01-15T10:00:00Z',
    tagNames: 'React,Hooks,フロントエンド',
    tagIds: '1,2,3',
    viewed: false,
  },
  {
    knowledgeId: 2,
    title: 'TypeScriptの型定義ベストプラクティス',
    content: 'TypeScriptで型定義を行う際のベストプラクティスを紹介します。',
    publicFlag: 1,
    likeCount: 10,
    commentCount: 3,
    point: 25,
    typeId: 1,
    insertUser: 2,
    insertUserName: '鈴木花子',
    insertDatetime: '2024-01-10T14:30:00Z',
    updateUser: 2,
    updateUserName: '鈴木花子',
    updateDatetime: '2024-01-12T09:15:00Z',
    tagNames: 'TypeScript,フロントエンド',
    tagIds: '4,3',
    viewed: true,
  },
  {
    knowledgeId: 3,
    title: 'Next.js App Routerの新機能',
    content: 'Next.js 13で導入されたApp Routerの新機能について詳しく解説します。',
    publicFlag: 1,
    likeCount: 25,
    commentCount: 8,
    point: 50,
    typeId: 1,
    insertUser: 3,
    insertUserName: '佐藤健',
    insertDatetime: '2024-01-20T16:00:00Z',
    updateUser: 3,
    updateUserName: '佐藤健',
    updateDatetime: '2024-01-20T16:00:00Z',
    tagNames: 'Next.js,React,フロントエンド',
    tagIds: '5,1,3',
    viewed: false,
  },
  {
    knowledgeId: 4,
    title: 'プロジェクトA 設計書',
    content: 'プロジェクトAの基本設計書です。\n\n## システム構成\n...',
    publicFlag: 2, // グループ限定
    likeCount: 5,
    commentCount: 2,
    point: 12,
    typeId: 2,
    insertUser: 1,
    insertUserName: '山田太郎',
    insertDatetime: '2024-01-08T11:00:00Z',
    updateUser: 1,
    updateUserName: '山田太郎',
    updateDatetime: '2024-01-18T15:30:00Z',
    tagNames: 'プロジェクトA,設計書',
    tagIds: '6,7',
    viewed: true,
  },
  {
    knowledgeId: 5,
    title: 'Docker Composeでの開発環境構築',
    content: 'Docker Composeを使用した開発環境の構築手順を説明します。',
    publicFlag: 1,
    likeCount: 20,
    commentCount: 6,
    point: 40,
    typeId: 1,
    insertUser: 4,
    insertUserName: '田中美咲',
    insertDatetime: '2024-01-05T09:00:00Z',
    updateUser: 4,
    updateUserName: '田中美咲',
    updateDatetime: '2024-01-05T09:00:00Z',
    tagNames: 'Docker,インフラ,開発環境',
    tagIds: '8,9,10',
    viewed: false,
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const stockId = searchParams.get('stockid');
  const limit = 20;

  // TODO: 実際の実装では認証チェックが必要
  // const session = await getSession();
  // if (!session) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  let filteredKnowledges = [...mockKnowledges];
  let selectedStock: StocksEntity | null = null;

  // ストックIDでフィルタリング
  if (stockId) {
    const stockIdNum = parseInt(stockId, 10);
    selectedStock = mockStocks.find(s => s.stockId === stockIdNum) || null;
    
    if (selectedStock) {
      // 該当のストックに含まれるナレッジのみフィルタリング
      filteredKnowledges = filteredKnowledges.filter(k => 
        k.stocks?.some(s => s.stockId === stockIdNum)
      );
    } else {
      // 無効なストックIDの場合は空配列を返す
      filteredKnowledges = [];
    }
  }

  // ページネーション
  const start = offset * limit;
  const end = start + limit;
  const paginatedKnowledges = filteredKnowledges.slice(start, end);

  return NextResponse.json({
    stocks: paginatedKnowledges,
    stock: selectedStock,
    pagination: {
      offset,
      limit,
      total: filteredKnowledges.length,
    },
  });
}