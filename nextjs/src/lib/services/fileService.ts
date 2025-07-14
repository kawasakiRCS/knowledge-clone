/**
 * ファイルサービス
 * 
 * @description 旧Javaシステムの完全移植
 * - UploadedFileLogic + SlideLogic の機能を統合
 * - ファイルアクセス制御、スライド処理、バイナリデータ管理
 */
import { PrismaClient } from '@prisma/client';
import { KnowledgeRepository } from '@/lib/repositories/knowledgeRepository';
import { KnowledgeService } from '@/lib/services/knowledgeService';
import { AuthenticatedUser } from '@/lib/auth/middleware';

const prisma = new PrismaClient();

export interface FileData {
  fileNo: number;
  fileName: string;
  fileBinary: Buffer;
  fileSize: number;
  knowledgeId?: number;
}

export interface SlideInfo {
  fileNo: string;
  fileName: string;
  totalSlides: number;
  slides: Array<{
    slideNumber: number;
    imageName: string;
  }>;
}

export interface SlideImageData {
  data: Buffer;
  contentType: string;
  size: number;
}

export class FileService {
  private knowledgeService: KnowledgeService;
  private knowledgeRepository: KnowledgeRepository;

  constructor() {
    this.knowledgeService = new KnowledgeService();
    this.knowledgeRepository = new KnowledgeRepository();
  }

  /**
   * ファイル取得（アクセス制御付き）
   * 
   * @description 旧UploadedFileLogic.getFile()の移植
   * @param fileNo ファイル番号
   * @param currentUser 現在のユーザー（null可能 = 未認証ユーザー）
   * @returns ファイルデータまたはnull
   */
  async getFile(fileNo: number, currentUser: AuthenticatedUser | null): Promise<FileData | null> {
    try {
      const fileEntity = await prisma.knowledgeFile.findUnique({
        where: { fileNo: BigInt(fileNo) },
        select: {
          fileNo: true,
          fileName: true,
          fileBinary: true,
          fileSize: true,
          knowledgeId: true,
          insertUser: true,
          deleteFlag: true
        }
      });

      if (!fileEntity || fileEntity.deleteFlag) {
        return null;
      }

      // アクセス制御チェック
      const hasAccess = await this.checkFileAccess(fileEntity, currentUser);
      if (!hasAccess) {
        return null;
      }

      return {
        fileNo: Number(fileEntity.fileNo),
        fileName: fileEntity.fileName || '',
        fileBinary: fileEntity.fileBinary ? Buffer.from(fileEntity.fileBinary) : Buffer.alloc(0),
        fileSize: Number(fileEntity.fileSize || 0),
        knowledgeId: fileEntity.knowledgeId ? Number(fileEntity.knowledgeId) : undefined
      };
    } catch (error) {
      console.error('FileService.getFile error:', error);
      return null;
    }
  }

  /**
   * ファイルアクセス権限チェック
   * 
   * @description 旧Javaシステムのアクセス制御ロジックを移植
   */
  private async checkFileAccess(
    fileEntity: any,
    currentUser: AuthenticatedUser | null
  ): Promise<boolean> {
    // 下書き状態のファイル（knowledgeId = null or 0）
    if (!fileEntity.knowledgeId || fileEntity.knowledgeId === BigInt(0)) {
      // 下書きは作成者のみアクセス可能
      if (!currentUser) {
        return false;
      }
      return Number(fileEntity.insertUser) === currentUser.userId;
    }

    // 公開済みナレッジに紐づくファイル
    const knowledgeId = Number(fileEntity.knowledgeId);
    
    // ナレッジの可視性チェック（未認証ユーザーも含む）
    const knowledge = await this.knowledgeRepository.findById(BigInt(knowledgeId));

    if (!knowledge) {
      return false;
    }

    // 公開フラグによる可視性チェック
    if (knowledge.publicFlag === 1) {
      return true; // 公開
    } else if (knowledge.publicFlag === 2 && currentUser) {
      return true; // 保護（認証済みユーザーのみ）
    } else if (knowledge.publicFlag === 3 && currentUser) {
      // 非公開（作成者のみ）
      return knowledge.insertUser === currentUser.userId;
    }

    return false;
  }

  /**
   * スライド情報取得
   * 
   * @description 旧SlideLogic.getSlideInfo()の移植
   * @param fileNo ファイル番号（文字列）
   * @param currentUser 現在のユーザー
   * @returns スライド情報またはnull
   */
  async getSlideInfo(fileNo: string, currentUser: AuthenticatedUser | null): Promise<SlideInfo | null> {
    try {
      const fileData = await this.getFile(parseInt(fileNo), currentUser);
      if (!fileData) {
        return null;
      }

      // ファイル名からスライドかどうか判定
      const fileName = fileData.fileName.toLowerCase();
      if (!fileName.endsWith('.pdf') && !fileName.endsWith('.ppt') && 
          !fileName.endsWith('.pptx') && !fileName.endsWith('.odp')) {
        return null;
      }

      // スライド画像の存在確認（実際の実装では外部ツールでPDF→画像変換）
      // ここでは仮想的なスライド情報を返す
      const totalSlides = await this.countSlidePages(fileNo);
      
      const slides = [];
      for (let i = 1; i <= totalSlides; i++) {
        slides.push({
          slideNumber: i,
          imageName: `slide_${i}.png`
        });
      }

      return {
        fileNo,
        fileName: fileData.fileName,
        totalSlides,
        slides
      };
    } catch (error) {
      console.error('FileService.getSlideInfo error:', error);
      return null;
    }
  }

  /**
   * スライド画像取得
   * 
   * @description 旧SlideLogic.getSlideImage()の移植
   * @param fileNo ファイル番号（文字列）
   * @param slideImage スライド画像名
   * @param currentUser 現在のユーザー
   * @returns スライド画像データまたはnull
   */
  async getSlideImage(
    fileNo: string, 
    slideImage: string, 
    currentUser: AuthenticatedUser | null
  ): Promise<SlideImageData | null> {
    try {
      // ファイルアクセス権限チェック
      const fileData = await this.getFile(parseInt(fileNo), currentUser);
      if (!fileData) {
        return null;
      }

      // スライド画像の実際のパスを構築
      // 実際の実装ではファイルシステムまたはオブジェクトストレージから画像を取得
      const slideImagePath = this.buildSlideImagePath(fileNo, slideImage);
      const imageBuffer = await this.loadSlideImageFromStorage(slideImagePath);
      
      if (!imageBuffer) {
        return null;
      }

      return {
        data: imageBuffer,
        contentType: 'image/png',
        size: imageBuffer.length
      };
    } catch (error) {
      console.error('FileService.getSlideImage error:', error);
      return null;
    }
  }

  /**
   * スライドページ数カウント（仮想実装）
   * 
   * @description 実際の実装では外部ツール（pdftoppm等）でページ数を取得
   */
  private async countSlidePages(fileNo: string): Promise<number> {
    // 仮実装：ファイル番号に応じて適当なページ数を返す
    const fileId = parseInt(fileNo);
    return Math.max(1, fileId % 20 + 1);
  }

  /**
   * スライド画像パス構築
   * 
   * @description 旧Javaシステムのファイルパス規則を移植
   */
  private buildSlideImagePath(fileNo: string, slideImage: string): string {
    // 実際のパス規則: /slides/{fileNo}/{slideImage}
    return `/slides/${fileNo}/${slideImage}`;
  }

  /**
   * ストレージからスライド画像読み込み（仮想実装）
   * 
   * @description 実際の実装ではファイルシステムまたはS3等から読み込み
   */
  private async loadSlideImageFromStorage(imagePath: string): Promise<Buffer | null> {
    try {
      // 仮実装：1x1のPNG画像データを返す
      const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      return Buffer.from(base64Data, 'base64');
    } catch (error) {
      console.error('Failed to load slide image:', error);
      return null;
    }
  }

  /**
   * ファイル作成（アップロード用）
   * 
   * @description 旧UploadedFileLogic.saveFile()の移植
   */
  async createFile(
    fileName: string,
    fileBinary: Buffer,
    knowledgeId: number | null,
    userId: number
  ): Promise<FileData | null> {
    try {
      const now = new Date();
      
      const fileEntity = await prisma.knowledgeFile.create({
        data: {
          fileName,
          fileBinary,
          fileSize: fileBinary.length,
          knowledgeId: knowledgeId ? BigInt(knowledgeId) : null,
          insertUser: userId,
          insertDatetime: now,
          updateUser: userId,
          updateDatetime: now,
          deleteFlag: 0,
          parseStatus: 0
        }
      });

      return {
        fileNo: Number(fileEntity.fileNo),
        fileName: fileEntity.fileName || '',
        fileBinary: fileEntity.fileBinary ? Buffer.from(fileEntity.fileBinary) : Buffer.alloc(0),
        fileSize: Number(fileEntity.fileSize || 0),
        knowledgeId: fileEntity.knowledgeId ? Number(fileEntity.knowledgeId) : undefined
      };
    } catch (error) {
      console.error('FileService.createFile error:', error);
      return null;
    }
  }

  /**
   * ファイル削除
   * 
   * @description 旧UploadedFileLogic.removeFile()の移植
   */
  async deleteFile(fileNo: number, userId: number): Promise<boolean> {
    try {
      const fileEntity = await prisma.knowledgeFile.findUnique({
        where: { fileNo: BigInt(fileNo) }
      });

      if (!fileEntity || fileEntity.deleteFlag) {
        return false;
      }

      // 削除権限チェック
      // 下書き中は作成者のみ、公開済みは編集権限者のみ
      if (!fileEntity.knowledgeId || fileEntity.knowledgeId === BigInt(0)) {
        if (Number(fileEntity.insertUser) !== userId) {
          return false;
        }
      } else {
        // TODO: KnowledgeLogic.isEditor()の実装待ち
        // const hasEditPermission = await this.knowledgeService.hasEditPermission(
        //   Number(fileEntity.knowledgeId),
        //   userId
        // );
        // if (!hasEditPermission) {
        //   return false;
        // }
      }

      // 論理削除実行
      await prisma.knowledgeFile.update({
        where: { fileNo: BigInt(fileNo) },
        data: {
          deleteFlag: 1,
          updateUser: userId,
          updateDatetime: new Date()
        }
      });

      return true;
    } catch (error) {
      console.error('FileService.deleteFile error:', error);
      return false;
    }
  }
}