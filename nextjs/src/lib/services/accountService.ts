/**
 * アカウントサービス
 * 
 * @description 旧JavaシステムのAccountLogicと互換性のあるサービス
 */
import { prisma } from '@/lib/db/prisma';
import { User } from '@prisma/client';
import { KnowledgeService } from './knowledgeService';
import crypto from 'crypto';

export interface IconData {
  fileName: string;
  contentType: string;
  size: number;
  data: Buffer;
}

export interface AccountInfo extends User {
  knowledgeCount?: number;
  point?: bigint;
}

export interface ContributionPointHistory {
  date: string;
  point: number;
  knowledgeCount: number;
  likeCount: number;
  commentCount: number;
}

export interface ActivityHistory {
  activityId: bigint;
  activityType: string;
  datetime: Date;
  title: string;
  point: number;
}

export class AccountService {
  private knowledgeService = new KnowledgeService();

  /**
   * ユーザー情報を取得
   * 
   * @description 旧システムのselectAccountInfoOnKey相当
   * @param userId ユーザーID
   * @returns ユーザー情報またはnull
   */
  async getUserInfo(userId: number): Promise<AccountInfo | null> {
    const user = await prisma.user.findUnique({
      where: { 
        userId,
        deleteFlag: 0
      }
    });

    if (!user) {
      return null;
    }

    // パスワード情報は除外
    const { password, ...userInfo } = user;
    
    return userInfo as AccountInfo;
  }

  /**
   * ユーザーアイコンを取得
   * 
   * @description 旧システムのアイコン取得処理相当
   * @param userId ユーザーID
   * @returns アイコンデータまたはnull
   */
  async getUserIcon(userId: number): Promise<IconData | null> {
    if (userId === -1) {
      return null; // デフォルトアイコンを使用
    }

    // アカウント画像テーブルから取得（実装予定）
    // const accountImage = await prisma.accountImage.findUnique({
    //   where: { userId }
    // });

    // if (accountImage) {
    //   return {
    //     fileName: accountImage.fileName,
    //     contentType: accountImage.contentType,
    //     size: accountImage.fileSize,
    //     data: accountImage.fileBinary
    //   };
    // }

    // カスタムアイコンがない場合はidenticonを生成
    return await this.generateIdenticon(userId);
  }

  /**
   * デフォルトアイコンを取得
   * 
   * @description 旧システムのデフォルトアイコン相当
   * @returns デフォルトアイコンデータ
   */
  async getDefaultIcon(): Promise<IconData> {
    // デフォルトアイコンのデータ（実装予定）
    // 実際にはファイルシステムから読み込む
    return {
      fileName: 'icon.png',
      contentType: 'image/png',
      size: 12140,
      data: Buffer.from('') // 実際のアイコンデータ
    };
  }

  /**
   * Identiconを生成
   * 
   * @description 旧システムのIdenticonLogic相当
   * @param userId ユーザーID
   * @returns 生成されたアイコンデータ
   */
  async generateIdenticon(userId: number): Promise<IconData> {
    // 簡易的なidenticon生成（実装予定）
    const hash = crypto.createHash('md5').update(String(userId)).digest('hex');
    
    // 実際にはidenticon生成ライブラリを使用
    const iconData = Buffer.from(hash); // 仮実装
    
    return {
      fileName: `identicon_${userId}.png`,
      contentType: 'image/png',
      size: iconData.length,
      data: iconData
    };
  }

  /**
   * ユーザーのナレッジ一覧を取得
   * 
   * @description 旧システムのshowKnowledgeOnUser相当
   * @param userId ユーザーID
   * @param currentUser 現在のユーザー（認証状態）
   * @param offset オフセット
   * @param limit 取得件数
   * @returns ナレッジ一覧
   */
  async getUserKnowledges(userId: number, currentUser: any, offset: number, limit: number): Promise<any[]> {
    const where: any = {
      insertUser: userId,
      deleteFlag: 0
    };

    // アクセス権限に基づくフィルタリング
    if (!currentUser || currentUser.userId !== userId) {
      // 他のユーザーまたは未認証の場合は公開ナレッジのみ
      where.publicFlag = 1;
    }

    const knowledges = await prisma.knowledge.findMany({
      where,
      orderBy: { insertDatetime: 'desc' },
      skip: offset,
      take: limit,
      include: {
        author: {
          select: {
            userId: true,
            userName: true
          }
        }
      }
    });

    // BigInt型の変換とストック情報の追加
    return knowledges.map(k => ({
      knowledgeId: k.knowledgeId.toString(),
      title: k.title,
      content: k.content,
      publicFlag: k.publicFlag,
      typeId: k.typeId,
      insertUser: k.insertUser,
      insertDatetime: k.insertDatetime,
      updateDatetime: k.updateDatetime,
      viewCount: k.viewCount?.toString() || '0',
      point: k.point || 0,
      author: k.author
    }));
  }

  /**
   * ユーザーのポイントを取得
   * 
   * @description 旧システムのgetPoint相当
   * @param userId ユーザーID
   * @returns ポイント数
   */
  async getUserPoint(userId: number): Promise<number> {
    // アクティビティポイントの集計（実装予定）
    // 実際にはactivitiesテーブルから集計
    const activities = await prisma.$queryRaw<{ total: bigint }[]>`
      SELECT COALESCE(SUM(point), 0) as total 
      FROM activities 
      WHERE user_id = ${userId}
    `;
    
    return Number(activities[0]?.total || 0);
  }

  /**
   * ユーザーのCP履歴を取得
   * 
   * @description 旧システムのgetUserPointHistoriesByDate相当
   * @param userId ユーザーID
   * @returns CP履歴
   */
  async getUserCPHistory(userId: number): Promise<ContributionPointHistory[]> {
    // CP履歴の取得（実装予定）
    // 実際にはactivitiesテーブルから日別集計
    return [
      {
        date: new Date().toISOString().split('T')[0],
        point: 100,
        knowledgeCount: 5,
        likeCount: 10,
        commentCount: 3
      }
    ];
  }

  /**
   * ユーザーのアクティビティ履歴を取得
   * 
   * @description 旧システムのgetUserPointHistoriese相当
   * @param userId ユーザーID
   * @param limit 取得件数
   * @param offset オフセット
   * @returns アクティビティ履歴
   */
  async getUserActivity(userId: number, limit: number, offset: number): Promise<ActivityHistory[]> {
    // アクティビティ履歴の取得（実装予定）
    // 実際にはactivitiesテーブルから取得
    return [
      {
        activityId: BigInt(1),
        activityType: 'KNOWLEDGE_CREATE',
        datetime: new Date(),
        title: 'ナレッジを作成しました',
        point: 10
      }
    ];
  }

  /**
   * アイコン画像を保存
   * 
   * @description 旧システムのsaveIconImage相当
   * @param imageData 画像データ
   * @param user ユーザー情報
   * @returns 保存結果
   */
  async saveIconImage(imageData: Buffer, user: any): Promise<any> {
    // アイコン画像の保存（実装予定）
    // 実際にはaccount_imagesテーブルに保存
    return {
      fileName: 'icon.png',
      fileNo: 1,
      url: `/api/open/account/${user.userId}/icon`
    };
  }

  /**
   * メールアドレス変更リクエストを保存
   * 
   * @description 旧システムのsaveChangeEmailRequest相当
   * @param newEmail 新しいメールアドレス
   * @param user ユーザー情報
   * @returns 保存結果
   */
  async saveChangeEmailRequest(newEmail: string, user: any): Promise<any[]> {
    // メールアドレス変更リクエストの保存（実装予定）
    return [];
  }

  /**
   * メールアドレス変更を完了
   * 
   * @description 旧システムのcompleteChangeEmailRequest相当
   * @param requestId リクエストID
   * @param user ユーザー情報
   * @returns 完了結果
   */
  async completeChangeEmailRequest(requestId: string, user: any): Promise<any[]> {
    // メールアドレス変更の完了処理（実装予定）
    return [];
  }

  /**
   * ユーザー情報を更新
   * 
   * @description 旧システムのアカウント更新相当
   * @param userId ユーザーID
   * @param data 更新データ
   * @returns 更新されたユーザー情報
   */
  async updateUserInfo(userId: number, data: {
    userName?: string;
    password?: string;
    userKey?: string;
  }): Promise<any> {
    const updateData: any = {
      updateDatetime: new Date()
    };

    if (data.userName) {
      updateData.userName = data.userName;
    }

    if (data.password) {
      // パスワードのハッシュ化（実装予定）
      updateData.password = data.password;
      updateData.encrypted = false;
    }

    if (data.userKey) {
      updateData.userKey = data.userKey;
    }

    const updatedUser = await prisma.user.update({
      where: { userId },
      data: updateData,
      select: {
        userId: true,
        userName: true,
        userKey: true,
        mailAddress: true,
        insertDatetime: true,
        updateDatetime: true
      }
    });

    return updatedUser;
  }

  /**
   * ユーザーを退会処理
   * 
   * @description 旧システムのwithdrawal相当
   * @param userId ユーザーID
   * @param removeKnowledge ナレッジも削除するかどうか
   */
  async withdrawUser(userId: number, removeKnowledge: boolean): Promise<void> {
    // トランザクションで退会処理を実行
    await prisma.$transaction(async (tx) => {
      if (removeKnowledge) {
        // ナレッジも削除する場合は論理削除
        await tx.knowledge.updateMany({
          where: { insertUser: userId },
          data: {
            deleteFlag: 1,
            updateDatetime: new Date()
          }
        });
      }

      // ユーザーを論理削除
      await tx.user.update({
        where: { userId },
        data: {
          deleteFlag: 1,
          updateDatetime: new Date()
        }
      });

      // 関連データの削除（実装予定）
      // - セッション情報
      // - アカウント画像
      // - ユーザー設定
    });
  }

  /**
   * システム設定を取得
   * 
   * @description 旧システムのSystemConfig取得相当
   * @returns システム設定
   */
  async getSystemConfig(): Promise<any> {
    // システム設定の取得（実装予定）
    return {
      userAddType: 'ADMIN' // ADMIN, APPROVE, MAIL
    };
  }

  /**
   * ユーザー設定を取得
   * 
   * @description 旧システムのUserConfig取得相当
   * @param userId ユーザーID
   * @returns ユーザー設定
   */
  async getUserConfig(userId: number): Promise<any> {
    // ユーザー設定の取得（実装予定）
    // 実際にはuser_configsテーブルから取得
    return {
      defaultPublicFlag: '1',
      defaultTargets: '',
      defaultViewers: []
    };
  }

  /**
   * ユーザー設定を保存
   * 
   * @description 旧システムのUserConfig保存相当
   * @param userId ユーザーID
   * @param config 設定データ
   */
  async saveUserConfig(userId: number, config: {
    defaultPublicFlag?: string;
    defaultTargets?: string;
  }): Promise<void> {
    // ユーザー設定の保存（実装予定）
    // 実際にはuser_configsテーブルに保存
    
    if (config.defaultPublicFlag) {
      // デフォルト公開フラグを保存
    }

    if (config.defaultTargets) {
      // デフォルト公開範囲を保存
    }
  }
}