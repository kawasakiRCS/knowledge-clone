/**
 * ナレッジ一覧API
 * 
 * @description 旧システムのapi/knowledge/list.apiに対応
 * Pages RouterからApp Routerに移行 - 実DBデータ取得版
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth/middleware';

/**
 * ナレッジ一覧取得API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // ユーザー認証情報取得
    const authenticatedUser = await getAuthenticatedUser(request);
    
    // パラメータ取得
    const keyword = searchParams.get('keyword') || '';
    const tag = searchParams.get('tag') || '';
    const group = searchParams.get('group') || '';
    const user = searchParams.get('user') || '';
    const tagNames = searchParams.get('tagNames') || '';
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');
    const templates = searchParams.getAll('template');

    // ナレッジデータをDBから取得
    let whereConditions: any = {
      deleteFlag: 0,
    };

    // アクセス権限に基づくフィルタリング
    let accessFilter: any;
    if (authenticatedUser) {
      // ログイン済み：公開記事 OR 自分が作成した記事
      accessFilter = {
        OR: [
          { publicFlag: 1 }, // 公開記事
          { insertUser: authenticatedUser.userId }, // 自分が作成した記事
        ]
      };
    } else {
      // 未ログイン：公開記事のみ
      accessFilter = { publicFlag: 1 };
    }

    // キーワード検索
    if (keyword) {
      whereConditions.AND = [
        accessFilter,
        {
          OR: [
            { title: { contains: keyword, mode: 'insensitive' } },
            { content: { contains: keyword, mode: 'insensitive' } },
          ]
        }
      ];
    } else {
      Object.assign(whereConditions, accessFilter);
    }

    // タグ名検索
    if (tagNames) {
      whereConditions.tagNames = { contains: tagNames };
    }

    // テンプレート種別フィルタ
    if (templates.length > 0) {
      whereConditions.typeId = { in: templates.map(t => parseInt(t)) };
    }

    // ナレッジ取得（ユーザー情報付き）
    const knowledges = await prisma.knowledge.findMany({
      where: whereConditions,
      include: {
        author: true,
      },
      orderBy: {
        updateDatetime: 'desc',
      },
      skip: offset,
      take: limit,
    });

    // 総件数取得
    const total = await prisma.knowledge.count({
      where: whereConditions,
    });

    // ナレッジデータの変換
    const transformedKnowledges = knowledges.map(k => ({
      knowledgeId: Number(k.knowledgeId),
      title: k.title,
      content: k.content || '',
      insertUser: k.insertUser || 0,
      insertUserName: k.author?.userName || '不明',
      insertDatetime: k.insertDatetime?.toISOString() || '',
      updateUser: k.updateUser || 0,
      updateUserName: k.author?.userName || '不明',
      updateDatetime: k.updateDatetime?.toISOString() || '',
      publicFlag: k.publicFlag || 1,
      likeCount: Number(k.likeCount || 0),
      commentCount: k.commentCount || 0,
      point: k.point || 0,
      typeId: k.typeId || -100,
      tagNames: k.tagNames || '',
      tagIds: k.tagIds || '',
      pin: false, // 将来的に実装
    }));

    // タグ情報を取得
    const tags = await prisma.$queryRaw`
      SELECT t.tag_id, t.tag_name, COUNT(kt.knowledge_id) as knowledge_count
      FROM tags t
      LEFT JOIN knowledge_tags kt ON t.tag_id = kt.tag_id AND kt.delete_flag = 0
      WHERE t.delete_flag = 0
      GROUP BY t.tag_id, t.tag_name
      ORDER BY knowledge_count DESC
      LIMIT 20
    ` as any[];

    const transformedTags = tags.map(t => ({
      tagId: t.tag_id,
      tagName: t.tag_name,
      knowledgeCount: Number(t.knowledge_count),
    }));

    // グループ情報を取得
    const groups = await prisma.$queryRaw`
      SELECT g.group_id, g.group_name, COUNT(kg.knowledge_id) as knowledge_count
      FROM groups g
      LEFT JOIN knowledge_groups kg ON g.group_id = kg.group_id AND kg.delete_flag = 0
      WHERE g.delete_flag = 0
      GROUP BY g.group_id, g.group_name
      ORDER BY knowledge_count DESC
      LIMIT 10
    ` as any[];

    const transformedGroups = groups.map(g => ({
      groupId: g.group_id,
      groupName: g.group_name,
      groupKnowledgeCount: Number(g.knowledge_count),
    }));

    // テンプレート情報を取得
    const templateMasters = await prisma.templateMaster.findMany({
      where: { deleteFlag: 0 },
      orderBy: { typeId: 'asc' },
    });

    const transformedTemplates: Record<number, any> = {};
    templateMasters.forEach(t => {
      transformedTemplates[t.typeId] = {
        typeId: t.typeId,
        typeName: t.typeName,
        typeIcon: t.typeIcon || 'fa-file-text-o',
      };
    });

    // レスポンス
    const response = {
      knowledges: transformedKnowledges,
      total,
      offset,
      limit,
      tags: transformedTags,
      groups: transformedGroups,
      templates: transformedTemplates,
      selectedTemplates: [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Knowledge list API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}