import type { NextApiRequest, NextApiResponse } from 'next';

type Stock = {
  stockId: number;
  stockName: string;
};

type Knowledge = {
  knowledgeId: number;
  title: string;
  content: string;
  insertUser: string;
  insertUserName: string;
  insertDatetime: string;
  updateUser: string;
  updateUserName: string;
  updateDatetime: string;
  likeCount: number;
  commentCount: number;
  point: number;
  pointOnTerm?: number;
  publicFlag: number;
  typeId: number;
  template: {
    typeId: number;
    typeName: string;
    typeIcon: string;
  };
  tagNames: string;
  tagIds: string;
  stocks: Stock[];
  pin: boolean;
};

type Tag = {
  tagId: number;
  tagName: string;
  knowledgeCount: number;
};

type Group = {
  groupId: number;
  groupName: string;
  groupKnowledgeCount: number;
};

type PopularityResponse = {
  knowledges: Knowledge[];
  tags: Tag[];
  groups: Group[];
  offset: number;
  limit: number;
  total: number;
  events?: string[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<PopularityResponse>
) {
  // 人気順のモックデータ（ポイントとポイント増加率でソート）
  const mockKnowledges: Knowledge[] = [
    {
      knowledgeId: 101,
      title: '【人気】Next.js 15の新機能完全ガイド',
      content: 'Next.js 15では、App Routerの改善、Turbopackの統合、React Server Componentsの強化など、多くの新機能が追加されました。本記事では、これらの新機能を実際のコード例とともに詳しく解説します。',
      insertUser: 'nextjs_expert',
      insertUserName: 'Next.js エキスパート',
      insertDatetime: '2024-01-15T09:00:00Z',
      updateUser: 'nextjs_expert',
      updateUserName: 'Next.js エキスパート',
      updateDatetime: '2024-01-16T10:30:00Z',
      likeCount: 256,
      commentCount: 42,
      point: 1580,
      pointOnTerm: 320,
      publicFlag: 1,
      typeId: 1,
      template: {
        typeId: 1,
        typeName: 'ナレッジ',
        typeIcon: 'fa-file-text-o',
      },
      tagNames: 'Next.js,React,JavaScript,フロントエンド',
      tagIds: '1,2,3,4',
      stocks: [
        { stockId: 1, stockName: 'Web開発' },
        { stockId: 2, stockName: 'モダンフレームワーク' },
      ],
      pin: true,
    },
    {
      knowledgeId: 102,
      title: '【話題】AIを活用した開発効率化テクニック',
      content: 'GitHub Copilot、ChatGPT、Claude などのAIツールを活用して、開発効率を大幅に向上させる方法を紹介します。実際のワークフローへの組み込み方やベストプラクティスを解説。',
      insertUser: 'ai_developer',
      insertUserName: 'AI開発者',
      insertDatetime: '2024-01-10T14:00:00Z',
      updateUser: 'ai_developer',
      updateUserName: 'AI開発者',
      updateDatetime: '2024-01-11T09:00:00Z',
      likeCount: 189,
      commentCount: 28,
      point: 1240,
      pointOnTerm: 280,
      publicFlag: 1,
      typeId: 1,
      template: {
        typeId: 1,
        typeName: 'ナレッジ',
        typeIcon: 'fa-file-text-o',
      },
      tagNames: 'AI,生産性,開発効率,ChatGPT',
      tagIds: '5,6,7,8',
      stocks: [],
      pin: false,
    },
    {
      knowledgeId: 103,
      title: 'TypeScript 5.0の型システム徹底解説',
      content: 'TypeScript 5.0で追加された新しい型機能について、実践的な例とともに解説します。Decorators、const type parameters、satisfies operatorなど。',
      insertUser: 'ts_master',
      insertUserName: 'TypeScriptマスター',
      insertDatetime: '2024-01-08T11:00:00Z',
      updateUser: 'ts_master',
      updateUserName: 'TypeScriptマスター',
      updateDatetime: '2024-01-08T11:00:00Z',
      likeCount: 145,
      commentCount: 19,
      point: 980,
      pointOnTerm: 180,
      publicFlag: 1,
      typeId: 1,
      template: {
        typeId: 1,
        typeName: 'ナレッジ',
        typeIcon: 'fa-file-text-o',
      },
      tagNames: 'TypeScript,JavaScript,型システム',
      tagIds: '2,3,9',
      stocks: [
        { stockId: 1, stockName: 'Web開発' },
      ],
      pin: false,
    },
    {
      knowledgeId: 104,
      title: 'マイクロサービス設計のベストプラクティス',
      content: 'マイクロサービスアーキテクチャを採用する際の設計原則、通信パターン、データ管理、監視・運用について実例を交えて解説します。',
      insertUser: 'architect',
      insertUserName: 'システムアーキテクト',
      insertDatetime: '2024-01-05T16:00:00Z',
      updateUser: 'architect',
      updateUserName: 'システムアーキテクト',
      updateDatetime: '2024-01-06T10:00:00Z',
      likeCount: 112,
      commentCount: 15,
      point: 820,
      pointOnTerm: 150,
      publicFlag: 1,
      typeId: 1,
      template: {
        typeId: 1,
        typeName: 'ナレッジ',
        typeIcon: 'fa-file-text-o',
      },
      tagNames: 'マイクロサービス,アーキテクチャ,設計',
      tagIds: '10,11,12',
      stocks: [],
      pin: false,
    },
    {
      knowledgeId: 105,
      title: 'React Server Componentsの実装パターン集',
      content: 'React Server Componentsを実際のプロジェクトで活用するための実装パターンを紹介。パフォーマンス最適化、データフェッチング、状態管理など。',
      insertUser: 'react_dev',
      insertUserName: 'React開発者',
      insertDatetime: '2024-01-12T13:00:00Z',
      updateUser: 'react_dev',
      updateUserName: 'React開発者',
      updateDatetime: '2024-01-12T13:00:00Z',
      likeCount: 98,
      commentCount: 12,
      point: 680,
      pointOnTerm: 120,
      publicFlag: 1,
      typeId: 1,
      template: {
        typeId: 1,
        typeName: 'ナレッジ',
        typeIcon: 'fa-file-text-o',
      },
      tagNames: 'React,RSC,パフォーマンス',
      tagIds: '2,13,14',
      stocks: [],
      pin: false,
    },
  ];

  // 人気のタグ（モックデータ）
  const mockTags: Tag[] = [
    { tagId: 1, tagName: 'Next.js', knowledgeCount: 125 },
    { tagId: 2, tagName: 'React', knowledgeCount: 98 },
    { tagId: 3, tagName: 'JavaScript', knowledgeCount: 87 },
    { tagId: 4, tagName: 'TypeScript', knowledgeCount: 76 },
    { tagId: 5, tagName: 'AI', knowledgeCount: 65 },
    { tagId: 6, tagName: 'マイクロサービス', knowledgeCount: 43 },
    { tagId: 7, tagName: 'Docker', knowledgeCount: 38 },
    { tagId: 8, tagName: 'Kubernetes', knowledgeCount: 32 },
  ];

  // グループ（認証が必要なため、通常は空）
  const mockGroups: Group[] = [];

  // イベント日付（モックデータ）
  const mockEvents: string[] = [
    '2024-01-20',
    '2024-01-25',
    '2024-02-01',
  ];

  const response: PopularityResponse = {
    knowledges: mockKnowledges,
    tags: mockTags,
    groups: mockGroups,
    events: mockEvents,
    offset: 0,
    limit: 20,
    total: mockKnowledges.length,
  };

  res.status(200).json(response);
}