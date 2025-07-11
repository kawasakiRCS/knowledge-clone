import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// モックデータ
const mockKnowledgeData: any = {
  1: {
    knowledgeId: 1,
    title: 'Next.js App Routerの基本',
    content: `
      <h2>はじめに</h2>
      <p>Next.js 13で導入されたApp Routerは、新しいファイルベースのルーティングシステムです。</p>
      
      <h3>主な特徴</h3>
      <ul>
        <li>React Server Components のサポート</li>
        <li>ネストされたレイアウト</li>
        <li>ストリーミングとサスペンス</li>
        <li>組み込みのデータフェッチング</li>
      </ul>
      
      <h3>基本的な使い方</h3>
      <p>appディレクトリ内にフォルダを作成することで、自動的にルートが生成されます。</p>
      
      <pre><code>app/
├── page.tsx        # /
├── about/
│   └── page.tsx    # /about
└── blog/
    ├── page.tsx    # /blog
    └── [id]/
        └── page.tsx # /blog/[id]</code></pre>
    `,
    publicFlag: 1,
    typeId: 1,
    point: 150,
    likeCount: 12,
    commentCount: 5,
    tags: [
      { tagId: 1, tagName: 'Next.js' },
      { tagId: 2, tagName: 'React' },
      { tagId: 3, tagName: 'TypeScript' }
    ],
    stocks: [
      { stockId: 1, stockName: 'Web開発' },
      { stockId: 2, stockName: 'フロントエンド' }
    ],
    targets: [],
    groups: [],
    editors: [],
    editable: false,
    insertUser: '山田太郎',
    insertDatetime: '2024-01-15T10:00:00',
    updateUser: '山田太郎',
    updateDatetime: '2024-01-16T14:30:00',
    files: [
      { 
        fileNo: 1, 
        fileName: 'nextjs-app-router-guide.pdf',
        fileSize: 2048000,
        mimeType: 'application/pdf'
      },
      { 
        fileNo: 2, 
        fileName: 'sample-code.zip',
        fileSize: 512000,
        mimeType: 'application/zip'
      }
    ],
    comments: [
      {
        commentNo: 1,
        comment: '<p>とても分かりやすい解説ありがとうございます！App Routerの概念がよく理解できました。</p>',
        insertUser: '鈴木花子',
        insertDatetime: '2024-01-16T09:00:00',
        likeCount: 3
      },
      {
        commentNo: 2,
        comment: '<p>Server ComponentsとClient Componentsの使い分けについても解説していただけると嬉しいです。</p>',
        insertUser: '佐藤次郎',
        insertDatetime: '2024-01-16T11:30:00',
        likeCount: 5
      },
      {
        commentNo: 3,
        comment: '<p>サンプルコードも参考になりました。実際にプロジェクトで使ってみます！</p>',
        insertUser: '田中美咲',
        insertDatetime: '2024-01-17T10:15:00',
        likeCount: 1
      }
    ]
  },
  2: {
    knowledgeId: 2,
    title: 'TypeScriptの型システム入門',
    content: '<h2>TypeScriptの型システム</h2><p>TypeScriptは、JavaScriptに静的型付けを追加した言語です。</p>',
    publicFlag: 2, // 非公開
    typeId: 1,
    point: 80,
    likeCount: 8,
    commentCount: 2,
    tags: [
      { tagId: 3, tagName: 'TypeScript' },
      { tagId: 4, tagName: 'プログラミング' }
    ],
    stocks: [],
    targets: [],
    groups: [],
    editors: ['user1'],
    editable: true,
    insertUser: '管理者',
    insertDatetime: '2024-01-10T10:00:00',
    updateUser: '管理者',
    updateDatetime: '2024-01-10T10:00:00',
    files: [],
    comments: []
  },
  3: {
    knowledgeId: 3,
    title: '社内開発ガイドライン',
    content: '<h2>開発ガイドライン</h2><p>当社の開発ガイドラインについて説明します。</p>',
    publicFlag: 3, // 保護
    typeId: 1,
    point: 50,
    likeCount: 3,
    commentCount: 1,
    tags: [
      { tagId: 5, tagName: '社内ルール' }
    ],
    stocks: [],
    targets: [],
    groups: [
      { value: '1', label: '開発部' },
      { value: '2', label: '品質管理部' }
    ],
    editors: [],
    editable: false,
    insertUser: 'CTO',
    insertDatetime: '2024-01-05T10:00:00',
    updateUser: 'CTO',
    updateDatetime: '2024-01-05T10:00:00',
    files: [],
    comments: []
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  // モックデータから取得
  const knowledge = mockKnowledgeData[id];
  
  if (!knowledge) {
    return NextResponse.json(
      { error: 'Knowledge not found' },
      { status: 404 }
    );
  }

  // 公開フラグをチェック（実際の実装では認証情報も確認）
  // ここでは簡易的な実装
  if (knowledge.publicFlag === 2) {
    // 非公開の場合は403を返す（本来は認証チェックが必要）
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    );
  }

  // 正常レスポンス
  return NextResponse.json(knowledge);
}