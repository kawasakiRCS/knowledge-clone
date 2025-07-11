/**
 * ユーザーアイコン取得API
 * 
 * @description ユーザーのアイコン情報を返すAPI
 */
import type { NextApiRequest, NextApiResponse } from 'next';

interface IconResponse {
  userId: number;
  iconUrl: string;
  iconType: 'default' | 'custom' | 'gravatar';
  lastUpdated: string;
}

interface ErrorResponse {
  message: string;
}

// モックデータ（実装時はDBから取得）
const mockIconData: Record<number, IconResponse> = {
  1: {
    userId: 1,
    iconUrl: '/images/icons/user1.png',
    iconType: 'custom',
    lastUpdated: '2025-01-10 10:00:00',
  },
  2: {
    userId: 2,
    iconUrl: '/images/icons/default.png',
    iconType: 'default',
    lastUpdated: '2025-01-08 12:00:00',
  },
  3: {
    userId: 3,
    iconUrl: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
    iconType: 'gravatar',
    lastUpdated: '2025-01-05 09:30:00',
  },
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<IconResponse | ErrorResponse>
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
  
  const iconData = mockIconData[userIdNum];
  
  if (!iconData) {
    // ユーザーが存在しない場合、デフォルトアイコンを返す
    return res.status(200).json({
      userId: userIdNum,
      iconUrl: '/images/icons/default.png',
      iconType: 'default',
      lastUpdated: new Date().toISOString(),
    });
  }
  
  return res.status(200).json(iconData);
}