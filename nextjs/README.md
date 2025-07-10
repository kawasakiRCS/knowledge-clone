# Knowledge Base System - Next.js

JavaベースのナレッジベースシステムをNext.js + TypeScriptに移植したアプリケーション。

## 🚀 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS + Shadcn/ui
- **データベース**: PostgreSQL + Prisma ORM
- **認証**: NextAuth.js
- **バリデーション**: Zod + React Hook Form
- **テスト**: Jest + React Testing Library + Playwright

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

### 4. 開発サーバー起動
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

```bash
# ユニットテスト
npm run test

# E2Eテスト
npm run test:e2e

# テストカバレッジ
npm run test:coverage
```

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

## 🔗 関連リンク

- [移植分析レポート](../MIGRATION_ANALYSIS.md)
- [詳細移植計画](../PAGE_MIGRATION_PLAN.md)
- [GitHub Issues](https://github.com/kawasakiRCS/knowledge-clone/issues)

## 📄 ライセンス

Apache License 2.0
