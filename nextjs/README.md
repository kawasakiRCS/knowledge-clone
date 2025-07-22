# Knowledge Base System - Next.js

JavaベースのナレッジベースシステムをNext.js + TypeScriptに移植したアプリケーション。

## 🚀 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS + Shadcn/ui
- **データベース**: PostgreSQL + Prisma ORM
- **認証**: NextAuth.js
- **バリデーション**: Zod + React Hook Form
- **テスト**: Jest + React Testing Library + Playwright + Claude Code MCP統合

## 📋 プロジェクト構造

```
src/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # 認証関連ページ
│   ├── (protected)/       # ログイン必要ページ
│   ├── (public)/          # 公開ページ
│   ├── admin/             # 管理画面
│   └── api/               # API Routes
├── components/            # Reactコンポーネント
│   ├── ui/                # 基本UIコンポーネント
│   ├── forms/             # フォームコンポーネント
│   ├── knowledge/         # ナレッジ関連コンポーネント
│   └── layout/            # レイアウトコンポーネント
├── lib/                   # ユーティリティ関数
│   ├── db/                # データベース接続
│   ├── auth/              # 認証ロジック
│   ├── validations/       # バリデーションスキーマ
│   └── utils/             # 共通ユーティリティ
├── types/                 # TypeScript型定義
└── prisma/                # Prismaスキーマ・マイグレーション
```

## 🏗️ セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env.local`ファイルを作成し、以下を設定：

```env
DATABASE_URL="postgresql://user:password@localhost:5432/knowledge"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. データベースセットアップ
```bash
# 初回セットアップ（Docker Compose + 既存データリストア）
npm run db:setup

# または手動セットアップ
docker-compose up -d postgres
npm run prisma:generate
```

### 4. Playwright E2Eテスト環境のセットアップ
```bash
# Playwright依存関係のインストール
npx playwright install-deps

# システムブラウザのインストール（MCP統合対応）
npx playwright install chrome
```

**⚠️ 重要**: Claude Code MCPツールとの統合には、システムレベルでのGoogle Chromeインストールが必要です：

```bash
# Ubuntu/Debian系の場合
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt update
sudo apt install -y google-chrome-stable
```

### 5. 開発サーバー起動
```bash
npm run dev
```

## 📊 移植進捗

### 実装済み機能
- [x] 基本プロジェクト構成
- [ ] 共通レイアウト
- [ ] 認証システム
- [ ] ナレッジCRUD機能

### 今後の実装予定
詳細は [PAGE_MIGRATION_PLAN.md](../PAGE_MIGRATION_PLAN.md) を参照

## 🧪 テスト

### ユニットテスト
```bash
# ユニットテスト実行
npm run test

# テスト監視モード
npm run test:watch

# テストカバレッジ
npm run test:coverage
```

### E2Eテスト（Playwright）
```bash
# 標準E2Eテスト（ヘッドレス）
npm run test:e2e

# ヘッド付きテスト（ブラウザ表示）
npm run test:e2e:headed

# デバッグモード（Playwright Inspector）
npm run test:e2e:debug

# UIモード（インタラクティブ）
npm run test:e2e:ui

# テストレポート表示
npm run test:e2e:report
```

### 🎯 Playwright + Claude Code MCP統合デバッグ

**テストコードなしでも即座にブラウザ操作が可能**：

#### 基本的な使用方法
1. **開発サーバー起動**: `npm run dev`
2. **Claude Code MCP**使用:
   ```typescript
   // ブラウザでページにアクセス
   await mcp__playwright__browser_navigate({ url: 'http://localhost:3000' });
   
   // 要素クリック
   await mcp__playwright__browser_click({ element: 'ボタン', ref: 'e10' });
   
   // フォーム入力
   await mcp__playwright__browser_type({ element: 'input', ref: 'e28', text: 'テスト' });
   
   // スクリーンショット
   await mcp__playwright__browser_take_screenshot({ filename: 'debug.png' });
   ```

#### 🚀 認証バイパス機能（開発環境限定）

**認証を自動的にスキップして検証用ユーザーでログイン**：

```typescript
// 管理者ユーザーとして自動ログイン
await mcp__playwright__browser_navigate({ 
  url: 'http://localhost:3000/api/dev/auth/bypass?user=admin' 
});

// 保護されたページにアクセス（認証済み状態）
await mcp__playwright__browser_navigate({ 
  url: 'http://localhost:3000/protect/knowledge/edit' 
});

// 一般ユーザーとして自動ログイン
await mcp__playwright__browser_navigate({ 
  url: 'http://localhost:3000/api/dev/auth/bypass?user=user' 
});
```

**利用可能なユーザータイプ**:
- `admin`: 管理者権限（Knowledge test ユーザー）
- `user`: 一般ユーザー権限（山田 テスト ユーザー）

**セキュリティ**:
- 開発環境（`NODE_ENV=development`）でのみ有効
- 環境変数 `DEVELOPMENT_AUTH_BYPASS=true` が必要
- 本番環境では完全に無効化

3. **リアルタイムデバッグ**: ページ構造の確認、要素操作、視覚的確認が全て可能

## 🗄️ データベース管理

```bash
# データベース起動
npm run db:start

# データベース停止
npm run db:stop

# データベースリセット（全データ削除・再構築）
npm run db:reset

# データベースログ確認
npm run db:logs

# データベースに直接接続
npm run db:shell

# Prisma Studio（データベースGUI）
npm run prisma:studio
```

### pgAdmin
- URL: http://localhost:8080
- Email: admin@knowledge.local  
- Password: admin

## 📝 開発ルール

- **ページ単位移植**: 旧システムのJSPページと同等の見た目・機能を実現
- **Issue連携**: 全コミットはGitHub Issue番号と紐づける
- **テスト駆動**: 新機能実装時はテストを含める
- **型安全**: TypeScriptの型チェックを厳格に運用

## 🔧 トラブルシューティング

### Playwright MCP統合エラー

#### ❌ `Chromium distribution 'chrome' is not found`
```bash
# 解決方法
npx playwright install chrome

# Ubuntu/Debian系でシステムChromeも必要な場合
sudo apt install -y google-chrome-stable
```

#### ❌ Playwright依存関係エラー
```bash
# システム依存関係の再インストール
npx playwright install-deps

# 手動で必要パッケージをインストール
sudo apt install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libdrm2 libxkbcommon0 \
  libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libgtk-3-0 libasound2t64
```

#### ❌ E2Eテスト失敗
```bash
# デバッグモードで詳細確認
npm run test:e2e:debug

# ヘッド付きで視覚的確認
npm run test:e2e:headed

# トレース記録付きで実行
npx playwright test --trace on
```

### データベース接続エラー

#### ❌ PostgreSQL接続失敗
```bash
# Dockerコンテナ状況確認
docker-compose ps

# データベースログ確認
npm run db:logs

# 完全リセット
npm run db:reset
```

## 🔗 関連リンク

- [移植分析レポート](../MIGRATION_ANALYSIS.md)
- [詳細移植計画](../PAGE_MIGRATION_PLAN.md)
- [GitHub Issues](https://github.com/kawasakiRCS/knowledge-clone/issues)

## 📄 ライセンス

Apache License 2.0
