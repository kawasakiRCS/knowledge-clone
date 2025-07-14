import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { Knowledge } from '@/types/knowledge';

// モックデータ
const mockKnowledgeData: Record<string, Knowledge & {
  tags: Array<{ tagId: number; tagName: string }>;
  stocks: Array<{ stockId: number; userId: number }>;
  targets: Array<{ targetId: number; targetName: string }>;
  groups: Array<{ value: string; label: string }>;
  editors: string[];
  editable: boolean;
  files: Array<{ fileNo: number; fileName: string; fileSize: number; mimeType: string }>;
  comments: Array<{
    commentNo: number;
    comment: string;
    insertUser: string;
    insertDatetime: string;
    likeCount: number;
  }>;
}> = {
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
      { stockId: 1, userId: 1, stockName: 'お気に入り' },
      { stockId: 2, userId: 1, stockName: 'あとで読む' }
    ],
    targets: [],
    groups: [],
    editors: [],
    editable: false,
    insertUser: 1,
    insertUserName: '山田太郎',
    insertDatetime: '2024-01-15T10:00:00',
    updateUser: 1,
    updateUserName: '山田太郎',
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
    insertUser: 2,
    insertUserName: '管理者',
    insertDatetime: '2024-01-10T10:00:00',
    updateUser: 2,
    updateUserName: '管理者',
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
    insertUser: 3,
    insertUserName: 'CTO',
    insertDatetime: '2024-01-05T10:00:00',
    updateUser: 3,
    updateUserName: 'CTO',
    updateDatetime: '2024-01-05T10:00:00',
    files: [],
    comments: []
  },
  672: {
    knowledgeId: 672,
    title: 'React Server Components の活用方法',
    content: `
      <h2>React Server Components とは</h2>
      <p>React Server Components (RSC) は、サーバーサイドでレンダリングされるReactコンポーネントです。</p>
      
      <h3>主な利点</h3>
      <ul>
        <li>バンドルサイズの削減</li>
        <li>データフェッチングの最適化</li>
        <li>SEO改善</li>
        <li>初期表示速度の向上</li>
      </ul>
      
      <h3>使用例</h3>
      <pre><code>// Server Component (app/page.tsx)
export default async function Page() {
  const data = await fetch('https://api.example.com/data');
  const result = await data.json();
  
  return (
    &lt;div&gt;
      &lt;h1&gt;{result.title}&lt;/h1&gt;
      &lt;ClientComponent data={result} /&gt;
    &lt;/div&gt;
  );
}</code></pre>
      
      <h3>注意点</h3>
      <p>Server Componentsでは、useState、useEffect等のクライアントサイドAPIは使用できません。</p>
    `,
    publicFlag: 1,
    typeId: 1,
    point: 200,
    likeCount: 18,
    commentCount: 7,
    tags: [
      { tagId: 1, tagName: 'Next.js' },
      { tagId: 2, tagName: 'React' },
      { tagId: 3, tagName: 'TypeScript' },
      { tagId: 6, tagName: 'Server Components' }
    ],
    stocks: [
      { stockId: 1, userId: 1, stockName: 'お気に入り' },
      { stockId: 3, userId: 2, stockName: 'RSC関連' }
    ],
    targets: [],
    groups: [],
    editors: [],
    editable: false,
    insertUser: 1,
    insertUserName: '山田太郎',
    insertDatetime: '2024-01-20T09:00:00',
    updateUser: 1,
    updateUserName: '山田太郎',
    updateDatetime: '2024-01-22T16:45:00',
    files: [
      { 
        fileNo: 3, 
        fileName: 'rsc-best-practices.md',
        fileSize: 1024000,
        mimeType: 'text/markdown'
      }
    ],
    comments: [
      {
        commentNo: 1,
        comment: '<p>Server Componentsの概念がよく理解できました。特にバンドルサイズ削減の効果は大きいですね。</p>',
        insertUser: '伊藤綾子',
        insertDatetime: '2024-01-21T10:30:00',
        likeCount: 4
      },
      {
        commentNo: 2,
        comment: '<p>クライアントサイドとサーバーサイドの境界を意識した設計が重要だと感じました。</p>',
        insertUser: '高橋健太',
        insertDatetime: '2024-01-21T14:15:00',
        likeCount: 6
      },
      {
        commentNo: 3,
        comment: '<p>実際のプロジェクトで使ってみましたが、パフォーマンス改善効果は大きかったです。</p>',
        insertUser: '松本由美',
        insertDatetime: '2024-01-22T11:00:00',
        likeCount: 2
      }
    ]
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
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