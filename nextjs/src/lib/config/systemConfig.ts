/**
 * システム設定管理
 * 
 * @description 旧システムのSystemConfigLogicに対応
 */

/**
 * システム公開タイプ
 */
export enum SystemExposeType {
  OPEN = 'OPEN',   // 公開モード
  CLOSE = 'CLOSE', // 閉鎖モード
}

/**
 * システム設定
 */
interface SystemConfig {
  isCloseMode: boolean;
  exposeType: SystemExposeType;
}

/**
 * グローバルシステム設定
 */
let systemConfig: SystemConfig = {
  isCloseMode: false,
  exposeType: SystemExposeType.OPEN,
};

/**
 * システムが閉鎖モードかどうかを取得
 */
export function isSystemClosed(): boolean {
  return systemConfig.isCloseMode;
}

/**
 * システムの公開タイプを取得
 */
export function getSystemExposeType(): SystemExposeType {
  return systemConfig.exposeType;
}

/**
 * 閉鎖モードを設定
 */
export function setCloseMode(isClosed: boolean): void {
  systemConfig.isCloseMode = isClosed;
  systemConfig.exposeType = isClosed ? SystemExposeType.CLOSE : SystemExposeType.OPEN;
}

/**
 * 環境変数からシステム設定を初期化
 */
export function initializeSystemConfig(): void {
  // 環境変数でシステム公開タイプを設定
  const exposeType = process.env.SYSTEM_EXPOSE_TYPE as SystemExposeType;
  
  if (exposeType === SystemExposeType.CLOSE) {
    setCloseMode(true);
  } else {
    setCloseMode(false);
  }
  
  console.log(`System initialized with expose type: ${getSystemExposeType()}`);
}