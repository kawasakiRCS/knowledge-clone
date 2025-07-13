/**
 * ナレッジ一覧API
 * 
 * @description 旧システムのapi/knowledge/list.apiに対応
 * Pages RouterからApp Routerに移行
 */
import { NextRequest, NextResponse } from 'next/server';

// モックデータ（実際の実装では DB から取得）
const mockKnowledges = [
  {
    knowledgeId: 2,
    title: "Reactのベストプラクティス",
    content: "Reactアプリケーション開発でのベストプラクティスをまとめました。",
    insertUser: 2,
    insertUserName: "佐藤花子",
    insertDatetime: "2025-01-09T14:30:00Z",
    updateUser: 2,
    updateUserName: "佐藤花子", 
    updateDatetime: "2025-01-09T14:30:00Z",
    publicFlag: 1,
    likeCount: 8,
    commentCount: 5,
    point: 15,
    pointOnTerm: 3,
    typeId: 1,
    tagNames: "React,JavaScript",
    tagIds: "2,1",
    pin: true
  },
  {
    knowledgeId: 1,
    title: "Next.js入門ガイド",
    content: "Next.jsの基本的な使い方について説明します。",
    insertUser: 1,
    insertUserName: "田中太郎",
    insertDatetime: "2025-01-10T09:00:00Z",
    updateUser: 1,
    updateUserName: "田中太郎",
    updateDatetime: "2025-01-10T09:00:00Z",
    publicFlag: 1,
    likeCount: 5,
    commentCount: 3,
    point: 10,
    pointOnTerm: 2,
    typeId: 1,
    tagNames: "Next.js,React,TypeScript",
    tagIds: "4,2,3",
    pin: false
  },
  {
    knowledgeId: 3,
    title: "TypeScript型定義のコツ",
    content: "TypeScriptで効果的な型定義を行うためのテクニックを紹介します。",
    insertUser: 3,
    insertUserName: "鈴木一郎",
    insertDatetime: "2025-01-08T11:15:00Z",
    updateUser: 3,
    updateUserName: "鈴木一郎",
    updateDatetime: "2025-01-08T11:15:00Z",
    publicFlag: 1,
    likeCount: 12,
    commentCount: 7,
    point: 20,
    pointOnTerm: 5,
    typeId: 1,
    tagNames: "TypeScript,JavaScript",
    tagIds: "3,1",
    pin: false
  },
  {
    knowledgeId: 4,
    title: "Javaメモリ管理について",
    content: "Javaアプリケーションでのメモリ管理の重要なポイントを解説します。",
    insertUser: 4,
    insertUserName: "山田次郎",
    insertDatetime: "2025-01-07T16:45:00Z",
    updateUser: 4,
    updateUserName: "山田次郎",
    updateDatetime: "2025-01-07T16:45:00Z",
    publicFlag: 1,
    likeCount: 6,
    commentCount: 2,
    point: 12,
    pointOnTerm: 1,
    typeId: 1,
    tagNames: "Java",
    tagIds: "5",
    pin: false
  },
  {
    knowledgeId: 5,
    title: "デバッグのQ&A集",
    content: "よくあるデバッグ問題とその解決方法をQ&A形式でまとめました。",
    insertUser: 5,
    insertUserName: "高橋美咲",
    insertDatetime: "2025-01-06T13:20:00Z",
    updateUser: 5,
    updateUserName: "高橋美咲",
    updateDatetime: "2025-01-06T13:20:00Z",
    publicFlag: 1,
    likeCount: 9,
    commentCount: 4,
    point: 18,
    pointOnTerm: 4,
    typeId: 2,
    tagNames: "デバッグ,トラブルシューティング",
    tagIds: "6,7",
    pin: false
  }
];

const mockTags = [
  { tagId: 1, tagName: "JavaScript", knowledgeCount: 15 },
  { tagId: 2, tagName: "React", knowledgeCount: 12 },
  { tagId: 3, tagName: "TypeScript", knowledgeCount: 8 },
  { tagId: 4, tagName: "Next.js", knowledgeCount: 6 },
  { tagId: 5, tagName: "Java", knowledgeCount: 20 }
];

const mockGroups = [
  { groupId: 1, groupName: "開発チーム", groupKnowledgeCount: 25 },
  { groupId: 2, groupName: "QAチーム", groupKnowledgeCount: 10 },
  { groupId: 3, groupName: "デザインチーム", groupKnowledgeCount: 8 }
];

const mockTemplates = {
  "1": { typeId: 1, typeName: "ナレッジ", typeIcon: "fa-file-text-o" },
  "2": { typeId: 2, typeName: "Q&A", typeIcon: "fa-question-circle-o" },
  "3": { typeId: 3, typeName: "イベント", typeIcon: "fa-calendar" },
  "4": { typeId: 4, typeName: "ブックマーク", typeIcon: "fa-bookmark" }
};

/**
 * ナレッジ一覧取得API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // パラメータ取得
    const keyword = searchParams.get('keyword') || '';
    const tag = searchParams.get('tag') || '';
    // group, creator, templateは将来的に実装予定
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');

    // フィルタリング処理（モック）
    let filteredKnowledges = mockKnowledges;
    
    if (keyword) {
      filteredKnowledges = filteredKnowledges.filter(k => 
        k.title.includes(keyword) || k.content.includes(keyword)
      );
    }
    
    if (tag) {
      filteredKnowledges = filteredKnowledges.filter(k => 
        k.tagNames.includes(tag)
      );
    }

    // ページネーション
    const total = filteredKnowledges.length;
    const paginatedKnowledges = filteredKnowledges.slice(offset, offset + limit);

    // レスポンス
    const response = {
      knowledges: paginatedKnowledges,
      total,
      offset,
      limit,
      tags: mockTags,
      groups: mockGroups,
      templates: mockTemplates,
      selectedTemplates: []
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Knowledge list API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}