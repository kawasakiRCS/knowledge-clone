/**
 * アカウント情報API
 * 
 * @description AccountControl#info()に対応
 */
import type { NextApiRequest, NextApiResponse } from 'next';

// モックデータ（実装時はDBから取得）
const mockAccountData = {
  1: {
    userId: 1,
    userName: 'テストユーザー',
    knowledgeCount: 10,
    likeCount: 25,
    stockCount: 5,
    point: 100,
    knowledges: [
      {
        knowledgeId: 1,
        title: 'Next.js入門ガイド',
        content: 'Next.jsの基本的な使い方について説明します。',
        createUser: { userId: 1, userName: 'テストユーザー' },
        createDatetime: '2025-01-10 10:00:00',
        likeCount: 5,
        commentCount: 3,
        publicFlag: 1,
        tags: [{ tagName: 'nextjs' }, { tagName: 'react' }],
        viewers: [],
        stocks: [],
      },
      {
        knowledgeId: 2,
        title: 'TypeScript実践テクニック',
        content: 'TypeScriptの高度な型操作について解説します。',
        createUser: { userId: 1, userName: 'テストユーザー' },
        createDatetime: '2025-01-09 15:30:00',
        likeCount: 8,
        commentCount: 2,
        publicFlag: 1,
        tags: [{ tagName: 'typescript' }],
        viewers: [],
        stocks: [],
      },
    ],
  },
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = req.query;
  const userIdNum = parseInt(userId as string, 10);
  
  const accountData = mockAccountData[userIdNum as keyof typeof mockAccountData];
  
  if (!accountData) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // ページネーション処理（後で実装）
  // const offset = parseInt(req.query.offset as string || '0', 10);
  // const limit = 50;
  
  return res.status(200).json(accountData);
}