/**
 * ナレッジ一覧取得API
 * 
 * @description 旧システムのKnowledgeControl.listメソッドと互換
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { Knowledge, KnowledgeListResponse, TemplateType, Tag, Group } from '../../../src/types/knowledge';

// モックデータ
const mockTemplates: Record<number, TemplateType> = {
  1: { typeId: 1, typeName: 'ナレッジ', typeIcon: 'fa-file-text-o' },
  2: { typeId: 2, typeName: 'Q&A', typeIcon: 'fa-question-circle-o' },
  3: { typeId: 3, typeName: 'イベント', typeIcon: 'fa-calendar' },
  4: { typeId: 4, typeName: 'ブックマーク', typeIcon: 'fa-bookmark' },
};

const mockTags: Tag[] = [
  { tagId: 1, tagName: 'JavaScript', knowledgeCount: 15 },
  { tagId: 2, tagName: 'React', knowledgeCount: 12 },
  { tagId: 3, tagName: 'TypeScript', knowledgeCount: 8 },
  { tagId: 4, tagName: 'Next.js', knowledgeCount: 6 },
  { tagId: 5, tagName: 'Java', knowledgeCount: 20 },
];

const mockGroups: Group[] = [
  { groupId: 1, groupName: '開発チーム', groupKnowledgeCount: 25 },
  { groupId: 2, groupName: 'QAチーム', groupKnowledgeCount: 10 },
  { groupId: 3, groupName: 'デザインチーム', groupKnowledgeCount: 8 },
];

const mockKnowledges: Knowledge[] = [
  {
    knowledgeId: 1,
    title: 'Next.js入門ガイド',
    content: 'Next.jsの基本的な使い方について説明します。',
    insertUser: 1,
    insertUserName: '田中太郎',
    insertDatetime: '2025-01-10T09:00:00Z',
    updateUser: 1,
    updateUserName: '田中太郎',
    updateDatetime: '2025-01-10T09:00:00Z',
    publicFlag: 1,
    likeCount: 5,
    commentCount: 3,
    point: 10,
    pointOnTerm: 2,
    typeId: 1,
    tagNames: 'Next.js,React,TypeScript',
    tagIds: '4,2,3',
    pin: false,
  },
  {
    knowledgeId: 2,
    title: 'Reactのベストプラクティス',
    content: 'Reactアプリケーション開発でのベストプラクティスをまとめました。',
    insertUser: 2,
    insertUserName: '佐藤花子',
    insertDatetime: '2025-01-09T14:30:00Z',
    updateUser: 2,
    updateUserName: '佐藤花子',
    updateDatetime: '2025-01-09T14:30:00Z',
    publicFlag: 1,
    likeCount: 8,
    commentCount: 5,
    point: 15,
    pointOnTerm: 3,
    typeId: 1,
    tagNames: 'React,JavaScript',
    tagIds: '2,1',
    pin: true,
  },
  {
    knowledgeId: 3,
    title: 'TypeScript型定義のコツ',
    content: 'TypeScriptで効果的な型定義を行うためのテクニックを紹介します。',
    insertUser: 3,
    insertUserName: '鈴木一郎',
    insertDatetime: '2025-01-08T11:15:00Z',
    updateUser: 3,
    updateUserName: '鈴木一郎',
    updateDatetime: '2025-01-08T11:15:00Z',
    publicFlag: 1,
    likeCount: 12,
    commentCount: 7,
    point: 20,
    pointOnTerm: 5,
    typeId: 1,
    tagNames: 'TypeScript,JavaScript',
    tagIds: '3,1',
    pin: false,
  },
  {
    knowledgeId: 4,
    title: 'Javaメモリ管理について',
    content: 'Javaアプリケーションでのメモリ管理の重要なポイントを解説します。',
    insertUser: 4,
    insertUserName: '山田次郎',
    insertDatetime: '2025-01-07T16:45:00Z',
    updateUser: 4,
    updateUserName: '山田次郎',
    updateDatetime: '2025-01-07T16:45:00Z',
    publicFlag: 1,
    likeCount: 6,
    commentCount: 2,
    point: 12,
    pointOnTerm: 1,
    typeId: 1,
    tagNames: 'Java',
    tagIds: '5',
    pin: false,
  },
  {
    knowledgeId: 5,
    title: 'デバッグのQ&A集',
    content: 'よくあるデバッグ問題とその解決方法をQ&A形式でまとめました。',
    insertUser: 5,
    insertUserName: '高橋美咲',
    insertDatetime: '2025-01-06T13:20:00Z',
    updateUser: 5,
    updateUserName: '高橋美咲',
    updateDatetime: '2025-01-06T13:20:00Z',
    publicFlag: 1,
    likeCount: 9,
    commentCount: 4,
    point: 18,
    pointOnTerm: 4,
    typeId: 2,
    tagNames: 'デバッグ,トラブルシューティング',
    tagIds: '6,7',
    pin: false,
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse<KnowledgeListResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      knowledges: [], 
      total: 0, 
      offset: 0, 
      limit: 50,
      error: 'Method not allowed' 
    } as KnowledgeListResponse & { error: string });
  }

  try {
    // クエリパラメータの解析
    const {
      offset = '0',
      limit = '50',
      keyword,
      tag,
      group,
      user,
      tagNames,
      groupNames,
      creators,
      template,
      stockid,
      keywordSortType = '1'
    } = req.query;

    const offsetNum = parseInt(Array.isArray(offset) ? offset[0] : offset);
    const limitNum = parseInt(Array.isArray(limit) ? limit[0] : limit);

    let filteredKnowledges = [...mockKnowledges];

    // キーワード検索フィルタ
    if (keyword) {
      const keywordStr = Array.isArray(keyword) ? keyword[0] : keyword;
      filteredKnowledges = filteredKnowledges.filter(k => 
        k.title.includes(keywordStr) || k.content.includes(keywordStr)
      );
    }

    // タグフィルタ
    if (tag) {
      const tagId = parseInt(Array.isArray(tag) ? tag[0] : tag);
      filteredKnowledges = filteredKnowledges.filter(k => 
        k.tagIds?.includes(String(tagId))
      );
    }

    // タグ名フィルタ
    if (tagNames) {
      const tagNamesStr = Array.isArray(tagNames) ? tagNames[0] : tagNames;
      const targetTags = tagNamesStr.split(',');
      filteredKnowledges = filteredKnowledges.filter(k => 
        targetTags.some(tagName => k.tagNames?.includes(tagName.trim()))
      );
    }

    // テンプレートフィルタ
    if (template && Array.isArray(template)) {
      const templateIds = template.map(t => parseInt(t)).filter(t => !isNaN(t));
      if (templateIds.length > 0) {
        filteredKnowledges = filteredKnowledges.filter(k => 
          templateIds.includes(k.typeId)
        );
      }
    }

    // ピン留めを先頭に配置（オフセット0の場合のみ）
    if (offsetNum === 0) {
      const pinnedKnowledges = filteredKnowledges.filter(k => k.pin);
      const unpinnedKnowledges = filteredKnowledges.filter(k => !k.pin);
      filteredKnowledges = [...pinnedKnowledges, ...unpinnedKnowledges];
    }

    // ページング
    const total = filteredKnowledges.length;
    const paginatedKnowledges = filteredKnowledges.slice(
      offsetNum * limitNum,
      (offsetNum + 1) * limitNum
    );

    // 選択されたフィルタ情報
    let selectedTag: Tag | undefined;
    let selectedGroup: Group | undefined;
    let selectedTemplates: TemplateType[] = [];

    if (tag) {
      const tagId = parseInt(Array.isArray(tag) ? tag[0] : tag);
      selectedTag = mockTags.find(t => t.tagId === tagId);
    }

    if (group) {
      const groupId = parseInt(Array.isArray(group) ? group[0] : group);
      selectedGroup = mockGroups.find(g => g.groupId === groupId);
    }

    if (template && Array.isArray(template)) {
      const templateIds = template.map(t => parseInt(t)).filter(t => !isNaN(t));
      selectedTemplates = templateIds
        .map(id => mockTemplates[id])
        .filter(t => t !== undefined);
    }

    const response: KnowledgeListResponse = {
      knowledges: paginatedKnowledges,
      total,
      offset: offsetNum,
      limit: limitNum,
      tags: mockTags,
      groups: mockGroups,
      templates: mockTemplates,
      selectedTag,
      selectedGroup,
      selectedTemplates,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in knowledge list API:', error);
    res.status(500).json({
      knowledges: [],
      total: 0,
      offset: 0,
      limit: 50,
      error: 'Internal server error'
    } as KnowledgeListResponse & { error: string });
  }
}