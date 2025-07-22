/**
 * タグサービス
 * 
 * @description 旧Javaシステムの完全移植
 * - TagLogic + TagsDao の機能を統合
 * - タグ一覧取得、検索、ナレッジ件数取得
 */
import { PrismaClient } from '@prisma/client';
import { AuthenticatedUser } from '@/lib/auth/middleware';

let prisma: PrismaClient;

export interface TagData {
  tagId: number;
  tagName: string;
  knowledgeCount: number;
  tagColor?: string;
}

export class TagService {
  constructor(prismaClient?: PrismaClient) {
    prisma = prismaClient || new PrismaClient();
  }

  /**
   * タグ一覧をナレッジ件数付きで取得
   * 
   * @description 旧TagLogic.selectTagsWithCount()の移植
   * @param currentUser 現在のユーザー（アクセス制御用）
   * @param offset オフセット
   * @param limit 取得件数制限
   * @returns タグ一覧
   */
  async getTagsWithCount(
    currentUser: AuthenticatedUser | null,
    offset: number,
    limit: number
  ): Promise<TagData[]> {
    try {
      // ユーザーがアクセス可能なナレッジのみをカウント
      const userId = currentUser?.userId || -1;
      
      // 複雑なクエリのためrawクエリを使用
      const query = `
        SELECT 
          t.tag_id,
          t.tag_name,
          COALESCE(COUNT(DISTINCT kt.knowledge_id), 0) as knowledge_count
        FROM tags_entity t
        LEFT JOIN knowledge_tag_maps_entity kt ON t.tag_id = kt.tag_id
        LEFT JOIN knowledges_entity k ON kt.knowledge_id = k.knowledge_id
        WHERE t.delete_flag = false
          AND (
            kt.knowledge_id IS NULL 
            OR (
              k.delete_flag = false 
              AND (
                k.public_flag = true
                OR k.insert_user = $1
                OR EXISTS (
                  SELECT 1 FROM groups_entity g
                  JOIN user_groups_entity ug ON g.group_id = ug.group_id
                  WHERE ug.user_id = $1 AND g.group_id = k.type_id
                  AND g.delete_flag = false AND ug.delete_flag = false
                )
              )
            )
          )
        GROUP BY t.tag_id, t.tag_name
        ORDER BY knowledge_count DESC, t.tag_name ASC
        OFFSET $2 LIMIT $3
      `;

      const result = await prisma.$queryRawUnsafe(query, userId, offset, limit);
      
      return (result as any[]).map(row => ({
        tagId: Number(row.tag_id),
        tagName: row.tag_name,
        knowledgeCount: Number(row.knowledge_count)
      }));
    } catch (error) {
      console.error('TagService.getTagsWithCount error:', error);
      return [];
    }
  }

  /**
   * キーワード検索でタグ取得
   * 
   * @description 旧TagsDao.selectWithKnowledgeCountOnTagName()の移植
   * @param keyword 検索キーワード
   * @param offset オフセット
   * @param limit 取得件数制限
   * @returns 検索結果タグ一覧
   */
  async getTagsWithKeyword(
    keyword: string,
    offset: number,
    limit: number
  ): Promise<TagData[]> {
    try {
      // キーワードサニタイズ
      const sanitizedKeyword = this.sanitizeKeyword(keyword);
      
      const query = `
        SELECT 
          t.tag_id,
          t.tag_name,
          COALESCE(COUNT(DISTINCT kt.knowledge_id), 0) as knowledge_count
        FROM tags_entity t
        LEFT JOIN knowledge_tag_maps_entity kt ON t.tag_id = kt.tag_id
        LEFT JOIN knowledges_entity k ON kt.knowledge_id = k.knowledge_id
        WHERE t.delete_flag = false
          AND t.tag_name ILIKE $1
          AND (
            kt.knowledge_id IS NULL 
            OR (k.delete_flag = false AND k.public_flag = true)
          )
        GROUP BY t.tag_id, t.tag_name
        ORDER BY knowledge_count DESC, t.tag_name ASC
        OFFSET $2 LIMIT $3
      `;

      const searchPattern = `%${sanitizedKeyword}%`;
      const result = await prisma.$queryRawUnsafe(query, searchPattern, offset, limit);
      
      return (result as any[]).map(row => ({
        tagId: Number(row.tag_id),
        tagName: row.tag_name,
        knowledgeCount: Number(row.knowledge_count)
      }));
    } catch (error) {
      console.error('TagService.getTagsWithKeyword error:', error);
      return [];
    }
  }

  /**
   * タグ作成
   * 
   * @description 新規タグ作成機能
   * @param tagName タグ名
   * @param userId 作成ユーザーID
   * @returns 作成されたタグ情報
   */
  async createTag(tagName: string, userId: number): Promise<TagData | null> {
    try {
      // 重複チェック
      const existing = await prisma.tag.findFirst({
        where: {
          tagName,
          deleteFlag: 0
        }
      });

      if (existing) {
        return {
          tagId: Number(existing.tagId),
          tagName: existing.tagName,
          knowledgeCount: 0
        };
      }

      // 新規作成
      const now = new Date();
      const tag = await prisma.tag.create({
        data: {
          tagName,
          insertUser: userId,
          insertDatetime: now,
          updateUser: userId,
          updateDatetime: now,
          deleteFlag: 0
        }
      });

      return {
        tagId: Number(tag.tagId),
        tagName: tag.tagName,
        knowledgeCount: 0
      };
    } catch (error) {
      console.error('TagService.createTag error:', error);
      return null;
    }
  }

  /**
   * タグ削除
   * 
   * @description タグの論理削除
   * @param tagId タグID
   * @param userId 削除実行ユーザーID
   * @returns 削除成功フラグ
   */
  async deleteTag(tagId: number, userId: number): Promise<boolean> {
    try {
      const tag = await prisma.tag.findUnique({
        where: { tagId: tagId }
      });

      if (!tag || tag.deleteFlag) {
        return false;
      }

      // 論理削除実行
      await prisma.tag.update({
        where: { tagId: tagId },
        data: {
          deleteFlag: 1,
          updateUser: userId,
          updateDatetime: new Date()
        }
      });

      return true;
    } catch (error) {
      console.error('TagService.deleteTag error:', error);
      return false;
    }
  }

  /**
   * ナレッジとタグの紐づけ
   * 
   * @description ナレッジにタグを関連付け
   * @param knowledgeId ナレッジID
   * @param tagIds タグID配列
   * @param userId 実行ユーザーID
   * @returns 紐づけ成功フラグ
   */
  async attachTagsToKnowledge(
    knowledgeId: number,
    tagIds: number[],
    userId: number
  ): Promise<boolean> {
    try {
      const now = new Date();

      // 既存の紐づけを削除
      await prisma.knowledgeTag.updateMany({
        where: {
          knowledgeId: BigInt(knowledgeId),
          deleteFlag: 0
        },
        data: {
          deleteFlag: 1,
          updateUser: userId,
          updateDatetime: now
        }
      });

      // 新しい紐づけを作成
      for (const tagId of tagIds) {
        await prisma.knowledgeTag.create({
          data: {
            knowledgeId: BigInt(knowledgeId),
            tagId: tagId,
            insertUser: userId,
            insertDatetime: now,
            updateUser: userId,
            updateDatetime: now,
            deleteFlag: 0
          }
        });
      }

      return true;
    } catch (error) {
      console.error('TagService.attachTagsToKnowledge error:', error);
      return false;
    }
  }

  /**
   * ナレッジに紐づくタグを取得
   * 
   * @description 指定されたナレッジIDに関連付けられたタグを取得
   * @param knowledgeId ナレッジID
   * @returns タグ配列
   */
  async getTagsByKnowledgeId(knowledgeId: bigint): Promise<TagData[]> {
    try {
      const tags = await prisma.knowledgeTag.findMany({
        where: {
          knowledgeId: knowledgeId,
          deleteFlag: 0
        },
        include: {
          tag: {
            where: {
              deleteFlag: 0
            }
          }
        }
      });

      return tags
        .filter(kt => kt.tag) // tagがnullでないもののみ
        .map(kt => ({
          tagId: Number(kt.tag!.tagId),
          tagName: kt.tag!.tagName,
          knowledgeCount: 0 // 個別取得時はカウント不要
        }));
    } catch (error) {
      console.error('TagService.getTagsByKnowledgeId error:', error);
      return [];
    }
  }

  /**
   * ナレッジのタグを更新
   * 
   * @description 指定されたナレッジのタグを全て更新（既存削除→新規追加）
   * @param knowledgeId ナレッジID
   * @param tagNames タグ名配列
   * @param user 実行ユーザー
   * @returns 更新成功フラグ
   */
  async updateKnowledgeTags(
    knowledgeId: bigint,
    tagNames: string[],
    user: AuthenticatedUser
  ): Promise<boolean> {
    try {
      const now = new Date();
      const userId = user.userId;

      // 既存の紐づけを削除
      await prisma.knowledgeTag.updateMany({
        where: {
          knowledgeId: knowledgeId,
          deleteFlag: 0
        },
        data: {
          deleteFlag: 1,
          updateUser: userId,
          updateDatetime: now
        }
      });

      // 新しいタグの処理
      for (const tagName of tagNames) {
        if (!tagName.trim()) continue;

        // タグ取得または作成
        let tag = await prisma.tag.findFirst({
          where: {
            tagName: tagName.trim(),
            deleteFlag: 0
          }
        });

        if (!tag) {
          // タグが存在しない場合は作成
          tag = await prisma.tag.create({
            data: {
              tagName: tagName.trim(),
              insertUser: userId,
              insertDatetime: now,
              updateUser: userId,
              updateDatetime: now,
              deleteFlag: 0
            }
          });
        }

        // ナレッジとタグの紐づけ作成
        await prisma.knowledgeTag.create({
          data: {
            knowledgeId: knowledgeId,
            tagId: Number(tag.tagId),
            insertUser: userId,
            insertDatetime: now,
            updateUser: userId,
            updateDatetime: now,
            deleteFlag: 0
          }
        });
      }

      return true;
    } catch (error) {
      console.error('TagService.updateKnowledgeTags error:', error);
      return false;
    }
  }

  /**
   * キーワードサニタイズ
   * 
   * @description SQL Injection等の防止
   * @param keyword 入力キーワード
   * @returns サニタイズ済みキーワード
   */
  private sanitizeKeyword(keyword: string): string {
    if (!keyword) return '';
    
    // 基本的なサニタイズ
    return keyword
      .replace(/[%_]/g, '\\$&') // LIKE演算子のエスケープ
      .replace(/[<>]/g, '') // HTMLタグ除去
      .replace(/['";]/g, '') // SQLインジェクション対策
      .trim()
      .substring(0, 100); // 長さ制限
  }

  /**
   * オフセット検証
   * 
   * @description ページネーションパラメータの検証
   * @param offset オフセット値
   * @returns 検証済みオフセット
   */
  validateOffset(offset: any): number {
    const parsed = parseInt(offset);
    if (isNaN(parsed) || parsed < 0) {
      return 0;
    }
    return Math.min(parsed, 10000); // 上限設定
  }
}