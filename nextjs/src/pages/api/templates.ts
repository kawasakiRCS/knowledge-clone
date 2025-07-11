import type { NextApiRequest, NextApiResponse } from 'next';

interface Template {
  typeId: number;
  typeIcon: string;
  typeName: string;
}

// モックデータ（旧システムと同じテンプレート）
const mockTemplates: Template[] = [
  {
    typeId: 1,
    typeIcon: 'fa-file-text-o',
    typeName: '記事',
  },
  {
    typeId: 2,
    typeIcon: 'fa-code',
    typeName: 'コード',
  },
  {
    typeId: 3,
    typeIcon: 'fa-book',
    typeName: 'Wiki',
  },
  {
    typeId: 4,
    typeIcon: 'fa-sticky-note-o',
    typeName: 'メモ',
  },
  {
    typeId: 5,
    typeIcon: 'fa-comments-o',
    typeName: 'Q&A',
  },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Template[]>
) {
  if (req.method === 'GET') {
    // 実際の実装では、データベースからテンプレートを取得
    res.status(200).json(mockTemplates);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}