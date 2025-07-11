/**
 * ナレッジ関連の型定義
 */

export interface Knowledge {
  knowledgeId: number;
  title: string;
  content: string;
  insertUser: number;
  insertUserName: string;
  insertDatetime: string;
  updateUser: number;
  updateUserName: string;
  updateDatetime: string;
  publicFlag: number;
  likeCount: number;
  commentCount: number;
  point: number;
  pointOnTerm?: number;
  typeId: number;
  tagNames?: string;
  tagIds?: string;
  pin?: boolean;
  stocks?: Stock[];
  targets?: TargetLabel[];
  startDateTime?: string;
  viewed?: boolean;
}

export interface StockKnowledge extends Knowledge {
  viewed: boolean;
  participations?: {
    count: number;
    limit: number;
    status?: number;
  };
}

export interface Tag {
  tagId: number;
  tagName: string;
  knowledgeCount?: number;
}

export interface Group {
  groupId: number;
  groupName: string;
  groupKnowledgeCount?: number;
}

export interface User {
  userId: number;
  userName: string;
}

export interface Stock {
  stockId: number;
  stockName: string;
}

export interface TargetLabel {
  label: string;
  value: string;
}

export interface TemplateType {
  typeId: number;
  typeName: string;
  typeIcon: string;
}

export interface KnowledgeListResponse {
  knowledges: Knowledge[];
  total: number;
  offset: number;
  limit: number;
  tags?: Tag[];
  groups?: Group[];
  selectedTag?: Tag;
  selectedGroup?: Group;
  selectedUser?: User;
  selectedTags?: Tag[];
  selectedGroups?: Group[];
  creators?: User[];
  templates?: Record<number, TemplateType>;
  selectedTemplates?: TemplateType[];
  targets?: Record<number, TargetLabel[]>;
}

export interface KnowledgeListParams {
  offset?: number;
  limit?: number;
  keyword?: string;
  tag?: string;
  group?: string;
  user?: string;
  tagNames?: string;
  groupNames?: string;
  creators?: string;
  template?: string[];
  stockid?: string;
  keywordSortType?: number;
}

// 定数
export const PUBLIC_FLAG = {
  PUBLIC: 1,
  PRIVATE: 2,
  PROTECT: 3,
} as const;

export const KEYWORD_SORT_TYPE = {
  SCORE: 1,
  TIME: 2,
} as const;

export const EVENT_STATUS = {
  PARTICIPATION: 1,
  WAIT_CANCEL: 2,
} as const;

export const PAGE_LIMIT = 50;