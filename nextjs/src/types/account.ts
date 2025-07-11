/**
 * アカウント関連の型定義
 */

/**
 * アカウント情報
 */
export interface AccountInfo {
  userId: number;
  userName: string;
  knowledgeCount: number;
  likeCount: number;
  stockCount: number;
  point?: number;
}

/**
 * ContributionPointの履歴
 */
export interface ContributionPointHistory {
  date: string;
  point: number;
}

/**
 * アクティビティ履歴
 */
export interface ActivityHistory {
  msg: string;
  dispDate: string;
}