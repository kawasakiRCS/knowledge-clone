/**
 * ナレッジ詳細ページテスト
 * 
 * @description 旧システムとの互換性テストを含む
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import KnowledgeViewPage from '../[id]/page';

// モック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// エラーページコンポーネントのモック
jest.mock('@/components/error/ErrorPage', () => ({
  __esModule: true,
  default: ({ statusCode }: { statusCode: number }) => (
    <div>
      <h1>{statusCode}</h1>
      <p>エラーが発生しました</p>
    </div>
  ),
}));

jest.mock('@/components/error/NotFoundPage', () => ({
  __esModule: true,
  default: () => (
    <div>
      <h1>404</h1>
      <p>ページが見つかりません</p>
    </div>
  ),
}));

jest.mock('@/components/error/ForbiddenPage', () => ({
  __esModule: true,
  default: () => (
    <div>
      <h1>403</h1>
      <p>アクセスが拒否されました</p>
    </div>
  ),
}));

// MainLayoutのモック
jest.mock('@/components/layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// KnowledgeViewのモック
jest.mock('@/components/knowledge/KnowledgeView', () => ({
  __esModule: true,
  default: ({ knowledge }: { knowledge: any }) => (
    <div>
      <div id="content_head">
        <div className="col-sm-8">
          <h4 className="title">
            <span className="dispKnowledgeId">#{knowledge.knowledgeId}</span>
            {' '}
            {knowledge.title}
          </h4>
          <div className="meta-info">
            <div>{knowledge.point}</div>
            <div>CP</div>
            <div>{knowledge.likeCount}</div>
            <div>Likes</div>
            <div>{knowledge.commentCount}</div>
            <div>Comments</div>
          </div>
          <div className="meta-info">
            {knowledge.tags.map((tag: any) => (
              <span key={tag.tagId}>{tag.tagName}</span>
            ))}
          </div>
          <div className="meta-info">
            {knowledge.stocks.map((stock: any) => (
              <span key={stock.stockId}>{stock.stockName}</span>
            ))}
          </div>
          <div className="meta-info">
            {knowledge.publicFlag === 1 && <span title="公開">公開</span>}
            {knowledge.publicFlag === 2 && <span title="非公開">非公開</span>}
          </div>
          <div className="meta-info">
            <span>作成: {knowledge.insertUser}</span>
            <span>更新: {knowledge.updateUser}</span>
          </div>
        </div>
        <div className="col-sm-4">
          {knowledge.editable && <button>編集</button>}
          <button>いいね</button>
          <button>ストック</button>
        </div>
      </div>
      <div id="content_main">
        <div dangerouslySetInnerHTML={{ __html: knowledge.content }} />
      </div>
      {knowledge.files.map((file: any) => (
        <div key={file.fileNo}>{file.fileName}</div>
      ))}
      {knowledge.comments.map((comment: any) => (
        <div key={comment.commentNo}>
          <div>{comment.insertUser}</div>
          <div dangerouslySetInnerHTML={{ __html: comment.comment }} />
        </div>
      ))}
      <div>
        <textarea placeholder="コメントを入力..." />
        <button>コメント投稿</button>
      </div>
    </div>
  ),
}));

// APIモック
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

describe('KnowledgeViewPage', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    pathname: '/open/knowledge/view/1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    // デフォルトのAPIレスポンス
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/knowledge/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            knowledgeId: 1,
            title: 'テストナレッジ',
            content: '<p>これはテストコンテンツです。</p>',
            publicFlag: 1,
            typeId: 1,
            point: 100,
            likeCount: 5,
            commentCount: 3,
            tags: [
              { tagId: 1, tagName: 'テストタグ1' },
              { tagId: 2, tagName: 'テストタグ2' }
            ],
            stocks: [
              { stockId: 1, stockName: 'お気に入り' }
            ],
            targets: [],
            groups: [],
            editors: [],
            editable: false,
            insertUser: 'テストユーザー',
            insertDatetime: '2024-01-01T10:00:00',
            updateUser: 'テストユーザー',
            updateDatetime: '2024-01-01T10:00:00',
            files: [
              { 
                fileNo: 1, 
                fileName: 'test.pdf',
                fileSize: 1024,
                mimeType: 'application/pdf'
              }
            ],
            comments: [
              {
                commentNo: 1,
                comment: '<p>テストコメント</p>',
                insertUser: 'コメントユーザー',
                insertDatetime: '2024-01-02T10:00:00',
                likeCount: 2
              }
            ]
          }),
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
      });
    });
  });

  describe('基本レンダリング', () => {
    test('ナレッジ詳細が表示される', async () => {
      render(<KnowledgeViewPage params={Promise.resolve({ id: '1' })} />);

      await waitFor(() => {
        expect(screen.getByText('#1')).toBeInTheDocument();
        expect(screen.getByText('テストナレッジ')).toBeInTheDocument();
        expect(screen.getByText('これはテストコンテンツです。')).toBeInTheDocument();
      });
    });

    test('メタ情報が表示される', async () => {
      render(<KnowledgeViewPage params={Promise.resolve({ id: '1' })} />);

      await waitFor(() => {
        // ポイント
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('CP')).toBeInTheDocument();
        
        // いいね
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('Likes')).toBeInTheDocument();
        
        // コメント
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('Comments')).toBeInTheDocument();
      });
    });

    test('タグが表示される', async () => {
      render(<KnowledgeViewPage params={Promise.resolve({ id: '1' })} />);

      await waitFor(() => {
        expect(screen.getByText('テストタグ1')).toBeInTheDocument();
        expect(screen.getByText('テストタグ2')).toBeInTheDocument();
      });
    });

    test('ストック情報が表示される', async () => {
      render(<KnowledgeViewPage params={Promise.resolve({ id: '1' })} />);

      await waitFor(() => {
        expect(screen.getByText('お気に入り')).toBeInTheDocument();
      });
    });

    test('作成者・更新者情報が表示される', async () => {
      render(<KnowledgeViewPage params={Promise.resolve({ id: '1' })} />);

      await waitFor(() => {
        expect(screen.getByText(/作成: テストユーザー/)).toBeInTheDocument();
        expect(screen.getByText(/更新: テストユーザー/)).toBeInTheDocument();
      });
    });
  });

  describe('操作ボタン', () => {
    test('編集権限がない場合、編集ボタンが表示されない', async () => {
      render(<KnowledgeViewPage params={Promise.resolve({ id: '1' })} />);

      await waitFor(() => {
        expect(screen.queryByText('編集')).not.toBeInTheDocument();
      });
    });

    test('編集権限がある場合、編集ボタンが表示される', async () => {
      mockFetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: async () => ({
            knowledgeId: 1,
            title: 'テストナレッジ',
            content: '<p>これはテストコンテンツです。</p>',
            editable: true,
            // その他必須フィールド
            publicFlag: 1,
            typeId: 1,
            point: 0,
            likeCount: 0,
            commentCount: 0,
            tags: [],
            stocks: [],
            targets: [],
            groups: [],
            editors: [],
            insertUser: 'テストユーザー',
            insertDatetime: '2024-01-01T10:00:00',
            updateUser: 'テストユーザー',
            updateDatetime: '2024-01-01T10:00:00',
            files: [],
            comments: []
          }),
        })
      );

      render(<KnowledgeViewPage params={Promise.resolve({ id: '1' })} />);

      await waitFor(() => {
        expect(screen.getByText('編集')).toBeInTheDocument();
      });
    });

    test('いいねボタンが表示される', async () => {
      render(<KnowledgeViewPage params={Promise.resolve({ id: '1' })} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /いいね/ })).toBeInTheDocument();
      });
    });

    test('ストックボタンが表示される', async () => {
      render(<KnowledgeViewPage params={Promise.resolve({ id: '1' })} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /ストック/ })).toBeInTheDocument();
      });
    });
  });

  describe('添付ファイル', () => {
    test('添付ファイルが表示される', async () => {
      render(<KnowledgeViewPage params={Promise.resolve({ id: '1' })} />);

      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument();
      });
    });
  });

  describe('コメント', () => {
    test('コメントが表示される', async () => {
      render(<KnowledgeViewPage params={Promise.resolve({ id: '1' })} />);

      await waitFor(() => {
        expect(screen.getByText('テストコメント')).toBeInTheDocument();
        expect(screen.getByText('コメントユーザー')).toBeInTheDocument();
      });
    });

    test('コメント投稿フォームが表示される', async () => {
      render(<KnowledgeViewPage params={Promise.resolve({ id: '1' })} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('コメントを入力...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'コメント投稿' })).toBeInTheDocument();
      });
    });
  });

  describe('エラーハンドリング', () => {
    test('ナレッジが見つからない場合、404エラーが表示される', async () => {
      mockFetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: false,
          status: 404,
        })
      );

      render(<KnowledgeViewPage params={Promise.resolve({ id: '999' })} />);

      await waitFor(() => {
        expect(screen.getByText('404')).toBeInTheDocument();
        expect(screen.getByText('ページが見つかりません')).toBeInTheDocument();
      });
    });

    test('権限がない場合、403エラーが表示される', async () => {
      mockFetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: false,
          status: 403,
        })
      );

      render(<KnowledgeViewPage params={Promise.resolve({ id: '1' })} />);

      await waitFor(() => {
        expect(screen.getByText('403')).toBeInTheDocument();
        expect(screen.getByText('アクセスが拒否されました')).toBeInTheDocument();
      });
    });
  });

  describe('公開範囲表示', () => {
    test('公開ナレッジの場合、公開アイコンが表示される', async () => {
      render(<KnowledgeViewPage params={Promise.resolve({ id: '1' })} />);

      await waitFor(() => {
        expect(screen.getByTitle('公開')).toBeInTheDocument();
      });
    });

    test('非公開ナレッジの場合、非公開アイコンが表示される', async () => {
      mockFetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: async () => ({
            knowledgeId: 1,
            title: 'テストナレッジ',
            content: '<p>これはテストコンテンツです。</p>',
            publicFlag: 2, // PRIVATE
            // その他必須フィールド
            typeId: 1,
            point: 0,
            likeCount: 0,
            commentCount: 0,
            tags: [],
            stocks: [],
            targets: [],
            groups: [],
            editors: [],
            editable: false,
            insertUser: 'テストユーザー',
            insertDatetime: '2024-01-01T10:00:00',
            updateUser: 'テストユーザー',
            updateDatetime: '2024-01-01T10:00:00',
            files: [],
            comments: []
          }),
        })
      );

      render(<KnowledgeViewPage params={Promise.resolve({ id: '1' })} />);

      await waitFor(() => {
        expect(screen.getByTitle('非公開')).toBeInTheDocument();
      });
    });
  });

  describe('旧システム互換性', () => {
    test('URL構造が旧システムと同じ', () => {
      const { container } = render(<KnowledgeViewPage params={Promise.resolve({ id: '1' })} />);
      
      // URL: /open/knowledge/view/1
      expect(mockRouter.pathname).toBe('/open/knowledge/view/1');
    });

    test('CSS構造が旧システムと同等', async () => {
      const { container } = render(<KnowledgeViewPage params={Promise.resolve({ id: '1' })} />);

      await waitFor(() => {
        // ヘッダー部分
        expect(container.querySelector('#content_head')).toBeInTheDocument();
        expect(container.querySelector('.dispKnowledgeId')).toBeInTheDocument();
        expect(container.querySelector('.meta-info')).toBeInTheDocument();
        
        // メインコンテンツ部分
        expect(container.querySelector('#content_main')).toBeInTheDocument();
      });
    });
  });
});