/**
 * 旧システム互換ファイルダウンロードAPI
 * 
 * @description 旧Javaシステムの /knowledge/open.file/download 完全互換
 * - URL: /knowledge/open.file/download?fileNo=XXX
 * - 処理: 既存のFileServiceを使用してファイルダウンロード
 */
import { NextRequest, NextResponse } from 'next/server';
import { FileService } from '@/lib/services/fileService';
import { getAuthenticatedUser } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileNo = searchParams.get('fileNo');
    const attachment = searchParams.get('attachment') || '';

    if (!fileNo || isNaN(parseInt(fileNo))) {
      return NextResponse.json(
        { success: false, error: 'Invalid file number' },
        { status: 400 }
      );
    }

    const fileService = new FileService();
    const currentUser = await getAuthenticatedUser(request);

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

    // コンテンツタイプの決定（旧システム完全互換）
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
    console.error('Legacy file download error:', error);
    return NextResponse.json(
      { success: false, error: 'Download failed' },
      { status: 500 }
    );
  }
}