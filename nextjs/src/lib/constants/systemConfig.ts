/**
 * システム設定定数
 * 
 * @description 旧Java SystemConfig.javaの定数移植
 */
export const SystemConfig = {
  // ユーザー追加タイプ設定キー
  USER_ADD_TYPE: 'USER_ADD_TYPE',
  
  // ユーザー追加タイプの値
  USER_ADD_TYPE_VALUE_ADMIN: '0', // 管理者のみ追加可能
  USER_ADD_TYPE_VALUE_USER: '1', // ユーザーが自分で登録可能
  USER_ADD_TYPE_VALUE_MAIL: '2', // 招待メールで登録
  USER_ADD_TYPE_VALUE_APPROVE: '3', // 管理者承認が必要
  
  // システムURL設定キー
  SYSTEM_URL: 'SYSTEM_URL',
} as const;

export type UserAddType = typeof SystemConfig.USER_ADD_TYPE_VALUE_ADMIN 
  | typeof SystemConfig.USER_ADD_TYPE_VALUE_USER 
  | typeof SystemConfig.USER_ADD_TYPE_VALUE_MAIL 
  | typeof SystemConfig.USER_ADD_TYPE_VALUE_APPROVE;