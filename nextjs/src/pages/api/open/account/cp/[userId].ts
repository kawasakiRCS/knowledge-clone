/**
 * Contribution Point履歴取得API
 * 
 * @description ユーザーのContribution Point履歴を返すAPI
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import type { ContributionPointHistory } from '@/types/account';

interface CPHistoryResponse {
  userId: number;
  history: ContributionPointHistory[];
  totalPoints: number;
  lastUpdated: string;
}

interface ErrorResponse {
  message: string;
}

// モックデータ（実装時はDBから取得）
const mockCPHistoryData: Record<number, CPHistoryResponse> = {
  1: {
    userId: 1,
    history: [
      { date: '2025-01-01', point: 10 },
      { date: '2025-01-02', point: 15 },
      { date: '2025-01-03', point: 25 },
      { date: '2025-01-04', point: 30 },
      { date: '2025-01-05', point: 45 },
      { date: '2025-01-06', point: 60 },
      { date: '2025-01-07', point: 75 },
      { date: '2025-01-08', point: 85 },
      { date: '2025-01-09', point: 95 },
      { date: '2025-01-10', point: 100 },
    ],
    totalPoints: 100,
    lastUpdated: '2025-01-10 15:00:00',
  },
  2: {
    userId: 2,
    history: [
      { date: '2025-01-03', point: 5 },
      { date: '2025-01-05', point: 10 },
      { date: '2025-01-07', point: 20 },
      { date: '2025-01-09', point: 25 },
      { date: '2025-01-10', point: 30 },
    ],
    totalPoints: 30,
    lastUpdated: '2025-01-10 14:00:00',
  },
  3: {
    userId: 3,
    history: [
      { date: '2024-12-20', point: 10 },
      { date: '2024-12-25', point: 20 },
      { date: '2024-12-30', point: 35 },
      { date: '2025-01-05', point: 50 },
      { date: '2025-01-10', point: 65 },
    ],
    totalPoints: 65,
    lastUpdated: '2025-01-10 12:00:00',
  },
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<CPHistoryResponse | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = req.query;
  
  // userIdの検証
  if (!userId || Array.isArray(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }
  
  const userIdNum = parseInt(userId, 10);
  
  if (isNaN(userIdNum) || userIdNum <= 0) {
    return res.status(400).json({ message: 'User ID must be a positive number' });
  }
  
  const cpHistory = mockCPHistoryData[userIdNum];
  
  if (!cpHistory) {
    // ユーザーが存在しない場合、空の履歴を返す
    return res.status(200).json({
      userId: userIdNum,
      history: [],
      totalPoints: 0,
      lastUpdated: new Date().toISOString(),
    });
  }
  
  // 期間フィルタリング（オプション）
  const { from, to } = req.query;
  let filteredHistory = cpHistory.history;
  
  if (from && typeof from === 'string') {
    filteredHistory = filteredHistory.filter(item => item.date >= from);
  }
  
  if (to && typeof to === 'string') {
    filteredHistory = filteredHistory.filter(item => item.date <= to);
  }
  
  return res.status(200).json({
    ...cpHistory,
    history: filteredHistory,
  });
}