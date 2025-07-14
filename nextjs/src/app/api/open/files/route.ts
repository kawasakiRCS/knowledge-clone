/**
 * 公開ファイルAPI
 * 
 * @description 旧Javaシステムのopen/FileControl.javaの完全移植
 * - GET /download: ファイルダウンロード・画像表示
 * - GET /slide: スライド情報・画像取得
 */
import { NextRequest, NextResponse } from 'next/server';
import { FileService } from '@/lib/services/fileService';
import { getAuthenticatedUser } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    const { searchParams, pathname } = new URL(request.url);
    const action = pathname.split('/').pop(); // 最後のパスセグメントを取得

    const fileService = new FileService();
    const currentUser = await getAuthenticatedUser(request);

    switch (action) {
      case 'download':
        return await handleFileDownload(request, fileService, currentUser);
        
      case 'slide':
        return await handleSlideRequest(request, fileService, currentUser);
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('File API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * ファイルダウンロード処理
 */
async function handleFileDownload(request: NextRequest, fileService: FileService, currentUser: any) {
  const { searchParams } = new URL(request.url);
  const fileNo = searchParams.get('fileNo');
  const attachment = searchParams.get('attachment') || '';

  if (!fileNo || isNaN(parseInt(fileNo))) {
    return NextResponse.json(
      { success: false, error: 'Invalid file number' },
      { status: 400 }
    );
  }

  try {
    const fileEntity = await fileService.getFile(parseInt(fileNo), currentUser);
    
    if (!fileEntity) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    if (!fileEntity.fileBinary) {
      console.error(`File binary is null. [fileNo] ${fileNo}`);
      return NextResponse.json(
        { success: false, error: 'File data not found' },
        { status: 404 }
      );
    }

    // コンテンツタイプの決定
    let contentType = 'application/octet-stream';
    let disposition = 'attachment';

    // 画像ファイルの場合、attachmentパラメータが空なら inline表示
    if (attachment === '') {
      const fileName = fileEntity.fileName.toLowerCase();
      if (fileName.endsWith('.png')) {
        contentType = 'image/png';
        disposition = 'inline';
      } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        contentType = 'image/jpeg';
        disposition = 'inline';
      } else if (fileName.endsWith('.gif')) {
        contentType = 'image/gif';
        disposition = 'inline';
      }
    }

    // レスポンスヘッダーの設定
    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Length': fileEntity.fileSize.toString(),
      'Content-Disposition': `${disposition}; filename="${encodeURIComponent(fileEntity.fileName)}"`,
      'Cache-Control': 'private, max-age=3600'
    });

    return new NextResponse(fileEntity.fileBinary, { headers });
  } catch (error) {
    console.error('File download error:', error);
    return NextResponse.json(
      { success: false, error: 'Download failed' },
      { status: 500 }
    );
  }
}

/**
 * スライドリクエスト処理
 */
async function handleSlideRequest(request: NextRequest, fileService: FileService, currentUser: any) {
  const pathname = request.nextUrl.pathname;
  const pathSegments = pathname.split('/').filter(segment => segment !== '');
  
  // パスの解析: /api/open/files/slide/[fileNo]/[slideImage?]
  const slideIndex = pathSegments.indexOf('slide');
  if (slideIndex === -1 || slideIndex + 1 >= pathSegments.length) {
    return NextResponse.json(
      { success: false, error: 'Invalid slide path' },
      { status: 400 }
    );
  }

  const fileNo = pathSegments[slideIndex + 1];
  const slideImage = pathSegments[slideIndex + 2] || null;

  if (!fileNo || isNaN(parseInt(fileNo))) {
    return NextResponse.json(
      { success: false, error: 'Invalid file number' },
      { status: 400 }
    );
  }

  try {
    if (!slideImage) {
      // スライド情報を取得
      const slideInfo = await fileService.getSlideInfo(fileNo, currentUser);
      
      if (!slideInfo) {
        return NextResponse.json(
          { success: false, error: 'Slide not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        slideInfo
      });
    } else {
      // スライド画像を取得
      const slideImageData = await fileService.getSlideImage(fileNo, slideImage, currentUser);
      
      if (!slideImageData) {
        return NextResponse.json(
          { success: false, error: 'Slide image not found' },
          { status: 404 }
        );
      }

      const headers = new Headers({
        'Content-Type': slideImageData.contentType,
        'Content-Length': slideImageData.size.toString(),
        'Cache-Control': 'public, max-age=3600'
      });

      return new NextResponse(slideImageData.data, { headers });
    }
  } catch (error) {
    console.error('Slide request error:', error);
    return NextResponse.json(
      { success: false, error: 'Slide request failed' },
      { status: 500 }
    );
  }
}