/**
 * ストック関連の型定義
 */

export interface StocksEntity {
  stockId: number;
  stockName: string;
  stockType: number;
  description?: string;
  insertUser: number;
  insertDatetime: string;
  updateUser: number;
  updateDatetime: string;
  deleteFlag: number;
}

export interface StockKnowledgesEntity {
  stockId: number;
  knowledgeId: number;
  comment?: string;
  insertUser: number;
  insertDatetime: string;
  updateUser: number;
  updateDatetime: string;
  deleteFlag: number;
}