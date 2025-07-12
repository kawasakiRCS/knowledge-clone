/**
 * アクティビティ履歴取得API
 * 
 * @description ユーザーのアクティビティ履歴を返すAPI
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import type { ActivityHistory } from '@/types/account';

interface ActivityHistoryResponse {
  userId: number;
  activities: ActivityHistory[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

interface ErrorResponse {
  message: string;
}

// モックデータ（実装時はDBから取得）
const mockActivityData: Record<number, ActivityHistory[]> = {
  1: [
    { msg: 'ナレッジ「Next.js入門ガイド」を投稿しました', dispDate: '2025-01-10 10:00:00' },
    { msg: 'ナレッジ「TypeScript実践テクニック」にコメントしました', dispDate: '2025-01-09 18:30:00' },
    { msg: 'ナレッジ「React Hooks完全ガイド」にいいねしました', dispDate: '2025-01-09 15:20:00' },
    { msg: 'ナレッジ「TypeScript実践テクニック」を投稿しました', dispDate: '2025-01-09 15:30:00' },
    { msg: 'ナレッジ「CSS Grid Layout入門」をストックしました', dispDate: '2025-01-08 14:00:00' },
    { msg: 'ナレッジ「Vue.js vs React」にコメントしました', dispDate: '2025-01-08 11:45:00' },
    { msg: 'プロフィールを更新しました', dispDate: '2025-01-07 16:00:00' },
    { msg: 'ナレッジ「JavaScript Promise詳解」にいいねしました', dispDate: '2025-01-07 10:30:00' },
    { msg: 'ナレッジ「Docker入門」を投稿しました', dispDate: '2025-01-06 09:00:00' },
    { msg: 'アカウントを作成しました', dispDate: '2025-01-01 08:00:00' },
  ],
  2: [
    { msg: 'ナレッジ「Python データ分析入門」を投稿しました', dispDate: '2025-01-10 14:00:00' },
    { msg: 'ナレッジ「機械学習の基礎」にいいねしました', dispDate: '2025-01-09 16:00:00' },
    { msg: 'ナレッジ「SQL最適化テクニック」をストックしました', dispDate: '2025-01-08 13:00:00' },
    { msg: 'プロフィールを更新しました', dispDate: '2025-01-05 10:00:00' },
    { msg: 'アカウントを作成しました', dispDate: '2025-01-03 09:00:00' },
  ],
  3: [
    { msg: 'ナレッジ「AWS入門ガイド」を投稿しました', dispDate: '2025-01-10 12:00:00' },
    { msg: 'ナレッジ「Kubernetes実践」にコメントしました', dispDate: '2025-01-08 15:00:00' },
    { msg: 'ナレッジ「CI/CDパイプライン構築」を投稿しました', dispDate: '2025-01-05 11:00:00' },
    { msg: 'ナレッジ「インフラ自動化」にいいねしました', dispDate: '2025-01-03 14:00:00' },
    { msg: 'ナレッジ「セキュリティベストプラクティス」をストックしました', dispDate: '2024-12-30 10:00:00' },
    { msg: 'プロフィールを更新しました', dispDate: '2024-12-25 09:00:00' },
    { msg: 'アカウントを作成しました', dispDate: '2024-12-20 08:00:00' },
  ],
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ActivityHistoryResponse | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, page = '1', pageSize = '10' } = req.query;
  
  // userIdの検証
  if (!userId || Array.isArray(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }
  
  const userIdNum = parseInt(userId, 10);
  
  if (isNaN(userIdNum) || userIdNum <= 0) {
    return res.status(400).json({ message: 'User ID must be a positive number' });
  }
  
  // ページネーション用のパラメータを解析
  const pageNum = parseInt(Array.isArray(page) ? page[0] : page, 10) || 1;
  const pageSizeNum = parseInt(Array.isArray(pageSize) ? pageSize[0] : pageSize, 10) || 10;
  
  if (pageNum < 1 || pageSizeNum < 1 || pageSizeNum > 100) {
    return res.status(400).json({ message: 'Invalid pagination parameters' });
  }
  
  const activities = mockActivityData[userIdNum] || [];
  
  // ページネーション処理
  const totalCount = activities.length;
  const startIndex = (pageNum - 1) * pageSizeNum;
  const endIndex = startIndex + pageSizeNum;
  const paginatedActivities = activities.slice(startIndex, endIndex);
  const hasMore = endIndex < totalCount;
  
  return res.status(200).json({
    userId: userIdNum,
    activities: paginatedActivities,
    totalCount,
    page: pageNum,
    pageSize: pageSizeNum,
    hasMore,
  });
}