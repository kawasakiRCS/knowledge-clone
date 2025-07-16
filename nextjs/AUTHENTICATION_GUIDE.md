# 🔐 認証・認可実装ガイド

## 📋 概要

Next.jsアプリケーションでのページとAPIの認証・認可実装について説明します。

## 🛡️ 認証システム構成

### 1. **Middleware による保護**
`/middleware.ts` で全リクエストをインターセプトし、認証チェックを実行。

### 2. **NextAuth.js による認証**
- **Azure AD (EntraID)** 認証
- **Credentials** 認証（LDAP + DB）
- **JWT** ベースセッション管理

### 3. **サーバーサイド認証ヘルパー**
`/src/lib/auth/serverAuth.ts` でAPI認証を簡単に実装。

## 🗺️ ページ・API分類

### **公開ページ（認証不要）**
```
/                     # トップページ
/open/*               # 公開ページ群
/signin               # サインインページ
/authorizer_error     # 認証エラーページ
/api/auth/*           # NextAuth API
/api/open/*           # 公開API
/api/password/*       # パスワードリセット
/api/signup/*         # サインアップ
```

### **保護ページ（認証必要）**
```
/protect/*            # 保護ページ群（将来実装）
/knowledge/edit/*     # ナレッジ編集（将来実装）
/knowledge/add/*      # ナレッジ追加（将来実装）
/api/protect/*        # 保護API
/api/knowledge/*      # ナレッジ操作API（一部除く）
```

### **管理者専用**
```
/admin/*              # 管理画面（将来実装）
/api/admin/*          # 管理API（将来実装）
```

### **読み取り専用API（個別チェック）**
```
/api/knowledge/list           # ナレッジ一覧
/api/knowledge/[id]           # ナレッジ詳細
/api/knowledge/histories/*    # 履歴表示
/api/knowledge/show-history/* # 履歴詳細
```

## 🔧 実装方法

### **ページ保護**

**Middleware が自動的に処理**
- 未認証の場合 → `/signin?page=元のURL` にリダイレクト
- 管理者権限不足 → `/authorizer_error` にリダイレクト

### **API保護**

#### **基本的な認証**
```typescript
import { withAuth } from '@/lib/auth/serverAuth';

export const GET = withAuth(async (request, user) => {
  // user は認証済みユーザー情報
  return Response.json({ user });
});
```

#### **管理者権限必要**
```typescript
import { withAdminAuth } from '@/lib/auth/serverAuth';

export const POST = withAdminAuth(async (request, user) => {
  // user は管理者ユーザー
  return Response.json({ message: 'Admin only' });
});
```

#### **個別権限チェック**
```typescript
import { withAuth, requireOwnerOrAdmin } from '@/lib/auth/serverAuth';

export const DELETE = withAuth(async (request, user) => {
  const { knowledgeId } = await request.json();
  
  // 作成者か管理者のみ削除可能
  const knowledge = await getKnowledge(knowledgeId);
  requireOwnerOrAdmin(user, knowledge.insertUser);
  
  // 削除処理
});
```

### **クライアントサイド認証チェック**

```typescript
import { useSession } from 'next-auth/react';

function ProtectedComponent() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') return <div>Access Denied</div>;
  
  return <div>Hello {session?.user?.name}</div>;
}
```

## 🎯 認証フロー

### **1. ページアクセス**
```
ユーザー → Middleware → 認証チェック → ページ表示 or リダイレクト
```

### **2. API呼び出し**
```
クライアント → Middleware → withAuth → API処理 → レスポンス
```

### **3. エラーハンドリング**
```
認証エラー → 401 (API) or /signin (ページ)
権限エラー → 403 (API) or /authorizer_error (ページ)
```

## 🔍 エラーレスポンス

### **API**
```json
{
  "success": false,
  "error": "認証が必要です"
}
```

### **ページ**
- **401**: `/signin?page=元のURL`
- **403**: `/authorizer_error`

## 🧪 テスト方法

### **認証が必要なページへアクセス**
```bash
# 未認証で保護ページにアクセス → サインインページにリダイレクト
curl http://localhost:3000/protect/account
```

### **認証が必要なAPIを呼び出し**
```bash
# 未認証でAPI呼び出し → 401エラー
curl http://localhost:3000/api/protect/account
```

### **認証後のアクセス**
```bash
# 認証後は正常にアクセス可能
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/protect/account
```

## 📝 カスタマイズ

### **新しい保護ページ追加**
`/middleware.ts` の `PROTECTED_PATHS` に追加：
```typescript
const PROTECTED_PATHS = [
  '/protect',
  '/new-protected-page', // 追加
];
```

### **新しい公開ページ追加**
`/middleware.ts` の `PUBLIC_PATHS` に追加：
```typescript
const PUBLIC_PATHS = [
  '/open',
  '/new-public-page', // 追加
];
```

### **管理者専用機能追加**
`/middleware.ts` の `ADMIN_PATHS` に追加：
```typescript
const ADMIN_PATHS = [
  '/admin',
  '/new-admin-feature', // 追加
];
```

## 🔐 セキュリティ考慮事項

1. **JWTシークレット**: 本番環境では強力なシークレットを使用
2. **HTTPS**: 本番環境ではHTTPS必須
3. **セッション期限**: 適切な期限設定（現在24時間）
4. **ログ**: 認証失敗やアクセス試行のログ記録
5. **レート制限**: 必要に応じてAPI呼び出し制限を実装

## 🚀 今後の拡張

1. **ロールベース認証**: より細かい権限制御
2. **グループベース認証**: グループ単位でのアクセス制御
3. **2要素認証**: より強固な認証方式
4. **監査ログ**: セキュリティ監査のためのログ機能
5. **API制限**: レート制限やクォータ管理