/**
 * ナレッジサービス
 * 
 * @description 旧JavaシステムのKnowledgeLogicと互換性のあるサービス
 */
import { KnowledgeRepository, KnowledgeWithAuthor } from '@/lib/repositories/knowledgeRepository';
import { Knowledge } from '@prisma/client';

export interface User {
  userId: number;
  isAdmin?: boolean;
  groups?: Array<{ groupId: number }>;
}

export class KnowledgeService {
  private knowledgeRepo = new KnowledgeRepository();

  /**
   * ナレッジをIDで取得（基本情報のみ）
   * 
   * @description 旧システムのKnowledgeLogic相当
   * @param knowledgeId ナレッジID
   * @returns ナレッジ情報またはnull
   */
  async getKnowledgeById(knowledgeId: bigint): Promise<Knowledge | null> {
    return await this.knowledgeRepo.findById(knowledgeId);
  }

  /**
   * ナレッジをIDで取得（ユーザー情報含む）
   * 
   * @description 旧システムのKnowledgeLogic相当（ユーザー情報付き）
   * @param knowledgeId ナレッジID
   * @returns ナレッジ情報（ユーザー情報含む）またはnull
   */
  async getKnowledgeByIdWithUser(knowledgeId: bigint): Promise<KnowledgeWithAuthor | null> {
    return await this.knowledgeRepo.findByIdWithUserInfo(knowledgeId);
  }

  /**
   * ナレッジへのアクセス権限をチェック
   * 
   * @description 旧システムのKnowledgeAuthenticationLogic相当
   * @param knowledgeId ナレッジID
   * @param user ユーザー情報（ログインしていない場合はundefined）
   * @returns アクセス可能かどうか
   */
  async canAccessKnowledge(knowledgeId: bigint, user?: User): Promise<boolean> {
    const knowledge = await this.knowledgeRepo.findById(knowledgeId);
    
    if (!knowledge) {
      return false; // 存在しないナレッジはアクセス不可
    }

    // 公開フラグによる判定
    switch (knowledge.publicFlag) {
      case 1: // 公開
        return true;
      
      case 2: // 非公開
        if (!user) return false; // ログインしていない場合はアクセス不可
        // 作成者または管理者の場合はアクセス可能
        return knowledge.insertUser === user.userId || user.isAdmin === true;
      
      case 3: // 保護（グループメンバーのみ）
        if (!user) return false; // ログインしていない場合はアクセス不可
        // 作成者、管理者、または所属グループメンバーの場合はアクセス可能
        if (knowledge.insertUser === user.userId || user.isAdmin === true) {
          return true;
        }
        // グループチェック（実装は後で詳細化）
        return false;
      
      default:
        return false; // 不明なフラグはアクセス不可
    }
  }

  /**
   * ナレッジの閲覧数を増加
   * 
   * @description 旧システムのKnowledgeLogic相当
   * @param knowledgeId ナレッジID
   */
  async incrementViewCount(knowledgeId: bigint): Promise<void> {
    try {
      const knowledge = await this.knowledgeRepo.findById(knowledgeId);
      if (knowledge) {
        const newCount = (knowledge.viewCount || BigInt(0)) + BigInt(1);
        await this.knowledgeRepo.updateViewCount(knowledgeId, newCount);
      }
    } catch (error) {
      // エラーログを出力するが、閲覧処理を妨げない
      console.error('Failed to increment view count:', error);
    }
  }

  /**
   * ナレッジのポイントを取得
   * 
   * @description 旧システムのKnowledgeLogic相当
   * @param knowledgeId ナレッジID
   * @returns ポイント値
   */
  async getKnowledgePoint(knowledgeId: bigint): Promise<number> {
    return await this.knowledgeRepo.getPoint(knowledgeId);
  }

  /**
   * ナレッジのポイントを更新
   * 
   * @description 旧システムのKnowledgeLogic相当
   * @param knowledgeId ナレッジID
   * @param point 新しいポイント値
   */
  async updateKnowledgePoint(knowledgeId: bigint, point: number): Promise<void> {
    await this.knowledgeRepo.updatePoint(knowledgeId, point);
  }
}