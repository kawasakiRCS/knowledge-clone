/**
 * ナレッジサービス
 * 
 * @description 旧JavaシステムのKnowledgeLogicと互換性のあるサービス
 */
import { KnowledgeRepository, KnowledgeWithAuthor } from '@/lib/repositories/knowledgeRepository';
import { Knowledge } from '@prisma/client';
import { AuthenticatedUser } from '@/lib/auth/middleware';

export interface User {
  userId: number;
  isAdmin?: boolean;
  groups?: Array<{ groupId: number }>;
}

export interface CreateKnowledgeInput {
  title: string;
  content?: string;
  publicFlag: number;
  typeId: number;
  tags?: string[];
  groups?: number[];
  editors?: number[];
}

export interface UpdateKnowledgeInput extends CreateKnowledgeInput {
  knowledgeId: bigint;
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

  /**
   * ナレッジを新規作成
   * 
   * @description 旧システムのKnowledgeLogic.insert相当
   * @param data 作成データ
   * @param user 作成者
   * @returns 作成されたナレッジ
   */
  async createKnowledge(data: CreateKnowledgeInput, user: AuthenticatedUser): Promise<Knowledge> {
    // バリデーション
    this.validateKnowledgeData(data);

    // 権限チェック（将来実装予定：グループ・編集者権限）
    await this.checkCreatePermission(user, data);

    // ナレッジ作成
    const knowledge = await this.knowledgeRepo.create({
      title: data.title,
      content: data.content || '',
      publicFlag: data.publicFlag,
      typeId: data.typeId,
      insertUser: user.userId,
      insertDatetime: new Date(),
      updateUser: user.userId,
      updateDatetime: new Date(),
      deleteFlag: 0,
      viewCount: BigInt(0),
      point: 0
    });

    // 関連データの作成（タグ、グループ、編集者）
    await this.saveRelatedData(knowledge.knowledgeId, data, user);

    return knowledge;
  }

  /**
   * ナレッジを更新
   * 
   * @description 旧システムのKnowledgeLogic.update相当
   * @param data 更新データ
   * @param user 更新者
   * @returns 更新されたナレッジ
   */
  async updateKnowledge(data: UpdateKnowledgeInput, user: AuthenticatedUser): Promise<Knowledge> {
    // バリデーション
    this.validateKnowledgeData(data);

    // 既存データ取得
    const existing = await this.knowledgeRepo.findById(data.knowledgeId);
    if (!existing) {
      throw new Error('Knowledge not found');
    }

    // 編集権限チェック
    await this.checkEditPermission(user, existing);

    // 履歴作成（実装予定）
    await this.createHistory(existing, user);

    // ナレッジ更新
    const updated = await this.knowledgeRepo.update(data.knowledgeId, {
      title: data.title,
      content: data.content || existing.content,
      publicFlag: data.publicFlag,
      typeId: data.typeId,
      updateUser: user.userId,
      updateDatetime: new Date()
    });

    // 関連データの更新（タグ、グループ、編集者）
    await this.saveRelatedData(updated.knowledgeId, data, user);

    return updated;
  }

  /**
   * ナレッジを削除
   * 
   * @description 旧システムのKnowledgeLogic.delete相当
   * @param knowledgeId ナレッジID
   * @param user 削除者
   */
  async deleteKnowledge(knowledgeId: bigint, user: AuthenticatedUser): Promise<void> {
    // 既存データ取得
    const existing = await this.knowledgeRepo.findById(knowledgeId);
    if (!existing) {
      throw new Error('Knowledge not found');
    }

    // 削除権限チェック
    await this.checkDeletePermission(user, existing);

    // 論理削除
    await this.knowledgeRepo.softDelete(knowledgeId, user.userId);
  }

  /**
   * ナレッジデータのバリデーション
   * 
   * @description 旧システムのvalidate相当
   * @param data ナレッジデータ
   */
  private validateKnowledgeData(data: CreateKnowledgeInput | UpdateKnowledgeInput): void {
    if (!data.title || data.title.trim() === '') {
      throw new Error('タイトルは必須です');
    }

    if (data.title.length > 1024) {
      throw new Error('タイトルは1024文字以内で入力してください');
    }

    if (!data.typeId) {
      throw new Error('テンプレートタイプは必須です');
    }

    if (![1, 2, 3].includes(data.publicFlag)) {
      throw new Error('公開フラグが無効です');
    }
  }

  /**
   * 作成権限チェック
   * 
   * @description 作成時の権限チェック
   * @param user ユーザー
   * @param data 作成データ
   */
  private async checkCreatePermission(user: AuthenticatedUser, data: CreateKnowledgeInput): Promise<void> {
    // 基本的に認証済みユーザーは作成可能
    // グループ指定時のグループメンバーチェック（実装予定）
    // 編集者指定時の権限チェック（実装予定）
  }

  /**
   * 編集権限チェック
   * 
   * @description 旧システムのisEditor相当
   * @param user ユーザー
   * @param knowledge ナレッジ
   */
  private async checkEditPermission(user: AuthenticatedUser, knowledge: Knowledge): Promise<void> {
    // 作成者の場合は編集可能
    if (knowledge.insertUser === user.userId) {
      return;
    }

    // システム管理者の場合は編集可能
    if (user.isAdmin) {
      return;
    }

    // 共同編集者チェック（実装予定）
    // TODO: KnowledgeEditorsテーブルとの照合

    // グループ編集権限チェック（実装予定）
    // TODO: KnowledgeGroupsテーブルとユーザーグループの照合

    throw new Error('ナレッジの編集権限がありません');
  }

  /**
   * 削除権限チェック
   * 
   * @description 削除権限チェック
   * @param user ユーザー
   * @param knowledge ナレッジ
   */
  private async checkDeletePermission(user: AuthenticatedUser, knowledge: Knowledge): Promise<void> {
    // 削除権限は編集権限と同じ
    await this.checkEditPermission(user, knowledge);
  }

  /**
   * 関連データの保存
   * 
   * @description タグ、グループ、編集者の関連データ保存
   * @param knowledgeId ナレッジID
   * @param data ナレッジデータ
   * @param user ユーザー
   */
  private async saveRelatedData(knowledgeId: bigint, data: CreateKnowledgeInput | UpdateKnowledgeInput, user: AuthenticatedUser): Promise<void> {
    // タグの保存（実装予定）
    if (data.tags && data.tags.length > 0) {
      await this.saveTags(knowledgeId, data.tags, user);
    }

    // グループの保存（実装予定）
    if (data.groups && data.groups.length > 0) {
      await this.saveGroups(knowledgeId, data.groups, user);
    }

    // 編集者の保存（実装予定）
    if (data.editors && data.editors.length > 0) {
      await this.saveEditors(knowledgeId, data.editors, user);
    }
  }

  /**
   * 履歴作成
   * 
   * @description 旧システムの履歴作成相当
   * @param knowledge ナレッジ
   * @param user ユーザー
   */
  private async createHistory(knowledge: Knowledge, user: AuthenticatedUser): Promise<void> {
    // ナレッジ履歴テーブルへの保存（実装予定）
    // TODO: KnowledgeHistoriesテーブルの実装
  }

  /**
   * タグの保存
   * 
   * @description ナレッジタグの関連付け
   * @param knowledgeId ナレッジID
   * @param tags タグ名配列
   * @param user ユーザー
   */
  private async saveTags(knowledgeId: bigint, tags: string[], user: AuthenticatedUser): Promise<void> {
    // KnowledgeTagsテーブルの実装予定
  }

  /**
   * グループの保存
   * 
   * @description ナレッジグループの関連付け
   * @param knowledgeId ナレッジID
   * @param groups グループID配列
   * @param user ユーザー
   */
  private async saveGroups(knowledgeId: bigint, groups: number[], user: AuthenticatedUser): Promise<void> {
    // KnowledgeGroupsテーブルの実装予定
  }

  /**
   * 編集者の保存
   * 
   * @description ナレッジ編集者の関連付け
   * @param knowledgeId ナレッジID
   * @param editors 編集者ID配列
   * @param user ユーザー
   */
  private async saveEditors(knowledgeId: bigint, editors: number[], user: AuthenticatedUser): Promise<void> {
    // KnowledgeEditorsテーブルの実装予定
  }
}