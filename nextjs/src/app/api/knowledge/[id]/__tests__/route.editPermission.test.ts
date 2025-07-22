/**
 * ナレッジAPI編集権限テスト
 * 
 * @description 編集権限チェックが正しく動作することを確認
 */
import { GET } from '../route';
import { KnowledgeService } from '@/lib/services/knowledgeService';
import { getAuthenticatedUser } from '@/lib/auth/middleware';

// モックの設定
jest.mock('@/lib/services/knowledgeService');
jest.mock('@/lib/auth/middleware');

// NextRequestのモック
const createMockRequest = (url: string) => ({
  url,
  headers: new Map()
} as any);

describe('GET /api/knowledge/[id] - 編集権限チェック', () => {
  const mockKnowledgeService = KnowledgeService as jest.MockedClass<typeof KnowledgeService>;
  const mockGetAuthenticatedUser = getAuthenticatedUser as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('作成者は編集可能フラグがtrueになる', async () => {
    // モックの設定
    const mockKnowledge = {
      knowledgeId: BigInt(1),
      title: 'テスト記事',
      content: 'テスト内容',
      publicFlag: 1,
      typeId: 1,
      insertUser: 100,
      updateUser: 100,
      insertDatetime: new Date('2025-01-01'),
      updateDatetime: new Date('2025-01-01'),
      point: 0,
      viewCount: BigInt(10),
      author: {
        userId: 100,
        userName: 'テストユーザー',
        userKey: 'test-user'
      }
    };

    const mockEditors = [
      { userId: 200, userName: 'Editor1' }
    ];

    mockGetAuthenticatedUser.mockResolvedValue({ userId: 100 }); // 作成者としてログイン
    mockKnowledgeService.prototype.canAccessKnowledge.mockResolvedValue(true);
    mockKnowledgeService.prototype.getKnowledgeByIdWithUser.mockResolvedValue(mockKnowledge);
    mockKnowledgeService.prototype.getEditors.mockResolvedValue(mockEditors);
    mockKnowledgeService.prototype.isEditor.mockResolvedValue(true); // 編集可能
    mockKnowledgeService.prototype.incrementViewCount.mockResolvedValue(undefined);

    const request = createMockRequest('http://localhost:3000/api/knowledge/1');
    const response = await GET(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.editable).toBe(true);
    expect(data.editors).toHaveLength(1);
    expect(data.editors[0]).toEqual({ userId: 200, userName: 'Editor1' });
  });

  test('共同編集者は編集可能フラグがtrueになる', async () => {
    // モックの設定
    const mockKnowledge = {
      knowledgeId: BigInt(1),
      title: 'テスト記事',
      content: 'テスト内容',
      publicFlag: 1,
      typeId: 1,
      insertUser: 100,
      updateUser: 100,
      insertDatetime: new Date('2025-01-01'),
      updateDatetime: new Date('2025-01-01'),
      point: 0,
      viewCount: BigInt(10),
      author: {
        userId: 100,
        userName: 'テストユーザー',
        userKey: 'test-user'
      }
    };

    const mockEditors = [
      { userId: 200, userName: 'Editor1' },
      { userId: 300, userName: 'Editor2' }
    ];

    mockGetAuthenticatedUser.mockResolvedValue({ userId: 200 }); // 共同編集者としてログイン
    mockKnowledgeService.prototype.canAccessKnowledge.mockResolvedValue(true);
    mockKnowledgeService.prototype.getKnowledgeByIdWithUser.mockResolvedValue(mockKnowledge);
    mockKnowledgeService.prototype.getEditors.mockResolvedValue(mockEditors);
    mockKnowledgeService.prototype.isEditor.mockResolvedValue(true); // 編集可能
    mockKnowledgeService.prototype.incrementViewCount.mockResolvedValue(undefined);

    const request = createMockRequest('http://localhost:3000/api/knowledge/1');
    const response = await GET(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.editable).toBe(true);
  });

  test('権限がないユーザーは編集可能フラグがfalseになる', async () => {
    // モックの設定
    const mockKnowledge = {
      knowledgeId: BigInt(1),
      title: 'テスト記事',
      content: 'テスト内容',
      publicFlag: 1,
      typeId: 1,
      insertUser: 100,
      updateUser: 100,
      insertDatetime: new Date('2025-01-01'),
      updateDatetime: new Date('2025-01-01'),
      point: 0,
      viewCount: BigInt(10),
      author: {
        userId: 100,
        userName: 'テストユーザー',
        userKey: 'test-user'
      }
    };

    const mockEditors = [
      { userId: 200, userName: 'Editor1' }
    ];

    mockGetAuthenticatedUser.mockResolvedValue({ userId: 999 }); // 無関係なユーザーとしてログイン
    mockKnowledgeService.prototype.canAccessKnowledge.mockResolvedValue(true);
    mockKnowledgeService.prototype.getKnowledgeByIdWithUser.mockResolvedValue(mockKnowledge);
    mockKnowledgeService.prototype.getEditors.mockResolvedValue(mockEditors);
    mockKnowledgeService.prototype.isEditor.mockResolvedValue(false); // 編集不可
    mockKnowledgeService.prototype.incrementViewCount.mockResolvedValue(undefined);

    const request = createMockRequest('http://localhost:3000/api/knowledge/1');
    const response = await GET(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.editable).toBe(false);
  });

  test('未ログインユーザーは編集可能フラグがfalseになる', async () => {
    // モックの設定
    const mockKnowledge = {
      knowledgeId: BigInt(1),
      title: 'テスト記事',
      content: 'テスト内容',
      publicFlag: 1,
      typeId: 1,
      insertUser: 100,
      updateUser: 100,
      insertDatetime: new Date('2025-01-01'),
      updateDatetime: new Date('2025-01-01'),
      point: 0,
      viewCount: BigInt(10),
      author: {
        userId: 100,
        userName: 'テストユーザー',
        userKey: 'test-user'
      }
    };

    const mockEditors = [];

    mockGetAuthenticatedUser.mockResolvedValue(undefined); // 未ログイン
    mockKnowledgeService.prototype.canAccessKnowledge.mockResolvedValue(true);
    mockKnowledgeService.prototype.getKnowledgeByIdWithUser.mockResolvedValue(mockKnowledge);
    mockKnowledgeService.prototype.getEditors.mockResolvedValue(mockEditors);
    mockKnowledgeService.prototype.isEditor.mockResolvedValue(false); // 編集不可
    mockKnowledgeService.prototype.incrementViewCount.mockResolvedValue(undefined);

    const request = createMockRequest('http://localhost:3000/api/knowledge/1');
    const response = await GET(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.editable).toBe(false);
  });
});