import type { NextApiRequest, NextApiResponse } from 'next';

// モックデータ
const mockTags = [
  'Java',
  'JavaScript',
  'React',
  'Next.js',
  'TypeScript',
  'Node.js',
  'Python',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'CI/CD',
  'DevOps',
  'Agile',
  'Scrum',
  'TDD',
  'DDD',
  'Microservices',
  'REST API',
  'GraphQL',
  'Database',
  'PostgreSQL',
  'MongoDB',
  'Redis',
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<string[]>
) {
  if (req.method === 'GET') {
    // 実際の実装では、データベースからタグを取得
    res.status(200).json(mockTags);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}