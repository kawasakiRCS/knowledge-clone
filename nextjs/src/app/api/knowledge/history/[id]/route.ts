import { NextRequest, NextResponse } from 'next/server';

/**
 * 履歴データの取得
 * GET /api/knowledge/history/[id]?history_no=xxx
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const knowledgeId = parseInt(id, 10);
  const searchParams = request.nextUrl.searchParams;
  const historyNo = parseInt(searchParams.get('history_no') || '0', 10);

  // 権限チェック（モック）
  // TODO: 実際の権限チェックを実装
  
  // 履歴データの型定義
  interface KnowledgeHistoryDetail {
    historyNo: number;
    knowledgeId: number;
    updateUser: string;
    userName: string;
    updateDatetime: string;
    content: string;
  }

  // 履歴データ（モック）
  const mockHistories: Record<string, KnowledgeHistoryDetail> = {
    '1': {
      historyNo: 1,
      knowledgeId: 1,
      updateUser: '1',
      userName: '山田太郎',
      updateDatetime: '2024-01-01T10:00:00Z',
      content: `# はじめてのナレッジ（初版）

このドキュメントは、ナレッジベースシステムの使い方を説明します。

## 主な機能

- ナレッジの作成
- ナレッジの編集
- ナレッジの共有

## 使い方

1. ログインする
2. 「新規作成」ボタンをクリック
3. タイトルと内容を入力
4. 「保存」ボタンをクリック`,
    },
    '2': {
      historyNo: 2,
      knowledgeId: 1,
      updateUser: '2',
      userName: '佐藤花子',
      updateDatetime: '2024-01-02T14:30:00Z',
      content: `# はじめてのナレッジ（第2版）

このドキュメントは、ナレッジベースシステムの使い方を説明します。

## 主な機能

- ナレッジの作成
- ナレッジの編集
- ナレッジの共有
- **ナレッジの検索（追加）**

## 使い方

1. ログインする
2. 「新規作成」ボタンをクリック
3. タイトルと内容を入力
4. タグを設定する（追加）
5. 「保存」ボタンをクリック

## 検索機能について（追加）

キーワードやタグで検索できます。`,
    },
    '3': {
      historyNo: 3,
      knowledgeId: 2,
      updateUser: '3',
      userName: '鈴木一郎',
      updateDatetime: '2024-01-03T09:15:00Z',
      content: `# TypeScriptチュートリアル（初版）

## TypeScriptとは

JavaScriptに型システムを追加した言語です。

## 基本的な型

- number
- string
- boolean`,
    },
  };

  const historyKey = `${historyNo}`;
  const history = mockHistories[historyKey];

  if (!history || history.knowledgeId !== knowledgeId) {
    return NextResponse.json(
      { error: 'History not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(history);
}