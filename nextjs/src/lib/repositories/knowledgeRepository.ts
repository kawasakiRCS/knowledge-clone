/**
 * ナレッジリポジトリ
 * 
 * @description 旧JavaシステムのKnowledgesDao.javaと互換性のあるリポジトリ
 */
import { prisma } from '@/lib/db/prisma';
import { Knowledge, User } from '@prisma/client';

export interface SearchKnowledgeParams {
  keyword?: string;
  limit: number;
  offset: number;
}

export interface KnowledgeWithAuthor extends Knowledge {
  author?: User | null;
}

export class KnowledgeRepository {
  /**
   * IDでナレッジを取得
   * 
   * @description 旧システムのselectOnKey相当
   * @param id ナレッジID
   * @returns ナレッジ情報またはnull
   */
  async findById(id: bigint): Promise<Knowledge | null> {
    return await prisma.knowledge.findUnique({
      where: { 
        knowledgeId: id,
        deleteFlag: 0 // 削除されていないもののみ
      }
    });
  }

  /**
   * IDでナレッジをユーザー情報と共に取得
   * 
   * @description 旧システムのselectOnKeyWithUserName相当
   * @param id ナレッジID
   * @returns ナレッジ情報（ユーザー情報含む）またはnull
   */
  async findByIdWithUserInfo(id: bigint): Promise<KnowledgeWithAuthor | null> {
    return await prisma.knowledge.findUnique({
      where: { 
        knowledgeId: id,
        deleteFlag: 0 // 削除されていないもののみ
      },
      include: {
        author: {
          select: {
            userId: true,
            userName: true,
            userKey: true
          }
        }
      }
    });
  }

  /**
   * 公開ナレッジの検索
   * 
   * @description 旧システムのselectKnowledge相当（権限なし）
   * @param params 検索パラメータ
   * @returns ナレッジ一覧
   */
  async searchPublicKnowledges(params: SearchKnowledgeParams): Promise<Knowledge[]> {
    const where: any = {
      deleteFlag: 0,
      publicFlag: 1 // 公開のみ
    };

    if (params.keyword) {
      where.OR = [
        { title: { contains: params.keyword, mode: 'insensitive' } },
        { content: { contains: params.keyword, mode: 'insensitive' } }
      ];
    }

    return await prisma.knowledge.findMany({
      where,
      orderBy: { insertDatetime: 'desc' },
      take: params.limit,
      skip: params.offset
    });
  }

  /**
   * ナレッジの閲覧数を更新
   * 
   * @description 旧システムのupdateViewCount相当
   * @param knowledgeId ナレッジID
   * @param count 新しい閲覧数
   */
  async updateViewCount(knowledgeId: bigint, count: bigint): Promise<void> {
    await prisma.knowledge.update({
      where: { knowledgeId },
      data: { viewCount: count }
    });
  }

  /**
   * ナレッジのポイントを取得
   * 
   * @description 旧システムのselectPoint相当
   * @param knowledgeId ナレッジID
   * @returns ポイント値
   */
  async getPoint(knowledgeId: bigint): Promise<number> {
    const knowledge = await prisma.knowledge.findUnique({
      where: { knowledgeId },
      select: { point: true }
    });
    return knowledge?.point || 0;
  }

  /**
   * ナレッジのポイントを更新
   * 
   * @description 旧システムのupdatePoint相当
   * @param knowledgeId ナレッジID
   * @param point 新しいポイント値
   */
  async updatePoint(knowledgeId: bigint, point: number): Promise<void> {
    await prisma.knowledge.update({
      where: { knowledgeId },
      data: { point }
    });
  }
}