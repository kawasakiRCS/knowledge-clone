/**
 * 保護ファイルAPI
 * 
 * @description 旧Javaシステムのprotect/FileControl.javaの完全移植
 * - POST /upload: マルチパートファイルアップロード
 * - POST /imgupload: Base64画像アップロード（クリップボード対応）
 * - DELETE /{fileNo}: ファイル削除
 */
import { NextRequest, NextResponse } from 'next/server';
import { FileService } from '@/lib/services/fileService';
import { getAuthenticatedUser } from '@/lib/auth/middleware';

const DEFAULT_MAX_SIZE_MB = 10;

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { pathname } = new URL(request.url);
    const action = pathname.split('/').pop();

    const fileService = new FileService();

    switch (action) {
      case 'upload':
        return await handleFileUpload(request, fileService, currentUser);
        
      case 'imgupload':
        return await handleImageUpload(request, fileService, currentUser);
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Protected file API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return await handleFileDelete(request, currentUser);
  } catch (error) {
    console.error('File delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * マルチパートファイルアップロード処理
 * 
 * @description 旧FileControl.upload()の移植
 */
async function handleFileUpload(request: NextRequest, fileService: FileService, currentUser: any) {
  try {
    const formData = await request.formData();
    const uploadedFiles = [];
    const maxSizeMB = await getMaxUploadSize();

    // files[]パラメータからファイルを取得
    const files = formData.getAll('files[]') as File[];
    
    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (file.size === 0) {
        continue; // 空ファイルをスキップ
      }

      // ファイルサイズチェック
      if (file.size > maxSizeMB * 1024 * 1024) {
        return NextResponse.json(
          { 
            success: false, 
            error: `File size exceeds ${maxSizeMB}MB limit`,
            fileName: file.name
          },
          { status: 400 }
        );
      }

      // ファイルバイナリの取得
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // ファイル保存
      const savedFile = await fileService.createFile(
        file.name,
        buffer,
        null, // 下書き状態（knowledgeId = null）
        currentUser.userId
      );

      if (savedFile) {
        uploadedFiles.push({
          fileNo: savedFile.fileNo,
          fileName: savedFile.fileName,
          fileSize: savedFile.fileSize,
          url: `/api/open/files/download?fileNo=${savedFile.fileNo}`
        });
      }
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}

/**
 * Base64画像アップロード処理
 * 
 * @description 旧FileControl.imgupload()の移植
 * クリップボードから画像を直接アップロード可能
 */
async function handleImageUpload(request: NextRequest, fileService: FileService, currentUser: any) {
  try {
    const body = await request.json();
    const fileimg = body.fileimg;
    const maxSizeMB = await getMaxUploadSize();

    if (!fileimg || typeof fileimg !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Image data required' },
        { status: 400 }
      );
    }

    // Base64データの検証と分析
    if (!fileimg.startsWith('data:image/png;base64,')) {
      return NextResponse.json(
        { success: false, error: 'Only PNG format supported' },
        { status: 400 }
      );
    }

    // Base64デコード
    const base64Data = fileimg.substring('data:image/png;base64,'.length);
    let imageBuffer: Buffer;
    
    try {
      imageBuffer = Buffer.from(base64Data, 'base64');
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid base64 data' },
        { status: 400 }
      );
    }

    // サイズチェック
    if (imageBuffer.length > maxSizeMB * 1024 * 1024) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Image size exceeds ${maxSizeMB}MB limit` 
        },
        { status: 400 }
      );
    }

    // ファイル名生成（タイムスタンプ付き）
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `clipboard-image-${timestamp}.png`;

    // ファイル保存
    const savedFile = await fileService.createFile(
      fileName,
      imageBuffer,
      null, // 下書き状態
      currentUser.userId
    );

    if (!savedFile) {
      return NextResponse.json(
        { success: false, error: 'Failed to save image' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      files: [{
        fileNo: savedFile.fileNo,
        fileName: savedFile.fileName,
        fileSize: savedFile.fileSize,
        url: `/api/open/files/download?fileNo=${savedFile.fileNo}`
      }]
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Image upload failed' },
      { status: 500 }
    );
  }
}

/**
 * ファイル削除処理
 * 
 * @description 旧FileControl.delete()の移植
 */
async function handleFileDelete(request: NextRequest, currentUser: any) {
  try {
    const { pathname } = new URL(request.url);
    const pathSegments = pathname.split('/').filter(segment => segment !== '');
    
    // パスからfileNoを取得: /api/protect/files/{fileNo}
    const fileIndex = pathSegments.indexOf('files');
    if (fileIndex === -1 || fileIndex + 1 >= pathSegments.length) {
      return NextResponse.json(
        { success: false, error: 'File ID required' },
        { status: 400 }
      );
    }

    const fileNoStr = pathSegments[fileIndex + 1];
    const fileNo = parseInt(fileNoStr);

    if (isNaN(fileNo)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file ID' },
        { status: 400 }
      );
    }

    const fileService = new FileService();
    const success = await fileService.deleteFile(fileNo, currentUser.userId);

    if (success) {
      return NextResponse.json({
        success: true,
        message: `File ${fileNo} deleted successfully`
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to delete file or permission denied' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('File deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Delete failed' },
      { status: 500 }
    );
  }
}

/**
 * 最大アップロードサイズ取得
 * 
 * @description システム設定から最大アップロードサイズを取得
 * 旧SystemConfigsDao.selectOnKey(UPLOAD_MAX_MB_SIZE)の移植
 */
async function getMaxUploadSize(): Promise<number> {
  try {
    // TODO: システム設定テーブルから取得する実装を追加
    // const config = await prisma.systemConfigsEntity.findFirst({
    //   where: {
    //     configName: 'UPLOAD_MAX_MB_SIZE',
    //     systemName: 'knowledge'
    //   }
    // });
    // 
    // if (config && config.configValue && !isNaN(parseInt(config.configValue))) {
    //   return parseInt(config.configValue);
    // }
    
    return DEFAULT_MAX_SIZE_MB;
  } catch (error) {
    console.error('Failed to get max upload size:', error);
    return DEFAULT_MAX_SIZE_MB;
  }
}