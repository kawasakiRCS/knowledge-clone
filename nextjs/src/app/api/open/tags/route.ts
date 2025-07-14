/**
 * 公開タグAPI
 * 
 * @description 旧Javaシステムのopen/TagControl.javaの完全移植
 * - GET /list: タグ一覧表示（ページネーション付き）
 * - GET /json: タグ検索JSON API
 */
import { NextRequest, NextResponse } from 'next/server';
import { TagService } from '@/lib/services/tagService';
import { getAuthenticatedUser } from '@/lib/auth/middleware';

const LIST_LIMIT = 20;

export async function GET(request: NextRequest) {
  try {
    const { searchParams, pathname } = new URL(request.url);
    const action = pathname.split('/').pop(); // 最後のパスセグメントを取得

    const tagService = new TagService();
    const currentUser = await getAuthenticatedUser(request);

    switch (action) {
      case 'list':
        return await handleTagList(request, tagService, currentUser);
        
      case 'json':
        return await handleTagJson(request, tagService, currentUser);
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Tag API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * タグ一覧処理（JSP用ページネーション）
 * 
 * @description 旧TagControl.list()の移植
 */
async function handleTagList(request: NextRequest, tagService: TagService, currentUser: any) {
  const pathname = request.nextUrl.pathname;
  const pathSegments = pathname.split('/').filter(segment => segment !== '');
  
  // パスの解析: /api/open/tags/list/[offset?]
  const listIndex = pathSegments.indexOf('list');
  let offset = 0;
  
  if (listIndex !== -1 && listIndex + 1 < pathSegments.length) {
    const offsetParam = pathSegments[listIndex + 1];
    const parsedOffset = parseInt(offsetParam);
    if (!isNaN(parsedOffset) && parsedOffset >= 0) {
      offset = parsedOffset;
    }
  }

  try {
    const tags = await tagService.getTagsWithCount(
      currentUser, 
      offset * LIST_LIMIT, 
      LIST_LIMIT
    );

    // ページネーション計算
    let previous = offset - 1;
    if (previous < 0) {
      previous = 0;
    }

    const responseData = {
      success: true,
      tags,
      pagination: {
        offset,
        previous,
        next: offset + 1,
        limit: LIST_LIMIT
      }
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Tag list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve tag list' },
      { status: 500 }
    );
  }
}

/**
 * タグ検索JSON処理
 * 
 * @description 旧TagControl.json()の移植
 */
async function handleTagJson(request: NextRequest, tagService: TagService, currentUser: any) {
  const { searchParams, pathname } = new URL(request.url);
  const keyword = searchParams.get('keyword') || '';
  
  // パスからオフセットを取得: /api/open/tags/json/[offset?]
  const pathSegments = pathname.split('/').filter(segment => segment !== '');
  const jsonIndex = pathSegments.indexOf('json');
  let offset = 0;
  
  if (jsonIndex !== -1 && jsonIndex + 1 < pathSegments.length) {
    const offsetParam = pathSegments[jsonIndex + 1];
    const parsedOffset = parseInt(offsetParam);
    if (!isNaN(parsedOffset) && parsedOffset >= 0) {
      offset = parsedOffset;
    }
  }

  // キーワード検証
  if (keyword.length > 100) {
    return NextResponse.json(
      { success: false, error: 'Keyword too long' },
      { status: 400 }
    );
  }

  try {
    const limit = 10; // JSON APIは固定10件
    const tags = await tagService.getTagsWithKeyword(
      keyword,
      offset * limit,
      limit
    );

    return NextResponse.json({
      success: true,
      tags,
      pagination: {
        offset,
        limit,
        keyword
      }
    });
  } catch (error) {
    console.error('Tag JSON search error:', error);
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}