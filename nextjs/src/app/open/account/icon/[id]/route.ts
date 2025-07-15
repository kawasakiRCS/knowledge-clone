import { NextRequest, NextResponse } from 'next/server';
import { AccountService } from '@/lib/services/accountService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);

    // ユーザーIDバリデーション
    if (isNaN(userId) && userId !== -1) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const accountService = new AccountService();
    const iconData = await accountService.getUserIcon(userId);
    
    if (!iconData) {
      // デフォルトアイコンを返す
      const defaultIcon = await accountService.getDefaultIcon();
      return new NextResponse(defaultIcon.data, {
        headers: {
          'Content-Type': defaultIcon.contentType,
          'Content-Length': defaultIcon.size.toString(),
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }

    return new NextResponse(iconData.data, {
      headers: {
        'Content-Type': iconData.contentType,
        'Content-Length': iconData.size.toString(),
        'Content-Disposition': `inline; filename="${iconData.fileName}"`,
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Icon fetch error:', error);
    // エラー時はデフォルトアイコンを返す
    const accountService = new AccountService();
    const defaultIcon = await accountService.getDefaultIcon();
    return new NextResponse(defaultIcon.data, {
      headers: {
        'Content-Type': defaultIcon.contentType,
        'Content-Length': defaultIcon.size.toString(),
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }
}