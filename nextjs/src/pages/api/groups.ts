import type { NextApiRequest, NextApiResponse } from 'next';

// モックデータ
const mockGroups = [
  'Development Team',
  'Design Team',
  'QA Team',
  'Product Team',
  'Marketing Team',
  'Sales Team',
  'HR Team',
  'Finance Team',
  'Operations Team',
  'Management Team',
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<string[]>
) {
  if (req.method === 'GET') {
    // 実際の実装では、ユーザーの所属グループをデータベースから取得
    // 認証チェックも必要
    res.status(200).json(mockGroups);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}