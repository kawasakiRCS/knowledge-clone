/**
 * ドメインマッピングユーティリティ
 * 
 * @description 旧システムのLDAPドメインからEntraIDドメインへの変換を行う
 */

/**
 * ドメインマッピング設定
 * 旧LDAPドメイン → EntraIDドメインの対応表
 */
const DOMAIN_MAPPING: Record<string, string> = {
  'example.local': 'hoge.onmicrosoft.com',
  'company.local': 'company.onmicrosoft.com',
  // 必要に応じて追加
};

/**
 * 旧システムのメールアドレスをEntraIDメールアドレスに変換
 * 
 * @param legacyEmail 旧システムのメールアドレス
 * @returns EntraIDメールアドレス
 * 
 * @example
 * ```typescript
 * convertLegacyToEntraId('foobar@example.local') // 'foobar@hoge.onmicrosoft.com'
 * convertLegacyToEntraId('unknown@unknown.com') // 'unknown@unknown.com' (変換なし)
 * ```
 */
export function convertLegacyToEntraId(legacyEmail: string): string {
  if (!legacyEmail || !legacyEmail.includes('@')) {
    return legacyEmail;
  }

  const [username, domain] = legacyEmail.split('@');
  const newDomain = DOMAIN_MAPPING[domain];
  
  return newDomain ? `${username}@${newDomain}` : legacyEmail;
}

/**
 * EntraIDメールアドレスから旧システムのメールアドレスに逆変換
 * 
 * @param entraIdEmail EntraIDメールアドレス
 * @returns 旧システムのメールアドレス
 * 
 * @example
 * ```typescript
 * convertEntraIdToLegacy('foobar@hoge.onmicrosoft.com') // 'foobar@example.local'
 * ```
 */
export function convertEntraIdToLegacy(entraIdEmail: string): string {
  if (!entraIdEmail || !entraIdEmail.includes('@')) {
    return entraIdEmail;
  }

  const [username, domain] = entraIdEmail.split('@');
  
  // 逆マッピングを作成
  const reverseDomainMapping = Object.entries(DOMAIN_MAPPING).reduce(
    (acc, [legacy, entraid]) => {
      acc[entraid] = legacy;
      return acc;
    },
    {} as Record<string, string>
  );

  const legacyDomain = reverseDomainMapping[domain];
  
  return legacyDomain ? `${username}@${legacyDomain}` : entraIdEmail;
}

/**
 * ドメインマッピング設定を取得
 * 
 * @returns ドメインマッピングの設定オブジェクト
 */
export function getDomainMapping(): Record<string, string> {
  return { ...DOMAIN_MAPPING };
}

/**
 * 指定されたドメインがマッピング対象かどうかを判定
 * 
 * @param domain ドメイン名
 * @returns マッピング対象の場合true
 */
export function isMappedDomain(domain: string): boolean {
  return domain in DOMAIN_MAPPING;
}

/**
 * ユーザーキー（ログインID）をメールアドレス形式に変換
 * 
 * @param userKey ユーザーキー
 * @param defaultDomain デフォルトドメイン
 * @returns メールアドレス形式の文字列
 * 
 * @example
 * ```typescript
 * convertUserKeyToEmail('foobar', 'example.local') // 'foobar@example.local'
 * convertUserKeyToEmail('foobar@example.com', 'example.local') // 'foobar@example.com'
 * ```
 */
export function convertUserKeyToEmail(userKey: string, defaultDomain: string = 'example.local'): string {
  if (!userKey) {
    return userKey;
  }

  // 既にメールアドレス形式の場合はそのまま返す
  if (userKey.includes('@')) {
    return userKey;
  }

  // ドメインを追加してメールアドレス形式にする
  return `${userKey}@${defaultDomain}`;
}