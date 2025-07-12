/**
 * タグ一覧API
 * 
 * @description タグ一覧とページネーション情報を返す
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { Tag } from '@/types/knowledge';

interface TagListResponse {
  tags: Tag[];
  total: number;
  previous?: number;
  next?: number;
  offset: number;
}

// モックデータ - 実際の実装では DB から取得
const mockTags: Tag[] = [
  { tagId: 1, tagName: 'JavaScript', knowledgeCount: 15 },
  { tagId: 2, tagName: 'TypeScript', knowledgeCount: 12 },
  { tagId: 3, tagName: 'React', knowledgeCount: 8 },
  { tagId: 4, tagName: 'Next.js', knowledgeCount: 6 },
  { tagId: 5, tagName: 'Node.js', knowledgeCount: 10 },
  { tagId: 6, tagName: 'Python', knowledgeCount: 7 },
  { tagId: 7, tagName: 'Java', knowledgeCount: 20 },
  { tagId: 8, tagName: 'Spring Boot', knowledgeCount: 5 },
  { tagId: 9, tagName: 'Docker', knowledgeCount: 9 },
  { tagId: 10, tagName: 'PostgreSQL', knowledgeCount: 4 },
  { tagId: 11, tagName: 'MongoDB', knowledgeCount: 3 },
  { tagId: 12, tagName: 'Redis', knowledgeCount: 2 },
  { tagId: 13, tagName: 'AWS', knowledgeCount: 11 },
  { tagId: 14, tagName: 'Azure', knowledgeCount: 6 },
  { tagId: 15, tagName: 'GCP', knowledgeCount: 4 },
  { tagId: 16, tagName: 'Kubernetes', knowledgeCount: 8 },
  { tagId: 17, tagName: 'Machine Learning', knowledgeCount: 13 },
  { tagId: 18, tagName: 'Deep Learning', knowledgeCount: 7 },
  { tagId: 19, tagName: 'データ分析', knowledgeCount: 9 },
  { tagId: 20, tagName: 'セキュリティ', knowledgeCount: 14 },
];

const ITEMS_PER_PAGE = 10;

export default function handler(req: NextApiRequest, res: NextApiResponse<TagListResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const { offset = '0' } = req.query;
  const currentOffset = parseInt(offset as string) || 0;

  // ページネーションの計算
  const startIndex = currentOffset;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTags = mockTags.slice(startIndex, endIndex);

  // 前ページ・次ページの計算
  const hasPrevious = currentOffset > 0;
  const hasNext = endIndex < mockTags.length;
  
  const previous = hasPrevious ? Math.max(0, currentOffset - ITEMS_PER_PAGE) : undefined;
  const next = hasNext ? currentOffset + ITEMS_PER_PAGE : undefined;

  const response: TagListResponse = {
    tags: paginatedTags,
    total: mockTags.length,
    offset: currentOffset,
    ...(previous !== undefined && { previous }),
    ...(next !== undefined && { next }),
  };

  res.status(200).json(response);
}